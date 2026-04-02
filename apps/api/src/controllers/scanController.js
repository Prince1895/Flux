const db = require('../config/db');
const { assumeCustomerRole } = require('../services/awsService');
const {
    findUnattachedVolumes,
    findIdleIPs,
    findStoppedInstances,
    findOldSnapshots,
    findIdleLoadBalancers,
    findIdleNatGateways,
    findUnusedSecurityGroups,
} = require('../services/scannerService');

/**
 * Triggers a full scan for a specific cloud account and saves findings to zombie_resources.
 * Scans for: EBS Volumes, Elastic IPs, EC2 Instances (stopped), EBS Snapshots (old),
 *            Load Balancers (idle), NAT Gateways (idle), Security Groups (unused)
 */
exports.runScan = async (req, res) => {
    try {
        const { cloud_account_id } = req.body;
        const tenant_id = req.user.tenant_id;

        // --- BILLING LOGIC CHECK ---
        const tenantResult = await db.query(
            'SELECT plan, scan_credits, current_period_start FROM tenants WHERE id = $1',
            [tenant_id]
        );
        let tenant = tenantResult.rows[0];

        if (tenant && tenant.plan === 'starter') {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            if (new Date(tenant.current_period_start) < oneMonthAgo) {
                const updateRes = await db.query(
                    "UPDATE tenants SET scan_credits = 5, current_period_start = NOW() WHERE id = $1 RETURNING *",
                    [tenant_id]
                );
                tenant = updateRes.rows[0];
            }
        }

        if (!tenant || tenant.scan_credits <= 0) {
            return res.status(403).json({ error: 'Insufficient scan credits. Please upgrade your plan or wait for the next billing cycle.' });
        }
        // --- END BILLING LOGIC CHECK ---

        // 1. Ensure the user owns this cloud account
        const accountResult = await db.query(
            'SELECT * FROM cloud_accounts WHERE id = $1 AND tenant_id = $2',
            [cloud_account_id, tenant_id]
        );
        const account = accountResult.rows[0];

        if (!account) {
            return res.status(404).json({ error: 'Cloud account not found or access denied.' });
        }

        // 2. Assume the AWS Role
        const roleArn = account.credentials_json?.role_arn;
        if (!roleArn) {
            return res.status(400).json({ error: 'No IAM Role ARN found in credentials_json for this account.' });
        }

        console.log(`[Scanner] Assuming role for ${roleArn}...`);
        const credentials = await assumeCustomerRole(roleArn);
        const region = account.region || 'us-east-1';

        // 3. Discover all available AWS regions for this account
        const { EC2Client, DescribeRegionsCommand } = require('@aws-sdk/client-ec2');
        let enabledRegions = [region];
        try {
            const ec2Client = new EC2Client({
                region: 'us-east-1',
                credentials: {
                    accessKeyId: credentials.accessKeyId,
                    secretAccessKey: credentials.secretAccessKey,
                    sessionToken: credentials.sessionToken,
                },
            });
            const regionRes = await ec2Client.send(new DescribeRegionsCommand({}));
            enabledRegions = regionRes.Regions.map(r => r.RegionName);
            console.log(`[Scanner] Found ${enabledRegions.length} enabled regions to scan.`);
        } catch (e) {
            console.error('[Scanner] Failed to describe regions, defaulting to', enabledRegions);
        }

        // 4. Run all scanners concurrently across ALL regions
        console.log(`[Scanner] Running all zombie scanners across ${enabledRegions.length} regions...`);

        const allZombies = [];
        const scanPromises = enabledRegions.map(async (r) => {
            const results = await Promise.allSettled([
                findUnattachedVolumes(credentials, r),
                findIdleIPs(credentials, r),
                findStoppedInstances(credentials, r),
                findOldSnapshots(credentials, r),
                findIdleLoadBalancers(credentials, r),
                findIdleNatGateways(credentials, r),
                findUnusedSecurityGroups(credentials, r),
            ]);

            // Helper to safely extract fulfilled results
            const safeResult = (result) => result.status === 'fulfilled' ? result.value : [];

            const regionZombies = [
                ...safeResult(results[0]), // unattachedVolumes
                ...safeResult(results[1]), // idleIPs
                ...safeResult(results[2]), // stoppedInstances
                ...safeResult(results[3]), // oldSnapshots
                ...safeResult(results[4]), // idleLoadBalancers
                ...safeResult(results[5]), // idleNatGateways
                ...safeResult(results[6]), // unusedSecurityGroups
            ].map(zombie => ({ ...zombie, tenant_id, account_id: account.id }));

            allZombies.push(...regionZombies);
        });

        await Promise.allSettled(scanPromises);

        const totalSavings = allZombies.reduce((sum, z) => sum + (z.estimated_monthly_cost || 0), 0);

        // 4. Save results to zombie_resources
        let insertedCount = 0;
        if (allZombies.length > 0) {
            for (const zombie of allZombies) {
                await db.query(
                    `INSERT INTO zombie_resources
                        (tenant_id, account_id, external_id, resource_type, region, status, estimated_monthly_cost, details)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [
                        zombie.tenant_id,
                        zombie.account_id,
                        zombie.external_id,
                        zombie.resource_type,
                        zombie.region || region,
                        zombie.status || 'active',
                        zombie.estimated_monthly_cost || 0,
                        JSON.stringify(zombie.details || {}),
                    ]
                );
                insertedCount++;
            }
        }

        // 5. Deduct one scan credit
        await db.query(
            'UPDATE tenants SET scan_credits = scan_credits - 1 WHERE id = $1',
            [tenant_id]
        );

        console.log(`[Scanner] Scan complete. Found ${insertedCount} zombies. Estimated savings: $${totalSavings.toFixed(2)}/mo`);

        res.status(200).json({
            message: 'Scan completed successfully!',
            zombies_found: insertedCount,
            estimated_monthly_savings_usd: parseFloat(totalSavings.toFixed(2)),
            breakdown: {
                ebs_volumes: allZombies.filter(z => z.resource_type === 'ebs_volume').length,
                elastic_ips: allZombies.filter(z => z.resource_type === 'elastic_ip').length,
                ec2_instances: allZombies.filter(z => z.resource_type === 'ec2_instance').length,
                ebs_snapshots: allZombies.filter(z => z.resource_type === 'ebs_snapshot').length,
                load_balancers: allZombies.filter(z => z.resource_type === 'load_balancer').length,
                nat_gateways: allZombies.filter(z => z.resource_type === 'nat_gateway').length,
                security_groups: allZombies.filter(z => z.resource_type === 'security_group').length,
            },
        });

    } catch (error) {
        console.error('[Scanner] Scan Error:', error);
        res.status(500).json({ error: error.message || 'An error occurred during the scan.' });
    }
};

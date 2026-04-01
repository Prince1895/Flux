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

        // 3. Run all scanners concurrently for speed
        console.log('[Scanner] Running all zombie scanners in parallel...');
        const [
            unattachedVolumes,
            idleIPs,
            stoppedInstances,
            oldSnapshots,
            idleLoadBalancers,
            idleNatGateways,
            unusedSecurityGroups,
        ] = await Promise.allSettled([
            findUnattachedVolumes(credentials, region),
            findIdleIPs(credentials, region),
            findStoppedInstances(credentials, region),
            findOldSnapshots(credentials, region),
            findIdleLoadBalancers(credentials, region),
            findIdleNatGateways(credentials, region),
            findUnusedSecurityGroups(credentials, region),
        ]);

        // Helper to safely extract fulfilled results (don't fail the whole scan if one scanner errors)
        const safeResult = (result, name) => {
            if (result.status === 'fulfilled') return result.value;
            console.error(`[Scanner] ${name} scanner failed:`, result.reason?.message || result.reason);
            return [];
        };

        const allZombies = [
            ...safeResult(unattachedVolumes, 'EBS Volumes'),
            ...safeResult(idleIPs, 'Elastic IPs'),
            ...safeResult(stoppedInstances, 'Stopped EC2'),
            ...safeResult(oldSnapshots, 'Old Snapshots'),
            ...safeResult(idleLoadBalancers, 'Load Balancers'),
            ...safeResult(idleNatGateways, 'NAT Gateways'),
            ...safeResult(unusedSecurityGroups, 'Security Groups'),
        ].map(zombie => ({ ...zombie, tenant_id, account_id: account.id }));

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
                ebs_volumes: safeResult(unattachedVolumes, '').length,
                elastic_ips: safeResult(idleIPs, '').length,
                ec2_instances: safeResult(stoppedInstances, '').length,
                ebs_snapshots: safeResult(oldSnapshots, '').length,
                load_balancers: safeResult(idleLoadBalancers, '').length,
                nat_gateways: safeResult(idleNatGateways, '').length,
                security_groups: safeResult(unusedSecurityGroups, '').length,
            },
        });

    } catch (error) {
        console.error('[Scanner] Scan Error:', error);
        res.status(500).json({ error: error.message || 'An error occurred during the scan.' });
    }
};

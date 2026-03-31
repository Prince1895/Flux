const db = require('../config/db');
const { assumeCustomerRole } = require('../services/awsService');
const { findUnattachedVolumes, findIdleIPs } = require('../services/scannerService');

/**
 * Triggers a scan for a specific cloud account and saves findings to zombie_resources.
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
                // Reset credits to 5 for new month
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

        console.log(`Assuming role for ${roleArn}...`);
        const credentials = await assumeCustomerRole(roleArn);

        // 3. Run the Scanners
        console.log('Running Zombie Scanners...');
        const unattachedVolumes = await findUnattachedVolumes(credentials, account.region || 'us-east-1');
        const idleIPs = await findIdleIPs(credentials, account.region || 'us-east-1');

        const totalSavings = [
            ...unattachedVolumes,
            ...idleIPs
        ].reduce((sum, z) => sum + (z.estimated_monthly_cost || 0), 0);

        // 4. Save results to zombie_resources
        const allZombies = [...unattachedVolumes, ...idleIPs].map(zombie => ({
            ...zombie,
            tenant_id,
            account_id: account.id
        }));

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
                        zombie.region || account.region || 'us-east-1',
                        zombie.status || 'active',
                        zombie.estimated_monthly_cost || 0,
                        JSON.stringify(zombie.details || {})
                    ]
                );
                insertedCount++;
            }
        }

        // --- BILLING DEDUCTION ---
        await db.query(
            'UPDATE tenants SET scan_credits = scan_credits - 1 WHERE id = $1',
            [tenant_id]
        );

        res.status(200).json({
            message: 'Scan completed successfully!',
            zombies_found: insertedCount,
            estimated_monthly_savings_usd: totalSavings,
        });

    } catch (error) {
        console.error('Scan Error:', error);
        res.status(500).json({ error: error.message || 'An error occurred during the scan.' });
    }
};

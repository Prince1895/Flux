const db = require('../config/db');
const { sendScanReport, getScanReportHTML } = require('../services/emailService');

/**
 * GET /api/reports/summary
 * Returns a list of the tenant's cloud accounts with their top-level zombie metrics
 * (total active zombies & estimated waste).
 */
exports.getSummary = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;

        // Fetch all accounts for the tenant
        const accountsResult = await db.query(
            'SELECT id, account_alias, provider, region FROM cloud_accounts WHERE tenant_id = $1',
            [tenant_id]
        );
        const accounts = accountsResult.rows;

        // Fetch active zombies
        const zombiesResult = await db.query(
            "SELECT account_id, estimated_monthly_cost FROM zombie_resources WHERE tenant_id = $1 AND status = 'pending'",
            [tenant_id]
        );
        const zombies = zombiesResult.rows;

        // Aggregate
        const summary = accounts.map(acc => {
            const accZombies = zombies.filter(z => z.account_id === acc.id);
            const totalWaste = accZombies.reduce((sum, z) => sum + Number(z.estimated_monthly_cost || 0), 0);
            return {
                ...acc,
                active_zombies_count: accZombies.length,
                estimated_waste: totalWaste
            };
        });

        res.json(summary);
    } catch (err) {
        console.error('[Reports] getSummary error:', err);
        res.status(500).json({ error: 'Failed to fetch report summary' });
    }
};

/**
 * POST /api/reports/send
 * Body: { account_id }
 * Generates an email report from the DB state and inserts it into the email queue.
 */
exports.sendManualReport = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { account_id } = req.body;

        if (!account_id) {
            return res.status(400).json({ error: 'account_id is required' });
        }

        // 1. Get account
        const accResult = await db.query(
            'SELECT * FROM cloud_accounts WHERE id = $1 AND tenant_id = $2',
            [account_id, tenant_id]
        );
        const account = accResult.rows[0];
        if (!account) {
            return res.status(404).json({ error: 'Cloud account not found' });
        }

        // 2. Get all active zombies for this account
        const zResult = await db.query(
            "SELECT * FROM zombie_resources WHERE account_id = $1 AND tenant_id = $2 AND status = 'pending' ORDER BY estimated_monthly_cost DESC",
            [account_id, tenant_id]
        );
        const allZombies = zResult.rows;

        // 3. Aggregate totals
        const totalSavings = allZombies.reduce((s, z) => s + Number(z.estimated_monthly_cost || 0), 0);

        const breakdown = {
            ebs_volumes: 0, elastic_ips: 0, ec2_instances: 0,
            ebs_snapshots: 0, load_balancers: 0, nat_gateways: 0, security_groups: 0
        };

        allZombies.forEach(z => {
            if (breakdown[z.resource_type] !== undefined) {
                breakdown[z.resource_type]++;
            } else {
                breakdown[z.resource_type] = 1; // Fallback for unknown types
            }
        });

        // 4. Send/Queue email
        await sendScanReport(req.user.email, {
            accountName: account.account_alias || account.name || account.id,
            region: account.region || 'us-east-1',
            zombies_found: allZombies.length,
            estimated_monthly_savings_usd: totalSavings,
            breakdown,
            scannedAt: new Date().toISOString(),
        }, allZombies);

        res.json({ message: 'Report queued for sending.' });
    } catch (err) {
        console.error('[Reports] sendManualReport error:', err);
        res.status(500).json({ error: 'Failed to queue report' });
    }
};

/**
 * POST /api/reports/preview
 * Body: { account_id }
 * Generates the HTML string for the email report so the frontend can preview it.
 */
exports.previewManualReport = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { account_id } = req.body;

        if (!account_id) return res.status(400).json({ error: 'account_id is required' });

        const accResult = await db.query(
            'SELECT * FROM cloud_accounts WHERE id = $1 AND tenant_id = $2',
            [account_id, tenant_id]
        );
        const account = accResult.rows[0];
        if (!account) return res.status(404).json({ error: 'Cloud account not found' });

        const zResult = await db.query(
            "SELECT * FROM zombie_resources WHERE account_id = $1 AND tenant_id = $2 AND status = 'pending' ORDER BY estimated_monthly_cost DESC",
            [account_id, tenant_id]
        );
        const allZombies = zResult.rows;

        const totalSavings = allZombies.reduce((s, z) => s + Number(z.estimated_monthly_cost || 0), 0);
        const breakdown = {};
        allZombies.forEach(z => {
            breakdown[z.resource_type] = (breakdown[z.resource_type] || 0) + 1;
        });

        const html = getScanReportHTML({
            accountName: account.account_alias || account.name || account.id,
            region: account.region || 'us-east-1',
            zombies_found: allZombies.length,
            estimated_monthly_savings_usd: totalSavings,
            breakdown,
            scannedAt: new Date().toISOString(),
        }, allZombies);

        res.json({ html });
    } catch (err) {
        console.error('[Reports] previewManualReport error:', err);
        res.status(500).json({ error: 'Failed to generate preview' });
    }
};

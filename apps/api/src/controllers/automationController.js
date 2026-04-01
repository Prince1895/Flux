const db = require('../config/db');

/**
 * GET /api/automation
 * Returns all automation schedules for the tenant, joined with account name.
 */
exports.getSchedules = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const result = await db.query(
            `SELECT s.*, ca.name AS account_name, ca.region AS account_region
             FROM automation_schedules s
             JOIN cloud_accounts ca ON s.account_id = ca.id
             WHERE s.tenant_id = $1
             ORDER BY s.created_at DESC`,
            [tenant_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('[Automation] getSchedules error:', err);
        res.status(500).json({ error: 'Failed to fetch schedules' });
    }
};

/**
 * POST /api/automation
 * Create or update an automation schedule for a given cloud account.
 * Body: { account_id, frequency, notify_email, enabled }
 */
exports.upsertSchedule = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { account_id, frequency, notify_email, enabled } = req.body;

        if (!account_id || !frequency) {
            return res.status(400).json({ error: 'account_id and frequency are required.' });
        }
        if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
            return res.status(400).json({ error: 'Invalid frequency. Use: daily, weekly, monthly.' });
        }

        // Check plan gate
        const tenantResult = await db.query('SELECT plan FROM tenants WHERE id = $1', [tenant_id]);
        const plan = tenantResult.rows[0]?.plan;
        if (!plan || plan === 'starter') {
            return res.status(403).json({ error: 'Automation is available on Solo and Team plans only.' });
        }

        // Verify they own the account
        const accResult = await db.query(
            'SELECT id FROM cloud_accounts WHERE id = $1 AND tenant_id = $2',
            [account_id, tenant_id]
        );
        if (!accResult.rows[0]) {
            return res.status(404).json({ error: 'Cloud account not found or access denied.' });
        }

        // Upsert
        const result = await db.query(
            `INSERT INTO automation_schedules (tenant_id, account_id, frequency, enabled, notify_email)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (tenant_id, account_id)
             DO UPDATE SET
               frequency    = EXCLUDED.frequency,
               enabled      = EXCLUDED.enabled,
               notify_email = EXCLUDED.notify_email
             RETURNING *`,
            [tenant_id, account_id, frequency, enabled ?? false, notify_email || req.user.email]
        );

        // Notify scheduler to reload
        const { reloadSchedule } = require('../services/scheduler');
        reloadSchedule(result.rows[0]).catch(console.error);

        res.status(200).json({ message: 'Schedule saved.', schedule: result.rows[0] });
    } catch (err) {
        console.error('[Automation] upsertSchedule error:', err);
        res.status(500).json({ error: 'Failed to save schedule' });
    }
};

/**
 * PATCH /api/automation/:id/toggle
 * Enable or disable a specific schedule.
 */
exports.toggleSchedule = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { id } = req.params;

        const result = await db.query(
            `UPDATE automation_schedules
             SET enabled = NOT enabled
             WHERE id = $1 AND tenant_id = $2
             RETURNING *`,
            [id, tenant_id]
        );

        if (!result.rows[0]) {
            return res.status(404).json({ error: 'Schedule not found.' });
        }

        const { reloadSchedule } = require('../services/scheduler');
        reloadSchedule(result.rows[0]).catch(console.error);

        res.json({ message: `Schedule ${result.rows[0].enabled ? 'enabled' : 'disabled'}.`, schedule: result.rows[0] });
    } catch (err) {
        console.error('[Automation] toggleSchedule error:', err);
        res.status(500).json({ error: 'Failed to toggle schedule' });
    }
};

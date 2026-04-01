const db = require('../config/db');

// Get current billing status
exports.getBillingStatus = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const tenantResult = await db.query(
            'SELECT plan, scan_credits, current_period_start FROM tenants WHERE id = $1',
            [tenant_id]
        );
        const tenant = tenantResult.rows[0];

        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found.' });
        }

        // Auto-renew starter credits if needed (just for display accuracy)
        let { plan, scan_credits, current_period_start } = tenant;
        if (plan === 'starter') {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            if (new Date(current_period_start) < oneMonthAgo) {
                const updateRes = await db.query(
                    "UPDATE tenants SET scan_credits = 5, current_period_start = NOW() WHERE id = $1 RETURNING *",
                    [tenant_id]
                );
                scan_credits = updateRes.rows[0].scan_credits;
                current_period_start = updateRes.rows[0].current_period_start;
            }
        }

        res.status(200).json({
            plan,
            scan_credits,
            current_period_start
        });
    } catch (error) {
        console.error('Billing Status Error:', error);
        res.status(500).json({ error: 'Failed to fetch billing status' });
    }
};

// Upgrade Plan
exports.upgradePlan = async (req, res) => {
    try {
        const { target_plan } = req.body; // 'starter', 'solo', 'team'
        const tenant_id = req.user.tenant_id;

        if (!['starter', 'solo', 'team'].includes(target_plan)) {
            return res.status(400).json({ error: 'Invalid plan selected' });
        }

        let creditsToAdd = 0;
        if (target_plan === 'solo') creditsToAdd = 50;
        else if (target_plan === 'team') creditsToAdd = 500;
        else if (target_plan === 'starter') creditsToAdd = 5; // Reset to 5

        // In a real app, this is where Stripe Checkout success webhook would be processed.
        const updateRes = await db.query(
            `UPDATE tenants 
             SET plan = $1, scan_credits = scan_credits + $2, current_period_start = NOW() 
             WHERE id = $3 RETURNING plan, scan_credits`,
            [target_plan, creditsToAdd, tenant_id]
        );

        res.status(200).json({
            message: `Successfully upgraded to ${target_plan} plan`,
            plan: updateRes.rows[0].plan,
            scan_credits: updateRes.rows[0].scan_credits
        });
    } catch (error) {
        console.error('Upgrade Plan Error:', error);
        res.status(500).json({ error: 'Failed to upgrade plan' });
    }
};

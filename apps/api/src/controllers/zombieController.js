const db = require('../config/db');

/**
 * GET /api/zombies
 * Returns all zombie resources scoped to the authenticated tenant, with account alias.
 */
exports.getAllZombies = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;

        const result = await db.query(
            `SELECT zr.*, ca.account_alias
             FROM zombie_resources zr
             JOIN cloud_accounts ca ON zr.account_id = ca.id
             WHERE zr.tenant_id = $1
             ORDER BY zr.detected_at DESC`,
            [tenant_id]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching zombies:', error);
        res.status(500).json({ error: 'Server error fetching zombie resources' });
    }
};

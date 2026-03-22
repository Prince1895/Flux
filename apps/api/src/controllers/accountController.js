const db = require('../config/db');

exports.addAccount = async (req, res) => {
    try {
        const { name, provider, credentials_json, region } = req.body;
        const tenant_id = req.user.tenant_id;

        const result = await db.query(
            `INSERT INTO cloud_accounts (tenant_id, account_alias, provider, credentials_json, region)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [tenant_id, name || 'AWS Account', provider || 'aws', credentials_json, region || 'us-east-1']
        );

        res.status(201).json({ message: 'Cloud account added', account: result.rows[0] });
    } catch (error) {
        console.error('Error adding account:', error);
        res.status(500).json({ error: 'Server error adding account' });
    }
};

exports.getAccounts = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const result = await db.query(
            'SELECT * FROM cloud_accounts WHERE tenant_id = $1 ORDER BY created_at DESC',
            [tenant_id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({ error: 'Server error fetching accounts' });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const { accountId } = req.params;
        const tenant_id = req.user.tenant_id;

        const result = await db.query(
            'DELETE FROM cloud_accounts WHERE id = $1 AND tenant_id = $2 RETURNING id',
            [accountId, tenant_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Account not found or access denied' });
        }

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ error: 'Server error deleting account' });
    }
};

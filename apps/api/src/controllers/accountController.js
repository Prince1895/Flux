const supabase = require('../config/supabaseClient');

exports.addAccount = async (req, res) => {
    try {
        const { name, provider, credentials_json, region } = req.body;
        const tenant_id = req.user.user_metadata.tenant_id;

        // Note: 'region' was excluded here specifically because the schema provided 
        // does not appear to have a region column on 'cloud_accounts'.
        // The scanner will default to us-east-1 in the scanController.
        const { data, error } = await supabase
            .from('cloud_accounts')
            .insert([{
                account_alias: name || 'AWS Account',
                provider: provider || 'aws',
                credentials_json,
                tenant_id
            }])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(201).json({ message: 'Cloud account added', account: data[0] });
    } catch (error) {
        console.error('Error adding account:', error);
        res.status(500).json({ error: 'Server error adding account' });
    }
};

exports.getAccounts = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('cloud_accounts')
            .select('*')
            .eq('tenant_id', req.user.user_metadata.tenant_id);

        if (error) return res.status(400).json({ error: error.message });
        res.json(data);
    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({ error: 'Server error fetching accounts' });
    }
};

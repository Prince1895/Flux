const supabase = require('../config/supabaseClient');

exports.signup = async (req, res) => {
    const { email, password, company_name } = req.body;
    try {
        const { data: tenant, error: tenantError } = await supabase.from('tenants').insert([{ name: company_name }]).select().single();
        if (tenantError) throw tenantError;
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password, options: { data: { tenant_id: tenant.id, role: 'admin' } } });
        if (authError) throw authError;
        res.status(201).json({
            message: "Signup successful! Please check your email to verify.",
            user: authData.user
        });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
}

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: error.message });
    res.status(200).json({
        message: "Login Successful",
        session: data.session,
        user: data.user
    })
}

exports.googleLogin = async (req, res) => {
    const redirectTo = req.query.redirectTo || 'http://localhost:5173';
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: redirectTo,
        },
    });

    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json({ url: data.url });
}

exports.githubLogin = async (req, res) => {
    const redirectTo = req.query.redirectTo || 'http://localhost:5173';
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: redirectTo,
        },
    });

    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json({ url: data.url });
}

exports.syncProfile = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No authorization header' });

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);

        if (userError || !user) return res.status(401).json({ error: 'Invalid token' });

        // Check if user already exists in public.users
        const { data: existingUser } = await supabase.from('users').select('*').eq('id', user.id).single();

        if (existingUser && user.user_metadata?.tenant_id) {
            return res.status(200).json({ message: 'Profile already synced' });
        }

        // Create a default tenant if they don't have one
        const tenantName = user.user_metadata?.full_name ? `${user.user_metadata.full_name}'s Workspace` : 'Default Workspace';
        const { data: tenant, error: tenantError } = await supabase.from('tenants').insert([{ name: tenantName }]).select().single();
        if (tenantError) throw tenantError;

        // Insert into public.users
        const { error: insertUserError } = await supabase.from('users').upsert([{
            id: user.id,
            email: user.email,
            tenant_id: tenant.id,
            role: 'admin'
        }]);
        if (insertUserError) throw insertUserError;

        // Update auth metadata
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
            user_metadata: { ...user.user_metadata, tenant_id: tenant.id, role: 'admin' }
        });
        if (updateError) throw updateError;

        res.status(200).json({ message: 'Profile synced successfully', tenant_id: tenant.id });
    } catch (err) {
        console.error('Sync profile error:', err);
        res.status(500).json({ error: err.message });
    }
}
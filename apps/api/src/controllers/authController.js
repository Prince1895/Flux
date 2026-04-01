const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

exports.signup = async (req, res) => {
    const { email, password, company_name } = req.body;
    if (!email || !password || !company_name) {
        return res.status(400).json({ error: 'email, password, and company_name are required' });
    }
    try {
        // 1. Create tenant
        const tenantResult = await db.query(
            'INSERT INTO tenants (name) VALUES ($1) RETURNING *',
            [company_name]
        );
        const tenant = tenantResult.rows[0];

        // 2. Hash password and create user 
        const password_hash = await bcrypt.hash(password, 12);
        const userResult = await db.query(
            'INSERT INTO users (tenant_id, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, email, tenant_id, role',
            [tenant.id, email, password_hash, 'admin']
        );
        const user = userResult.rows[0];

        // 3. Generate JWT
        const token = jwt.sign(
            { id: user.id, tenant_id: user.tenant_id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Signup successful!',
            token,
            user: { id: user.id, email: user.email, tenant_id: user.tenant_id, role: user.role, company_name }
        });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'An account with this email already exists.' });
        }
        console.error('Signup error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
<<<<<<< HEAD
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
=======
    if (!email || !password) {
        return res.status(400).json({ error: 'email and password are required' });
    }
    try {
        // 1. Find user + tenant name in one query
        const userResult = await db.query(
            `SELECT u.*, t.name AS company_name
             FROM users u
             JOIN tenants t ON u.tenant_id = t.id
             WHERE u.email = $1`,
            [email]
        );
        const user = userResult.rows[0];
        if (!user) return res.status(401).json({ error: 'Invalid email or password' });

        // 2. Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) return res.status(401).json({ error: 'Invalid email or password' });

        // 3. Generate JWT
        const token = jwt.sign(
            { id: user.id, tenant_id: user.tenant_id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Login Successful',
            token,
            user: { id: user.id, email: user.email, tenant_id: user.tenant_id, role: user.role, company_name: user.company_name }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: err.message });
    }
};
>>>>>>> fix-branch

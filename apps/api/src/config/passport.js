const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const db = require('./db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Helper to find or create an OAuth user
const findOrCreateUser = async (provider, profile) => {
    const oauthId = profile.id;
    const email = profile.emails && profile.emails[0].value;
    const displayName = profile.displayName || profile.username || 'OAuth User';

    // 1. Check if user already exists by oauth_id
    let res = await db.query('SELECT * FROM users WHERE oauth_provider = $1 AND oauth_id = $2', [provider, oauthId]);
    if (res.rows.length > 0) return res.rows[0];

    // 2. Check if user exists by email (link accounts if desired, but we'll try to link here)
    if (email) {
        res = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (res.rows.length > 0) {
            const user = res.rows[0];
            // Update to link oauth
            await db.query('UPDATE users SET oauth_provider = $1, oauth_id = $2 WHERE id = $3', [provider, oauthId, user.id]);
            user.oauth_provider = provider;
            user.oauth_id = oauthId;
            return user;
        }
    }

    // 3. Auto-Signup: Create Tenant + User
    try {
        await db.query('BEGIN');

        // Create Tenant
        const tenantName = `${displayName}'s Organization`;
        const tenantRes = await db.query(
            'INSERT INTO tenants (name) VALUES ($1) RETURNING id',
            [tenantName]
        );
        const tenantId = tenantRes.rows[0].id;

        // Create User
        // Generate a random placeholder email if none is provided by OAuth (rare but possible with Github)
        const finalEmail = email || `${oauthId}@${provider}.local`;

        const userRes = await db.query(
            'INSERT INTO users (tenant_id, email, role, oauth_provider, oauth_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, tenant_id, role',
            [tenantId, finalEmail, 'admin', provider, oauthId]
        );

        await db.query('COMMIT');
        return userRes.rows[0];
    } catch (err) {
        await db.query('ROLLBACK');
        throw err;
    }
};

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL || 'http://localhost:4000'}/api/auth/google/callback`,
        scope: ['profile', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await findOrCreateUser('google', profile);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    }));
}

// GitHub Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL || 'http://localhost:4000'}/api/auth/github/callback`,
        scope: ['user:email']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await findOrCreateUser('github', profile);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    }));
}

// Passport Serialize/Deserialize isn't strictly necessary if we only use it to generate the JWT immediately,
// but express-session works better if we serialize at least the ID.
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = passport;

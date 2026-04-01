const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.APP_URL || 'http://localhost:5173';

const handleOAuthCallback = (req, res) => {
    // req.user arrives from passport's done(null, user) via express-session
    if (!req.user) {
        console.error('OAuth Callback Error: No user in req');
        return res.redirect(`${FRONTEND_URL}/login?error=OAuthFailed`);
    }

    // Fetch tenant name to include in JWT like standard login
    const db = require('../config/db');
    db.query('SELECT name FROM tenants WHERE id = $1', [req.user.tenant_id])
        .then(tenantRes => {
            const company_name = tenantRes.rows[0]?.name || 'Organization';
            const { id, tenant_id, role, email } = req.user;

            // Generate our standard custom JWT token
            const token = jwt.sign(
                { id, tenant_id, role, email, company_name },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Redirect to frontend dashboard with token encoded in URL params
            res.redirect(`${FRONTEND_URL}/dashboard?token=${encodeURIComponent(token)}`);
        })
        .catch(err => {
            console.error('Failed to encode OAuth session:', err);
            res.redirect(`${FRONTEND_URL}/login?error=OAuthFailed`);
        });
};

// --- Google Routes ---
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/login?error=GoogleFailed` }),
    handleOAuthCallback
);

// --- GitHub Routes ---
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: `${FRONTEND_URL}/login?error=GithubFailed` }),
    handleOAuthCallback
);

module.exports = router;

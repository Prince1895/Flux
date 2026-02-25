const supabase = require('../config/supabaseClient');

const verifyJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization; // Note the 's' in headers

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Unauthorized access" });
    }
    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
        return res.status(401).json({ error: "Invalid Token" });
    }
    req.user = user;
    next();
};

module.exports = { verifyJWT };
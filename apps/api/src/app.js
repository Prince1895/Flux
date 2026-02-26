const express = require('express');
const cors = require('cors');
const supabase = require('./config/supabaseClient'); // Updated path
const authRoutes = require('./routes/authRoutes');
const scanRoutes = require('./routes/scanRoutes');
const accountRoutes = require('./routes/accountRoutes');
const { verifyJWT } = require('./middlewares/authMiddleware.js');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/accounts', accountRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'flux API running' });
});

module.exports = app;
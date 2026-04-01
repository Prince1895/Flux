const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const scanRoutes = require('./routes/scanRoutes');
const accountRoutes = require('./routes/accountRoutes');
const reapRoutes = require('./routes/reapRoutes');
const zombieRoutes = require('./routes/zombieRoutes');
const { verifyJWT } = require('./middlewares/authMiddleware.js');
const billingRoutes = require('./routes/billingRoutes');
const automationRoutes = require('./routes/automationRoutes');
const db = require('./config/db');

const reportRoutes = require('./routes/reportRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/scans', verifyJWT, scanRoutes);
app.use('/api/accounts', verifyJWT, accountRoutes);
app.use('/api/reap', verifyJWT, reapRoutes);
app.use('/api/zombies', verifyJWT, zombieRoutes);
app.use('/api/billing', verifyJWT, billingRoutes);
app.use('/api/automation', verifyJWT, automationRoutes);
app.use('/api/reports', verifyJWT, reportRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'flux API running' });
});

app.get('/api/public/stats', async (req, res) => {
  try {
    const result = await db.query('SELECT COUNT(*) AS count FROM users');
    res.json({ users: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    console.error('Failed to fetch stats:', err);
    res.status(500).json({ users: 0 });
  }
});

module.exports = app;
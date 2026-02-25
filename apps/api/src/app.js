const express = require('express');
const cors = require('cors');
const supabase = require('./config/supabaseClient'); // Updated path
const authRoutes = require('./routes/authRoutes');
const scanRoutes = require('./routes/scanRoutes');
const { verifyJWT } = require('./middlewares/authMiddleware.js');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'flux API running' });
});

app.get('/api/accounts', verifyJWT, async (req, res) => {
  const { data, error } = await supabase
    .from('cloud_accounts')
    .select('*')
    .eq('tenant_id', req.user.app_metadata.tenant_id);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

module.exports = app;
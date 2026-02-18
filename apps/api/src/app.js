const express = require('express');
const cors = require('cors');
const supabase = require('./config/supabaseClient');
const authRoutes = require('./routes/authRoutes');


const app = express();

app.use(cors());
app.use(express.json());

// app.use('/api/auth', authRoutes);
app.get('/health', (req, res) => {
  res.json({ status: 'flux API running' });
});


app.get('/api/accounts', async (req, res) => {
  const { data, error } = await supabase
    .from('cloud_accounts')
    .select('*');

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

module.exports = app;

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const scanRoutes = require('./routes/scanRoutes');
const accountRoutes = require('./routes/accountRoutes');
const reapRoutes = require('./routes/reapRoutes');
const zombieRoutes = require('./routes/zombieRoutes');
const { verifyJWT } = require('./middlewares/authMiddleware.js');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/scans', verifyJWT, scanRoutes);
app.use('/api/accounts', verifyJWT, accountRoutes);
app.use('/api/reap', verifyJWT, reapRoutes);
app.use('/api/zombies', verifyJWT, zombieRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'flux API running' });
});

module.exports = app;
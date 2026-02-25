const express = require('express');
const { runScan } = require('../controllers/scanController');
const { verifyJWT } = require('../middlewares/authMiddleware');

const router = express.Router();

// POST /api/scans/run
// Protected route: Only authenticated users belonging to a tenant can trigger scans
router.post('/run', verifyJWT, runScan);

module.exports = router;

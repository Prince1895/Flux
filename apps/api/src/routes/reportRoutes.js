const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyJWT } = require('../middlewares/authMiddleware');

router.use(verifyJWT);

// GET /api/reports/summary
router.get('/summary', reportController.getSummary);

// POST /api/reports/send
router.post('/send', reportController.sendManualReport);

module.exports = router;

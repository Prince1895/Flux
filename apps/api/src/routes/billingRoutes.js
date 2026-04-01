const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');

router.get('/status', billingController.getBillingStatus);
router.post('/upgrade', billingController.upgradePlan);

module.exports = router;

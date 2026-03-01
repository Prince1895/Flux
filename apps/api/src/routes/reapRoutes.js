const express = require('express');
const router = express.Router();
const reapController = require('../controllers/reapController');

// POST /api/reap/:zombieId
router.post('/:zombieId', reapController.executeReap);

module.exports = router;

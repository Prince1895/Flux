const express = require('express');
const router = express.Router();
const { getAllZombies } = require('../controllers/zombieController');
const { verifyJWT } = require('../middlewares/authMiddleware');

// GET /api/zombies - All zombies for the authenticated tenant
router.get('/', verifyJWT, getAllZombies);

module.exports = router;

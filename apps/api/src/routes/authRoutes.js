const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/google', authController.googleLogin);
router.get('/github', authController.githubLogin);

module.exports = router;
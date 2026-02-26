const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { verifyJWT } = require('../middlewares/authMiddleware');

router.post('/', verifyJWT, accountController.addAccount);
router.get('/', verifyJWT, accountController.getAccounts);

module.exports = router;

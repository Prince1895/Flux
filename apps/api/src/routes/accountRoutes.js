const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { verifyJWT } = require('../middlewares/authMiddleware');

router.post('/', accountController.addAccount);
router.get('/', accountController.getAccounts);
router.delete('/:accountId', accountController.deleteAccount);

module.exports = router;

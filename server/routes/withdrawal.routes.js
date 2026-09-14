const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawal.controller');
const { auth } = require('../middleware/auth');

router.post('/request', auth, withdrawalController.requestWithdrawal);
router.get('/history', auth, withdrawalController.getWithdrawalHistory);
router.get('/earnings', auth, withdrawalController.getEarnings);

module.exports = router;

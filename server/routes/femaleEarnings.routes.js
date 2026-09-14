const express = require('express');
const router = express.Router();
const controller = require('../controllers/femaleEarnings.controller');
const { auth } = require('../middleware/auth');

router.get('/earnings', auth, controller.getMyEarnings);
router.get('/bonus-rules', auth, controller.getMyBonusRules);
router.post('/bonus-rules/:id/accept', auth, controller.acceptBonusRule);

module.exports = router;

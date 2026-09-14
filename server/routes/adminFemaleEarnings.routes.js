const express = require('express');
const router = express.Router();
const controller = require('../controllers/femaleEarnings.controller');
const { auth, adminAuth } = require('../middleware/auth');

router.get('/female-earnings', auth, adminAuth, controller.getFemaleEarningsOverview);
router.get('/female-earnings/:userId', auth, adminAuth, controller.getFemaleEarningsDetail);
router.get('/female-earnings/revenue', auth, adminAuth, controller.getAdminRevenue);
router.get('/bonus-rules', auth, adminAuth, controller.getBonusRules);
router.post('/bonus-rules', auth, adminAuth, controller.createBonusRule);
router.put('/bonus-rules/:id', auth, adminAuth, controller.updateBonusRule);
router.delete('/bonus-rules/:id', auth, adminAuth, controller.deleteBonusRule);

module.exports = router;

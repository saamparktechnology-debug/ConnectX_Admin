const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { adminAuth } = require('../middleware/auth');

router.post('/login', adminController.adminLogin);
router.get('/dashboard', adminAuth, adminController.getDashboard);
router.get('/users', adminAuth, adminController.getUsers);
router.get('/users/:userId', adminAuth, adminController.getUserById);
router.put('/users/:userId/ban', adminAuth, adminController.banUser);
router.put('/users/:userId/verify', adminAuth, adminController.verifyUser);
router.put('/users/:userId/deactivate', adminAuth, adminController.deactivateUser);
router.get('/reports', adminAuth, adminController.getReports);
router.put('/reports/:reportId/status', adminAuth, adminController.updateReportStatus);
router.get('/subscriptions', adminAuth, adminController.getSubscriptions);
router.get('/plans', adminAuth, adminController.getPlans);
router.post('/plans', adminAuth, adminController.createPlan);
router.put('/plans/:planId', adminAuth, adminController.updatePlan);
router.get('/settings', adminAuth, adminController.getSettings);
router.put('/settings/:key', adminAuth, adminController.updateSetting);
router.get('/payment-settings', adminAuth, adminController.getPaymentSettings);
router.put('/payment-settings', adminAuth, adminController.updatePaymentSettings);
router.get('/verifications', adminAuth, adminController.getVerifications);
router.put('/verifications/:userId', adminAuth, adminController.updateVerification);
router.get('/withdrawals', adminAuth, adminController.getWithdrawals);
router.put('/withdrawals/:id', adminAuth, adminController.updateWithdrawal);

module.exports = router;

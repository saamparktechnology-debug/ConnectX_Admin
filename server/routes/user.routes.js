const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.put('/preferences', auth, userController.updatePreferences);
router.post('/photos', auth, upload.array('photos', 9), userController.uploadPhotos);
router.delete('/photos/:photoId', auth, userController.removePhoto);
router.post('/interests', auth, userController.setInterests);
router.get('/interests', auth, userController.getInterests);
router.get('/user/:userId', auth, userController.getOtherUserProfile);
router.post('/block', auth, userController.blockUser);
router.post('/unblock', auth, userController.unblockUser);
router.post('/report', auth, userController.reportUser);
router.get('/blocked', auth, userController.getBlockedUsers);
router.get('/wallet', auth, userController.getWallet);
router.post('/wallet/recharge', auth, userController.rechargeWallet);
router.get('/experts', auth, userController.getExperts);
router.post('/calls/start', auth, userController.startCall);
router.post('/calls/end', auth, userController.endCall);
router.get('/recent-calls', auth, userController.getRecentCalls);

module.exports = router;

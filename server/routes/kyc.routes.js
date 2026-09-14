const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kyc.controller');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/submit', auth, kycController.submitKyc);
router.get('/status', auth, kycController.getKycStatus);
router.post('/upload-voice-note', auth, upload.single('voice_note'), kycController.uploadVoiceNote);

module.exports = router;

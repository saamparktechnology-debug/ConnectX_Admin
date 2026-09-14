const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { auth } = require('../middleware/auth');

router.get('/messages/:matchId', auth, chatController.getMessages);
router.post('/send/:matchId', auth, chatController.sendMessage);
router.post('/read/:matchId', auth, chatController.markAsRead);
router.get('/unread', auth, chatController.getUnreadCount);
router.delete('/message/:messageId', auth, chatController.deleteMessage);
router.post('/icebreaker/:matchId', auth, chatController.sendIceBreaker);

module.exports = router;

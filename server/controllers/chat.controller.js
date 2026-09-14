const chatQueries = require('../queries/chat.queries');
const discoverQueries = require('../queries/discover.queries');

exports.getMessages = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { limit, offset } = req.query;
    const messages = await chatQueries.getMessages(
      parseInt(matchId),
      parseInt(limit) || 50,
      parseInt(offset) || 0
    );
    await chatQueries.markAsRead(parseInt(matchId), req.userId);
    res.json({ success: true, data: { messages } });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { message_text, message_type, media_url } = req.body;

    const match = await discoverQueries.getMatchById(parseInt(matchId));
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found.' });
    }
    if (match.user1_id !== req.userId && match.user2_id !== req.userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const recipientId = match.user1_id === req.userId ? match.user2_id : match.user1_id;
    const messageId = await chatQueries.sendMessage(
      parseInt(matchId), req.userId, message_text,
      message_type || 'text', media_url || null
    );

    const io = req.app.get('io');
    if (io) {
      const message = {
        id: messageId,
        match_id: parseInt(matchId),
        sender_id: req.userId,
        message_text,
        message_type: message_type || 'text',
        media_url,
        is_read: false,
        created_at: new Date().toISOString()
      };
      io.to(`user_${recipientId}`).emit('new_message', message);
      io.to(`user_${req.userId}`).emit('new_message', message);
    }

    res.json({ success: true, data: { messageId } });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { matchId } = req.params;
    await chatQueries.markAsRead(parseInt(matchId), req.userId);
    res.json({ success: true, message: 'Messages marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await chatQueries.getUnreadCount(req.userId);
    res.json({ success: true, data: { unreadCount: count } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    await chatQueries.deleteMessage(parseInt(messageId), req.userId);
    res.json({ success: true, message: 'Message deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.sendIceBreaker = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { text } = req.body;
    const messageId = await chatQueries.sendMessage(
      parseInt(matchId), req.userId, text, 'ice_breaker', null
    );

    const match = await discoverQueries.getMatchById(parseInt(matchId));
    const recipientId = match.user1_id === req.userId ? match.user2_id : match.user1_id;
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${recipientId}`).emit('new_message', {
        id: messageId, match_id: parseInt(matchId), sender_id: req.userId,
        message_text: text, message_type: 'ice_breaker', created_at: new Date().toISOString()
      });
    }

    res.json({ success: true, data: { messageId } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

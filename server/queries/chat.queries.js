const db = require('../config/db');

const sendMessage = async (matchId, senderId, messageText, messageType = 'text', mediaUrl = null) => {
  const [result] = await db.query(
    'INSERT INTO messages (match_id, sender_id, message_text, message_type, media_url) VALUES (?, ?, ?, ?, ?)',
    [matchId, senderId, messageText, messageType, mediaUrl]
  );
  return result.insertId;
};

const getMessages = async (matchId, limit = 50, offset = 0) => {
  const [rows] = await db.query(
    `SELECT m.*, u.name as sender_name, u.primary_photo as sender_photo
     FROM messages m
     INNER JOIN users u ON m.sender_id = u.id
     WHERE m.match_id = ? AND m.is_deleted = FALSE
     ORDER BY m.created_at DESC
     LIMIT ? OFFSET ?`,
    [matchId, limit, offset]
  );
  return rows.reverse();
};

const markAsRead = async (matchId, userId) => {
  await db.query(
    'UPDATE messages SET is_read = TRUE WHERE match_id = ? AND sender_id != ? AND is_read = FALSE',
    [matchId, userId]
  );
};

const getUnreadCount = async (userId) => {
  const [rows] = await db.query(
    `SELECT COUNT(*) as count FROM messages m
     INNER JOIN matches ma ON m.match_id = ma.id
     WHERE (ma.user1_id = ? OR ma.user2_id = ?)
       AND m.sender_id != ?
       AND m.is_read = FALSE
       AND ma.is_active = TRUE`,
    [userId, userId, userId]
  );
  return rows[0].count;
};

const deleteMessage = async (messageId, userId) => {
  await db.query(
    'UPDATE messages SET is_deleted = TRUE WHERE id = ? AND sender_id = ?',
    [messageId, userId]
  );
};

module.exports = { sendMessage, getMessages, markAsRead, getUnreadCount, deleteMessage };

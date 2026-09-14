const db = require('../config/db');

const createSwipe = async (swiperId, swipedId, action) => {
  await db.query(
    'INSERT INTO swipes (swiper_id, swiped_id, action) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE action = ?',
    [swiperId, swipedId, action, action]
  );
};

const checkMutualLike = async (user1Id, user2Id) => {
  const [rows] = await db.query(
    `SELECT * FROM swipes
     WHERE ((swiper_id = ? AND swiped_id = ? AND action = 'like')
        OR (swiper_id = ? AND swiped_id = ? AND action = 'like'))`,
    [user1Id, user2Id, user2Id, user1Id]
  );
  return rows.length >= 2;
};

const createMatch = async (user1Id, user2Id) => {
  const smaller = Math.min(user1Id, user2Id);
  const larger = Math.max(user1Id, user2Id);
  const [existing] = await db.query(
    'SELECT * FROM matches WHERE user1_id = ? AND user2_id = ? AND is_active = TRUE',
    [smaller, larger]
  );
  if (existing.length > 0) return existing[0];
  const [result] = await db.query(
    'INSERT INTO matches (user1_id, user2_id) VALUES (?, ?)',
    [smaller, larger]
  );
  return { id: result.insertId, user1_id: smaller, user2_id: larger };
};

const getMatchById = async (matchId) => {
  const [rows] = await db.query('SELECT * FROM matches WHERE id = ?', [matchId]);
  return rows[0];
};

const getUserMatches = async (userId) => {
  const [rows] = await db.query(
    `SELECT m.*,
            CASE WHEN m.user1_id = ? THEN u2.id ELSE u1.id END as match_user_id,
            CASE WHEN m.user1_id = ? THEN u2.name ELSE u1.name END as match_user_name,
            CASE WHEN m.user1_id = ? THEN u2.primary_photo ELSE u1.primary_photo END as match_user_photo,
            CASE WHEN m.user1_id = ? THEN u2.is_online ELSE u1.is_online END as match_user_online,
            CASE WHEN m.user1_id = ? THEN u2.last_active ELSE u1.last_active END as match_user_last_active,
            (SELECT message_text FROM messages WHERE match_id = m.id ORDER BY created_at DESC LIMIT 1) as last_message,
            (SELECT created_at FROM messages WHERE match_id = m.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
            (SELECT COUNT(*) FROM messages WHERE match_id = m.id AND sender_id != ? AND is_read = FALSE) as unread_count
     FROM matches m
     INNER JOIN users u1 ON m.user1_id = u1.id
     INNER JOIN users u2 ON m.user2_id = u2.id
     WHERE (m.user1_id = ? OR m.user2_id = ?)
       AND m.is_active = TRUE
       AND m.unmatched_by IS NULL
     ORDER BY last_message_time DESC, m.matched_at DESC`,
    [userId, userId, userId, userId, userId, userId, userId, userId]
  );
  return rows;
};

const unmatch = async (matchId, userId) => {
  await db.query('UPDATE matches SET is_active = FALSE, unmatched_by = ? WHERE id = ?', [userId, matchId]);
};

const getWhoLikedYou = async (userId) => {
  const [rows] = await db.query(
    `SELECT s.swiper_id as id, u.name, u.gender, u.date_of_birth, u.bio, u.city,
            u.primary_photo, u.is_verified, u.is_premium,
            GROUP_CONCAT(DISTINCT p.photo_url ORDER BY p.display_order ASC SEPARATOR ',') as photos,
            s.created_at as liked_at
     FROM swipes s
     INNER JOIN users u ON s.swiper_id = u.id
     LEFT JOIN user_photos p ON s.swiper_id = p.user_id
     WHERE s.swiped_id = ?
       AND s.action IN ('like', 'super_like')
       AND s.swiper_id NOT IN (SELECT blocked_id FROM user_blocks WHERE blocker_id = ?)
       AND u.is_banned = FALSE
       AND u.is_deactivated = FALSE
     GROUP BY s.swiper_id
     ORDER BY s.created_at DESC`,
    [userId, userId]
  );
  return rows;
};

module.exports = {
  createSwipe, checkMutualLike, createMatch, getMatchById,
  getUserMatches, unmatch, getWhoLikedYou
};

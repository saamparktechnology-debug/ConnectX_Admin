const db = require('../config/db');

const generateDatingId = async () => {
  const [rows] = await db.query('SELECT dating_id FROM users WHERE dating_id IS NOT NULL ORDER BY id DESC LIMIT 1');
  if (rows.length === 0 || !rows[0].dating_id) {
    return 'CX1001';
  }
  const lastId = rows[0].dating_id;
  const lastNum = parseInt(lastId.replace('CX', ''), 10);
  const nextNum = lastNum + 1;
  return 'CX' + nextNum.toString().padStart(4, '0');
};

const createUser = async (data) => {
  const dating_id = await generateDatingId();
  const [result] = await db.query(
    'INSERT INTO users (name, email, phone, password_hash, gender, date_of_birth, language, dating_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [data.name, data.email, data.phone, data.password_hash, data.gender, data.date_of_birth, data.language, dating_id]
  );
  await db.query('INSERT INTO user_preferences (user_id) VALUES (?)', [result.insertId]);
  return result.insertId;
};

const findUserByEmail = async (email) => {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

const findUserByPhone = async (phone) => {
  const [rows] = await db.query('SELECT * FROM users WHERE phone = ?', [phone]);
  return rows[0];
};

const findUserById = async (id) => {
  const [rows] = await db.query(
    `SELECT u.*, GROUP_CONCAT(DISTINCT p.photo_url ORDER BY p.display_order ASC) as all_photos
     FROM users u
     LEFT JOIN user_photos p ON u.id = p.user_id
     WHERE u.id = ?
     GROUP BY u.id`, [id]
  );
  return rows[0];
};

const updateUser = async (id, data) => {
  const fields = [];
  const values = [];
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== null) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  });
  if (fields.length === 0) return false;
  values.push(id);
  await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  return true;
};

const updateLastActive = async (userId) => {
  await db.query('UPDATE users SET last_active = NOW(), is_online = TRUE WHERE id = ?', [userId]);
};

const setUserOnline = async (userId, isOnline) => {
  await db.query('UPDATE users SET is_online = ? WHERE id = ?', [isOnline, userId]);
};

const storeOtpSession = async (phone, requestId) => {
  await db.query(
    `INSERT INTO otp_sessions (phone, request_id, expires_at)
     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))
     ON DUPLICATE KEY UPDATE request_id = VALUES(request_id), expires_at = VALUES(expires_at), created_at = NOW()`,
    [phone, requestId]
  );
};

const getOtpSession = async (phone) => {
  const [rows] = await db.query(
    'SELECT * FROM otp_sessions WHERE phone = ? AND expires_at > NOW()',
    [phone]
  );
  return rows[0] || null;
};

const deleteOtpSession = async (phone) => {
  await db.query('DELETE FROM otp_sessions WHERE phone = ?', [phone]);
};

module.exports = {
  createUser, findUserByEmail, findUserByPhone, findUserById,
  updateUser, updateLastActive, setUserOnline,
  storeOtpSession, getOtpSession, deleteOtpSession
};

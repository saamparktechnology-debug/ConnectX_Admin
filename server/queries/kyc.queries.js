const db = require('../config/db');

const getKycByUserId = async (userId) => {
  const [rows] = await db.query('SELECT * FROM user_kyc WHERE user_id = ?', [userId]);
  return rows[0];
};

const submitKyc = async (userId, data) => {
  const existing = await getKycByUserId(userId);
  if (existing) {
    const fields = [];
    const values = [];
    const allowedFields = [
      'aadhar_number', 'pan_number',
      'bank_account_number', 'bank_ifsc', 'bank_name', 'bank_holder_name',
      'upi_id', 'voice_note_url', 'voice_note_language'
    ];
    Object.keys(data).forEach(key => {
      if (allowedFields.includes(key) && data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    });
    if (fields.length === 0) return existing;
    values.push(userId);
    await db.query(`UPDATE user_kyc SET ${fields.join(', ')}, verification_status = 'pending' WHERE user_id = ?`, values);
    return getKycByUserId(userId);
  } else {
    const allowedFields = [
      'aadhar_number', 'pan_number',
      'bank_account_number', 'bank_ifsc', 'bank_name', 'bank_holder_name',
      'upi_id', 'voice_note_url', 'voice_note_language'
    ];
    const fields = ['user_id'];
    const values = [userId];
    Object.keys(data).forEach(key => {
      if (allowedFields.includes(key) && data[key] !== undefined) {
        fields.push(key);
        values.push(data[key]);
      }
    });
    const placeholders = fields.map(() => '?').join(', ');
    await db.query(`INSERT INTO user_kyc (${fields.join(', ')}) VALUES (${placeholders})`, values);
    try {
      await db.query('UPDATE users SET is_kyc_submitted = TRUE WHERE id = ?', [userId]);
    } catch (e) {
      console.warn('is_kyc_submitted column may not exist. Run migration.sql on your database.');
    }
    return getKycByUserId(userId);
  }
};

const updateKycStatus = async (userId, status, adminId, rejectionReason = null) => {
  await db.query(
    'UPDATE user_kyc SET verification_status = ?, verified_by = ?, verified_at = NOW(), rejection_reason = ? WHERE user_id = ?',
    [status, adminId, rejectionReason, userId]
  );
  if (status === 'approved') {
    await db.query('UPDATE users SET is_female_verified = TRUE WHERE id = ?', [userId]);
  } else if (status === 'rejected') {
    await db.query('UPDATE users SET is_female_verified = FALSE WHERE id = ?', [userId]);
  }
};

const getAllPendingVerifications = async (page = 1, limit = 20, status = '') => {
  const offset = (page - 1) * limit;
  let where = '';
  const params = [];
  if (status) {
    where = 'WHERE k.verification_status = ?';
    params.push(status);
  } else {
    where = 'WHERE k.verification_status != "approved"';
  }

  const [countResult] = await db.query(`SELECT COUNT(*) as count FROM user_kyc k ${where}`, params);
  const total = countResult[0].count;

  const [rows] = await db.query(
    `SELECT k.*, u.name, u.email, u.phone, u.gender, u.primary_photo, u.created_at as user_created_at
     FROM user_kyc k
     INNER JOIN users u ON k.user_id = u.id
     ${where}
     ORDER BY k.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { verifications: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
};

module.exports = {
  getKycByUserId,
  submitKyc,
  updateKycStatus,
  getAllPendingVerifications
};

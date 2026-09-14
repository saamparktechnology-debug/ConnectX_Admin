const db = require('../config/db');

const getDashboardStats = async () => {
  const [totalUsers] = await db.query('SELECT COUNT(*) as count FROM users');
  const [activeUsers] = await db.query("SELECT COUNT(*) as count FROM users WHERE last_active > DATE_SUB(NOW(), INTERVAL 24 HOUR)");
  const [maleUsers] = await db.query("SELECT COUNT(*) as count FROM users WHERE gender = 'male'");
  const [femaleUsers] = await db.query("SELECT COUNT(*) as count FROM users WHERE gender = 'female'");
  const [totalMatches] = await db.query('SELECT COUNT(*) as count FROM matches WHERE is_active = TRUE');
  const [totalMessages] = await db.query('SELECT COUNT(*) as count FROM messages');
  const [totalSwipes] = await db.query('SELECT COUNT(*) as count FROM swipes');
  const [premiumUsers] = await db.query('SELECT COUNT(*) as count FROM users WHERE is_premium = TRUE');
  const [pendingReports] = await db.query("SELECT COUNT(*) as count FROM user_reports WHERE status = 'pending'");
  const [newUsersToday] = await db.query("SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = CURDATE()");
  const [revenue] = await db.query("SELECT COALESCE(SUM(amount_paid), 0) as total FROM user_subscriptions WHERE payment_status = 'completed'");

  const [dailyActive] = await db.query(
    `SELECT DATE(last_active) as date, COUNT(DISTINCT id) as count
     FROM users WHERE last_active >= DATE_SUB(NOW(), INTERVAL 7 DAY)
     GROUP BY DATE(last_active) ORDER BY date`
  );

  const [dailySignups] = await db.query(
    `SELECT DATE(created_at) as date, COUNT(*) as count
     FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
     GROUP BY DATE(created_at) ORDER BY date`
  );

  return {
    totalUsers: totalUsers[0].count,
    activeUsers24h: activeUsers[0].count,
    maleUsers: maleUsers[0].count,
    femaleUsers: femaleUsers[0].count,
    totalMatches: totalMatches[0].count,
    totalMessages: totalMessages[0].count,
    totalSwipes: totalSwipes[0].count,
    premiumUsers: premiumUsers[0].count,
    pendingReports: pendingReports[0].count,
    newUsersToday: newUsersToday[0].count,
    totalRevenue: revenue[0].total,
    dailyActive,
    dailySignups
  };
};

const getAllUsers = async (page = 1, limit = 20, search = '', status = '') => {
  const offset = (page - 1) * limit;
  let where = 'WHERE 1=1';
  const params = [];

  if (search) {
    where += ' AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (status === 'banned') where += ' AND u.is_banned = TRUE';
  if (status === 'active') where += ' AND u.is_banned = FALSE AND u.is_deactivated = FALSE';
  if (status === 'premium') where += ' AND u.is_premium = TRUE';
  if (status === 'verified') where += ' AND u.is_verified = TRUE';
  if (status === 'new') where += ' AND u.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';

  const [countResult] = await db.query(
    `SELECT COUNT(*) as count FROM users u ${where}`, params
  );
  const total = countResult[0].count;

  const [rows] = await db.query(
    `SELECT u.id, u.name, u.email, u.phone, u.gender, u.city, u.primary_photo,
            u.is_verified, u.is_premium, u.is_banned, u.is_deactivated, u.created_at, u.last_active
     FROM users u ${where}
     ORDER BY u.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { users: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const getUserById = async (userId) => {
  const [rows] = await db.query(
    `SELECT u.*, GROUP_CONCAT(DISTINCT p.photo_url ORDER BY p.display_order ASC SEPARATOR ',') as photos,
            GROUP_CONCAT(DISTINCT i.name SEPARATOR ',') as interests
     FROM users u
     LEFT JOIN user_photos p ON u.id = p.user_id
     LEFT JOIN user_interests ui ON u.id = ui.user_id
     LEFT JOIN interests i ON ui.interest_id = i.id
     WHERE u.id = ?
     GROUP BY u.id`, [userId]
  );
  return rows[0];
};

const banUser = async (userId, banned) => {
  await db.query('UPDATE users SET is_banned = ? WHERE id = ?', [banned, userId]);
};

const verifyUser = async (userId, verified) => {
  await db.query('UPDATE users SET is_verified = ? WHERE id = ?', [verified, userId]);
};

const deactivateUser = async (userId, deactivated) => {
  await db.query('UPDATE users SET is_deactivated = ? WHERE id = ?', [deactivated, userId]);
};

const getAllReports = async (page = 1, limit = 20, status = '') => {
  const offset = (page - 1) * limit;
  let where = '';
  const params = [];
  if (status) {
    where = 'WHERE r.status = ?';
    params.push(status);
  } else {
    where = 'WHERE 1=1';
  }

  const [countResult] = await db.query(`SELECT COUNT(*) as count FROM user_reports r ${where}`, params);
  const total = countResult[0].count;

  const [rows] = await db.query(
    `SELECT r.*, u1.name as reporter_name, u1.email as reporter_email,
            u2.name as reported_name, u2.email as reported_email, u2.primary_photo as reported_photo
     FROM user_reports r
     INNER JOIN users u1 ON r.reporter_id = u1.id
     INNER JOIN users u2 ON r.reported_id = u2.id
     ${where}
     ORDER BY r.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { reports: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const updateReportStatus = async (reportId, status, adminId) => {
  await db.query(
    'UPDATE user_reports SET status = ?, admin_id = ?, reviewed_at = NOW() WHERE id = ?',
    [status, adminId, reportId]
  );
};

const getSubscriptions = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const [countResult] = await db.query('SELECT COUNT(*) as count FROM user_subscriptions');
  const total = countResult[0].count;

  const [rows] = await db.query(
    `SELECT us.*, u.name as user_name, u.email as user_email, sp.name as plan_name
     FROM user_subscriptions us
     INNER JOIN users u ON us.user_id = u.id
     INNER JOIN subscription_plans sp ON us.plan_id = sp.id
     ORDER BY us.created_at DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  return { subscriptions: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const getSubscriptionPlans = async () => {
  const [rows] = await db.query('SELECT * FROM subscription_plans ORDER BY display_order ASC');
  return rows;
};

const createPlan = async (data) => {
  const [result] = await db.query(
    `INSERT INTO subscription_plans (name, description, duration_days, price, features,
     swipe_limit, super_like_limit, boost_available, see_who_liked, unlimited_likes, display_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.name, data.description, data.duration_days, data.price, JSON.stringify(data.features),
     data.swipe_limit, data.super_like_limit, data.boost_available, data.see_who_liked,
     data.unlimited_likes, data.display_order || 0]
  );
  return result.insertId;
};

const updatePlan = async (planId, data) => {
  const fields = [];
  const values = [];
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined) {
      if (key === 'features') {
        fields.push(`${key} = ?`);
        values.push(JSON.stringify(data[key]));
      } else {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }
  });
  if (fields.length === 0) return false;
  values.push(planId);
  await db.query(`UPDATE subscription_plans SET ${fields.join(', ')} WHERE id = ?`, values);
  return true;
};

const getSettings = async () => {
  const [rows] = await db.query('SELECT * FROM app_settings ORDER BY id ASC');
  return rows;
};

const updateSetting = async (key, value) => {
  await db.query('UPDATE app_settings SET setting_value = ? WHERE setting_key = ?', [value, key]);
};

const getPaymentSettings = async () => {
  const [rows] = await db.query(
    "SELECT * FROM app_settings WHERE setting_key LIKE 'payment_%' ORDER BY id ASC"
  );
  return rows;
};

const updatePaymentSettings = async (data) => {
  const allowedKeys = ['payment_upi_id', 'payment_bank_name', 'payment_account_number', 'payment_ifsc_code', 'payment_account_holder'];
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    for (const [key, value] of Object.entries(data)) {
      if (allowedKeys.includes(key)) {
        await conn.query(
          'UPDATE app_settings SET setting_value = ? WHERE setting_key = ?',
          [value, key]
        );
      }
    }
    await conn.commit();
    return true;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

const getAllVerifications = async (page = 1, limit = 20, status = '') => {
  const offset = (page - 1) * limit;
  let where = '';
  const params = [];
  if (status) {
    where = 'WHERE k.verification_status = ?';
    params.push(status);
  } else {
    where = 'WHERE 1=1';
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

const updateVerificationStatus = async (userId, status, adminId, rejectionReason = null) => {
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

const getAllWithdrawals = async (page = 1, limit = 20, status = '') => {
  const offset = (page - 1) * limit;
  let where = '';
  const params = [];
  if (status) {
    where = 'WHERE w.status = ?';
    params.push(status);
  } else {
    where = 'WHERE 1=1';
  }

  const [countResult] = await db.query(`SELECT COUNT(*) as count FROM withdrawal_requests w ${where}`, params);
  const total = countResult[0].count;

  const [rows] = await db.query(
    `SELECT w.*, u.name as user_name, u.email as user_email, u.phone as user_phone, u.primary_photo
     FROM withdrawal_requests w
     INNER JOIN users u ON w.user_id = u.id
     ${where}
     ORDER BY w.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { withdrawals: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const updateWithdrawalStatus = async (withdrawalId, status, adminId, rejectionReason = null) => {
  const [withdrawal] = await db.query('SELECT * FROM withdrawal_requests WHERE id = ?', [withdrawalId]);
  if (!withdrawal.length) return null;

  await db.query(
    'UPDATE withdrawal_requests SET status = ?, admin_id = ?, rejection_reason = ?, processed_at = NOW() WHERE id = ?',
    [status, adminId, rejectionReason, withdrawalId]
  );

  if (status === 'rejected') {
    await db.query(
      'UPDATE wallets SET balance = balance + ? WHERE user_id = ?',
      [withdrawal[0].amount, withdrawal[0].user_id]
    );
    await db.query(
      'INSERT INTO wallet_transactions (user_id, type, amount, description) VALUES (?, "refund", ?, ?)',
      [withdrawal[0].user_id, withdrawal[0].amount, `Withdrawal rejected - ₹${withdrawal[0].amount} refunded`]
    );
  }

  return withdrawal[0];
};

module.exports = {
  getDashboardStats, getAllUsers, getUserById, banUser, verifyUser, deactivateUser,
  getAllReports, updateReportStatus, getSubscriptions, getSubscriptionPlans,
  createPlan, updatePlan, getSettings, updateSetting, getPaymentSettings, updatePaymentSettings,
  getAllVerifications, updateVerificationStatus, getAllWithdrawals, updateWithdrawalStatus
};

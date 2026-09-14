const db = require('../config/db');

const getFemaleEarningsOverview = async (page = 1, limit = 20, search = '') => {
  const offset = (page - 1) * limit;
  let where = "WHERE u.gender = 'female'";
  const params = [];

  if (search) {
    where += ' AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const [countResult] = await db.query(`SELECT COUNT(*) as count FROM users u ${where}`, params);
  const total = countResult[0].count;

  const [rows] = await db.query(
    `SELECT u.id, u.name, u.email, u.phone, u.primary_photo, u.created_at,
            COALESCE(SUM(fcm.minutes_talked), 0) as total_minutes,
            COALESCE(SUM(fcm.earned_amount), 0) as total_earned,
            (SELECT balance FROM wallets WHERE user_id = u.id) as wallet_balance,
            (SELECT COUNT(*) FROM female_bonus_rules WHERE female_user_id = u.id AND is_active = TRUE AND end_date >= CURDATE()) as active_bonuses
     FROM users u
     LEFT JOIN female_call_minutes fcm ON u.id = fcm.female_user_id
     ${where}
     GROUP BY u.id
     ORDER BY total_earned DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { users: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const getFemaleEarningsDetail = async (femaleUserId) => {
  const [user] = await db.query(
    `SELECT u.id, u.name, u.email, u.phone, u.primary_photo,
            COALESCE(SUM(fcm.minutes_talked), 0) as total_minutes,
            COALESCE(SUM(fcm.earned_amount), 0) as total_earned,
            (SELECT balance FROM wallets WHERE user_id = u.id) as wallet_balance
     FROM users u
     LEFT JOIN female_call_minutes fcm ON u.id = fcm.female_user_id
     WHERE u.id = ?
     GROUP BY u.id`,
    [femaleUserId]
  );

  const [monthlyBreakdown] = await db.query(
    `SELECT DATE_FORMAT(call_date, '%Y-%m') as month,
            SUM(minutes_talked) as minutes,
            SUM(earned_amount) as earned
     FROM female_call_minutes
     WHERE female_user_id = ?
     GROUP BY month
     ORDER BY month DESC
     LIMIT 12`,
    [femaleUserId]
  );

  const [activeBonuses] = await db.query(
    `SELECT r.*,
            COALESCE(SUM(fcm.minutes_talked), 0) as minutes_achieved
     FROM female_bonus_rules r
     LEFT JOIN female_call_minutes fcm ON r.female_user_id = fcm.female_user_id
       AND fcm.call_date BETWEEN r.start_date AND r.end_date
     WHERE r.female_user_id = ?
       AND r.is_active = TRUE
       AND r.end_date >= CURDATE()
     GROUP BY r.id
     ORDER BY r.end_date ASC`,
    [femaleUserId]
  );

  const [bonusHistory] = await db.query(
    `SELECT c.*, r.title as rule_title, r.target_minutes
     FROM female_bonus_claims c
     JOIN female_bonus_rules r ON c.rule_id = r.id
     WHERE c.female_user_id = ?
     ORDER BY c.claimed_at DESC
     LIMIT 20`,
    [femaleUserId]
  );

  return {
    user: user[0] || null,
    monthlyBreakdown,
    activeBonuses,
    bonusHistory,
  };
};

const getBonusRules = async (page = 1, limit = 20, femaleUserId = null) => {
  const offset = (page - 1) * limit;
  let where = 'WHERE 1=1';
  const params = [];

  if (femaleUserId) {
    where += ' AND r.female_user_id = ?';
    params.push(femaleUserId);
  }

  const [countResult] = await db.query(
    `SELECT COUNT(*) as count FROM female_bonus_rules r ${where}`, params
  );
  const total = countResult[0].count;

  const [rows] = await db.query(
    `SELECT r.*, u.name as female_name, u.phone as female_phone,
            COALESCE(SUM(fcm.minutes_talked), 0) as minutes_achieved
     FROM female_bonus_rules r
     JOIN users u ON r.female_user_id = u.id
     LEFT JOIN female_call_minutes fcm ON r.female_user_id = fcm.female_user_id
       AND fcm.call_date BETWEEN r.start_date AND r.end_date
     ${where}
     GROUP BY r.id
     ORDER BY r.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { rules: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const createBonusRule = async (data) => {
  const [result] = await db.query(
    `INSERT INTO female_bonus_rules (female_user_id, title, target_minutes, bonus_amount, validity_days, start_date, end_date)
     VALUES (?, ?, ?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY))`,
    [data.female_user_id, data.title || 'Bonus Offer', data.target_minutes, data.bonus_amount, data.validity_days, data.validity_days]
  );
  return result.insertId;
};

const updateBonusRule = async (id, data) => {
  const fields = [];
  const params = [];
  if (data.title) { fields.push('title = ?'); params.push(data.title); }
  if (data.target_minutes) { fields.push('target_minutes = ?'); params.push(data.target_minutes); }
  if (data.bonus_amount) { fields.push('bonus_amount = ?'); params.push(data.bonus_amount); }
  if (data.is_active !== undefined) { fields.push('is_active = ?'); params.push(data.is_active); }
  if (data.is_accepted !== undefined) { fields.push('is_accepted = ?'); params.push(data.is_accepted); }
  if (data.accepted_at) { fields.push('accepted_at = ?'); params.push(data.accepted_at); }
  if (fields.length === 0) return false;
  params.push(id);
  await db.query(`UPDATE female_bonus_rules SET ${fields.join(', ')} WHERE id = ?`, params);
  return true;
};

const deleteBonusRule = async (id) => {
  await db.query('DELETE FROM female_bonus_rules WHERE id = ?', [id]);
  return true;
};

const getBonusRuleById = async (id) => {
  const [rows] = await db.query('SELECT * FROM female_bonus_rules WHERE id = ?', [id]);
  return rows[0] || null;
};

const logCallMinutes = async (data) => {
  const [result] = await db.query(
    `INSERT INTO female_call_minutes (female_user_id, call_id, caller_id, minutes_talked, earned_amount, call_date)
     VALUES (?, ?, ?, ?, ?, CURDATE())`,
    [data.female_user_id, data.call_id, data.caller_id, data.minutes_talked, data.earned_amount]
  );
  return result.insertId;
};

const getFemaleMinutesInRange = async (femaleUserId, startDate, endDate) => {
  const [rows] = await db.query(
    `SELECT COALESCE(SUM(minutes_talked), 0) as total_minutes
     FROM female_call_minutes
     WHERE female_user_id = ? AND call_date BETWEEN ? AND ?`,
    [femaleUserId, startDate, endDate]
  );
  return rows[0].total_minutes;
};

const checkBonusTargets = async (femaleUserId) => {
  const [rules] = await db.query(
    `SELECT r.*,
            COALESCE(SUM(fcm.minutes_talked), 0) as minutes_achieved
     FROM female_bonus_rules r
     LEFT JOIN female_call_minutes fcm ON r.female_user_id = fcm.female_user_id
       AND fcm.call_date BETWEEN r.start_date AND r.end_date
     WHERE r.female_user_id = ?
       AND r.is_active = TRUE
       AND r.is_accepted = TRUE
       AND r.end_date >= CURDATE()
     GROUP BY r.id
     HAVING minutes_achieved >= r.target_minutes`,
    [femaleUserId]
  );
  return rules;
};

const claimBonus = async (femaleUserId, ruleId, minutesAchieved, bonusAmount) => {
  const existing = await db.query(
    'SELECT id FROM female_bonus_claims WHERE female_user_id = ? AND rule_id = ?',
    [femaleUserId, ruleId]
  );
  if (existing[0].length > 0) return null;

  const [result] = await db.query(
    `INSERT INTO female_bonus_claims (female_user_id, rule_id, total_minutes_achieved, bonus_amount, status)
     VALUES (?, ?, ?, ?, 'approved')`,
    [femaleUserId, ruleId, minutesAchieved, bonusAmount]
  );

  await db.query(
    'UPDATE wallets SET balance = balance + ?, total_recharged = total_recharged + ? WHERE user_id = ?',
    [bonusAmount, bonusAmount, femaleUserId]
  );

  const wallet = await db.query('SELECT id FROM wallets WHERE user_id = ?', [femaleUserId]);
  if (wallet[0].length > 0) {
    await db.query(
      `INSERT INTO wallet_transactions (user_id, type, amount, description, reference_id)
       VALUES (?, 'bonus', ?, 'Bonus earned from target achievement', ?)`,
      [femaleUserId, bonusAmount, result.insertId]
    );
  }

  await db.query('UPDATE female_bonus_rules SET is_active = FALSE WHERE id = ?', [ruleId]);

  return result.insertId;
};

const getFemaleActiveBonuses = async (femaleUserId) => {
  const [rows] = await db.query(
    `SELECT r.*,
            COALESCE(SUM(fcm.minutes_talked), 0) as minutes_achieved
     FROM female_bonus_rules r
     LEFT JOIN female_call_minutes fcm ON r.female_user_id = fcm.female_user_id
       AND fcm.call_date BETWEEN r.start_date AND r.end_date
     WHERE r.female_user_id = ?
       AND r.is_accepted = TRUE
       AND r.end_date >= CURDATE()
     GROUP BY r.id
     ORDER BY r.end_date ASC`,
    [femaleUserId]
  );
  return rows;
};

const getAdminRevenue = async () => {
  const [rows] = await db.query(
    `SELECT DATE_FORMAT(call_date, '%Y-%m') as month,
            SUM(earned_amount) as female_earned,
            SUM(earned_amount) as admin_revenue
     FROM female_call_minutes
     GROUP BY month
     ORDER BY month DESC
     LIMIT 12`
  );

  const [total] = await db.query(
    'SELECT COALESCE(SUM(earned_amount), 0) as total_revenue FROM female_call_minutes'
  );

  return { monthly: rows, totalRevenue: total[0].total_revenue };
};

module.exports = {
  getFemaleEarningsOverview,
  getFemaleEarningsDetail,
  getBonusRules,
  createBonusRule,
  updateBonusRule,
  deleteBonusRule,
  getBonusRuleById,
  logCallMinutes,
  getFemaleMinutesInRange,
  checkBonusTargets,
  claimBonus,
  getFemaleActiveBonuses,
  getAdminRevenue,
};

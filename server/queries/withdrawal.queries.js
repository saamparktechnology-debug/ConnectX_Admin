const db = require('../config/db');

const getWithdrawalHistory = async (userId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const [countResult] = await db.query('SELECT COUNT(*) as count FROM withdrawal_requests WHERE user_id = ?', [userId]);
  const total = countResult[0].count;

  const [rows] = await db.query(
    'SELECT * FROM withdrawal_requests WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [userId, limit, offset]
  );

  return { withdrawals: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const createWithdrawalRequest = async (userId, data) => {
  const [result] = await db.query(
    `INSERT INTO withdrawal_requests (user_id, amount, payment_method, account_number, ifsc_code, bank_name, upi_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, data.amount, data.payment_method, data.account_number || null,
     data.ifsc_code || null, data.bank_name || null, data.upi_id || null]
  );

  await db.query(
    'INSERT INTO wallet_transactions (user_id, type, amount, description) VALUES (?, "withdrawal", ?, ?)',
    [userId, data.amount, `Withdrawal request - ₹${data.amount}`]
  );

  return result.insertId;
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

const getFemaleEarnings = async (userId) => {
  const [wallet] = await db.query('SELECT * FROM wallets WHERE user_id = ?', [userId]);
  const [earnings] = await db.query(
    "SELECT COALESCE(SUM(amount), 0) as total FROM wallet_transactions WHERE user_id = ? AND type = 'call_earning'",
    [userId]
  );
  const [pendingWithdrawals] = await db.query(
    "SELECT COALESCE(SUM(amount), 0) as total FROM withdrawal_requests WHERE user_id = ? AND status IN ('pending', 'approved')",
    [userId]
  );
  return {
    balance: wallet[0]?.balance || 0,
    total_earned: earnings[0].total,
    pending_withdrawal: pendingWithdrawals[0].total,
    available_for_withdrawal: Math.max(0, (wallet[0]?.balance || 0) - pendingWithdrawals[0].total)
  };
};

module.exports = {
  getWithdrawalHistory,
  createWithdrawalRequest,
  updateWithdrawalStatus,
  getAllWithdrawals,
  getFemaleEarnings
};

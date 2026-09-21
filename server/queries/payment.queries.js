const db = require('../config/db');

const createCfOrder = async (userId, cfOrderId, orderId, amount) => {
  const [result] = await db.query(
    'INSERT INTO cf_orders (user_id, cf_order_id, order_id, amount) VALUES (?, ?, ?, ?)',
    [userId, cfOrderId, orderId, amount]
  );
  return result.insertId;
};

const getCfOrder = async (orderId) => {
  const [rows] = await db.query('SELECT * FROM cf_orders WHERE order_id = ?', [orderId]);
  return rows[0] || null;
};

const getCfOrderByCfId = async (cfOrderId) => {
  const [rows] = await db.query('SELECT * FROM cf_orders WHERE cf_order_id = ?', [cfOrderId]);
  return rows[0] || null;
};

const updateCfOrderStatus = async (orderId, status, cfPaymentId, paymentMethod) => {
  await db.query(
    'UPDATE cf_orders SET payment_status = ?, cf_payment_id = ?, payment_method = ? WHERE order_id = ?',
    [status, cfPaymentId || null, paymentMethod || null, orderId]
  );
};

const creditWallet = async (userId, amount, orderId) => {
  await db.query(
    'UPDATE wallets SET balance = balance + ?, total_recharged = total_recharged + ? WHERE user_id = ?',
    [amount, amount, userId]
  );
  await db.query(
    'INSERT INTO wallet_transactions (user_id, type, amount, description) VALUES (?, "recharge", ?, ?)',
    [userId, amount, `Cashfree Recharge - ₹${amount} (Order: ${orderId})`]
  );
};

module.exports = {
  createCfOrder,
  getCfOrder,
  getCfOrderByCfId,
  updateCfOrderStatus,
  creditWallet,
};

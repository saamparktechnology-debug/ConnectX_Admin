const withdrawalQueries = require('../queries/withdrawal.queries');
const db = require('../config/db');

exports.requestWithdrawal = async (req, res) => {
  try {
    const userId = req.userId;
    const { amount, payment_method, account_number, ifsc_code, bank_name, upi_id } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount.' });
    }

    const [settings] = await db.query("SELECT setting_value FROM app_settings WHERE setting_key = 'min_withdrawal_amount'");
    const minAmount = parseFloat(settings[0]?.setting_value || 100);

    if (amount < minAmount) {
      return res.status(400).json({ success: false, message: `Minimum withdrawal amount is ₹${minAmount}.` });
    }

    const [wallet] = await db.query('SELECT balance FROM wallets WHERE user_id = ?', [userId]);
    if (!wallet.length || wallet[0].balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance.' });
    }

    if (!payment_method || !['bank', 'upi'].includes(payment_method)) {
      return res.status(400).json({ success: false, message: 'Payment method must be bank or upi.' });
    }

    if (payment_method === 'bank' && (!account_number || !ifsc_code)) {
      return res.status(400).json({ success: false, message: 'Bank account number and IFSC code are required.' });
    }
    if (payment_method === 'upi' && !upi_id) {
      return res.status(400).json({ success: false, message: 'UPI ID is required.' });
    }

    await db.query('UPDATE wallets SET balance = balance - ? WHERE user_id = ?', [amount, userId]);

    const withdrawalId = await withdrawalQueries.createWithdrawalRequest(userId, {
      amount, payment_method, account_number, ifsc_code, bank_name, upi_id
    });

    res.json({ success: true, message: 'Withdrawal request submitted successfully.', data: { withdrawalId } });
  } catch (error) {
    console.error('Request withdrawal error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getWithdrawalHistory = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await withdrawalQueries.getWithdrawalHistory(
      req.userId, parseInt(page) || 1, parseInt(limit) || 20
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get withdrawal history error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getEarnings = async (req, res) => {
  try {
    const earnings = await withdrawalQueries.getFemaleEarnings(req.userId);
    res.json({ success: true, data: earnings });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

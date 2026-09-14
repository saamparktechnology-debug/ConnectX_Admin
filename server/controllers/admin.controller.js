const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const adminQueries = require('../queries/admin.queries');

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }
    const db = require('../config/db');
    const [admins] = await db.query('SELECT * FROM admin_users WHERE email = ?', [email]);
    if (!admins.length) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
    const admin = admins[0];
    if (!admin.is_active) {
      return res.status(403).json({ success: false, message: 'Account is inactive.' });
    }
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
    const token = jwt.sign({ id: admin.id }, process.env.ADMIN_JWT_SECRET, {
      expiresIn: process.env.ADMIN_JWT_EXPIRES_IN
    });
    await db.query('UPDATE admin_users SET last_login = NOW() WHERE id = ?', [admin.id]);
    res.json({
      success: true,
      data: {
        admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role, avatar: admin.avatar },
        token
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const stats = await adminQueries.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { page, limit, search, status } = req.query;
    const result = await adminQueries.getAllUsers(
      parseInt(page) || 1, parseInt(limit) || 20, search || '', status || ''
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await adminQueries.getUserById(parseInt(req.params.userId));
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const photos = user.photos ? user.photos.split(',') : [];
    const interests = user.interests ? user.interests.split(',') : [];
    delete user.photos;
    delete user.interests;
    res.json({ success: true, data: { ...user, photos, interests } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { banned } = req.body;
    await adminQueries.banUser(parseInt(userId), banned);
    res.json({ success: true, message: banned ? 'User banned.' : 'User unbanned.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.verifyUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { verified } = req.body;
    await adminQueries.verifyUser(parseInt(userId), verified);
    res.json({ success: true, message: verified ? 'User verified.' : 'Verification removed.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { deactivated } = req.body;
    await adminQueries.deactivateUser(parseInt(userId), deactivated);
    res.json({ success: true, message: deactivated ? 'User deactivated.' : 'User reactivated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const result = await adminQueries.getAllReports(
      parseInt(page) || 1, parseInt(limit) || 20, status || ''
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;
    await adminQueries.updateReportStatus(parseInt(reportId), status, req.adminId);
    res.json({ success: true, message: 'Report status updated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getSubscriptions = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await adminQueries.getSubscriptions(parseInt(page) || 1, parseInt(limit) || 20);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getPlans = async (req, res) => {
  try {
    const plans = await adminQueries.getSubscriptionPlans();
    res.json({ success: true, data: { plans } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.createPlan = async (req, res) => {
  try {
    const planId = await adminQueries.createPlan(req.body);
    res.json({ success: true, data: { planId }, message: 'Plan created.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    await adminQueries.updatePlan(parseInt(req.params.planId), req.body);
    res.json({ success: true, message: 'Plan updated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getSettings = async (req, res) => {
  try {
    const settings = await adminQueries.getSettings();
    res.json({ success: true, data: { settings } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    await adminQueries.updateSetting(key, value);
    res.json({ success: true, message: 'Setting updated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getPaymentSettings = async (req, res) => {
  try {
    const settings = await adminQueries.getPaymentSettings();
    res.json({ success: true, data: { settings } });
  } catch (error) {
    console.error('Get payment settings error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.updatePaymentSettings = async (req, res) => {
  try {
    await adminQueries.updatePaymentSettings(req.body);
    res.json({ success: true, message: 'Payment settings updated.' });
  } catch (error) {
    console.error('Update payment settings error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getVerifications = async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const result = await adminQueries.getAllVerifications(
      parseInt(page) || 1, parseInt(limit) || 20, status || ''
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get verifications error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.updateVerification = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, rejection_reason } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected.' });
    }
    if (status === 'rejected' && !rejection_reason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required.' });
    }
    await adminQueries.updateVerificationStatus(parseInt(userId), status, req.adminId, rejection_reason);
    res.json({ success: true, message: `Verification ${status}.` });
  } catch (error) {
    console.error('Update verification error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getWithdrawals = async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const result = await adminQueries.getAllWithdrawals(
      parseInt(page) || 1, parseInt(limit) || 20, status || ''
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.updateWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;
    if (!['approved', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }
    if (status === 'rejected' && !rejection_reason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required.' });
    }
    const result = await adminQueries.updateWithdrawalStatus(parseInt(id), status, req.adminId, rejection_reason);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found.' });
    }
    res.json({ success: true, message: `Withdrawal ${status}.` });
  } catch (error) {
    console.error('Update withdrawal error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const jwt = require('jsonwebtoken');
const db = require('../config/db');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [users] = await db.query('SELECT id, name, email, phone, is_banned, is_deactivated FROM users WHERE id = ?', [decoded.id]);
    if (!users.length) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }
    if (users[0].is_banned) {
      return res.status(403).json({ success: false, message: 'Account has been banned.' });
    }
    if (users[0].is_deactivated) {
      return res.status(403).json({ success: false, message: 'Account is deactivated.' });
    }
    req.user = users[0];
    req.userId = users[0].id;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired.' });
    }
    res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied.' });
    }
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    const [admins] = await db.query('SELECT id, name, email, role, is_active FROM admin_users WHERE id = ?', [decoded.id]);
    if (!admins.length || !admins[0].is_active) {
      return res.status(401).json({ success: false, message: 'Admin not found or inactive.' });
    }
    req.admin = admins[0];
    req.adminId = admins[0].id;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid admin token.' });
  }
};

module.exports = { auth, adminAuth };

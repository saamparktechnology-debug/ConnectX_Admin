const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authQueries = require('../queries/auth.queries');
const msg91 = require('../helpers/msg91');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, gender, date_of_birth, language } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required.' });
    }
    if (!email && !phone) {
      return res.status(400).json({ success: false, message: 'Email or phone is required.' });
    }

    if (email) {
      const existing = await authQueries.findUserByEmail(email);
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email already registered.' });
      }
    }
    if (phone) {
      const existing = await authQueries.findUserByPhone(phone);
      if (existing) {
        return res.status(409).json({ success: false, message: 'Phone already registered.' });
      }
    }

    const password_hash = password ? await bcrypt.hash(password, 12) : null;
    const userId = await authQueries.createUser({
      name, email, phone, password_hash, gender, date_of_birth, language
    });

    const token = generateToken(userId);
    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: { user: { id: userId, name, email, phone }, token }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required.' });
    }

    let user = null;
    if (email) user = await authQueries.findUserByEmail(email);
    else if (phone) user = await authQueries.findUserByPhone(phone);
    else {
      return res.status(400).json({ success: false, message: 'Email or phone is required.' });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
    if (user.is_banned) {
      return res.status(403).json({ success: false, message: 'Account has been banned.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = generateToken(user.id);
    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user.id, name: user.name, email: user.email, phone: user.phone,
          gender: user.gender, primary_photo: user.primary_photo, is_premium: user.is_premium
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await authQueries.findUserById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    delete user.password_hash;
    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length < 10) {
      return res.status(400).json({ success: false, message: 'Valid phone number is required.' });
    }

    const result = await msg91.sendOtp(phone);

    try {
      await authQueries.storeOtpSession(phone, result.requestId);
    } catch (dbErr) {
      console.error('Failed to store OTP session in DB (otp_sessions table may not exist):', dbErr.message);
    }

    console.log(`OTP sent to ${phone} via MSG91, requestId: ${result.requestId}`);

    res.json({
      success: true,
      message: 'OTP sent successfully.',
      data: { phone }
    });
  } catch (error) {
    console.error('Send OTP error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Server error sending OTP.' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required.' });
    }

    const stored = await authQueries.getOtpSession(phone);
    if (!stored) {
      return res.status(400).json({ success: false, message: 'OTP not found. Please request a new one.' });
    }

    await msg91.verifyOtp(phone, otp, stored.request_id);

    await authQueries.deleteOtpSession(phone);
    return await completeLogin(phone, res);
  } catch (error) {
    console.error('Verify OTP error:', error.response?.data || error.message);
    res.status(400).json({ success: false, message: error.response?.data?.message || 'Invalid OTP.' });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length < 10) {
      return res.status(400).json({ success: false, message: 'Valid phone number is required.' });
    }

    const stored = await authQueries.getOtpSession(phone);
    if (!stored) {
      return res.status(400).json({ success: false, message: 'No OTP session found. Please send OTP first.' });
    }

    await msg91.retryOtp(phone, stored.request_id);

    await authQueries.storeOtpSession(phone, stored.request_id);

    console.log(`OTP resent to ${phone} via MSG91`);

    res.json({
      success: true,
      message: 'OTP resent successfully.',
      data: { phone }
    });
  } catch (error) {
    console.error('Resend OTP error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Server error resending OTP.' });
  }
};

async function completeLogin(phone, res) {
  let user = await authQueries.findUserByPhone(phone);
  if (!user) {
    const userId = await authQueries.createUser({
      name: 'User',
      email: null,
      phone,
      password_hash: null,
      gender: null,
      date_of_birth: null,
      language: null
    });
    const db = require('../config/db');
    await db.query('INSERT INTO wallets (user_id, balance) VALUES (?, 0)', [userId]);
    user = await authQueries.findUserById(userId);
  }

  if (user.is_banned) {
    return res.status(403).json({ success: false, message: 'Account has been banned.' });
  }

  const token = generateToken(user.id);
  delete user.password_hash;

  res.json({
    success: true,
    message: 'OTP verified successfully.',
    data: { user, token }
  });
}

exports.updateFcmToken = async (req, res) => {
  try {
    const { fcm_token } = req.body;
    await authQueries.updateUser(req.userId, { fcm_token });
    res.json({ success: true, message: 'FCM token updated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

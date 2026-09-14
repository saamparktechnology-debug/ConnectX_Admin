const userQueries = require('../queries/user.queries');

exports.getProfile = async (req, res) => {
  try {
    const profile = await userQueries.getUserProfile(req.userId);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }
    const preferences = await userQueries.getUserPreferences(req.userId);
    const interests = profile.interest_names ? profile.interest_names.split(',') : [];
    const interestIds = profile.interest_ids ? profile.interest_ids.split(',').map(Number) : [];
    const photos = profile.photos ? profile.photos.split(',') : [];

    delete profile.interest_names;
    delete profile.interest_ids;
    delete profile.photos;

    res.json({
      success: true,
      data: { ...profile, photos, interests, interestIds, preferences }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updated = await userQueries.updateUserProfile(req.userId, req.body);
    if (!updated) {
      return res.status(400).json({ success: false, message: 'No valid fields to update.' });
    }
    res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    await userQueries.updateUserPreferences(req.userId, req.body);
    res.json({ success: true, message: 'Preferences updated successfully.' });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.uploadPhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No photos uploaded.' });
    }
    const photoUrls = req.files.map(file => `/uploads/photos/${file.filename}`);
    await userQueries.addPhotos(req.userId, photoUrls);
    res.json({ success: true, message: 'Photos uploaded successfully.', data: { photos: photoUrls } });
  } catch (error) {
    console.error('Upload photos error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.removePhoto = async (req, res) => {
  try {
    const { photoId } = req.params;
    const removed = await userQueries.removePhoto(parseInt(photoId), req.userId);
    if (!removed) {
      return res.status(404).json({ success: false, message: 'Photo not found.' });
    }
    res.json({ success: true, message: 'Photo removed successfully.' });
  } catch (error) {
    console.error('Remove photo error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.setInterests = async (req, res) => {
  try {
    const { interestIds } = req.body;
    if (!Array.isArray(interestIds)) {
      return res.status(400).json({ success: false, message: 'interestIds must be an array.' });
    }
    await userQueries.setUserInterests(req.userId, interestIds);
    res.json({ success: true, message: 'Interests updated successfully.' });
  } catch (error) {
    console.error('Set interests error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getInterests = async (req, res) => {
  try {
    const interests = await userQueries.getAllInterests();
    res.json({ success: true, data: { interests } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getOtherUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await userQueries.getUserProfile(parseInt(userId));
    if (!profile) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const photos = profile.photos ? profile.photos.split(',') : [];
    const interests = profile.interest_names ? profile.interest_names.split(',') : [];
    delete profile.photos;
    delete profile.interest_names;
    delete profile.interest_ids;
    delete profile.password_hash;
    delete profile.email;
    delete profile.phone;
    delete profile.fcm_token;

    const age = profile.date_of_birth ?
      Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;

    res.json({
      success: true,
      data: { ...profile, photos, interests, age }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const { blockedId } = req.body;
    const db = require('../config/db');
    await db.query(
      'INSERT INTO user_blocks (blocker_id, blocked_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE blocker_id = blocker_id',
      [req.userId, blockedId]
    );
    res.json({ success: true, message: 'User blocked successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const { blockedId } = req.body;
    const db = require('../config/db');
    await db.query('DELETE FROM user_blocks WHERE blocker_id = ? AND blocked_id = ?', [req.userId, blockedId]);
    res.json({ success: true, message: 'User unblocked successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.reportUser = async (req, res) => {
  try {
    const { reportedId, reason, description } = req.body;
    const db = require('../config/db');
    await db.query(
      'INSERT INTO user_reports (reporter_id, reported_id, reason, description) VALUES (?, ?, ?, ?)',
      [req.userId, reportedId, reason, description || null]
    );
    res.json({ success: true, message: 'Report submitted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getBlockedUsers = async (req, res) => {
  try {
    const db = require('../config/db');
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.primary_photo, u.city
       FROM user_blocks b
       INNER JOIN users u ON b.blocked_id = u.id
       WHERE b.blocker_id = ?`,
      [req.userId]
    );
    res.json({ success: true, data: { blockedUsers: rows } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getWallet = async (req, res) => {
  try {
    const db = require('../config/db');
    let [wallet] = await db.query('SELECT * FROM wallets WHERE user_id = ?', [req.userId]);
    if (!wallet.length) {
      await db.query('INSERT INTO wallets (user_id, balance) VALUES (?, 0)', [req.userId]);
      [wallet] = await db.query('SELECT * FROM wallets WHERE user_id = ?', [req.userId]);
    }
    res.json({ success: true, data: wallet[0] });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.rechargeWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount.' });
    }
    const db = require('../config/db');
    await db.query('UPDATE wallets SET balance = balance + ?, total_recharged = total_recharged + ? WHERE user_id = ?', [amount, amount, req.userId]);
    await db.query('INSERT INTO wallet_transactions (user_id, type, amount, description) VALUES (?, "recharge", ?, ?)', [req.userId, amount, `Recharged ₹${amount}`]);
    const [wallet] = await db.query('SELECT * FROM wallets WHERE user_id = ?', [req.userId]);
    res.json({ success: true, message: 'Wallet recharged successfully.', data: wallet[0] });
  } catch (error) {
    console.error('Recharge wallet error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getExperts = async (req, res) => {
  try {
    const db = require('../config/db');
    const { search } = req.query;
    const [currentUser] = await db.query('SELECT gender FROM users WHERE id = ?', [req.userId]);
    const userGender = currentUser[0]?.gender;
    const oppositeGender = userGender === 'male' ? 'female' : userGender === 'female' ? 'male' : null;

    let query = `
      SELECT u.id, u.name, u.primary_photo, u.city, u.state, u.is_online, u.language,
              u.gender, u.bio, u.occupation, u.dating_id,
              TIMESTAMPDIFF(YEAR, u.date_of_birth, CURDATE()) as age,
              COALESCE(e.price_per_minute, 1.50) as price_per_minute,
              COALESCE(e.category, 'confidence') as category,
              COALESCE(e.rating, 4.5) as rating,
              e.quote, e.languages,
              e.is_available, e.total_calls, e.total_earnings
       FROM users u
       LEFT JOIN experts e ON u.id = e.user_id
       WHERE u.is_banned = FALSE AND u.is_deactivated = FALSE AND u.id != ?`;
    const params = [req.userId];

    if (oppositeGender) {
      query += ' AND u.gender = ?';
      params.push(oppositeGender);
    }

    if (search && search.trim()) {
      query += ' AND u.dating_id = ?';
      params.push(search.trim());
    }

    query += ' ORDER BY u.last_active DESC LIMIT 50';

    const [users] = await db.query(query, params);
    res.json({ success: true, data: { experts: users } });
  } catch (error) {
    console.error('Get experts error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.startCall = async (req, res) => {
  try {
    const { expertId } = req.body;
    const db = require('../config/db');

    const [wallet] = await db.query('SELECT balance FROM wallets WHERE user_id = ?', [req.userId]);
    if (!wallet.length || wallet[0].balance <= 0) {
      return res.status(400).json({ success: false, message: 'Insufficient balance. Please recharge.' });
    }

    const [settings] = await db.query("SELECT setting_value FROM app_settings WHERE setting_key = 'call_rate_per_minute'");
    const rate = parseFloat(settings[0]?.setting_value || 1.50);
    if (wallet[0].balance < rate) {
      return res.status(400).json({ success: false, message: `Insufficient balance. Minimum ₹${rate} required.` });
    }

    const [result] = await db.query(
      'INSERT INTO calls (caller_id, expert_id, status, started_at) VALUES (?, ?, "connecting", NOW())',
      [req.userId, expertId]
    );
    res.json({ success: true, data: { callId: result.insertId } });
  } catch (error) {
    console.error('Start call error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.endCall = async (req, res) => {
  try {
    const { callId, duration, cost } = req.body;
    const db = require('../config/db');

    const [call] = await db.query(
      'SELECT c.*, e.user_id as female_user_id FROM calls c INNER JOIN experts e ON c.expert_id = e.id WHERE c.id = ? AND c.caller_id = ?',
      [callId, req.userId]
    );
    if (!call.length) {
      return res.status(404).json({ success: false, message: 'Call not found.' });
    }

    const [settings] = await db.query("SELECT setting_value FROM app_settings WHERE setting_key = 'call_rate_per_minute'");
    const rate = parseFloat(settings[0]?.setting_value || 1.50);
    const dur = duration || 0;
    const calculatedCost = parseFloat((dur / 60 * rate).toFixed(2));
    const finalCost = cost || calculatedCost;

    await db.query(
      'UPDATE calls SET status = "ended", duration = ?, cost = ?, ended_at = NOW() WHERE id = ?',
      [dur, finalCost, callId]
    );

    if (finalCost > 0) {
      await db.query(
        'UPDATE wallets SET balance = balance - ?, total_spent = total_spent + ? WHERE user_id = ?',
        [finalCost, finalCost, req.userId]
      );
      await db.query(
        'INSERT INTO wallet_transactions (user_id, type, amount, description) VALUES (?, "call_payment", ?, ?)',
        [req.userId, finalCost, `Call payment - ${dur}s @ ₹${rate}/min`]
      );

      if (call[0].female_user_id) {
        await db.query(
          'UPDATE wallets SET balance = balance + ? WHERE user_id = ?',
          [finalCost, call[0].female_user_id]
        );
        await db.query(
          'INSERT INTO wallet_transactions (user_id, type, amount, description) VALUES (?, "call_earning", ?, ?)',
          [call[0].female_user_id, finalCost, `Call earning - ${dur}s @ ₹${rate}/min`]
        );
        await db.query(
          'UPDATE experts SET total_earnings = total_earnings + ? WHERE user_id = ?',
          [finalCost, call[0].female_user_id]
        );
      }
    }

    res.json({ success: true, message: 'Call ended.', data: { cost: finalCost, duration: dur } });
  } catch (error) {
    console.error('End call error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getRecentCalls = async (req, res) => {
  try {
    const db = require('../config/db');
    const [recents] = await db.query(
      `SELECT c.*, u.name, u.primary_photo as photo, u.is_online,
              e.price_per_minute, e.category,
              TIMESTAMPDIFF(YEAR, u.date_of_birth, CURDATE()) as age
       FROM calls c
       INNER JOIN experts e ON c.expert_id = e.id
       INNER JOIN users u ON e.user_id = u.id
       WHERE c.caller_id = ?
       ORDER BY c.created_at DESC
       LIMIT 50`,
      [req.userId]
    );
    res.json({ success: true, data: { recents } });
  } catch (error) {
    console.error('Get recent calls error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

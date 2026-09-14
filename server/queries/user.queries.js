const db = require('../config/db');

const getUserProfile = async (userId) => {
  const [rows] = await db.query(
    `SELECT u.id, u.name, u.email, u.phone, u.gender, u.date_of_birth, u.bio,
            u.occupation, u.company, u.school, u.looking_for, u.relationship_goal,
            u.height, u.lifestyle_smoke, u.lifestyle_drink, u.lifestyle_exercise,
            u.city, u.state, u.country, u.is_verified, u.is_premium, u.language,
            u.primary_photo, u.anonymous_mode, u.created_at, u.dating_id,
            GROUP_CONCAT(DISTINCT p.photo_url ORDER BY p.display_order ASC SEPARATOR ',') as photos,
            GROUP_CONCAT(DISTINCT i.name SEPARATOR ',') as interest_names,
            GROUP_CONCAT(DISTINCT i.id SEPARATOR ',') as interest_ids
     FROM users u
     LEFT JOIN user_photos p ON u.id = p.user_id
     LEFT JOIN user_interests ui ON u.id = ui.user_id
     LEFT JOIN interests i ON ui.interest_id = i.id
     WHERE u.id = ?
     GROUP BY u.id`, [userId]
  );
  return rows[0];
};

const getUserPreferences = async (userId) => {
  const [rows] = await db.query('SELECT * FROM user_preferences WHERE user_id = ?', [userId]);
  return rows[0];
};

const updateUserProfile = async (userId, data) => {
  const allowedFields = ['name', 'bio', 'occupation', 'company', 'school', 'looking_for',
    'relationship_goal', 'height', 'lifestyle_smoke', 'lifestyle_drink', 'lifestyle_exercise',
    'city', 'state', 'country', 'location_lat', 'location_lng', 'language', 'primary_photo',
    'anonymous_mode', 'date_of_birth'];
  const fields = [];
  const values = [];
  Object.keys(data).forEach(key => {
    if (allowedFields.includes(key) && data[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  });
  if (fields.length === 0) return false;
  values.push(userId);
  await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  return true;
};

const updateUserPreferences = async (userId, data) => {
  const allowedFields = ['min_age', 'max_age', 'preferred_gender', 'max_distance_km', 'show_me'];
  const fields = [];
  const values = [];
  Object.keys(data).forEach(key => {
    if (allowedFields.includes(key) && data[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  });
  if (fields.length === 0) return false;
  const fieldValues = [...values];
  await db.query(
    `INSERT INTO user_preferences (user_id, ${fields.map(f => f.split(' =')[0]).join(', ')})
     VALUES (?, ${fields.map(() => '?').join(', ')})
     ON DUPLICATE KEY UPDATE ${fields.join(', ')}`,
    [userId, ...fieldValues, ...fieldValues]
  );
  return true;
};

const addPhotos = async (userId, photoUrls) => {
  const [existing] = await db.query('SELECT COUNT(*) as count FROM user_photos WHERE user_id = ?', [userId]);
  const startOrder = existing[0].count;
  const values = photoUrls.map((url, i) => [userId, url, i === 0 && startOrder === 0, startOrder + i]);
  await db.query('INSERT INTO user_photos (user_id, photo_url, is_primary, display_order) VALUES ?', [values]);
  if (startOrder === 0) {
    await db.query('UPDATE users SET primary_photo = ? WHERE id = ?', [photoUrls[0], userId]);
  }
};

const removePhoto = async (photoId, userId) => {
  const [photo] = await db.query('SELECT * FROM user_photos WHERE id = ? AND user_id = ?', [photoId, userId]);
  if (!photo.length) return null;
  await db.query('DELETE FROM user_photos WHERE id = ?', [photoId]);
  if (photo[0].is_primary) {
    const [next] = await db.query('SELECT photo_url FROM user_photos WHERE user_id = ? ORDER BY display_order ASC LIMIT 1', [userId]);
    if (next.length) {
      await db.query('UPDATE user_photos SET is_primary = TRUE WHERE id = ?', [next[0].id]);
      await db.query('UPDATE users SET primary_photo = ? WHERE id = ?', [next[0].photo_url, userId]);
    } else {
      await db.query('UPDATE users SET primary_photo = NULL WHERE id = ?', [userId]);
    }
  }
  return photo[0].photo_url;
};

const setUserInterests = async (userId, interestIds) => {
  await db.query('DELETE FROM user_interests WHERE user_id = ?', [userId]);
  if (interestIds.length > 0) {
    const values = interestIds.map(id => [userId, id]);
    await db.query('INSERT INTO user_interests (user_id, interest_id) VALUES ?', [values]);
  }
};

const getAllInterests = async () => {
  const [rows] = await db.query('SELECT * FROM interests WHERE is_active = TRUE ORDER BY name ASC');
  return rows;
};

const getSwipeableUsers = async (userId, preferences, lat, lng) => {
  let query = `
    SELECT u.id, u.name, u.gender, u.date_of_birth, u.bio, u.occupation,
           u.city, u.state, u.height, u.primary_photo, u.is_verified, u.is_premium,
           u.anonymous_mode, u.last_active,
           GROUP_CONCAT(DISTINCT p.photo_url ORDER BY p.display_order ASC SEPARATOR ',') as photos,
           GROUP_CONCAT(DISTINCT i.name SEPARATOR ',') as interests
    FROM users u
    LEFT JOIN user_photos p ON u.id = p.user_id
    LEFT JOIN user_interests ui ON u.id = ui.user_id
    LEFT JOIN interests i ON ui.interest_id = i.id
    WHERE u.id != ?
      AND u.is_banned = FALSE
      AND u.is_deactivated = FALSE
      AND u.primary_photo IS NOT NULL
      AND u.id NOT IN (SELECT swiped_id FROM swipes WHERE swiper_id = ?)
      AND u.id NOT IN (SELECT blocked_id FROM user_blocks WHERE blocker_id = ?)
      AND u.id NOT IN (SELECT blocker_id FROM user_blocks WHERE blocked_id = ?)
  `;
  const params = [userId, userId, userId, userId];

  if (preferences) {
    if (preferences.preferred_gender && preferences.preferred_gender !== 'both') {
      query += ' AND u.gender = ?';
      params.push(preferences.preferred_gender);
    }
  }

  query += ' GROUP BY u.id ORDER BY RAND() LIMIT 30';

  const [rows] = await db.query(query, params);
  return rows;
};

module.exports = {
  getUserProfile, getUserPreferences, updateUserProfile, updateUserPreferences,
  addPhotos, removePhoto, setUserInterests, getAllInterests, getSwipeableUsers
};

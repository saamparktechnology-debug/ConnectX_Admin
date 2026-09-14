const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { randomEmail } = require('./helpers');

describe('Database Functionality Tests', () => {
  let testUserId;

  // ==================== USER TABLE ====================
  describe('Users Table CRUD', () => {
    it('should insert a new user', async () => {
      const hash = await bcrypt.hash('TestPass123!', 12);
      const email = randomEmail();
      const [result] = await db.query(
        'INSERT INTO users (name, email, phone, password_hash, gender, date_of_birth) VALUES (?, ?, ?, ?, ?, ?)',
        ['DB Test User', email, '+19999999999', hash, 'male', '1995-06-15']
      );
      expect(result.insertId).toBeDefined();
      testUserId = result.insertId;
    });

    it('should read a user', async () => {
      const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [testUserId]);
      expect(rows.length).toBe(1);
      expect(rows[0].name).toBe('DB Test User');
      expect(rows[0].email).toBeDefined();
    });

    it('should update a user', async () => {
      const [result] = await db.query(
        'UPDATE users SET bio = ?, city = ? WHERE id = ?',
        ['Test bio from DB', 'Delhi', testUserId]
      );
      expect(result.affectedRows).toBe(1);
      const [rows] = await db.query('SELECT bio, city FROM users WHERE id = ?', [testUserId]);
      expect(rows[0].bio).toBe('Test bio from DB');
      expect(rows[0].city).toBe('Delhi');
    });

    it('should enforce unique email constraint', async () => {
      const existingUser = await db.query('SELECT email FROM users WHERE id = ?', [testUserId]);
      const email = existingUser[0][0].email;
      try {
        await db.query(
          'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
          ['Dup User', email, 'hash']
        );
        fail('Should have thrown duplicate entry error');
      } catch (error) {
        expect(error.code).toBe('ER_DUP_ENTRY');
      }
    });

    it('should enforce required fields', async () => {
      try {
        await db.query('INSERT INTO users (email) VALUES (?)', ['no_name@test.com']);
        fail('Should have thrown not null error');
      } catch (error) {
        expect(error.code).toBe('ER_NO_DEFAULT_FOR_FIELD');
      }
    });

    it('should delete a user', async () => {
      const [result] = await db.query('DELETE FROM users WHERE id = ?', [testUserId]);
      expect(result.affectedRows).toBe(1);
      const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [testUserId]);
      expect(rows.length).toBe(0);
    });
  });

  // ==================== INTERESTS TABLE ====================
  describe('Interests Table', () => {
    it('should have seeded interests', async () => {
      const [rows] = await db.query('SELECT * FROM interests WHERE is_active = TRUE');
      expect(rows.length).toBeGreaterThan(25);
    });

    it('should have unique interest names', async () => {
      const [rows] = await db.query('SELECT name, COUNT(*) as cnt FROM interests GROUP BY name HAVING cnt > 1');
      expect(rows.length).toBe(0);
    });

    it('should insert a new interest', async () => {
      const [result] = await db.query(
        'INSERT INTO interests (name, icon, category) VALUES (?, ?, ?)',
        ['DB Test Interest', '🧪', 'Test']
      );
      expect(result.insertId).toBeDefined();
      await db.query('DELETE FROM interests WHERE id = ?', [result.insertId]);
    });
  });

  // ==================== USER_PREFERENCES TABLE ====================
  describe('User Preferences Table', () => {
    let prefUserId;

    beforeAll(async () => {
      const hash = await bcrypt.hash('TestPass123!', 12);
      const email = randomEmail();
      const [result] = await db.query(
        'INSERT INTO users (name, email, password_hash, gender) VALUES (?, ?, ?, ?)',
        ['Pref User', email, hash, 'male']
      );
      prefUserId = result.insertId;
    });

    it('should auto-create preferences on user registration via query', async () => {
      await db.query('INSERT INTO user_preferences (user_id) VALUES (?)', [prefUserId]);
      const [rows] = await db.query('SELECT * FROM user_preferences WHERE user_id = ?', [prefUserId]);
      expect(rows.length).toBe(1);
      expect(rows[0].min_age).toBe(18);
      expect(rows[0].max_age).toBe(50);
    });

    it('should update preferences', async () => {
      await db.query(
        'UPDATE user_preferences SET min_age = ?, max_age = ?, preferred_gender = ? WHERE user_id = ?',
        [21, 35, 'female', prefUserId]
      );
      const [rows] = await db.query('SELECT * FROM user_preferences WHERE user_id = ?', [prefUserId]);
      expect(rows[0].min_age).toBe(21);
      expect(rows[0].max_age).toBe(35);
      expect(rows[0].preferred_gender).toBe('female');
    });

    it('should enforce unique user_id constraint', async () => {
      try {
        await db.query('INSERT INTO user_preferences (user_id) VALUES (?)', [prefUserId]);
        fail('Should have thrown duplicate entry error');
      } catch (error) {
        expect(error.code).toBe('ER_DUP_ENTRY');
      }
    });

    afterAll(async () => {
      await db.query('DELETE FROM user_preferences WHERE user_id = ?', [prefUserId]);
      await db.query('DELETE FROM users WHERE id = ?', [prefUserId]);
    });
  });

  // ==================== SWIPES TABLE ====================
  describe('Swipes Table', () => {
    let swipeUser1, swipeUser2;

    beforeAll(async () => {
      const hash = await bcrypt.hash('TestPass123!', 12);
      const email1 = randomEmail();
      const email2 = randomEmail();
      const [r1] = await db.query(
        'INSERT INTO users (name, email, password_hash, gender, primary_photo) VALUES (?, ?, ?, ?, ?)',
        ['Swipe User 1', email1, hash, 'male', '/test.jpg']
      );
      const [r2] = await db.query(
        'INSERT INTO users (name, email, password_hash, gender, primary_photo) VALUES (?, ?, ?, ?, ?)',
        ['Swipe User 2', email2, hash, 'female', '/test2.jpg']
      );
      swipeUser1 = r1.insertId;
      swipeUser2 = r2.insertId;
    });

    it('should create a swipe', async () => {
      const [result] = await db.query(
        'INSERT INTO swipes (swiper_id, swiped_id, action) VALUES (?, ?, ?)',
        [swipeUser1, swipeUser2, 'like']
      );
      expect(result.insertId).toBeDefined();
    });

    it('should enforce unique swipe constraint', async () => {
      try {
        await db.query(
          'INSERT INTO swipes (swiper_id, swiped_id, action) VALUES (?, ?, ?)',
          [swipeUser1, swipeUser2, 'dislike']
        );
        fail('Should have thrown duplicate entry error');
      } catch (error) {
        expect(error.code).toBe('ER_DUP_ENTRY');
      }
    });

    it('should update swipe action on duplicate', async () => {
      await db.query(
        'INSERT INTO swipes (swiper_id, swiped_id, action) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE action = ?',
        [swipeUser1, swipeUser2, 'super_like', 'super_like']
      );
      const [rows] = await db.query(
        'SELECT action FROM swipes WHERE swiper_id = ? AND swiped_id = ?',
        [swipeUser1, swipeUser2]
      );
      expect(rows[0].action).toBe('super_like');
    });

    it('should detect mutual likes', async () => {
      await db.query(
        'INSERT INTO swipes (swiper_id, swiped_id, action) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE action = ?',
        [swipeUser2, swipeUser1, 'like', 'like']
      );
      const [rows] = await db.query(
        `SELECT * FROM swipes
         WHERE ((swiper_id = ? AND swiped_id = ? AND action = 'like')
            OR (swiper_id = ? AND swiped_id = ? AND action = 'like'))`,
        [swipeUser1, swipeUser2, swipeUser2, swipeUser1]
      );
      expect(rows.length).toBeGreaterThanOrEqual(1);
    });

    afterAll(async () => {
      await db.query('DELETE FROM swipes WHERE swiper_id IN (?, ?) OR swiped_id IN (?, ?)',
        [swipeUser1, swipeUser2, swipeUser1, swipeUser2]);
      await db.query('DELETE FROM users WHERE id IN (?, ?)', [swipeUser1, swipeUser2]);
    });
  });

  // ==================== MATCHES TABLE ====================
  describe('Matches Table', () => {
    let matchUser1, matchUser2, matchId;

    beforeAll(async () => {
      const hash = await bcrypt.hash('TestPass123!', 12);
      const email1 = randomEmail();
      const email2 = randomEmail();
      const [r1] = await db.query(
        'INSERT INTO users (name, email, password_hash, gender, primary_photo) VALUES (?, ?, ?, ?, ?)',
        ['Match User 1', email1, hash, 'male', '/test.jpg']
      );
      const [r2] = await db.query(
        'INSERT INTO users (name, email, password_hash, gender, primary_photo) VALUES (?, ?, ?, ?, ?)',
        ['Match User 2', email2, hash, 'female', '/test2.jpg']
      );
      matchUser1 = r1.insertId;
      matchUser2 = r2.insertId;
    });

    it('should create a match', async () => {
      const smaller = Math.min(matchUser1, matchUser2);
      const larger = Math.max(matchUser1, matchUser2);
      const [result] = await db.query(
        'INSERT INTO matches (user1_id, user2_id) VALUES (?, ?)',
        [smaller, larger]
      );
      expect(result.insertId).toBeDefined();
      matchId = result.insertId;
    });

    it('should read a match', async () => {
      const [rows] = await db.query('SELECT * FROM matches WHERE id = ?', [matchId]);
      expect(rows.length).toBe(1);
      expect(!!rows[0].is_active).toBe(true);
    });

    it('should unmatch (soft delete)', async () => {
      await db.query(
        'UPDATE matches SET is_active = FALSE, unmatched_by = ? WHERE id = ?',
        [matchUser1, matchId]
      );
      const [rows] = await db.query('SELECT * FROM matches WHERE id = ?', [matchId]);
      expect(!!rows[0].is_active).toBe(false);
      expect(rows[0].unmatched_by).toBe(matchUser1);
    });

    afterAll(async () => {
      await db.query('DELETE FROM matches WHERE id = ?', [matchId]);
      await db.query('DELETE FROM users WHERE id IN (?, ?)', [matchUser1, matchUser2]);
    });
  });

  // ==================== MESSAGES TABLE ====================
  describe('Messages Table', () => {
    let msgMatchId, msgUser1, msgUser2, msgId;

    beforeAll(async () => {
      const hash = await bcrypt.hash('TestPass123!', 12);
      const email1 = randomEmail();
      const email2 = randomEmail();
      const [r1] = await db.query(
        'INSERT INTO users (name, email, password_hash, gender) VALUES (?, ?, ?, ?)',
        ['Msg User 1', email1, hash, 'male']
      );
      const [r2] = await db.query(
        'INSERT INTO users (name, email, password_hash, gender) VALUES (?, ?, ?, ?)',
        ['Msg User 2', email2, hash, 'female']
      );
      msgUser1 = r1.insertId;
      msgUser2 = r2.insertId;
      const smaller = Math.min(msgUser1, msgUser2);
      const larger = Math.max(msgUser1, msgUser2);
      const [mResult] = await db.query(
        'INSERT INTO matches (user1_id, user2_id) VALUES (?, ?)',
        [smaller, larger]
      );
      msgMatchId = mResult.insertId;
    });

    it('should send a message', async () => {
      const [result] = await db.query(
        'INSERT INTO messages (match_id, sender_id, message_text, message_type) VALUES (?, ?, ?, ?)',
        [msgMatchId, msgUser1, 'Hello DB!', 'text']
      );
      expect(result.insertId).toBeDefined();
      msgId = result.insertId;
    });

    it('should read messages', async () => {
      const [rows] = await db.query(
        'SELECT * FROM messages WHERE match_id = ? AND is_deleted = FALSE ORDER BY created_at DESC',
        [msgMatchId]
      );
      expect(rows.length).toBeGreaterThan(0);
      expect(rows[0].message_text).toBe('Hello DB!');
    });

    it('should mark messages as read', async () => {
      await db.query(
        'INSERT INTO messages (match_id, sender_id, message_text, message_type) VALUES (?, ?, ?, ?)',
        [msgMatchId, msgUser2, 'Reply from user 2', 'text']
      );
      const [beforeMark] = await db.query(
        'SELECT is_read FROM messages WHERE match_id = ? AND sender_id = ? AND is_read = FALSE',
        [msgMatchId, msgUser2]
      );
      expect(beforeMark.length).toBeGreaterThan(0);

      await db.query(
        'UPDATE messages SET is_read = TRUE WHERE match_id = ? AND sender_id != ? AND is_read = FALSE',
        [msgMatchId, msgUser1]
      );
      const [afterMark] = await db.query(
        'SELECT is_read FROM messages WHERE match_id = ? AND sender_id = ? ORDER BY id DESC LIMIT 1',
        [msgMatchId, msgUser2]
      );
      expect(!!afterMark[0].is_read).toBe(true);
    });

    it('should soft delete a message', async () => {
      await db.query(
        'UPDATE messages SET is_deleted = TRUE WHERE id = ? AND sender_id = ?',
        [msgId, msgUser1]
      );
      const [rows] = await db.query('SELECT is_deleted FROM messages WHERE id = ?', [msgId]);
      expect(!!rows[0].is_deleted).toBe(true);
    });

    it('should count unread messages', async () => {
      const [rows] = await db.query(
        `SELECT COUNT(*) as count FROM messages m
         INNER JOIN matches ma ON m.match_id = ma.id
         WHERE (ma.user1_id = ? OR ma.user2_id = ?)
           AND m.sender_id != ?
           AND m.is_read = FALSE
           AND ma.is_active = TRUE`,
        [msgUser2, msgUser2, msgUser2]
      );
      expect(typeof rows[0].count).toBe('number');
    });

    afterAll(async () => {
      await db.query('DELETE FROM messages WHERE match_id = ?', [msgMatchId]);
      await db.query('DELETE FROM matches WHERE id = ?', [msgMatchId]);
      await db.query('DELETE FROM users WHERE id IN (?, ?)', [msgUser1, msgUser2]);
    });
  });

  // ==================== USER_BLOCKS TABLE ====================
  describe('User Blocks Table', () => {
    let blockUser1, blockUser2;

    beforeAll(async () => {
      const hash = await bcrypt.hash('TestPass123!', 12);
      const email1 = randomEmail();
      const email2 = randomEmail();
      const [r1] = await db.query(
        'INSERT INTO users (name, email, password_hash, gender) VALUES (?, ?, ?, ?)',
        ['Block User 1', email1, hash, 'male']
      );
      const [r2] = await db.query(
        'INSERT INTO users (name, email, password_hash, gender) VALUES (?, ?, ?, ?)',
        ['Block User 2', email2, hash, 'female']
      );
      blockUser1 = r1.insertId;
      blockUser2 = r2.insertId;
    });

    it('should block a user', async () => {
      const [result] = await db.query(
        'INSERT INTO user_blocks (blocker_id, blocked_id) VALUES (?, ?)',
        [blockUser1, blockUser2]
      );
      expect(result.insertId).toBeDefined();
    });

    it('should enforce unique block constraint', async () => {
      try {
        await db.query(
          'INSERT INTO user_blocks (blocker_id, blocked_id) VALUES (?, ?)',
          [blockUser1, blockUser2]
        );
        fail('Should have thrown duplicate entry error');
      } catch (error) {
        expect(error.code).toBe('ER_DUP_ENTRY');
      }
    });

    it('should handle ON DUPLICATE KEY gracefully', async () => {
      const [result] = await db.query(
        'INSERT INTO user_blocks (blocker_id, blocked_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE blocker_id = blocker_id',
        [blockUser1, blockUser2]
      );
      expect(result.affectedRows).toBeLessThanOrEqual(1);
    });

    it('should unblock a user', async () => {
      const [result] = await db.query(
        'DELETE FROM user_blocks WHERE blocker_id = ? AND blocked_id = ?',
        [blockUser1, blockUser2]
      );
      expect(result.affectedRows).toBe(1);
    });

    afterAll(async () => {
      await db.query('DELETE FROM users WHERE id IN (?, ?)', [blockUser1, blockUser2]);
    });
  });

  // ==================== USER_REPORTS TABLE ====================
  describe('User Reports Table', () => {
    let reportUser1, reportUser2, reportId;

    beforeAll(async () => {
      const hash = await bcrypt.hash('TestPass123!', 12);
      const email1 = randomEmail();
      const email2 = randomEmail();
      const [r1] = await db.query(
        'INSERT INTO users (name, email, password_hash, gender) VALUES (?, ?, ?, ?)',
        ['Report User 1', email1, hash, 'male']
      );
      const [r2] = await db.query(
        'INSERT INTO users (name, email, password_hash, gender) VALUES (?, ?, ?, ?)',
        ['Report User 2', email2, hash, 'female']
      );
      reportUser1 = r1.insertId;
      reportUser2 = r2.insertId;
    });

    it('should create a report', async () => {
      const [result] = await db.query(
        'INSERT INTO user_reports (reporter_id, reported_id, reason, description) VALUES (?, ?, ?, ?)',
        [reportUser1, reportUser2, 'spam', 'This is spam content']
      );
      expect(result.insertId).toBeDefined();
      reportId = result.insertId;
    });

    it('should read reports with user joins', async () => {
      const [rows] = await db.query(
        `SELECT r.*, u1.name as reporter_name, u2.name as reported_name
         FROM user_reports r
         INNER JOIN users u1 ON r.reporter_id = u1.id
         INNER JOIN users u2 ON r.reported_id = u2.id
         WHERE r.id = ?`,
        [reportId]
      );
      expect(rows.length).toBe(1);
      expect(rows[0].reporter_name).toBe('Report User 1');
      expect(rows[0].status).toBe('pending');
    });

    it('should update report status', async () => {
      await db.query(
        'UPDATE user_reports SET status = ?, reviewed_at = NOW() WHERE id = ?',
        ['reviewed', reportId]
      );
      const [rows] = await db.query('SELECT status FROM user_reports WHERE id = ?', [reportId]);
      expect(rows[0].status).toBe('reviewed');
    });

    it('should enforce valid status enum', async () => {
      try {
        await db.query(
          'UPDATE user_reports SET status = ? WHERE id = ?',
          ['invalid_status', reportId]
        );
        const [rows] = await db.query('SELECT status FROM user_reports WHERE id = ?', [reportId]);
        expect(rows[0].status).not.toBe('invalid_status');
      } catch (error) {
        expect(['ER_TRUNCATED_WRONG_VALUE', 'WARN_DATA_TRUNCATED']).toContain(error.code);
      }
    });

    afterAll(async () => {
      await db.query('DELETE FROM user_reports WHERE id = ?', [reportId]);
      await db.query('DELETE FROM users WHERE id IN (?, ?)', [reportUser1, reportUser2]);
    });
  });

  // ==================== SUBSCRIPTION_PLANS TABLE ====================
  describe('Subscription Plans Table', () => {
    it('should have seeded plans', async () => {
      const [rows] = await db.query('SELECT * FROM subscription_plans');
      expect(rows.length).toBeGreaterThanOrEqual(5);
    });

    it('should insert and read a plan', async () => {
      const [result] = await db.query(
        `INSERT INTO subscription_plans (name, description, duration_days, price, features, swipe_limit, super_like_limit, boost_available, see_who_liked, unlimited_likes, display_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['DB Test Plan', 'Test', 30, 99.99, '{"test": true}', 10, 5, false, false, true, 100]
      );
      expect(result.insertId).toBeDefined();

      const [rows] = await db.query('SELECT * FROM subscription_plans WHERE id = ?', [result.insertId]);
      expect(rows[0].name).toBe('DB Test Plan');
      expect(rows[0].price).toBe('99.99');

      await db.query('DELETE FROM subscription_plans WHERE id = ?', [result.insertId]);
    });
  });

  // ==================== APP_SETTINGS TABLE ====================
  describe('App Settings Table', () => {
    it('should have seeded settings', async () => {
      const [rows] = await db.query('SELECT * FROM app_settings');
      expect(rows.length).toBeGreaterThanOrEqual(14);
    });

    it('should upsert a setting', async () => {
      await db.query(
        'INSERT INTO app_settings (setting_key, setting_value, setting_type) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        ['db_test_key', 'db_test_value', 'string', 'db_test_value']
      );
      const [rows] = await db.query('SELECT * FROM app_settings WHERE setting_key = ?', ['db_test_key']);
      expect(rows.length).toBe(1);
      expect(rows[0].setting_value).toBe('db_test_value');
      await db.query('DELETE FROM app_settings WHERE setting_key = ?', ['db_test_key']);
    });
  });

  // ==================== ADMIN_USERS TABLE ====================
  describe('Admin Users Table', () => {
    it('should have seeded admin', async () => {
      const [rows] = await db.query('SELECT * FROM admin_users');
      expect(rows.length).toBeGreaterThanOrEqual(1);
    });

    it('should insert a new admin', async () => {
      const hash = await bcrypt.hash('AdminPass123!', 12);
      const email = randomEmail();
      const [result] = await db.query(
        'INSERT INTO admin_users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
        [email, hash, 'DB Test Admin', 'admin']
      );
      expect(result.insertId).toBeDefined();

      const [rows] = await db.query('SELECT * FROM admin_users WHERE id = ?', [result.insertId]);
      expect(rows[0].role).toBe('admin');
      expect(!!rows[0].is_active).toBe(true);

      await db.query('DELETE FROM admin_users WHERE id = ?', [result.insertId]);
    });

    it('should enforce unique email constraint', async () => {
      const existing = await db.query('SELECT email FROM admin_users LIMIT 1');
      const email = existing[0][0].email;
      try {
        await db.query(
          'INSERT INTO admin_users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
          [email, 'hash', 'Dup Admin', 'admin']
        );
        fail('Should have thrown duplicate entry error');
      } catch (error) {
        expect(error.code).toBe('ER_DUP_ENTRY');
      }
    });
  });

  // ==================== JOIN QUERIES ====================
  describe('Complex Join Queries', () => {
    it('should get user profile with photos and interests via JOIN', async () => {
      const hash = await bcrypt.hash('TestPass123!', 12);
      const email = randomEmail();
      const [r] = await db.query(
        'INSERT INTO users (name, email, password_hash, gender) VALUES (?, ?, ?, ?)',
        ['Join User', email, hash, 'male']
      );
      const userId = r.insertId;

      await db.query(
        'INSERT INTO user_photos (user_id, photo_url, is_primary, display_order) VALUES (?, ?, ?, ?)',
        [userId, '/test/photo.jpg', true, 0]
      );
      await db.query('INSERT INTO user_interests (user_id, interest_id) VALUES (?, ?)', [userId, 1]);
      await db.query('INSERT INTO user_interests (user_id, interest_id) VALUES (?, ?)', [userId, 2]);

      const [rows] = await db.query(
        `SELECT u.id, u.name,
                GROUP_CONCAT(DISTINCT p.photo_url ORDER BY p.display_order ASC SEPARATOR ',') as photos,
                GROUP_CONCAT(DISTINCT i.name SEPARATOR ',') as interest_names
         FROM users u
         LEFT JOIN user_photos p ON u.id = p.user_id
         LEFT JOIN user_interests ui ON u.id = ui.user_id
         LEFT JOIN interests i ON ui.interest_id = i.id
         WHERE u.id = ?
         GROUP BY u.id`,
        [userId]
      );
      expect(rows.length).toBe(1);
      expect(rows[0].photos).toBe('/test/photo.jpg');
      expect(rows[0].interest_names).toContain('Travel');
      expect(rows[0].interest_names).toContain('Music');

      await db.query('DELETE FROM user_interests WHERE user_id = ?', [userId]);
      await db.query('DELETE FROM user_photos WHERE user_id = ?', [userId]);
      await db.query('DELETE FROM users WHERE id = ?', [userId]);
    });

    it('should get matches with user details via JOIN', async () => {
      const hash = await bcrypt.hash('TestPass123!', 12);
      const email1 = randomEmail();
      const email2 = randomEmail();
      const [r1] = await db.query(
        'INSERT INTO users (name, email, password_hash, gender, primary_photo) VALUES (?, ?, ?, ?, ?)',
        ['Join Match 1', email1, hash, 'male', '/m1.jpg']
      );
      const [r2] = await db.query(
        'INSERT INTO users (name, email, password_hash, gender, primary_photo) VALUES (?, ?, ?, ?, ?)',
        ['Join Match 2', email2, hash, 'female', '/m2.jpg']
      );
      const u1 = r1.insertId, u2 = r2.insertId;
      const smaller = Math.min(u1, u2), larger = Math.max(u1, u2);
      const [mRes] = await db.query(
        'INSERT INTO matches (user1_id, user2_id) VALUES (?, ?)',
        [smaller, larger]
      );

      const [rows] = await db.query(
        `SELECT m.*,
                CASE WHEN m.user1_id = ? THEN u2.name ELSE u1.name END as match_user_name
         FROM matches m
         INNER JOIN users u1 ON m.user1_id = u1.id
         INNER JOIN users u2 ON m.user2_id = u2.id
         WHERE m.id = ?`,
        [u1, mRes.insertId]
      );
      expect(rows.length).toBe(1);
      expect(rows[0].match_user_name).toBeDefined();

      await db.query('DELETE FROM matches WHERE id = ?', [mRes.insertId]);
      await db.query('DELETE FROM users WHERE id IN (?, ?)', [u1, u2]);
    });
  });

  // ==================== TRANSACTIONS ====================
  describe('Database Transactions', () => {
    it('should handle multiple inserts atomically', async () => {
      const hash = await bcrypt.hash('TestPass123!', 12);
      const email = randomEmail();
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();
        const [r1] = await conn.query(
          'INSERT INTO users (name, email, password_hash, gender) VALUES (?, ?, ?, ?)',
          ['Tx User', email, hash, 'male']
        );
        const userId = r1.insertId;
        await conn.query('INSERT INTO user_preferences (user_id) VALUES (?)', [userId]);
        await conn.query('INSERT INTO user_photos (user_id, photo_url, is_primary, display_order) VALUES (?, ?, ?, ?)',
          [userId, '/tx/photo.jpg', true, 0]);
        await conn.commit();

        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        const [prefs] = await db.query('SELECT * FROM user_preferences WHERE user_id = ?', [userId]);
        const [photos] = await db.query('SELECT * FROM user_photos WHERE user_id = ?', [userId]);

        expect(users.length).toBe(1);
        expect(prefs.length).toBe(1);
        expect(photos.length).toBe(1);

        await db.query('DELETE FROM user_photos WHERE user_id = ?', [userId]);
        await db.query('DELETE FROM user_preferences WHERE user_id = ?', [userId]);
        await db.query('DELETE FROM users WHERE id = ?', [userId]);
      } catch (error) {
        await conn.rollback();
        throw error;
      } finally {
        conn.release();
      }
    });

    it('should rollback on error', async () => {
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();
        await conn.query(
          'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
          ['Rollback User', 'rollback@test.com', 'hash']
        );
        await conn.query('INSERT INTO non_existent_table VALUES (1)');
        await conn.commit();
        fail('Should have thrown error');
      } catch (error) {
        await conn.rollback();
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', ['rollback@test.com']);
        expect(rows.length).toBe(0);
      } finally {
        conn.release();
      }
    });
  });
});

const mysql = require('mysql2/promise');
require('dotenv').config();

module.exports = async () => {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  });

  console.log('\n--- TEST GLOBAL TEARDOWN ---');

  await db.query('DELETE FROM messages WHERE match_id IN (SELECT id FROM matches WHERE user1_id IN (SELECT id FROM users WHERE email LIKE "%@testconnecto.com"))');
  await db.query('DELETE FROM matches WHERE user1_id IN (SELECT id FROM users WHERE email LIKE "%@testconnecto.com") OR user2_id IN (SELECT id FROM users WHERE email LIKE "%@testconnecto.com")');
  await db.query('DELETE FROM swipes WHERE swiper_id IN (SELECT id FROM users WHERE email LIKE "%@testconnecto.com") OR swiped_id IN (SELECT id FROM users WHERE email LIKE "%@testconnecto.com")');
  await db.query('DELETE FROM user_blocks WHERE blocker_id IN (SELECT id FROM users WHERE email LIKE "%@testconnecto.com") OR blocked_id IN (SELECT id FROM users WHERE email LIKE "%@testconnecto.com")');
  await db.query('DELETE FROM user_reports WHERE reporter_id IN (SELECT id FROM users WHERE email LIKE "%@testconnecto.com") OR reported_id IN (SELECT id FROM users WHERE email LIKE "%@testconnecto.com")');
  await db.query('DELETE FROM user_interests WHERE user_id IN (SELECT id FROM users WHERE email LIKE "%@testconnecto.com")');
  await db.query('DELETE FROM user_photos WHERE user_id IN (SELECT id FROM users WHERE email LIKE "%@testconnecto.com")');
  await db.query('DELETE FROM user_preferences WHERE user_id IN (SELECT id FROM users WHERE email LIKE "%@testconnecto.com")');
  await db.query('DELETE FROM user_subscriptions WHERE user_id IN (SELECT id FROM users WHERE email LIKE "%@testconnecto.com")');
  await db.query('DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE email LIKE "%@testconnecto.com")');
  await db.query('DELETE FROM users WHERE email LIKE "%@testconnecto.com"');
  await db.query('DELETE FROM admin_users WHERE email = "testadmin@connecto.com"');
  await db.query('DELETE FROM subscription_plans WHERE name = "Test Plan"');
  await db.query('DELETE FROM app_settings WHERE setting_key = "test_setting"');

  console.log('Test data cleaned up');
  console.log('--- TEARDOWN COMPLETE ---\n');

  await db.end();
};

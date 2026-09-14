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

  console.log('\n--- TEST GLOBAL SETUP ---');
  console.log('Connected to MySQL database');

  await db.query(`
    INSERT INTO admin_users (email, password_hash, name, role, is_active)
    VALUES ('testadmin@connecto.com', '$2b$10$YQ8GvJmEhRaZxQnLBKLhYOVmEH.MqJFQXhVlPjGPKiKlOwFK/1CfW', 'Test Admin', 'super_admin', TRUE)
    ON DUPLICATE KEY UPDATE is_active = TRUE
  `);

  await db.query(`
    INSERT INTO interests (name, icon, category, is_active)
    VALUES ('Test Interest', '🧪', 'Test', TRUE)
    ON DUPLICATE KEY UPDATE is_active = TRUE
  `);

  await db.query(`
    INSERT INTO app_settings (setting_key, setting_value, setting_type, description)
    VALUES ('test_setting', 'test_value', 'string', 'Test setting')
    ON DUPLICATE KEY UPDATE setting_value = 'test_value'
  `);

  console.log('Test seed data inserted');
  console.log('--- SETUP COMPLETE ---\n');

  await db.end();
};

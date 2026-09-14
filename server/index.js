const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const setupSocket = require('./utils/socket');
const db = require('./config/db');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173','http://localhost:8081','https://connecto-admin-lake.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.set('io', io);
setupSocket(io);

const migrate = async () => {
  try {
    await db.query("UPDATE users SET is_female_verified = TRUE WHERE gender = 'female' AND is_banned = FALSE");

    const [females] = await db.query(
      "SELECT u.id FROM users u LEFT JOIN experts e ON u.id = e.user_id WHERE u.gender = 'female' AND u.is_banned = FALSE AND e.id IS NULL"
    );
    for (const f of females) {
      await db.query(
        "INSERT INTO experts (user_id, price_per_minute, category, rating, is_available, total_calls, total_earnings) VALUES (?, 1.50, 'relationship', 4.5, TRUE, 0, 0)",
        [f.id]
      );
    }

    const [males] = await db.query(
      "SELECT u.id FROM users u LEFT JOIN experts e ON u.id = e.user_id WHERE u.gender = 'male' AND u.is_banned = FALSE AND e.id IS NULL"
    );
    for (const m of males) {
      await db.query(
        "INSERT INTO experts (user_id, price_per_minute, category, rating, is_available, total_calls, total_earnings) VALUES (?, 1.50, 'confidence', 4.5, TRUE, 0, 0)",
        [m.id]
      );
    }

    await db.query("INSERT IGNORE INTO app_settings (setting_key, setting_value) VALUES ('call_rate_per_minute', '1.50')");
    await db.query("INSERT IGNORE INTO app_settings (setting_key, setting_value) VALUES ('ring_timeout_seconds', '10')");
    await db.query("INSERT IGNORE INTO app_settings (setting_key, setting_value) VALUES ('max_ring_attempts', '5')");

    console.log('Migration complete: experts, settings, verified users');
  } catch (e) {
    console.error('Migration error:', e.message);
  }
};

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  migrate().then(() => {
    server.listen(PORT, () => {
      console.log(`ConnectX server running on port ${PORT}`);
    });
  });
}

module.exports = { app, server, io };

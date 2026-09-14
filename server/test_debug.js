const db = require('./config/db');
(async () => {
  // Test: find available females for a male caller (ID 170)
  const callerId = 170;
  const oppositeGender = 'female';

  const [receivers] = await db.query(
    `SELECT u.id, u.name, u.primary_photo, u.is_online, u.gender,
            e.id as expert_id, e.price_per_minute, e.is_available, e.category, e.rating
     FROM users u
     INNER JOIN experts e ON u.id = e.user_id
     WHERE u.gender = ?
       AND u.is_banned = FALSE
       AND u.is_deactivated = FALSE
       AND u.is_online = TRUE
       AND e.is_available = TRUE
       AND u.id != ?
     ORDER BY e.rating DESC, RAND()
     LIMIT 5`,
    [oppositeGender, callerId]
  );

  console.log('Available receivers for caller ' + callerId + ':');
  receivers.forEach(r => console.log('  ID:', r.id, 'Name:', r.name, 'Online:', r.is_online, 'Available:', r.is_available, 'Price:', r.price_per_minute));

  // Also check call_queue table
  const [queues] = await db.query('SELECT * FROM call_queue ORDER BY id DESC LIMIT 5');
  console.log('\nRecent call_queue entries:');
  queues.forEach(q => console.log('  ID:', q.id, 'Caller:', q.caller_id, 'Status:', q.status, 'Queue:', q.female_queue));

  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });

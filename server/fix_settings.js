const db = require('./config/db');
(async () => {
  const [r] = await db.query('SELECT id, name, gender FROM users WHERE gender = ?', ['male']);
  console.log('Male users:');
  r.forEach(u => console.log('  ID:', u.id, 'Name:', u.name));

  const [m] = await db.query('SELECT u.id, u.name, e.id as expert_id FROM users u LEFT JOIN experts e ON u.id = e.user_id WHERE u.gender = ? AND u.is_banned = FALSE', ['male']);
  console.log('\nMale experts:');
  m.forEach(u => console.log('  ID:', u.id, 'Name:', u.name, 'Expert:', u.expert_id));

  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });

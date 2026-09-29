require('dotenv').config();
const bcrypt = require('bcrypt');
const { initDB, getDB } = require('./config/db');

async function seedAdmin() {
  await initDB();
  const db = getDB();

  const email = 'admin@smartbus.com';
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
  if (!existingUser) {
    await db.run(
      'INSERT INTO users (name, email, password, role, must_change_password, status) VALUES (?, ?, ?, ?, ?, ?)',
      ['Super Admin', email, hashedPassword, 'superadmin', 0, 'active']
    );
    console.log(`Admin created: ${email} / admin123 (role: superadmin)`);
  } else {
    await db.run(
      'UPDATE users SET password = ?, role = ?, must_change_password = 0, status = ? WHERE email = ?',
      [hashedPassword, 'superadmin', 'active', email]
    );
    console.log(`Admin updated: ${email} / admin123 (role: superadmin)`);
  }
  await db.close();
}

seedAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});

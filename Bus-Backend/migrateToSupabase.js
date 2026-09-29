require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;
  const isSupabase = (connectionString && connectionString.includes('supabase')) ||
    (process.env.PGHOST && process.env.PGHOST.includes('supabase'));

  let poolConfig;
  if (connectionString) {
    console.log('Connecting to database using DATABASE_URL...');
    poolConfig = {
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    };
  } else if (process.env.PGHOST) {
    console.log(`Connecting to database at ${process.env.PGHOST}:${process.env.PGPORT || 5432}...`);
    poolConfig = {
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT || 5432),
      database: process.env.PGDATABASE || 'postgres',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD,
      ssl: isSupabase || process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 15000,
    };
  } else {
    console.error('Error: Neither DATABASE_URL nor PGHOST is configured in .env');
    process.exit(1);
  }

  const pool = new Pool(poolConfig);
  const client = await pool.connect();

  try {
    const res = await client.query("SELECT current_database() as db, current_user as usr, version() as ver");
    console.log(`Connected successfully to database: ${res.rows[0].db} as ${res.rows[0].usr}`);

    const sqlFile = path.resolve(__dirname, 'supabase_dump.sql');
    if (!fs.existsSync(sqlFile)) {
      throw new Error(`Dump file not found at ${sqlFile}. Run node exportToSupabase.js first.`);
    }

    const sql = fs.readFileSync(sqlFile, 'utf8');
    console.log('Applying schema and migrating records to Supabase...');
    await client.query(sql);

    const counts = await client.query(`
      SELECT 
        (SELECT count(*) FROM institutes) as institutes,
        (SELECT count(*) FROM users) as users,
        (SELECT count(*) FROM routes) as routes,
        (SELECT count(*) FROM buses) as buses,
        (SELECT count(*) FROM payments) as payments
    `);

    console.log('\n Migration to Supabase successful! Verified row counts:');
    console.log(JSON.stringify(counts.rows[0], null, 2));
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(err => {
  console.error('\n Migration failed:', err.message);
  if (err.detail) console.error('Detail:', err.detail);
  process.exit(1);
});

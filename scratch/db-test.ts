
import pg from 'pg';
const { Pool } = pg;

const connectionString = "postgresql://neondb_owner:npg_3XGFKDEP6Uib@ep-late-rain-an45slpq-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function test() {
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to database...');
    const res = await pool.query('SELECT NOW()');
    console.log('Connected! Server time:', res.rows[0].now);
    
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables in database:', tables.rows.map(r => r.table_name));
    
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    console.log('User count:', userCount.rows[0].count);
    
    if (userCount.rows[0].count > 0) {
        const users = await pool.query('SELECT id, name, email FROM users LIMIT 5');
        console.log('Latest users:', users.rows);
    }

  } catch (err) {
    console.error('Database test failed:', err);
  } finally {
    await pool.end();
  }
}

test();

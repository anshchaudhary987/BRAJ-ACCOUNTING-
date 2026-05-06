
import { initializeDatabase } from '../backend/src/config/database.js';
import pg from 'pg';
const { Pool } = pg;

async function verify() {
  console.log('Starting verification...');
  try {
    await initializeDatabase();
    console.log('Initialization complete.');

    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });

    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables present:', tables.rows.map(r => r.table_name));

    const roles = await pool.query("SELECT name FROM roles");
    console.log('Roles present:', roles.rows.map(r => r.name));

    await pool.end();
    console.log('Verification finished successfully.');
  } catch (err) {
    console.error('Verification failed:', err);
  }
}

verify();

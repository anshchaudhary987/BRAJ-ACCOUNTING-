import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/braj_accounting'
});

async function testConnection() {
  try {
    console.log('Attempting to connect to database...');
    const client = await pool.connect();
    console.log('Connected successfully!');
    
    // Test the connection with a simple query
    const result = await client.query('SELECT NOW()');
    console.log('Database time:', result.rows[0].now);
    
    // Check if groups table exists and has data
    const groupsCount = await client.query('SELECT COUNT(*) FROM groups');
    console.log('Number of groups in database:', groupsCount.rows[0].count);
    
    client.release();
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await pool.end();
  }
}

testConnection();
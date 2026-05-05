import pool from './config/database.js';

async function verify() {
  const ledgers = await pool.query('SELECT id, name FROM ledgers LIMIT 5');
  const items = await pool.query('SELECT id, name FROM stock_items LIMIT 5');
  const companies = await pool.query('SELECT id, name FROM companies LIMIT 5');
  
  console.log('Ledgers:', ledgers.rows);
  console.log('Items:', items.rows);
  console.log('Companies:', companies.rows);
}

verify();

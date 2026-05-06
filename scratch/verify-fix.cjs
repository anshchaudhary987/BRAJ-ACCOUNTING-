
const { readFileSync, existsSync } = require('fs');
const { join } = require('path');
const pg = require('pg');
const { Pool } = pg;

const connectionString = "postgresql://neondb_owner:npg_3XGFKDEP6Uib@ep-late-rain-an45slpq-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function verify() {
  console.log('Starting verification with single-query approach...');
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const schemaPath = join(process.cwd(), 'backend', 'src', 'db', 'schema.sql');
    const schemaSql = readFileSync(schemaPath, 'utf8');
    
    const client = await pool.connect();
    try {
        console.log('Executing full schema...');
        await client.query(schemaSql);
        
        console.log('Seeding roles...');
        const roles = [
            ['Admin', 'Full system access'],
            ['Manager', 'Complete company management'],
            ['Accountant', 'Full accounting operations'],
            ['Data Entry', 'Limited entry access']
        ];
        for (const [name, desc] of roles) {
            await client.query(
                'INSERT INTO roles (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
                [name, desc]
            );
        }
    } finally {
        client.release();
    }

    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables present:', tables.rows.map(r => r.table_name));

    const rolesResult = await pool.query("SELECT name FROM roles");
    console.log('Roles present:', rolesResult.rows.map(r => r.name));

    console.log('Verification finished successfully.');
  } catch (err) {
    console.error('Fatal error during execution:', err.message);
    if (err.position) {
        const pos = parseInt(err.position);
        const schemaSql = readFileSync(join(process.cwd(), 'backend', 'src', 'db', 'schema.sql'), 'utf8');
        console.error('Error near:', schemaSql.substring(Math.max(0, pos - 50), pos + 50));
    }
  } finally {
    await pool.end();
  }
}

verify();

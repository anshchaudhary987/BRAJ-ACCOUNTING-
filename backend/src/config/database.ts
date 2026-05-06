import pg from 'pg';
const { Pool } = pg;
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

let dbType: 'postgres' | 'sqlite' = 'postgres';
let pool: any = null;
let sqlite: any = null;

// Vercel Postgres provides POSTGRES_URL or DATABASE_URL
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString || !connectionString.startsWith('postgresql')) {
  console.log('PostgreSQL not configured or URL invalid. Falling back to SQLite.');
  dbType = 'sqlite';
}

if (dbType === 'postgres') {
  pool = new Pool({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    },
    max: 10, // Limit connections in serverless
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Handle pool errors to prevent process crashes in serverless
  pool.on('error', (err: any) => {
    console.error('Unexpected error on idle client', err);
  });
} else {
  const dbPath = join(process.cwd(), 'braj_accounting.db');
  sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  console.log(`Using SQLite database at: ${dbPath}`);
}

// Unified query function
export async function query(text: string, params?: any[]) {
  if (dbType === 'postgres') {
    return pool.query(text, params);
  } else {
    // Convert Postgres-style $1, $2 to SQLite ?
    const sqliteText = text.replace(/\$(\d+)/g, '?');
    
    // Convert Postgres-specific syntax if needed
    let processedText = sqliteText
      .replace(/NOW\(\)/gi, "datetime('now')")
      .replace(/TIMESTAMPTZ/gi, "TEXT")
      .replace(/UUID/gi, "TEXT")
      .replace(/SERIAL/gi, "INTEGER")
      .replace(/NUMERIC\(\d+,\d+\)/gi, "REAL")
      .replace(/RETURNING .*$/gi, "");
    
    if (processedText.trim().toUpperCase().startsWith('SELECT')) {
      const rows = sqlite.prepare(processedText).all(params?.map((p: any) => typeof p === 'boolean' ? (p ? 1 : 0) : p) || []);
      return { rows };
    } else {
      const result = sqlite.prepare(processedText).run(params?.map((p: any) => typeof p === 'boolean' ? (p ? 1 : 0) : p) || []);
      
      if (text.toUpperCase().includes('RETURNING')) {
        const tableMatch = text.match(/INSERT INTO (\w+)/i) || text.match(/UPDATE (\w+)/i);
        if (tableMatch) {
          const tableName = tableMatch[1];
          // For UPDATE, we might need a different way to find the row, but for now we focus on INSERT
          const lastRow = sqlite.prepare(`SELECT * FROM ${tableName} WHERE rowid = ?`).get(result.lastInsertRowid);
          return { rows: [lastRow] };
        }
      }
      return { rows: [], rowCount: result.changes };
    }
  }
}

export async function initializeDatabase() {
  const rootDir = process.cwd().endsWith('backend') ? process.cwd() : join(process.cwd(), 'backend');
  const schemaPath = join(rootDir, 'src', 'db', 'schema.sql');

  if (dbType === 'postgres') {
    const client = await pool.connect();
    try {
      const schemaSql = readFileSync(schemaPath, 'utf8');
      const statements = schemaSql.split(';').filter((stmt: string) => stmt.trim());
      
      for (const stmt of statements) {
        if (stmt.trim()) {
          await client.query(stmt);
        }
      }
    } finally {
      client.release();
    }
  } else {
    let schemaSql = readFileSync(schemaPath, 'utf8');
    
    schemaSql = schemaSql
      .replace(/CREATE EXTENSION IF NOT EXISTS "uuid-ossp";/g, '')
      .replace(/uuid_generate_v4\(\)/g, '(lower(hex(randomblob(16))))')
      .replace(/TIMESTAMPTZ/gi, 'TEXT')
      .replace(/now\(\)/gi, "(datetime('now'))")
      .replace(/UUID/gi, 'TEXT')
      .replace(/NUMERIC\(\d+,\d+\)/gi, 'REAL')
      .replace(/SERIAL/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
      .replace(/CHECK \((.*?)\)/gi, (match) => match.replace(/\$1/g, '?'));
      
    const statements = schemaSql
      .split(';')
      .map(stmt => stmt.replace(/--.*$/gm, '').trim())
      .filter((stmt: string) => stmt.length > 0);

    for (const stmt of statements) {
      try {
        sqlite.prepare(stmt).run();
      } catch (err: any) {
        if (!err.message.includes('already exists')) {
          console.error(`SQLite initialization error on stmt: \n${stmt}\nError: ${err.message}`);
        }
      }
    }
  }
}

export async function getClient() {
  if (dbType === 'postgres') {
    return pool.connect();
  } else {
    return {
      query: (text: string, params?: any[]) => query(text, params),
      release: () => {},
    };
  }
}

const poolMock = {
  query,
  connect: getClient,
  initializeDatabase,
  dbType
};

export default poolMock;
export { dbType };
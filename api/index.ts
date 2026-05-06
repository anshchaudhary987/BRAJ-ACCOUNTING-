import app from '../backend/src/app.js';
import { initializeDatabase, dbType } from '../backend/src/config/database.js';

let initialized = false;

export default async function handler(req: any, res: any) {
  if (req.url === '/api/test') {
    return res.status(200).json({ status: 'API Handler is Alive' });
  }
  if (!initialized) {
    try {
      console.log(`Initializing ${dbType} database...`);
      await initializeDatabase();
      initialized = true;
      console.log('Database initialized successfully in serverless context');
    } catch (err: any) {
      console.error('CRITICAL: Failed to initialize database:', err.message);
      // Don't set initialized = true so it retries on next request
      // But also return an error if it's a fatal setup issue
      if (req.url.includes('/auth/')) {
        return res.status(500).json({ 
          error: 'Database initialization failed', 
          details: err.message,
          hint: 'Ensure DATABASE_URL is correctly set in Vercel environment variables.'
        });
      }
    }
  }
  
  return app(req, res);
}

import app from '../backend/src/app.js';
import { initializeDatabase } from '../backend/src/config/database.js';

let initialized = false;

export default async function handler(req: any, res: any) {
  if (!initialized) {
    try {
      await initializeDatabase();
      initialized = true;
      console.log('Database initialized successfully in serverless context');
    } catch (err) {
      console.error('Failed to initialize database:', err);
    }
  }
  
  return app(req, res);
}

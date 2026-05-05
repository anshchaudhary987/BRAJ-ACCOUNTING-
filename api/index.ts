import app from '../backend/src/app.js';
import { initializeDatabase } from '../backend/src/config/database.js';

// Initialize database (will run once per function warm-up)
initializeDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
});

export default app;

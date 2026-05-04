import app from './app.js';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database.js';
import seed from './seed.js';

dotenv.config();

const port = process.env.PORT || 3000;

// Initialize the database and then start the server
initializeDatabase().then(() => {
  console.log('Database initialized successfully');
  
  // Seed the database with initial groups
  return seed();
}).then(() => {
  console.log('Groups seeded successfully');
  
  // Start the server
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
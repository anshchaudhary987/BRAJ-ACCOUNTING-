import app from './app.js';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database.js';
import seed from './seed.js';

dotenv.config();

const port = process.env.PORT || 3000;

// Initialize the database (this will run once per container instantiation on Vercel)
const initDb = async () => {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');
    await seed();
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Database initialization/seeding failed:', error);
  }
};

// For traditional environments (local, Render, etc.)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  initDb().then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  });
} else {
  // On Vercel, we might want to initialize on the first request or top-level
  // top-level await is supported in Node 14+ / NodeNext
  initDb();
}

export default app;
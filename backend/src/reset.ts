import { initializeDatabase } from './config/database.js';
import seed from './seed.js';

async function reset() {
  try {
    await initializeDatabase();
    console.log('Database initialized');
    await seed();
    console.log('Database seeded');
  } catch (error) {
    console.error('Error during reset:', error);
  }
}

reset();

import { initializeDatabase } from './config/database.js';
import seed from './seed.js';

async function run() {
  console.log('Starting migration and seeding...');
  try {
    await initializeDatabase();
    console.log('Migration completed successfully.');
    await seed();
    console.log('Seeding completed successfully.');
  } catch (err) {
    console.error('Operation failed:', err);
    process.exit(1);
  }
}

run();

import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';

dotenv.config();

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

// Main API Routes
app.use(routes);

// Health check endpoints
import { query } from './config/database.js';

app.get('/api/health', async (req, res) => {
  let dbStatus = 'unknown';
  try {
    await query('SELECT 1');
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = 'error: ' + (err instanceof Error ? err.message : String(err));
  }

  res.json({
    status: 'OK',
    environment: process.env.NODE_ENV,
    vercel: true,
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: Function) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default app;
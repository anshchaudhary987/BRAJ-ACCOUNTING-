import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import companyRoutes from './routes/company.routes.js';
import ledgerRoutes from './routes/ledger.routes.js';
import voucherRoutes from './routes/voucher.routes.js';
import reportsRoutes from './routes/reports.routes.js';


dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection handled in index.ts and controllers via config/database

// Routes
app.use('/api/company', companyRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/voucher', voucherRoutes);
app.use('/api/reports', reportsRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
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
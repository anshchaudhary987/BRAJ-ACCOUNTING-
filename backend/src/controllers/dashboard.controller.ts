import { Request, Response } from 'express';
import pool from '../config/database.js';
import { DashboardService } from '../services/dashboard.service.js';

export class DashboardController {
  static async getStats(req: Request, res: Response) {
    try {
      const companyId = req.headers['x-company-id'] as string;
      if (!companyId) {
        return res.status(400).json({ message: 'Company ID is required' });
      }

      const stats = await DashboardService.getStats(pool, companyId);
      const anomalies = await DashboardService.getAnomalies(pool, companyId);

      res.json({
        stats,
        anomalies,
        lastSync: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Dashboard Stats Error:', error);
      res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
  }
}

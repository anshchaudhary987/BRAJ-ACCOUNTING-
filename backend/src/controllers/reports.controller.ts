import type { Request, Response, NextFunction } from 'express';
import { LedgerRepository } from '../repositories/ledger.repository.js';
import pool from '../config/database.js';

/**
 * Controller for report-related operations.
 */
export class ReportsController {
  /**
   * Generate trial balance report.
   * @param req - Express request object
   * @param res - Express response object
   */
  static async trialBalance(req: Request, res: Response): Promise<void> {
    try {
      // Extract companyId from headers for tenancy
      const companyId = req.headers['x-company-id'] as string;
      if (!companyId) {
        res.status(400).json({ success: false, message: 'Missing company ID in headers' });
        return;
      }

      const { as_of_date } = req.query;
      const asOfDate = as_of_date ? String(as_of_date) : undefined;

      // Get all ledgers for the company
      const ledgers = await LedgerRepository.findByCompany(pool, companyId);
      
      // For each ledger, compute the balance as of the specified date
      const trialBalanceData = [];
      
      for (const ledger of ledgers) {
        // Skip inactive ledgers for trial balance? Usually trial balance includes all ledgers
        // But we can check if the ledger is active if needed
        
        const balance = await LedgerRepository.getBalance(
          pool,
          companyId,
          ledger.id,
          asOfDate
        );
        
        trialBalanceData.push({
          ledgerId: ledger.id,
          ledgerName: ledger.name,
          debitTotal: balance.debitTotal,
          creditTotal: balance.creditTotal,
          balance: balance.balance
        });
      }
      
      res.status(200).json({ success: true, data: trialBalanceData });
    } catch (error) {
      console.error('Error generating trial balance:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, message });
    }
  }

  static async dashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const companyId = req.headers['x-company-id'] as string;
      if (!companyId) {
        res.status(400).json({ success: false, message: 'Missing company ID in headers' });
        return;
      }

      const ledgers = await LedgerRepository.findByCompany(pool, companyId);
      let totalRevenue = 0;
      let totalAssets = 0;
      let cashBalance = 0;

      for (const ledger of ledgers) {
        const bal = await LedgerRepository.getBalance(pool, companyId, ledger.id);
        const amount = Math.abs(bal.balance);
        if (ledger.name.toLowerCase().includes('sales') || ledger.name.toLowerCase().includes('income')) {
          totalRevenue += amount;
        } else if (ledger.name.toLowerCase().includes('cash') || ledger.name.toLowerCase().includes('bank')) {
          cashBalance += amount;
          totalAssets += amount;
        }
      }

      res.status(200).json({ 
        success: true, 
        data: {
          totalRevenue,
          totalAssets,
          cashBalance,
          anomalyCount: 12
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
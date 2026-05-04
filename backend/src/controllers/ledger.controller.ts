import type { Request, Response, NextFunction } from 'express';
import { LedgerRepository } from '../repositories/ledger.repository.js';
import pool from '../config/database.js';

/**
 * Controller for ledger-related operations.
 */
export class LedgerController {
  /**
   * Create a new ledger.
   * @param req - Express request object
   * @param res - Express response object
   */
  static async createLedger(req: Request, res: Response): Promise<void> {
    try {
      // Extract companyId from headers for tenancy check
      const headerCompanyId = req.headers['x-company-id'] as string;
      if (!headerCompanyId) {
        res.status(400).json({ success: false, message: 'Missing company ID in headers' });
        return;
      }

      const { name, groupId, gstin, hsnSac, state, openingBalance, openingBalanceType, tdsApplicable, tdsNature, bankAccountNumber, bankIfsc, bankBranch } = req.body;

      // Validate required fields
      if (!name || !groupId) {
        res.status(400).json({ success: false, message: 'Missing required fields: name and groupId are required' });
        return;
      }

      const ledger = await LedgerRepository.create(pool, headerCompanyId, {
        name,
        groupId,
        gstin,
        hsnSac,
        state,
        openingBalance,
        openingBalanceType,
        tdsApplicable,
        tdsNature,
        bankAccountNumber,
        bankIfsc,
        bankBranch
      });

      res.status(201).json({ success: true, data: ledger });
    } catch (error) {
      console.error('Error creating ledger:', error);
      res.status(500).json({ success: false, message: 'Error creating ledger' });
    }
  }

  /**
   * Get ledgers by company ID.
   * @param req - Express request object
   * @param res - Express response object
   */
  static async getLedgersByCompany(req: Request, res: Response): Promise<void> {
    try {
      // Extract companyId from headers for tenancy check
      const headerCompanyId = req.headers['x-company-id'] as string;
      if (!headerCompanyId) {
        res.status(400).json({ success: false, message: 'Missing company ID in headers' });
        return;
      }

      const ledgers = await LedgerRepository.findByCompany(pool, headerCompanyId);
      res.status(200).json({ success: true, data: ledgers });
    } catch (error) {
      console.error('Error fetching ledgers:', error);
      res.status(500).json({ success: false, message: 'Error fetching ledgers' });
    }
  }

  /**
   * Get a ledger by ID.
   * @param req - Express request object
   * @param res - Express response object
   */
  static async getLedgerById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const headerCompanyId = req.headers['x-company-id'] as string;
      if (!headerCompanyId) {
        res.status(400).json({ success: false, message: 'Missing company ID in headers' });
        return;
      }

      const ledger = await LedgerRepository.findById(pool, headerCompanyId, id as string);
      if (!ledger) {
        res.status(404).json({ success: false, message: 'Ledger not found' });
        return;
      }

      res.status(200).json({ success: true, data: ledger });
    } catch (error) {
      console.error('Error fetching ledger:', error);
      res.status(500).json({ success: false, message: 'Error fetching ledger' });
    }
  }

  /**
   * Update a ledger by ID.
   * @param req - Express request object
   * @param res - Express response object
   */
  static async updateLedger(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const headerCompanyId = req.headers['x-company-id'] as string;
      if (!headerCompanyId) {
        res.status(400).json({ success: false, message: 'Missing company ID in headers' });
        return;
      }

      const updateData = req.body;
      const ledger = await LedgerRepository.update(pool, headerCompanyId, id as string, updateData);
      res.status(200).json({ success: true, data: ledger });
    } catch (error) {
      console.error('Error updating ledger:', error);
      res.status(500).json({ success: false, message: 'Error updating ledger' });
    }
  }
}
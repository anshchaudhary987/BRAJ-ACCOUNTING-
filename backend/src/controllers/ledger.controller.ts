import type { Request, Response } from 'express';
import { LedgerRepository } from '../repositories/ledger.repository.js';
import pool from '../config/database.js';

/**
 * Controller for ledger-related operations.
 */
export class LedgerController {
  /**
   * Create a new ledger.
   */
  static async createLedger(req: Request, res: Response): Promise<void> {
    try {
      const headerCompanyId = req.headers['x-company-id'] as string;
      if (!headerCompanyId) {
        res.status(400).json({ success: false, message: 'Missing company ID in headers' });
        return;
      }

      const { 
        name, groupId, gstin, hsnCodeId, stateId, 
        openingBalance, openingBalanceType, tdsApplicable, 
        tdsNatureCode, bankAccountNumber, bankIfsc, bankBranch 
      } = req.body;

      if (!name || !groupId) {
        res.status(400).json({ success: false, message: 'Missing required fields: name and groupId are required' });
        return;
      }

      const ledger = await LedgerRepository.create(pool, headerCompanyId, {
        name,
        groupId,
        gstin,
        hsnCodeId,
        stateId,
        openingBalance: openingBalance || 0,
        openingBalanceType: openingBalanceType || 'Dr',
        tdsApplicable: tdsApplicable || false,
        tdsNatureCode,
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
   */
  static async getLedgersByCompany(req: Request, res: Response): Promise<void> {
    try {
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
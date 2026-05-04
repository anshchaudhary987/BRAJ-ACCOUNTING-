import type { Request, Response } from 'express';
import { VoucherRepository } from '../repositories/voucher.repository.js';
import { LedgerRepository } from '../repositories/ledger.repository.js';
import { CompanyRepository } from '../repositories/company.repository.js';
import { GstService } from '../services/gst.service.js';
import { TdsService } from '../services/tds.service.js';
import pool from '../config/database.js';
import { VoucherService } from '../services/voucher.service.js';

/**
 * Controller for voucher-related operations.
 */
export class VoucherController {
  static async createVoucher(req: Request, res: Response): Promise<void> {
    const client = await pool.connect();
    try {
      const companyId = req.headers['x-company-id'] as string;
      if (!companyId) {
        res.status(400).json({ success: false, message: 'Missing company ID in headers' });
        return;
      }

      const { voucherNumber, voucherType, date, effectiveDate, narration, entries } = req.body;
      if (!voucherNumber || !voucherType || !date || !entries || !Array.isArray(entries)) {
        res.status(400).json({ success: false, message: 'Missing required fields' });
        return;
      }

      const voucherService = new VoucherService();
      
      // We will perform GST/TDS calculations on the fly here if required by requirements,
      // but to ensure Dr = Cr, we pass entries through validation
      const mergedEntries = voucherService.validateAndMergeEntries(entries);

      await client.query('BEGIN');
      const voucher = await VoucherRepository.saveVoucher(client, companyId, {
        voucherNumber, voucherType, date, effectiveDate: effectiveDate || date, narration, entries: mergedEntries
      });
      await client.query('COMMIT');

      res.status(201).json({ success: true, data: voucher });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating voucher:', error);
      const message = error instanceof Error ? error.message : 'Error creating voucher';
      res.status(500).json({ success: false, message });
    } finally {
      client.release();
    }
  }

  static async listVouchers(req: Request, res: Response): Promise<void> {
    try {
      const companyId = req.headers['x-company-id'] as string;
      if (!companyId) {
        res.status(400).json({ success: false, message: 'Missing company ID in headers' });
        return;
      }

      const filters = {
        fromDate: req.query.fromDate as string | undefined,
        toDate: req.query.toDate as string | undefined,
        type: req.query.type as string | undefined
      };
      const vouchers = await VoucherRepository.findByCompany(pool, companyId, filters);
      res.status(200).json({ success: true, data: vouchers });
    } catch (error) {
      console.error('Error listing vouchers:', error);
      res.status(500).json({ success: false, message: 'Error listing vouchers' });
    }
  }

  static async getVoucherById(req: Request, res: Response): Promise<void> {
    try {
      const companyId = req.headers['x-company-id'] as string;
      if (!companyId) {
        res.status(400).json({ success: false, message: 'Missing company ID in headers' });
        return;
      }

      const { id } = req.params;
      const voucher = await VoucherRepository.findById(pool, companyId, id as string);
      if (!voucher) {
        res.status(404).json({ success: false, message: 'Voucher not found' });
        return;
      }

      res.status(200).json({ success: true, data: voucher });
    } catch (error) {
      console.error('Error fetching voucher:', error);
      res.status(500).json({ success: false, message: 'Error fetching voucher' });
    }
  }
}
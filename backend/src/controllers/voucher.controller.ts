import type { Request, Response } from 'express';
import { VoucherRepository } from '../repositories/voucher.repository.js';
import { LedgerRepository } from '../repositories/ledger.repository.js';
import { CompanyRepository } from '../repositories/company.repository.js';
import { TdsNatureRepository } from '../repositories/tds-nature.repository.js';
import { GstEngineService } from '../services/gst-engine.service.js';
import { TdsEngineService } from '../services/tds-engine.service.js';
import { VoucherNumberService } from '../services/voucher-number.service.js';
import { VoucherService } from '../services/voucher.service.js';
import pool from '../config/database.js';

const gstEngine = new GstEngineService();
const tdsEngine = new TdsEngineService();
const voucherNumberService = new VoucherNumberService();
const voucherService = new VoucherService();

/**
 * Controller for voucher-related operations with automated Indian tax compliance.
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

      const { voucherType, date, effectiveDate, narration, entries } = req.body;
      if (!voucherType || !date || !entries || !Array.isArray(entries)) {
        res.status(400).json({ success: false, message: 'Missing required fields' });
        return;
      }

      await client.query('BEGIN');

      // 1. Fetch Company Details for GST Context
      const company = await CompanyRepository.findById(client, companyId);
      if (!company) throw new Error('Company not found');

      const voucherDate = new Date(date);
      const financialYear = voucherNumberService.getFinancialYear(voucherDate);

      const processedEntries: any[] = [];
      const taxEntries: any[] = [];

      // 2. Process entries for GST and TDS
      for (const entry of entries) {
        const ledger = await LedgerRepository.findById(client, companyId, entry.ledgerId);
        if (!ledger) throw new Error(`Ledger not found: ${entry.ledgerId}`);

        let entryWithTax = { ...entry };

        // GST Logic (for Sales/Purchase)
        if (['Sales', 'Purchase'].includes(voucherType) && ledger.hsn_code_id) {
          const gstResult = gstEngine.calculate({
            voucherType: voucherType as any,
            companyStateId: company.state_id,
            companyGSTIN: company.gstin,
            companyRegistrationType: company.gst_registration_type || 'Regular',
            partyStateId: ledger.state_id || company.state_id, // Default to intra-state if no state on ledger
            taxableAmount: entry.amount,
            taxRate: (ledger as any).gst_rate || 18,
            isReverseCharge: false
          });

          entryWithTax.cgstAmount = gstResult.entries.find(e => e.ledgerName.includes('CGST'))?.amount || 0;
          entryWithTax.sgstAmount = gstResult.entries.find(e => e.ledgerName.includes('SGST'))?.amount || 0;
          entryWithTax.igstAmount = gstResult.entries.find(e => e.ledgerName.includes('IGST'))?.amount || 0;
          entryWithTax.gstTreatmentType = gstResult.gstType;

          // Add tax entries to the voucher
          taxEntries.push(...gstResult.entries.map(e => ({
            ledgerId: e.ledgerName, // In reality, we map "Output CGST" to an actual ledger ID
            amount: e.amount,
            isDebit: e.isDebit,
            narration: e.narration
          })));
        }

        // TDS Logic (for Payments/Journal)
        if (['Payment', 'Journal'].includes(voucherType) && ledger.tds_applicable && ledger.tds_nature_code) {
          const tdsNature = await TdsNatureRepository.findByCode(client, ledger.tds_nature_code);
          if (tdsNature) {
            const tdsResult = tdsEngine.calculate({
              voucherType: voucherType as any,
              partyLedgerId: ledger.id,
              partyLedgerName: ledger.name,
              partyTdsNature: tdsNature,
              expenseAmount: entry.amount,
              isIndividualHuf: true, // Should be determined by ledger/party type
              cumulativeExpenseAmount: 0 // Should fetch from database
            });

            if (tdsResult.tdsEntry) {
              entryWithTax.tdsAmount = tdsResult.tdsAmount;
              taxEntries.push({
                ledgerId: tdsResult.tdsEntry.ledgerName,
                amount: tdsResult.tdsEntry.amount,
                isDebit: tdsResult.tdsEntry.isDebit,
                narration: tdsResult.tdsEntry.narration
              });
            }
          }
        }

        processedEntries.push(entryWithTax);
      }

      // 3. Assemble and Validate
      const finalEntries = voucherService.validateAndMergeEntries(processedEntries, taxEntries);

      // 4. Generate Voucher Number
      const sequence = await VoucherRepository.getNextSequence(client, companyId, voucherType, financialYear);
      const voucherNumber = voucherNumberService.generateFormattedNumber(voucherType, voucherDate, sequence);

      // 5. Save
      const voucher = await VoucherRepository.saveVoucher(client, companyId, {
        voucherNumber,
        voucherType,
        date,
        effectiveDate: effectiveDate || date,
        financialYear,
        narration,
        entries: finalEntries
      });

      await client.query('COMMIT');
      res.status(201).json({ success: true, data: voucher });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating voucher:', error);
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Error' });
    } finally {
      client.release();
    }
  }

  static async listVouchers(req: Request, res: Response): Promise<void> {
    try {
      const companyId = req.headers['x-company-id'] as string;
      if (!companyId) {
        res.status(400).json({ success: false, message: 'Missing company ID' });
        return;
      }
      const vouchers = await VoucherRepository.findByCompany(pool, companyId, req.query as any);
      res.status(200).json({ success: true, data: vouchers });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error' });
    }
  }

  static async getVoucherById(req: Request, res: Response): Promise<void> {
    try {
      const companyId = req.headers['x-company-id'] as string;
      const { id } = req.params;
      const voucher = await VoucherRepository.findById(pool, companyId, id as string);
      if (!voucher) {
        res.status(404).json({ success: false, message: 'Not found' });
        return;
      }
      res.status(200).json({ success: true, data: voucher });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error' });
    }
  }
}
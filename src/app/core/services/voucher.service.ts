import type { IVoucher, IVoucherEntry } from '../models/voucher.interface';
import { IGSTCalculationInput } from '../models/gst-engine.interface';
import { ITdsCalculationInput } from '../models/tds-engine.interface';
import { GstEngineService } from './gst-engine.service';
import { TdsEngineService } from './tds-engine.service';
import { VoucherValidationService } from './voucher-validation.service';

/**
 * Service for creating vouchers with automatic GST and TDS calculations.
 */
export class VoucherService {
  constructor(
    private gstEngine = new GstEngineService(),
    private tdsEngine = new TdsEngineService(),
    private voucherValidationService = new VoucherValidationService()
  ) {}

  /**
   * Create a voucher with automatic GST/TDS calculations based on the provided inputs.
   * 
   * @param input - The input object containing voucher details, company info, and optional party ledger.
   * @returns A validated voucher object.
   * @throws Error if validation fails or if required data is missing.
   */
  createVoucher(input: {
    voucherType: IVoucher['voucherType'];
    date: string;
    reference?: string;
    narration?: string;
    manualEntries: IVoucherEntry[];
    company: {
      state: string;
      gstin: string;
      registrationType: string;
      pan: string;
      tan: string;
    };
    partyLedger?: {
      id: string;
      name: string;
      state: string;
      gstin?: string;
      registrationType: string;
      isTDSApplicable: boolean;
      tdsNatureOfPayment?: string;
    }
  }): IVoucher {
    // 1. Start with manual entries
    const entries: IVoucherEntry[] = [...input.manualEntries];

    // 2. Handle GST for Sales/Purchase vouchers
    if (input.voucherType === 'Sales' || input.voucherType === 'Purchase') {
      // Find the base income/expense entry (assume first Dr for Purchase, first Cr for Sales)
      const baseEntryIndex = entries.findIndex(entry => 
        (input.voucherType === 'Purchase' && entry.type === 'Dr') ||
        (input.voucherType === 'Sales' && entry.type === 'Cr')
      );

      if (baseEntryIndex === -1) {
        throw new Error(`Could not find base ${input.voucherType === 'Purchase' ? 'debit' : 'credit'} entry for GST calculation`);
      }

      const baseEntry = entries[baseEntryIndex];
      const taxableAmount = baseEntry.amount;

      // Prepare GST calculation input
      const gstInput: IGSTCalculationInput = {
        voucherType: input.voucherType,
        companyState: input.company.state,
        companyGSTIN: input.company.gstin,
        companyRegistrationType: input.company.registrationType as any,
        partyState: input.partyLedger?.state || '',
        ...(input.partyLedger?.gstin !== undefined ? { partyGSTIN: input.partyLedger?.gstin } : {}),
        partyRegistrationType: input.partyLedger?.registrationType as any || 'Consumer',
        taxableAmount,
        taxRate: 18, // Default GST rate, can be made configurable
      };

      // Calculate GST
      const gstOutput = this.gstEngine.calculate(gstInput);
      // Add GST entries to the voucher
      entries.push(...gstOutput.entries);
    }

    // 3. Handle TDS for Payment vouchers with applicable party
    if (input.voucherType === 'Payment' && input.partyLedger && input.partyLedger.isTDSApplicable) {
      const partyLedger = input.partyLedger;
      // Find the party entry (Credit entry with matching ledgerId)
      const partyEntryIndex = entries.findIndex(entry =>
        entry.type === 'Cr' && entry.ledgerId === partyLedger.id
      );

      if (partyEntryIndex === -1) {
        throw new Error(`Could not find party credit entry for ledgerId: ${input.partyLedger.id}`);
      }

      const partyEntry = entries[partyEntryIndex];
      const expenseAmount = partyEntry.amount;

      // Prepare TDS calculation input
      const tdsInput: ITdsCalculationInput = {
        voucherType: input.voucherType,
        partyLedgerId: partyLedger.id,
        partyLedgerName: partyLedger.name,
        partyTdsNatureOfPayment: partyLedger.tdsNatureOfPayment!,
        expenseAmount,
        companyPAN: input.company.pan,
        companyTAN: input.company.tan
      };

      // Calculate TDS
      const tdsOutput = this.tdsEngine.calculate(tdsInput);
      // Replace the original party entry with the adjusted one
      entries[partyEntryIndex] = tdsOutput.partyEntryAdjustment;
      // Add the TDS entry
      entries.push(tdsOutput.tdsEntry);
    }

    // 4. Construct the voucher object
    const voucher: IVoucher = {
      date: input.date,
      voucherType: input.voucherType,
      reference: input.reference,
      narration: input.narration,
      entries
      // id and voucherNumber are optional and will be set by the caller/persistence layer
    };

    // 5. Validate the voucher (this will throw if invalid)
    this.voucherValidationService.validateVoucher(voucher);

    // 6. Return the voucher
    return voucher;
  }
}
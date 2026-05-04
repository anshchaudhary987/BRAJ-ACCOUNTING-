import type { IVoucher, IVoucherEntry } from '../models/voucher.model.js';

export class VoucherValidationService {
  /**
   * Validate a voucher object.
   * Throws an error if validation fails.
   */
  validateVoucher(voucher: IVoucher): void {
    // Check that voucher has at least two entries
    if (!voucher.entries || voucher.entries.length < 2) {
      throw new Error('Voucher must have at least two entries');
    }

    // Calculate total debit and credit
    let totalDebit = 0;
    let totalCredit = 0;

    for (const entry of voucher.entries) {
      // Validate entry
      if (!entry.ledgerId) {
        throw new Error('Each entry must have a ledgerId');
      }
      if (entry.amount <= 0) {
        throw new Error('Entry amount must be greater than zero');
      }
      if (entry.isDebit === undefined) {
        throw new Error('Each entry must specify isDebit (true for debit, false for credit)');
      }

      if (entry.isDebit) {
        totalDebit += entry.amount;
      } else {
        totalCredit += entry.amount;
      }
    }

    // Check that total debit equals total credit
    if (totalDebit !== totalCredit) {
      throw new Error(`Voucher is not balanced: total debit (${totalDebit}) does not equal total credit (${totalCredit})`);
    }
  }
}
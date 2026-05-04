import { IVoucher, IVoucherEntry } from '../models/voucher.interface';

export class VoucherValidationService {
  /**
   * Validates a voucher object.
   * Throws an Error if the voucher is invalid.
   * @param voucher - The voucher to validate.
   */
  validateVoucher(voucher: IVoucher): void {
    // 1. Check that voucher.entries has at least two entries
    if (!voucher.entries || voucher.entries.length < 2) {
      throw new Error('A voucher must have at least two entries (one debit and one credit).');
    }

    let totalDr = 0;
    let totalCr = 0;

    // 2. Ensure each entry amount > 0 and accumulate totals
    for (const entry of voucher.entries) {
      if (entry.amount <= 0) {
        throw new Error(`Entry amount must be greater than zero. LedgerId: ${entry.ledgerId}, Amount: ${entry.amount}`);
      }

      if (entry.type === 'Dr') {
        totalDr += entry.amount;
      } else if (entry.type === 'Cr') {
        totalCr += entry.amount;
      }
    }

    // 3. Check if total debit equals total credit
    if (totalDr !== totalCr) {
      const diff = totalDr - totalCr;
      throw new Error(`Voucher is unbalanced. Debit total: ${totalDr}, Credit total: ${totalCr}, Difference: ${diff}`);
    }
    // If equal, return void (no error)
  }
}
import { IVoucher, IVoucherEntry } from '../models/voucher.interface';
import ILedger from '../models/ledger.interface';
import ICompany from '../models/company.interface';
import { VoucherValidationService } from './voucher-validation.service';

/**
 * Service for generating opening balance vouchers.
 * Mimics Tally's automatic opening balance voucher creation.
 */
export class OpeningBalanceService {
  /**
   * Generate an opening balance voucher from the given ledgers and company.
   * 
   * @param ledgers - Array of ledgers, each with optional openingBalance and openingBalanceType.
   * @param company - The company for which the opening voucher is generated.
   * @returns A balanced voucher of type Journal with the opening balances.
   * @throws Error if validation fails (should not happen if balancing is correct).
   */
  generateOpeningVoucher(ledgers: ILedger[], company: ICompany): IVoucher {
    // 1. Filter ledgers with openingBalance > 0
    // Using a type guard to ensure openingBalance is a number > 0
    const ledgersWithOpeningBalance = ledgers.filter((ledger): ledger is ILedger & { openingBalance: number; openingBalanceType: 'Dr' | 'Cr' } => {
      return (
        ledger.openingBalance !== undefined &&
        ledger.openingBalance !== null &&
        ledger.openingBalance > 0 &&
        (ledger.openingBalanceType === 'Dr' || ledger.openingBalanceType === 'Cr')
      );
    });

    // 2. Create voucher entries for each ledger with opening balance
    const entries: IVoucherEntry[] = ledgersWithOpeningBalance.map(ledger => ({
      ledgerId: ledger.id || '', // Assuming ledger has an id; if not, we use empty string (should be validated elsewhere)
      type: ledger.openingBalanceType,
      amount: ledger.openingBalance
    }));

    // 3. Calculate total Dr and total Cr
    let totalDr = 0;
    let totalCr = 0;
    for (const entry of entries) {
      if (entry.type === 'Dr') {
        totalDr += entry.amount;
      } else if (entry.type === 'Cr') {
        totalCr += entry.amount;
      }
    }

    // 4. Balance the voucher if necessary
    if (totalDr !== totalCr) {
      const diff = Math.abs(totalDr - totalCr);
      // Round to 2 decimal places
      const balancedDiff = Math.round(diff * 100) / 100;

      if (totalDr > totalCr) {
        // Add a credit entry to balance
        entries.push({
          ledgerId: 'Difference in Opening Balances',
          type: 'Cr',
          amount: balancedDiff
        });
      } else {
        // Add a debit entry to balance
        entries.push({
          ledgerId: 'Difference in Opening Balances',
          type: 'Dr',
          amount: balancedDiff
        });
      }
    }

    // 5. Construct the voucher
    const voucher: IVoucher = {
      voucherType: 'Journal',
      date: company.booksBeginningDate,
      narration: 'Opening balance entry',
      entries
    };

    // 6. Validate the voucher (should pass because we balanced it)
    new VoucherValidationService().validateVoucher(voucher);

    // 7. Return the voucher
    return voucher;
  }
}
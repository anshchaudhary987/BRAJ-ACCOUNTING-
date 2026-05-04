/**
 * Voucher Service for validating and assembling voucher entries.
 * This service is pure (no database calls) and focuses on business logic.
 */
export class VoucherService {
  /**
   * Validate that total debits equal total credits and merge raw and tax entries.
   * 
   * @param rawEntries - Base entries (e.g., income/expense ledgers)
   * @param taxEntries - Tax and TDS entries (pre-computed by controller using GstService and TdsService)
   * @returns Combined entries array if validation passes
   * @throws Error if total debits do not equal total credits
   */
  validateAndMergeEntries(
    rawEntries: Array<{ ledgerId: string; amount: number; isDebit: boolean }>,
    taxEntries: Array<{ ledgerId: string; amount: number; isDebit: boolean }> = []
  ): Array<{ ledgerId: string; amount: number; isDebit: boolean }> {
    // Combine all entries
    const allEntries = [...rawEntries, ...taxEntries];

    // Calculate total debits and credits
    const totalDebit = allEntries
      .filter(entry => entry.isDebit)
      .reduce((sum, entry) => sum + entry.amount, 0);

    const totalCredit = allEntries
      .filter(entry => !entry.isDebit)
      .reduce((sum, entry) => sum + entry.amount, 0);

    // Validate balance (with tolerance for floating point rounding)
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new Error(`Unbalanced voucher: Total Debit (${totalDebit}) !== Total Credit (${totalCredit})`);
    }

    return allEntries;
  }
}
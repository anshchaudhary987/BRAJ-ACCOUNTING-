import { ITdsEngine, ITdsCalculationInput, ITdsCalculationOutput } from '../models/tds-engine.interface';
import { IVoucherEntry } from '../models/voucher.interface';

/**
 * TDS Engine Service for calculating Tax Deducted at Source on payments.
 * Implements the ITdsEngine interface.
 */
export class TdsEngineService implements ITdsEngine {
  /**
   * TDS rates for common payment sections.
   * These are simplified rates for demonstration; in a real system,
   * these would be configurable or come from a master table.
   */
  private readonly tdsRates: Record<string, number> = {
    '194C': 1,   // 1% for contractor/sub-contractor
    '194J': 10,  // 10% for professional/technical services
    '194H': 5,   // 5% for commission/brokerage
    '194I': 2,   // 2% for rent of plant/machinery (simplified)
    '194A': 10   // 10% for interest other than securities
  };

  /**
   * Calculate TDS based on the input.
   * Throws an error if the TDS section is not supported.
   * 
   * @param input - The TDS calculation input.
   * @returns The TDS calculation output containing TDS amount, TDS payable entry, net party amount, and party entry adjustment.
   * @throws Error if the TDS section is not supported.
   */
  calculate(input: ITdsCalculationInput): ITdsCalculationOutput {
    // 1. Check that the TDS section is supported
    const rate = this.tdsRates[input.partyTdsNatureOfPayment];
    if (rate === undefined) {
      throw new Error(`TDS section not supported yet: ${input.partyTdsNatureOfPayment}`);
    }

    // 2. Compute TDS amount (rounded to 2 decimals)
    const tdsAmount = Math.round((input.expenseAmount * rate / 100) * 100) / 100;

    // 3. Compute net amount to party
    const netPartyAmount = input.expenseAmount - tdsAmount;

    // 4. Create TDS Payable entry (Credit)
    const tdsEntry: IVoucherEntry = {
      ledgerId: 'TDS Payable',
      type: 'Cr' as const,
      amount: tdsAmount,
      narration: `TDS deducted u/s ${input.partyTdsNatureOfPayment} @ ${rate}%`
    };

    // 5. Create Party entry adjustment (Credit of net amount)
    const partyEntryAdjustment: IVoucherEntry = {
      ledgerId: input.partyLedgerId,
      type: 'Cr' as const,
      amount: netPartyAmount,
      narration: `Payment after TDS on ${input.partyLedgerName}`
    };

    // 6. Return output
    return {
      tdsAmount,
      tdsEntry,
      netPartyAmount,
      partyEntryAdjustment
    };
  }
}
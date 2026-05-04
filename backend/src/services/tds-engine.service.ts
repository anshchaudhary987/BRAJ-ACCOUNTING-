import type { ITdsCalculationInput, ITdsCalculationOutput } from '../models/tds-engine.model.js';

/**
 * TDS Engine Service for calculating TDS on payments.
 * Implements the ITdsEngine interface.
 */
export class TdsEngineService {
  /**
   * Calculate TDS based on the input.
   * Follows Indian TDS rules for various sections.
   * 
   * @param input - The TDS calculation input.
   * @returns The TDS calculation output.
   */
  calculate(input: ITdsCalculationInput): ITdsCalculationOutput {
    // TDS rates for various sections (in percentage)
    const tdsRates: Record<string, number> = {
      '194C': 1,   // Payments to contractors (individual/HUF: 1%, others: 2%)
      '194J': 10,  // Fees for professional or technical services
      '194H': 5,   // Commission or brokerage
      '194I': 10,  // Rent (plant/machinery: 2%, land/building/furniture: 10%)
      '194A': 10,  // Interest other than interest on securities
      // Add more as needed
    };

    // Get the rate for the given section, default to 10% if not found
    const rate = tdsRates[input.partyTdsNatureOfPayment] || 10;

    // Calculate TDS amount (rounded to two decimal places)
    const tdsAmount = Math.round((input.expenseAmount * rate / 100) * 100) / 100;

    // Net amount to be paid to the party
    const netPartyAmount = Math.round((input.expenseAmount - tdsAmount) * 100) / 100;

    // Build TDS entry (Credit for TDS Payable)
    const tdsEntry: ITdsCalculationOutput['tdsEntry'] = {
      ledgerName: 'TDS Payable', // In a real system, this would be looked up from the ledger master
      amount: tdsAmount,
      isDebit: false, // Credit
      narration: `TDS u/s ${input.partyTdsNatureOfPayment} @ ${rate}%`
    };

    // Build party entry adjustment (Credit for net amount)
    const partyEntryAdjustment: ITdsCalculationOutput['partyEntryAdjustment'] = {
      ledgerName: input.partyLedgerName, // This should match the ledger name of the party
      amount: netPartyAmount,
      isDebit: false, // Credit
      narration: `Payment to ${input.partyLedgerName} after TDS`
    };

    // 7. Return output
    return {
      tdsAmount,
      tdsEntry,
      netPartyAmount,
      partyEntryAdjustment
    };
  }
}
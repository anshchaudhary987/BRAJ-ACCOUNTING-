import type { ITdsCalculationInput, ITdsCalculationOutput } from '../models/tds-engine.model.js';

/**
 * TDS Engine Service for calculating TDS on payments.
 * Handles Indian Income Tax thresholds and rates for FY 2024-25.
 */
export class TdsEngineService {
  /**
   * Calculate TDS based on the input and nature of payment.
   */
  calculate(input: ITdsCalculationInput): ITdsCalculationOutput {
    const { partyTdsNature, expenseAmount, cumulativeExpenseAmount, isIndividualHuf } = input;
    
    // 1. Check if total expense (including this one) exceeds the threshold
    const totalWithCurrent = cumulativeExpenseAmount + expenseAmount;
    const isThresholdBreached = totalWithCurrent > partyTdsNature.thresholdLimit;

    if (!isThresholdBreached) {
      return {
        tdsAmount: 0,
        tdsEntry: null,
        netPartyAmount: expenseAmount,
        isThresholdBreached: false
      };
    }

    // 2. Select rate based on party category (Individual/HUF vs Others)
    const rate = isIndividualHuf ? partyTdsNature.rateIndividual : partyTdsNature.rateOthers;

    // 3. Calculate TDS 
    // Note: In India, if threshold is breached, TDS is usually calculated on the ENTIRE amount if it's the first time,
    // or just on the current amount if TDS was already deducted on previous amounts.
    // For simplicity here, we assume if it's breached, we deduct on current expense.
    const tdsAmount = Math.round((expenseAmount * rate / 100) * 100) / 100;
    const netPartyAmount = Math.round((expenseAmount - tdsAmount) * 100) / 100;

    // 4. Build TDS entry (Credit for TDS Payable)
    const tdsEntry = {
      ledgerName: `TDS u/s ${partyTdsNature.section} Payable`,
      amount: tdsAmount,
      isDebit: false,
      narration: `TDS u/s ${partyTdsNature.section} @ ${rate}% (Threshold: ${partyTdsNature.thresholdLimit})`
    };

    return {
      tdsAmount,
      tdsEntry,
      netPartyAmount,
      isThresholdBreached: true
    };
  }
}
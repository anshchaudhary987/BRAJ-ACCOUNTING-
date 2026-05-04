import type { IVoucherEntry } from './voucher.interface';

/**
 * Input for the TDS calculation engine.
 */
export interface ITdsCalculationInput {
  /**
   * Voucher type for which TDS is being calculated.
   * Typically 'Payment' or 'Journal'.
   */
  voucherType: 'Payment' | 'Journal';

  /**
   * ID of the party ledger (must have isTDSApplicable: true and tdsNatureOfPayment set).
   */
  partyLedgerId: string;

  /**
   * Display name of the party ledger (for narration).
   */
  partyLedgerName: string;

  /**
   * TDS section under which tax is deducted (e.g., "194C", "194J", "194H").
   */
  partyTdsNatureOfPayment: string;

  /**
   * Gross amount being paid/credited to the party before TDS.
   */
  expenseAmount: number;

  /**
   * Company's PAN for reference.
   */
  companyPAN: string;

  /**
   * Company's TAN.
   */
  companyTAN: string;
}

/**
 * Output from the TDS calculation engine.
 */
export interface ITdsCalculationOutput {
  /**
   * Calculated TDS amount.
   */
  tdsAmount: number;

  /**
   * Entry for TDS Payable (typically a Credit).
   */
  tdsEntry: IVoucherEntry;

  /**
   * Net amount to be paid to the party (expenseAmount - tdsAmount).
   */
  netPartyAmount: number;

  /**
   * Entry for the party (typically a Credit of netPartyAmount).
   * Note: The original party entry in the voucher should be adjusted to this amount.
   */
  partyEntryAdjustment: IVoucherEntry;
}

/**
 * TDS engine interface.
 */
export interface ITdsEngine {
  /**
   * Calculate TDS based on the input.
   * @param input - The TDS calculation input.
   * @returns The TDS calculation output.
   */
  calculate(input: ITdsCalculationInput): ITdsCalculationOutput;
}
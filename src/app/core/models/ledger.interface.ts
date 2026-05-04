export default interface ILedger {
  /**
   * The auto-generated unique ID; not needed for creation, but present when fetched from DB.
   */
  id?: string;

  /**
   * Required, unique, like "Computer Expenses A/c".
   */
  ledgerName: string;

  /**
   * Optional print name.
   */
  alias?: string;

  /**
   * Required, must match an `id` from the chart-of-accounts groups, e.g., "fixed-assets".
   */
  groupId: string;

  /**
   * Optional, defaults to 0. Use `number` for currency; stored as float/decimal in DB.
   */
  openingBalance?: number;

  /**
   * Optional, only meaningful if openingBalance > 0; otherwise can be omitted.
   * "Dr" for Debit, "Cr" for Credit.
   */
  openingBalanceType?: 'Dr' | 'Cr';

  /**
   * Optional, ISO date string like "2025-04-01". Defaults to the company's financial year start.
   */
  openingBalanceDate?: string;

  /**
   * Optional, defaults to false. Can be auto-set from the group's `isGSTRelevant` flag.
   */
  isGSTApplicable?: boolean;

  /**
   * Optional, only needed if isGSTApplicable is true.
   * "Regular" | "Composition" | "Unregistered" | "Consumer"
   */
  gstRegistrationType?: 'Regular' | 'Composition' | 'Unregistered' | 'Consumer';

  /**
   * Optional, GST identification number of the party or business.
   */
  gstin?: string;

  /**
   * Optional, HSN code for goods or SAC for services. Relevant for sales/purchase ledgers.
   */
  hsnSacCode?: string;

  /**
   * Optional, state code like "MH", "DL". Essential for GST state-wise calculations and determining intra/inter-state.
   */
  state?: string;

  /**
   * Optional, Permanent Account Number for TDS.
   */
  pan?: string;

  /**
   * Optional, defaults to false. If true, TDS will be deducted in applicable vouchers.
   */
  isTDSApplicable?: boolean;

  /**
   * Optional, like "194C", "194J". Only required if isTDSApplicable is true.
   */
  tdsNatureOfPayment?: string;

  /**
   * Optional, defaults to false.
   */
  isBankLedger?: boolean;

  /**
   * Optional, only if isBankLedger.
   */
  bankAccountNumber?: string;

  /**
   * Optional, only if isBankLedger.
   */
  bankIFSC?: string;

  /**
   * Optional, only if isBankLedger.
   */
  bankName?: string;

  /**
   * Optional, defaults to false. True if the ledger belongs to Sundry Debtors or Creditors.
   */
  isPartyLedger?: boolean;

  /**
   * Optional, free text.
   */
  narration?: string;

  /**
   * Optional, defaults to "Active".
   */
  status?: 'Active' | 'Inactive';
}
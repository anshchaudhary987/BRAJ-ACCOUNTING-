export interface IVoucherEntry {
  /**
   * Optional unique ID when fetched from DB.
   */
  id?: string;

  /**
   * Required, must be the ID of an existing Ledger.
   */
  ledgerId: string;

  /**
   * Required, either "Dr" (Debit) or "Cr" (Credit).
   */
  type: 'Dr' | 'Cr';

  /**
   * Required, must be greater than 0.
   */
  amount: number;

  /**
   * Optional cheque details.
   */
  chequeDetails?: {
    chequeNo: string;
    chequeDate: string; // ISO date
    bankName: string;
  };

  /**
   * Optional line-level description.
   */
  narration?: string;
}

export interface IVoucher {
  /**
   * Optional unique ID.
   */
  id?: string;

  /**
   * Required, one of the voucher types.
   */
  voucherType:
    | 'Payment'
    | 'Receipt'
    | 'Contra'
    | 'Sales'
    | 'Purchase'
    | 'Journal'
    | 'Debit Note'
    | 'Credit Note';

  /**
   * Optional; will be auto-generated if not provided.
   */
  voucherNumber?: string;

  /**
   * Required, ISO date like "2024-04-15".
   */
  date: string;

  /**
   * Optional, like invoice number or cheque number.
   */
  reference?: string;

  /**
   * Optional, overall description.
   */
  narration?: string;

  /**
   * Required, must contain at least two entries, and the total Dr must equal total Cr.
   * This rule will be enforced by a validator.
   */
  entries: IVoucherEntry[];
}
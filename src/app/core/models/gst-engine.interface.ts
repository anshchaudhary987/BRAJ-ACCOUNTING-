import type { IVoucherEntry } from './voucher.interface';

/**
 * Input for the GST calculation engine.
 */
export interface IGSTCalculationInput {
  /**
   * Required, because GST treatment differs slightly for purchases like reverse charge.
   * 'Sales' | 'Purchase' | 'Debit Note' | 'Credit Note'
   */
  voucherType: 'Sales' | 'Purchase' | 'Debit Note' | 'Credit Note';

  /**
   * Required, state code of the company, e.g., "MH"
   */
  companyState: string;

  /**
   * Required
   */
  companyGSTIN: string;

  /**
   * Required
   * "Regular" | "Composition" | "Unregistered"
   */
  companyRegistrationType: 'Regular' | 'Composition' | 'Unregistered';

  /**
   * Required, state code of the customer/supplier from the party ledger
   */
  partyState: string;

  /**
   * Optional, if the party is unregistered, this may be blank
   */
  partyGSTIN?: string;

  /**
   * Required
   * "Regular" | "Composition" | "Unregistered" | "Consumer"
   */
  partyRegistrationType: 'Regular' | 'Composition' | 'Unregistered' | 'Consumer';

  /**
   * Required, the base value of the transaction before tax
   */
  taxableAmount: number;

  /**
   * Optional, HSN/SAC code for the item
   */
  hsnSacCode?: string;

  /**
   * Required, the total GST rate applicable, e.g., 18 for 18%. For simplicity, we assume a single rate; the engine will split it into CGST+SGST or IGST.
   */
  taxRate: number;

  /**
   * Optional, defaults to false. If true, GST is payable under reverse charge, which changes the accounting entry logic.
   */
  isReverseCharge?: boolean;
}

/**
 * Output from the GST calculation engine.
 */
export interface IGSTCalculationOutput {
  /**
   * The calculated tax entries, e.g., CGST and SGST ledgers credited, or IGST ledger credited/debited
   */
  entries: IVoucherEntry[];

  /**
   * The type of GST applied
   * "CGST+SGST" | "IGST" | "NONE"
   */
  gstType: 'CGST+SGST' | 'IGST' | 'NONE';

  /**
   * Total tax amount
   */
  totalTaxAmount: number;
}

/**
 * GST engine interface.
 */
export interface IGSTEngine {
  /**
   * Calculate GST based on the input.
   * @param input - The GST calculation input.
   * @returns The GST calculation output.
   */
  calculate(input: IGSTCalculationInput): IGSTCalculationOutput;
}
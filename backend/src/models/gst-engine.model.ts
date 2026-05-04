export interface IGSTCalculationInput {
  voucherType: 'Sales' | 'Purchase' | 'Debit Note' | 'Credit Note';
  companyState: string;
  companyGSTIN: string;
  companyRegistrationType: 'Regular' | 'Composition' | 'Unregistered';
  partyState: string;
  partyGSTIN?: string;
  partyRegistrationType: 'Regular' | 'Composition' | 'Unregistered' | 'Consumer';
  taxableAmount: number;
  hsnSacCode?: string;
  taxRate: number;
  isReverseCharge?: boolean;
}

export interface IGSTCalculationOutput {
  entries: {
    ledgerName: string; // This is the name of the ledger, e.g., "Output CGST"
    amount: number;
    isDebit: boolean;
    narration?: string;
    // We will also include the tax breakdown for the entry, but note: each entry is for a specific tax head.
    // So we can have:
    cgstAmount?: number;
    sgstAmount?: number;
    igstAmount?: number;
  }[];
  gstType: 'CGST+SGST' | 'IGST' | 'NONE';
  totalTaxAmount: number;
}
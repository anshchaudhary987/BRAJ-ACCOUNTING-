export interface IGSTCalculationInput {
  voucherType: 'Sales' | 'Purchase' | 'Debit Note' | 'Credit Note';
  companyStateId: string;
  companyGSTIN: string;
  companyRegistrationType: 'Regular' | 'Composition' | 'Unregistered';
  partyStateId: string;
  partyGSTIN?: string;
  partyRegistrationType: 'Regular' | 'Composition' | 'Unregistered' | 'Consumer';
  taxableAmount: number;
  hsnSacCode?: string;
  taxRate: number;
  isReverseCharge?: boolean;
}

export interface IGSTCalculationOutput {
  entries: {
    ledgerName: string; 
    amount: number;
    isDebit: boolean;
    narration?: string;
    cgstAmount?: number;
    sgstAmount?: number;
    igstAmount?: number;
  }[];
  gstType: 'CGST+SGST' | 'IGST' | 'NONE';
  totalTaxAmount: number;
}
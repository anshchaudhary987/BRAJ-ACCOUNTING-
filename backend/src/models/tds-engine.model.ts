export interface ITdsCalculationInput {
  voucherType: 'Payment' | 'Journal';
  partyLedgerId: string;
  partyLedgerName: string;
  partyTdsNatureOfPayment: string;
  expenseAmount: number;
  companyPAN: string;
  companyTAN: string;
}

export interface ITdsCalculationOutput {
  tdsAmount: number;
  tdsEntry: {
    ledgerName: string;
    amount: number;
    isDebit: boolean;
    narration?: string;
  };
  netPartyAmount: number;
  partyEntryAdjustment: {
    ledgerName: string;
    amount: number;
    isDebit: boolean;
    narration?: string;
  };
}
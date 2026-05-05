export interface ITdsNature {
  code: string;
  section: string;
  description: string;
  rateIndividual: number;
  rateOthers: number;
  thresholdLimit: number;
}

export interface ITdsCalculationInput {
  voucherType: 'Payment' | 'Journal';
  partyLedgerId: string;
  partyLedgerName: string;
  partyTdsNature: ITdsNature;
  expenseAmount: number;
  isIndividualHuf: boolean;
  cumulativeExpenseAmount: number; // For threshold checking
}

export interface ITdsCalculationOutput {
  tdsAmount: number;
  tdsEntry: {
    ledgerName: string;
    amount: number;
    isDebit: boolean;
    narration?: string;
  } | null;
  netPartyAmount: number;
  isThresholdBreached: boolean;
}
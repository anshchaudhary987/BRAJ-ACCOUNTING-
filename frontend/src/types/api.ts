export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface State {
  id: string;
  name: string;
  code: string;
}

export interface HSN {
  id: string;
  code: string;
  description: string;
  gstRate: number;
}

export interface Company {
  id: string;
  name: string;
  stateId: string;
  stateName?: string;
  gstin?: string;
  pan?: string;
  tan?: string;
  gstRegistrationType?: 'Regular' | 'Composition' | 'Unregistered';
  financialYearStart: string;
  booksBeginningDate: string;
  createdAt?: string;
}

export interface LedgerGroup {
  id: string;
  name: string;
  parentId?: string;
}

export interface Ledger {
  id: string;
  companyId: string;
  name: string;
  groupId: string;
  groupName: string;
  gstin?: string;
  hsnCodeId?: string;
  hsnCode?: string;
  stateId?: string;
  stateName?: string;
  openingBalance: number;
  openingBalanceType: 'Dr' | 'Cr';
  tdsApplicable: boolean;
  tdsNatureCode?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankBranch?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface VoucherEntry {
  id: string;
  voucherId: string;
  ledgerId: string;
  ledgerName?: string;
  amount: number;
  isDebit: boolean;
  type?: 'Dr' | 'Cr';
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  tdsAmount?: number;
  gstTreatmentType?: string;
  createdAt?: string;
}

export interface Voucher {
  id: string;
  companyId: string;
  voucherNumber: string;
  voucherType: string;
  date: string;
  effectiveDate?: string;
  narration?: string;
  totalDebit?: number;
  totalCredit?: number;
  financialYear: string;
  entries: VoucherEntry[];
  createdAt?: string;
}

export interface TrialBalanceItem {
  ledgerId: string;
  ledgerName: string;
  debitTotal: number;
  creditTotal: number;
  balance: number;
}

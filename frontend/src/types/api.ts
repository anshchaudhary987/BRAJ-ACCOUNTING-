export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Company {
  id: string;
  name: string;
  state: string;
  gstin?: string;
  financialYearStart: string;
  booksBeginningDate: string;
  createdAt?: string;
}

export interface LedgerGroup {
  id: string;
  name: string;
  parent_id?: string;
}

export interface Ledger {
  id: string;
  companyId: string;
  name: string;
  groupId: string;
  group_name: string; // Used in current frontend
  gstin?: string;
  hsnSac?: string;
  state?: string;
  openingBalance: number;
  openingBalanceType: 'Dr' | 'Cr';
  tdsApplicable: boolean;
  tdsNature?: string;
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
  amount: number | string;
  isDebit: boolean;
  type?: 'Dr' | 'Cr'; // Component state often uses this
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
  vchNo: string; // Backend uses vchNo based on previous code
  vchType: string;
  date: string;
  effectiveDate?: string;
  narration?: string;
  totalDebit?: number;
  totalCredit?: number;
  totalAmount?: number;
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

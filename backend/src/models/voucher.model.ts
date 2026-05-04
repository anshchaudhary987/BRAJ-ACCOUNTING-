export interface IVoucher {
  id?: string;
  companyId: string;
  voucherNumber?: string;
  voucherType: string;
  date: string; // ISO date string
  effectiveDate?: string; // ISO date string
  reference?: string;
  narration?: string;
  totalDebit: number;
  totalCredit: number;
  entries: IVoucherEntry[];
  createdAt?: Date;
}

export interface IVoucherEntry {
  id?: string;
  voucherId?: string;
  ledgerId: string;
  amount: number;
  isDebit: boolean;
  gstTreatmentType?: string;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  tdsAmount?: number;
  narration?: string;
  createdAt?: Date;
}
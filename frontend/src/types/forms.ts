import { VoucherEntry, Voucher } from './api';

export interface VoucherEntryFormValue {
  ledgerId: string;
  amount: number;
  type: 'Dr' | 'Cr';
}

export interface VoucherFormValues {
  type: string;
  date: string;
  narration: string;
  entries: VoucherEntryFormValue[];
}

export interface LedgerFormValues {
  name: string;
  group_name: string;
  opening_balance: number;
  balance_type: 'Dr' | 'Cr';
}

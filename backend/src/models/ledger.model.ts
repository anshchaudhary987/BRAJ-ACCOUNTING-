export interface ILedger {
  id?: string;
  companyId: string;
  name: string;
  groupId: string;
  gstin?: string;
  hsnSac?: string;
  state?: string;
  openingBalance?: number;
  openingBalanceType?: 'Dr' | 'Cr';
  tdsApplicable?: boolean;
  tdsNature?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankBranch?: string;
  isActive?: boolean;
  createdAt?: Date;
}
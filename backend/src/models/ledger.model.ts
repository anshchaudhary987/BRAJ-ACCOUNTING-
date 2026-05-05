export interface IHSN {
  id: string;
  code: string;
  description: string;
  gstRate: number;
  type: 'HSN' | 'SAC';
}

export interface ILedger {
  id?: string;
  companyId: string;
  name: string;
  groupId: string;
  gstin?: string;
  hsnCodeId?: string;
  stateId?: string;
  openingBalance?: number;
  openingBalanceType?: 'Dr' | 'Cr';
  tdsApplicable?: boolean;
  tdsNatureCode?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankBranch?: string;
  isActive?: boolean;
  createdAt?: Date;

  // Joined fields
  groupName?: string;
  hsnCode?: IHSN;
  state?: {
    id: string;
    code: string;
    name: string;
  };
}
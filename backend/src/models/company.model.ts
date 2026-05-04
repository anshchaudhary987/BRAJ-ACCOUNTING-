export interface ICompany {
  id?: string;
  name: string;
  state: string;
  gstin?: string;
  gstRegistrationType?: 'Regular' | 'Composition' | 'Unregistered';
  pan: string;
  tan?: string;
  financialYearStart: string; // ISO date string
  booksBeginningDate: string; // ISO date string
  createdAt?: Date;
}
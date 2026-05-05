export interface IState {
  id: string;
  code: string;
  name: string;
  type: 'State' | 'Union Territory';
}

export interface ICompany {
  id?: string;
  name: string;
  stateId: string;
  gstin?: string;
  gstRegistrationType?: 'Regular' | 'Composition' | 'Unregistered';
  pan: string;
  tan?: string;
  financialYearStart: string; // ISO date string
  booksBeginningDate: string; // ISO date string
  createdAt?: Date;
  
  // Joined fields
  state?: IState;
}
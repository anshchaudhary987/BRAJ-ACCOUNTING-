export interface IGroup {
  id?: string;
  name: string;
  type: 'Assets' | 'Liabilities' | 'Income' | 'Expenditure';
  parentGroupId?: string | null;
}
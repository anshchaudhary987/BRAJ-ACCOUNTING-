export interface DbQueryResult<T = any> {
  rows: T[];
  rowCount?: number;
}

export interface DbClient {
  query(text: string, params?: any[]): Promise<DbQueryResult>;
  release?(): void;
}

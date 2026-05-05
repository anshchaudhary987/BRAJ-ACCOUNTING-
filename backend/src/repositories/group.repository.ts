import type { DbClient, DbQueryResult } from '../types/database.js';

/**
 * Group interface (matches groups table)
 */
export interface IGroup {
  id: string;
  name: string;
  parentId: string | null;
  type: string;
  isGstRelevant: boolean;
  remarks: string | null;
}

function mapGroupRow(row: any): IGroup {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name,
    parentId: row.parent_id,
    type: row.type,
    isGstRelevant: Boolean(row.is_gst_relevant),
    remarks: row.remarks
  };
}

/**
 * Repository for group data access.
 */
export class GroupRepository {
  /**
   * Find all groups.
   * @param client - PostgreSQL client (pool or transaction client)
   * @returns Array of group objects
   */
  static async findAll(client: DbClient): Promise<IGroup[]> {
    const query = 'SELECT * FROM groups ORDER BY name';
    const result: DbQueryResult<any> = await client.query(query);
    return result.rows.map(mapGroupRow);
  }
}
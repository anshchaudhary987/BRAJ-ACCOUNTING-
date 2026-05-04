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
    const result: DbQueryResult<IGroup> = await client.query(query);
    return result.rows;
  }
}
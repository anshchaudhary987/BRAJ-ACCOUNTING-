import type { DbClient, DbQueryResult } from '../types/database.js';

interface StateRow {
  id: string;
  code: string;
  name: string;
  type: 'State' | 'Union Territory';
}

function mapStateRow(row: any): StateRow {
  if (!row) return row;
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    type: row.type
  };
}

export class StateRepository {
  static async findAll(client: DbClient): Promise<StateRow[]> {
    const query = 'SELECT * FROM states ORDER BY code ASC';
    const result: DbQueryResult<any> = await client.query(query);
    return result.rows.map(mapStateRow);
  }

  static async findById(client: DbClient, id: string): Promise<StateRow | null> {
    const query = 'SELECT * FROM states WHERE id = $1';
    const result: DbQueryResult<any> = await client.query(query, [id]);
    return result.rows[0] ? mapStateRow(result.rows[0]) : null;
  }
}

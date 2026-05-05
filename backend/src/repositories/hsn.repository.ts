import type { DbClient, DbQueryResult } from '../types/database.js';

interface HsnRow {
  id: string;
  code: string;
  description: string;
  gstRate: number;
  type: 'HSN' | 'SAC';
}

function mapHsnRow(row: any): HsnRow {
  if (!row) return row;
  return {
    id: row.id,
    code: row.code,
    description: row.description,
    gstRate: parseFloat(row.gst_rate || '0'),
    type: row.type
  };
}

export class HsnRepository {
  static async findAll(client: DbClient): Promise<HsnRow[]> {
    const query = 'SELECT * FROM hsn_codes ORDER BY code ASC';
    const result: DbQueryResult<any> = await client.query(query);
    return result.rows.map(mapHsnRow);
  }

  static async findById(client: DbClient, id: string): Promise<HsnRow | null> {
    const query = 'SELECT * FROM hsn_codes WHERE id = $1';
    const result: DbQueryResult<any> = await client.query(query, [id]);
    return result.rows[0] ? mapHsnRow(result.rows[0]) : null;
  }
}

import type { DbClient, DbQueryResult } from '../types/database.js';
import type { ITdsNature } from '../models/tds-engine.model.js';

function mapTdsNatureRow(row: any): ITdsNature {
  if (!row) return row;
  return {
    code: row.code,
    description: row.description,
    section: row.section,
    rateIndividual: parseFloat(row.rate_individual || '0'),
    rateOthers: parseFloat(row.rate_company || '0'),
    thresholdLimit: parseFloat(row.threshold || '0')
  };
}

export class TdsNatureRepository {
  static async findByCode(client: DbClient, code: string): Promise<ITdsNature | null> {
    const query = 'SELECT * FROM tds_natures WHERE code = $1';
    const result: DbQueryResult<any> = await client.query(query, [code]);
    return result.rows[0] ? mapTdsNatureRow(result.rows[0]) : null;
  }

  static async findAll(client: DbClient): Promise<ITdsNature[]> {
    const query = 'SELECT * FROM tds_natures ORDER BY section ASC';
    const result: DbQueryResult<any> = await client.query(query);
    return result.rows.map(mapTdsNatureRow);
  }
}

import type { DbClient, DbQueryResult } from '../types/database.js';
import { mapKeysToSnakeCase } from '../utils/mapper.js';


interface CompanyRow {
  id: string;
  name: string;
  stateId: string;
  gstin: string;
  financialYearStart: string; 
  booksBeginningDate: string; 
  createdAt?: Date;
  updatedAt?: Date;
  pan: string;
  tan?: string;
  gstRegistrationType?: 'Regular' | 'Composition' | 'Unregistered';
  stateCode?: string;
  stateName?: string;
}

function mapRow(row: any): CompanyRow {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name,
    stateId: row.state_id,
    gstin: row.gstin,
    financialYearStart: row.financial_year_start,
    booksBeginningDate: row.books_beginning_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    pan: row.pan,
    tan: row.tan,
    gstRegistrationType: row.gst_registration_type,
    stateCode: row.state_code,
    stateName: row.state_name
  };
}

/**
 * Repository for company data access.
 */
export class CompanyRepository {
  /**
   * Create a new company.
   */
  static async create(
    client: DbClient,
    data: {
      name: string;
      stateId: string;
      gstin: string;
      pan: string;
      tan?: string;
      gstRegistrationType?: 'Regular' | 'Composition' | 'Unregistered';
      financialYearStart: string;
      booksBeginningDate: string;
    }
  ): Promise<CompanyRow> {
    const query = `
      INSERT INTO companies (
        name, state_id, gstin, pan, tan, 
        gst_registration_type, financial_year_start, books_beginning_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      data.name, 
      data.stateId, 
      data.gstin, 
      data.pan, 
      data.tan ?? null,
      data.gstRegistrationType ?? 'Regular',
      data.financialYearStart, 
      data.booksBeginningDate
    ];
    const result: DbQueryResult<CompanyRow> = await client.query(query, values);
    const company = result.rows[0];
    if (!company) {
      throw new Error('Failed to create company');
    }
    return mapRow(company);
  }

  /**
   * Find a company by ID.
   */
  static async findById(client: DbClient, id: string): Promise<CompanyRow | null> {
    const query = `
      SELECT c.*, s.code as state_code, s.name as state_name
      FROM companies c
      JOIN states s ON c.state_id = s.id
      WHERE c.id = $1
    `;
    const result: DbQueryResult<any> = await client.query(query, [id]);
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  static async findAll(client: DbClient): Promise<CompanyRow[]> {
    const query = `
      SELECT c.*, s.name as state_name
      FROM companies c
      JOIN states s ON c.state_id = s.id
      ORDER BY c.created_at DESC
    `;
    const result: DbQueryResult<any> = await client.query(query);
    return result.rows.map(mapRow);
  }

  static async findByUser(client: DbClient, userId: string): Promise<CompanyRow[]> {
    const query = `
      SELECT c.*, s.name as state_name
      FROM companies c
      JOIN company_users cu ON c.id = cu.company_id
      JOIN states s ON c.state_id = s.id
      WHERE cu.user_id = $1
      ORDER BY c.created_at DESC
    `;
    const result: DbQueryResult<any> = await client.query(query, [userId]);
    return result.rows.map(mapRow);
  }

  /**
   * Update a company by ID.
   */
  static async update(
    client: DbClient,
    id: string,
    data: Partial<Omit<CompanyRow, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<CompanyRow> {
    const snakeData = mapKeysToSnakeCase(data);
    const fields = Object.keys(snakeData);
    if (fields.length === 0) {
      throw new Error('No data provided for update');
    }

    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(', ');
    const values = [id, ...fields.map((field) => snakeData[field])];

    const query = `
      UPDATE companies
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;


    const result: DbQueryResult<any> = await client.query(query, values);
    const company = result.rows[0];
    if (!company) {
      throw new Error('Failed to update company');
    }
    return mapRow(company);
  }
}
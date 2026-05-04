import type { DbClient, DbQueryResult } from '../types/database.js';

// Interface for company row (matches companies table)
interface CompanyRow {
  id: string;
  name: string;
  state: string;
  gstin: string;
  financial_year_start: string; // Assuming date stored as string or date
  books_beginning_date: string; // Assuming date stored as string or date
  created_at?: Date;
  updated_at?: Date;
  pan: string;
  tan?: string;
  gst_registration_type?: 'Regular' | 'Composition' | 'Unregistered';
}

/**
 * Repository for company data access.
 */
export class CompanyRepository {
  /**
   * Create a new company.
   * @param client - PostgreSQL client (pool or transaction client)
   * @param name - Company name
   * @param state - State
   * @param gstin - GSTIN
   * @param pan - PAN
   * @param financialYearStart - Financial year start date
   * @param booksBeginningDate - Books beginning date
   * @returns Created company object
   */
  static async create(
    client: DbClient,
    name: string,
    state: string,
    gstin: string,
    pan: string,
    financialYearStart: string,
    booksBeginningDate: string
  ): Promise<CompanyRow> {
    const query = `
      INSERT INTO companies (name, state, gstin, pan, financial_year_start, books_beginning_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [name, state, gstin, pan, financialYearStart, booksBeginningDate];
    const result: DbQueryResult<CompanyRow> = await client.query(query, [name, state, gstin, pan, financialYearStart, booksBeginningDate]);
    const company = result.rows[0];
    if (!company) {
      throw new Error('Failed to create company');
    }
    return company;
  }

  /**
   * Find a company by ID.
   * @param client - PostgreSQL client (pool or transaction client)
   * @param id - Company ID
   * @returns Company object if found, null otherwise
   */
  static async findById(client: DbClient, id: string): Promise<CompanyRow | null> {
    const query = 'SELECT * FROM companies WHERE id = $1';
    const result: DbQueryResult<CompanyRow> = await client.query(query, [id]);
    return result.rows[0] ?? null;
  }

  static async findAll(client: DbClient): Promise<CompanyRow[]> {
    const query = 'SELECT * FROM companies ORDER BY created_at DESC';
    const result: DbQueryResult<CompanyRow> = await client.query(query);
    return result.rows;
  }

  /**
   * Update a company by ID.
   * @param client - PostgreSQL client (pool or transaction client)
   * @param id - Company ID
   * @param data - Partial company data to update
   * @returns Updated company object
   */
  static async update(
    client: DbClient,
    id: string,
    data: Partial<Omit<CompanyRow, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<CompanyRow> {
    // Build dynamic SET clause
    const fields = Object.keys(data);
    if (fields.length === 0) {
      throw new Error('No data provided for update');
    }

    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(', ');
    const values = [id, ...fields.map((field) => data[field as keyof typeof data])];

    const query = `
      UPDATE companies
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result: DbQueryResult<CompanyRow> = await client.query(query, values);
    const company = result.rows[0];
    if (!company) {
      throw new Error('Failed to update company');
    }
    return company;
  }
}
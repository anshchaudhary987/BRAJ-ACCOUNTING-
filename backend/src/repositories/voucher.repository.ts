import type { DbClient, DbQueryResult } from '../types/database.js';

// Interface for voucher row (matches vouchers table)
interface VoucherRow {
  id: string;
  company_id: string;
  voucher_number: string;
  voucher_type: string;
  date: string; // Assuming date stored as string or date
  effective_date: string; // Assuming date stored as string or date
  narration?: string | null;
  total_debit: number;
  total_credit: number;
  created_at?: Date;
  updated_at?: Date;
}

// Interface for voucher entry row (matches voucher_entries table)
interface VoucherEntryRow {
  id: string;
  voucher_id: string;
  ledger_id: string;
  amount: number;
  is_debit: boolean;
  cgst_amount?: number | null;
  sgst_amount?: number | null;
  igst_amount?: number | null;
  tds_amount?: number | null;
  gst_treatment_type?: string | null;
  created_at?: Date;
}

/**
 * Repository for voucher data access.
 */
export class VoucherRepository {
  /**
   * Save a voucher with its entries.
   * Assumes the client is already a transaction client when called from service layer.
   * @param client - PostgreSQL client (should be a transaction client)
   * @param companyId - Company ID for multi-tenancy
   * @param voucher - Voucher object containing voucherNumber, voucherType, date, effectiveDate, narration, entries
   * @returns Saved voucher with its entries (including generated IDs)
   */
  static async saveVoucher(
    client: DbClient,
    companyId: string,
    voucher: {
      voucherNumber: string;
      voucherType: string;
      date: string; // Assuming date string
      effectiveDate: string; // Assuming date string
      narration?: string | null;
      entries: Array<{
        ledgerId: string;
        amount: number;
        isDebit: boolean;
        cgstAmount?: number | null;
        sgstAmount?: number | null;
        igstAmount?: number | null;
        tdsAmount?: number | null;
        gstTreatmentType?: string | null;
      }>
    }
  ): Promise<{ voucher: VoucherRow; entries: VoucherEntryRow[] }> {
    // Calculate totals from entries
    const totalDebit = voucher.entries
      .filter(entry => entry.isDebit)
      .reduce((sum, entry) => sum + entry.amount, 0);
    const totalCredit = voucher.entries
      .filter(entry => !entry.isDebit)
      .reduce((sum, entry) => sum + entry.amount, 0);

    // Insert voucher
    const voucherQuery = `
      INSERT INTO vouchers (
        company_id, voucher_number, voucher_type, date, effective_date, narration, total_debit, total_credit
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const voucherValues = [
      companyId,
      voucher.voucherNumber,
      voucher.voucherType,
      voucher.date,
      voucher.effectiveDate,
      voucher.narration ?? null,
      totalDebit,
      totalCredit
    ];
    const voucherResult: DbQueryResult<VoucherRow> = await client.query(voucherQuery, voucherValues);
    const savedVoucher = voucherResult.rows[0];
    if (!savedVoucher) {
      throw new Error('Failed to create voucher');
    }

    // Insert each entry
    const entryPromises = voucher.entries.map(async (entry) => {
      const entryQuery = `
        INSERT INTO voucher_entries (
          voucher_id, ledger_id, amount, is_debit, cgst_amount, sgst_amount, igst_amount, tds_amount, gst_treatment_type
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      const entryValues = [
        savedVoucher.id,
        entry.ledgerId,
        entry.amount,
        entry.isDebit,
        entry.cgstAmount ?? null,
        entry.sgstAmount ?? null,
        entry.igstAmount ?? null,
        entry.tdsAmount ?? null,
        entry.gstTreatmentType ?? null
      ];
      const entryResult: DbQueryResult<VoucherEntryRow> = await client.query(entryQuery, entryValues);
      const savedEntry = entryResult.rows[0];
      if (!savedEntry) {
        throw new Error('Failed to create voucher entry');
      }
      return savedEntry;
    });

    const savedEntries = await Promise.all(entryPromises);

    return { voucher: savedVoucher, entries: savedEntries };
  }

  /**
   * Find a voucher by ID and company ID, with its entries.
   * @param client - PostgreSQL client (pool or transaction client)
   * @param companyId - Company ID
   * @param voucherId - Voucher ID
   * @returns Voucher with entries if found, null otherwise
   */
  static async findById(
    client: DbClient,
    companyId: string,
    voucherId: string
  ): Promise<{ voucher: VoucherRow; entries: VoucherEntryRow[] } | null> {
    // Get voucher
    const voucherQuery = 'SELECT * FROM vouchers WHERE id = $1 AND company_id = $2';
    const voucherResult: DbQueryResult<VoucherRow> = await client.query(voucherQuery, [voucherId, companyId]);
    const voucher = voucherResult.rows[0];
    if (!voucher) {
      return null;
    }

    // Get entries
    const entriesQuery = 'SELECT * FROM voucher_entries WHERE voucher_id = $1';
    const entriesResult: DbQueryResult<VoucherEntryRow> = await client.query(entriesQuery, [voucherId]);
    const entries = entriesResult.rows;

    return { voucher, entries };
  }

  /**
   * Find vouchers by company ID with optional filters.
   * @param client - PostgreSQL client (pool or transaction client)
   * @param companyId - Company ID
   * @param filters - Optional filters (fromDate, toDate, type)
   * @returns Array of vouchers with their entries
   */
  static async findByCompany(
    client: DbClient,
    companyId: string,
    filters?: {
      fromDate?: string | Date;
      toDate?: string | Date;
      type?: string;
    }
  ): Promise<Array<{ voucher: VoucherRow; entries: VoucherEntryRow[] }>> {
    // Build WHERE clause
    const whereConditions = ['v.company_id = $1'];
    const values: any[] = [companyId];
    let paramIndex = 2;

    if (filters?.fromDate) {
      whereConditions.push(`v.date >= $${paramIndex++}`);
      values.push(filters.fromDate);
    }
    if (filters?.toDate) {
      whereConditions.push(`v.date <= $${paramIndex++}`);
      values.push(filters.toDate);
    }
    if (filters?.type) {
      whereConditions.push(`v.voucher_type = $${paramIndex++}`);
      values.push(filters.type);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get vouchers
    const voucherQuery = `
      SELECT v.* FROM vouchers v
      ${whereClause}
      ORDER BY v.date DESC, v.created_at DESC
    `;
    const voucherResult: DbQueryResult<VoucherRow> = await client.query(voucherQuery, values);
    const vouchers = voucherResult.rows;

    // For each voucher, get its entries
    const voucherWithEntriesPromises = vouchers.map(async (voucher) => {
      const entriesQuery = 'SELECT * FROM voucher_entries WHERE voucher_id = $1';
      const entriesResult: DbQueryResult<VoucherEntryRow> = await client.query(entriesQuery, [voucher.id]);
      const entries = entriesResult.rows;
      return { voucher, entries };
    });

    return await Promise.all(voucherWithEntriesPromises);
  }

  /**
   * Delete a voucher by ID and company ID (cascade will delete entries).
   * @param client - PostgreSQL client (pool or transaction client)
   * @param companyId - Company ID
   * @param voucherId - Voucher ID
   */
  static async deleteVoucher(
    client: DbClient,
    companyId: string,
    voucherId: string
  ): Promise<void> {
    const query = 'DELETE FROM vouchers WHERE id = $2 AND company_id = $1';
    await client.query(query, [companyId, voucherId]);
    // Note: Assuming foreign key with ON DELETE CASCADE on voucher_entries
  }
}
import type { DbClient, DbQueryResult } from '../types/database.js';

// Interface for voucher row (matches vouchers table)
interface VoucherRow {
  id: string;
  companyId: string;
  voucherNumber: string;
  voucherType: string;
  date: string; 
  effectiveDate: string; 
  narration?: string | null;
  totalDebit: number;
  totalCredit: number;
  financialYear: string;
  createdAt?: Date;
  updatedAt?: Date;
}

function mapVoucherRow(row: any): VoucherRow {
  if (!row) return row;
  return {
    id: row.id,
    companyId: row.company_id,
    voucherNumber: row.voucher_number,
    voucherType: row.voucher_type,
    date: row.date,
    effectiveDate: row.effective_date,
    narration: row.narration,
    totalDebit: parseFloat(row.total_debit || '0'),
    totalCredit: parseFloat(row.total_credit || '0'),
    financialYear: row.financial_year,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// Interface for voucher entry row (matches voucher_entries table)
interface VoucherEntryRow {
  id: string;
  voucherId: string;
  ledgerId: string;
  amount: number;
  isDebit: boolean;
  cgstAmount?: number | null;
  sgstAmount?: number | null;
  igstAmount?: number | null;
  tdsAmount?: number | null;
  gstTreatmentType?: string | null;
  createdAt?: Date;
  ledgerName?: string;
}

function mapVoucherEntryRow(row: any): VoucherEntryRow {
  if (!row) return row;
  return {
    id: row.id,
    voucherId: row.voucher_id,
    ledgerId: row.ledger_id,
    amount: parseFloat(row.amount || '0'),
    isDebit: row.is_debit,
    cgstAmount: row.cgst_amount ? parseFloat(row.cgst_amount) : undefined,
    sgstAmount: row.sgst_amount ? parseFloat(row.sgst_amount) : undefined,
    igstAmount: row.igst_amount ? parseFloat(row.igst_amount) : undefined,
    tdsAmount: row.tds_amount ? parseFloat(row.tds_amount) : undefined,
    gstTreatmentType: row.gst_treatment_type,
    createdAt: row.created_at,
    ledgerName: row.ledger_name
  };
}

/**
 * Repository for voucher data access.
 */
export class VoucherRepository {
  /**
   * Get the next sequence number for a voucher type within a financial year.
   */
  static async getNextSequence(
    client: DbClient,
    companyId: string,
    voucherType: string,
    financialYear: string
  ): Promise<number> {
    const query = `
      SELECT COUNT(*) as count 
      FROM vouchers 
      WHERE company_id = $1 AND voucher_type = $2 AND financial_year = $3
    `;
    const result: DbQueryResult<{ count: string }> = await client.query(query, [companyId, voucherType, financialYear]);
    const count = parseInt(result.rows[0]?.count ?? '0', 10);
    return count + 1;
  }

  /**
   * Save a voucher with its entries.
   */
  static async saveVoucher(
    client: DbClient,
    companyId: string,
    voucher: {
      voucherNumber: string;
      voucherType: string;
      date: string; 
      effectiveDate: string; 
      financialYear: string;
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
    const totalDebit = voucher.entries
      .filter(entry => entry.isDebit)
      .reduce((sum, entry) => sum + entry.amount, 0);
    const totalCredit = voucher.entries
      .filter(entry => !entry.isDebit)
      .reduce((sum, entry) => sum + entry.amount, 0);

    const voucherQuery = `
      INSERT INTO vouchers (
        company_id, voucher_number, voucher_type, date, effective_date, 
        narration, total_debit, total_credit, financial_year
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
      totalCredit,
      voucher.financialYear
    ];
    const voucherResult: DbQueryResult<any> = await client.query(voucherQuery, voucherValues);
    const savedVoucher = voucherResult.rows[0];
    if (!savedVoucher) {
      throw new Error('Failed to create voucher');
    }

    const entryPromises = voucher.entries.map(async (entry) => {
      const entryQuery = `
        INSERT INTO voucher_entries (
          voucher_id, ledger_id, amount, is_debit, 
          cgst_amount, sgst_amount, igst_amount, tds_amount, gst_treatment_type
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
      const entryResult: DbQueryResult<any> = await client.query(entryQuery, entryValues);
      const savedEntry = entryResult.rows[0];
      if (!savedEntry) {
        throw new Error('Failed to create voucher entry');
      }
      return mapVoucherEntryRow(savedEntry);
    });

    const savedEntries = await Promise.all(entryPromises);

    return { voucher: mapVoucherRow(savedVoucher), entries: savedEntries };
  }

  static async findById(
    client: DbClient,
    companyId: string,
    voucherId: string
  ): Promise<{ voucher: VoucherRow; entries: VoucherEntryRow[] } | null> {
    const voucherQuery = 'SELECT * FROM vouchers WHERE id = $1 AND company_id = $2';
    const voucherResult: DbQueryResult<any> = await client.query(voucherQuery, [voucherId, companyId]);
    const voucher = voucherResult.rows[0];
    if (!voucher) {
      return null;
    }

    const entriesQuery = `
      SELECT ve.*, l.name as ledger_name 
      FROM voucher_entries ve
      JOIN ledgers l ON ve.ledger_id = l.id
      WHERE ve.voucher_id = $1
    `;
    const entriesResult: DbQueryResult<any> = await client.query(entriesQuery, [voucherId]);
    const entries = entriesResult.rows.map(mapVoucherEntryRow);

    return { voucher: mapVoucherRow(voucher), entries };
  }

  static async findByCompany(
    client: DbClient,
    companyId: string,
    filters?: {
      fromDate?: string | Date;
      toDate?: string | Date;
      type?: string;
      financialYear?: string;
    }
  ): Promise<Array<{ voucher: VoucherRow; entries: VoucherEntryRow[] }>> {
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
    if (filters?.financialYear) {
      whereConditions.push(`v.financial_year = $${paramIndex++}`);
      values.push(filters.financialYear);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const voucherQuery = `
      SELECT v.* FROM vouchers v
      ${whereClause}
      ORDER BY v.date DESC, v.created_at DESC
    `;
    const voucherResult: DbQueryResult<any> = await client.query(voucherQuery, values);
    const vouchers = voucherResult.rows;

    const voucherWithEntriesPromises = vouchers.map(async (voucher) => {
      const entriesQuery = `
        SELECT ve.*, l.name as ledger_name 
        FROM voucher_entries ve
        JOIN ledgers l ON ve.ledger_id = l.id
        WHERE ve.voucher_id = $1
      `;
      const entriesResult: DbQueryResult<any> = await client.query(entriesQuery, [voucher.id]);
      const entries = entriesResult.rows.map(mapVoucherEntryRow);
      return { voucher: mapVoucherRow(voucher), entries };
    });

    return await Promise.all(voucherWithEntriesPromises);
  }

  static async deleteVoucher(
    client: DbClient,
    companyId: string,
    voucherId: string
  ): Promise<void> {
    const query = 'DELETE FROM vouchers WHERE id = $2 AND company_id = $1';
    await client.query(query, [companyId, voucherId]);
  }
}
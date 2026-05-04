import type { DbClient, DbQueryResult } from '../types/database.js';

// Interface for ledger row (matches ledgers table)
interface LedgerRow {
  id: string;
  company_id: string;
  name: string;
  group_id: string;
  gstin?: string | null;
  hsn_sac?: string | null;
  state?: string | null;
  opening_balance: number; // Assuming numeric
  opening_balance_type: 'Dr' | 'Cr';
  tds_applicable: boolean;
  tds_nature?: string | null;
  bank_account_number?: string | null;
  bank_ifsc?: string | null;
  bank_branch?: string | null;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Repository for ledger data access.
 */
export class LedgerRepository {
  /**
   * Create a new ledger.
   * @param client - Database client
   * @param companyId - Company ID for multi-tenancy
   * @param ledgerData - Ledger data
   * @returns Created ledger object
   */
  static async create(
    client: DbClient,
    companyId: string,
    ledgerData: {
      name: string;
      groupId: string;
      gstin?: string | null;
      hsnSac?: string | null;
      state?: string | null;
      openingBalance: number;
      openingBalanceType: 'Dr' | 'Cr';
      tdsApplicable: boolean;
      tdsNature?: string | null;
      bankAccountNumber?: string | null;
      bankIfsc?: string | null;
      bankBranch?: string | null;
    }
  ): Promise<LedgerRow> {
    const query = `
      INSERT INTO ledgers (
        company_id, name, group_id, gstin, hsn_sac, state,
        opening_balance, opening_balance_type, tds_applicable, tds_nature,
        bank_account_number, bank_ifsc, bank_branch
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    const values = [
      companyId,
      ledgerData.name,
      ledgerData.groupId,
      ledgerData.gstin ?? null,
      ledgerData.hsnSac ?? null,
      ledgerData.state ?? null,
      ledgerData.openingBalance,
      ledgerData.openingBalanceType,
      ledgerData.tdsApplicable,
      ledgerData.tdsNature ?? null,
      ledgerData.bankAccountNumber ?? null,
      ledgerData.bankIfsc ?? null,
      ledgerData.bankBranch ?? null
    ];
    const result: DbQueryResult<LedgerRow> = await client.query(query, values);
    const ledger = result.rows[0];
    if (!ledger) {
      throw new Error('Failed to create ledger');
    }
    return ledger;
  }

  static async findByCompany(
    client: DbClient,
    companyId: string,
    groupId?: string
  ): Promise<LedgerRow[]> {
    if (groupId) {
      const query = 'SELECT * FROM ledgers WHERE company_id = $1 AND group_id = $2 AND is_active = true';
      const result: DbQueryResult<LedgerRow> = await client.query(query, [companyId, groupId]);
      return result.rows;
    } else {
      const query = 'SELECT * FROM ledgers WHERE company_id = $1 AND is_active = true';
      const result: DbQueryResult<LedgerRow> = await client.query(query, [companyId]);
      return result.rows;
    }
  }

  static async findById(
    client: DbClient,
    companyId: string,
    ledgerId: string
  ): Promise<LedgerRow | null> {
    const query = 'SELECT * FROM ledgers WHERE id = $1 AND company_id = $2 AND is_active = true';
    const result: DbQueryResult<LedgerRow> = await client.query(query, [ledgerId, companyId]);
    return result.rows[0] ?? null;
  }

  static async update(
    client: DbClient,
    companyId: string,
    ledgerId: string,
    data: Partial<Omit<LedgerRow, 'id' | 'company_id' | 'created_at' | 'updated_at' | 'is_active'>>
  ): Promise<LedgerRow> {
    const fields = Object.keys(data);
    if (fields.length === 0) {
      throw new Error('No data provided for update');
    }

    const setClause = fields
      .map((field, index) => `${field} = $${index + 3}`)
      .join(', ');
    const values = [companyId, ledgerId, ...fields.map((field) => (data as any)[field])];

    const query = `
      UPDATE ledgers
      SET ${setClause}, updated_at = NOW()
      WHERE id = $2 AND company_id = $1
      RETURNING *
    `;

    const result: DbQueryResult<LedgerRow> = await client.query(query, values);
    const ledger = result.rows[0];
    if (!ledger) {
      throw new Error('Failed to update ledger');
    }
    return ledger;
  }

  static async softDelete(
    client: DbClient,
    companyId: string,
    ledgerId: string
  ): Promise<void> {
    const checkQuery = `
      SELECT COUNT(*) FROM voucher_entries ve
      JOIN vouchers v ON ve.voucher_id = v.id
      WHERE ve.ledger_id = $1 AND v.company_id = $2
    `;
    const checkResult: DbQueryResult<{ count: string }> = await client.query(checkQuery, [ledgerId, companyId]);
    const count = parseInt(checkResult.rows[0]?.count ?? '0', 10);
    if (count > 0) {
      throw new Error('Cannot delete ledger with existing vouchers');
    }

    const query = 'UPDATE ledgers SET is_active = false, updated_at = NOW() WHERE id = $2 AND company_id = $1';
    await client.query(query, [companyId, ledgerId]);
  }

  static async getBalance(
    client: DbClient,
    companyId: string,
    ledgerId: string,
    asOfDate?: string | Date
  ): Promise<{ debitTotal: number; creditTotal: number; balance: number }> {
    const dateCondition = asOfDate
      ? 'AND v.date <= $3'
      : '';
    const values = asOfDate
      ? [companyId, ledgerId, asOfDate]
      : [companyId, ledgerId];

    const query = `
      SELECT
        COALESCE(SUM(CASE WHEN ve.is_debit THEN ve.amount ELSE 0 END), 0) AS debit_total,
        COALESCE(SUM(CASE WHEN NOT ve.is_debit THEN ve.amount ELSE 0 END), 0) AS credit_total
      FROM voucher_entries ve
      JOIN vouchers v ON ve.voucher_id = v.id
      WHERE v.company_id = $1
        AND ve.ledger_id = $2
        ${dateCondition}
    `;

    const result: DbQueryResult<{ debit_total: string; credit_total: string }> = await client.query(query, values);
    const row = result.rows[0] ?? { debit_total: '0', credit_total: '0' };
    const debitTotal = parseFloat(row.debit_total);
    const creditTotal = parseFloat(row.credit_total);
    const balance = debitTotal - creditTotal;

    return { debitTotal, creditTotal, balance };
  }
}
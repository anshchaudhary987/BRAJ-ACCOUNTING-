import type { DbClient, DbQueryResult } from '../types/database.js';
import { mapKeysToSnakeCase } from '../utils/mapper.js';


// Interface for ledger row (matches ledgers table)
interface LedgerRow {
  id: string;
  companyId: string;
  name: string;
  groupId: string;
  gstin?: string | null;
  hsnCodeId?: string | null;
  stateId?: string | null;
  openingBalance: number; 
  openingBalanceType: 'Dr' | 'Cr';
  tdsApplicable: boolean;
  tdsNatureCode?: string | null;
  bankAccountNumber?: string | null;
  bankIfsc?: string | null;
  bankBranch?: string | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  stateCode?: string;
  stateName?: string;
  hsnCode?: string;
  gstRate?: number;
}

function mapRow(row: any): LedgerRow {
  if (!row) return row;
  return {
    id: row.id,
    companyId: row.company_id,
    name: row.name,
    groupId: row.group_id,
    gstin: row.gstin,
    hsnCodeId: row.hsn_code_id,
    stateId: row.state_id,
    openingBalance: parseFloat(row.opening_balance || '0'),
    openingBalanceType: row.opening_balance_type,
    tdsApplicable: row.tds_applicable,
    tdsNatureCode: row.tds_nature_code,
    bankAccountNumber: row.bank_account_number,
    bankIfsc: row.bank_ifsc,
    bankBranch: row.bank_branch,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    stateCode: row.state_code,
    stateName: row.state_name,
    hsnCode: row.hsn_code,
    gstRate: row.gst_rate ? parseFloat(row.gst_rate) : undefined
  };
}

/**
 * Repository for ledger data access.
 */
export class LedgerRepository {
  /**
   * Create a new ledger.
   */
  static async create(
    client: DbClient,
    companyId: string,
    ledgerData: {
      name: string;
      groupId: string;
      gstin?: string | null;
      hsnCodeId?: string | null;
      stateId?: string | null;
      openingBalance: number;
      openingBalanceType: 'Dr' | 'Cr';
      tdsApplicable: boolean;
      tdsNatureCode?: string | null;
      bankAccountNumber?: string | null;
      bankIfsc?: string | null;
      bankBranch?: string | null;
    }
  ): Promise<LedgerRow> {
    const query = `
      INSERT INTO ledgers (
        company_id, name, group_id, gstin, hsn_code_id, state_id,
        opening_balance, opening_balance_type, tds_applicable, tds_nature_code,
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
      ledgerData.hsnCodeId ?? null,
      ledgerData.stateId ?? null,
      ledgerData.openingBalance,
      ledgerData.openingBalanceType,
      ledgerData.tdsApplicable,
      ledgerData.tdsNatureCode ?? null,
      ledgerData.bankAccountNumber ?? null,
      ledgerData.bankIfsc ?? null,
      ledgerData.bankBranch ?? null
    ];
    const result: DbQueryResult<any> = await client.query(query, values);
    const ledger = result.rows[0];
    if (!ledger) {
      throw new Error('Failed to create ledger');
    }
    return mapRow(ledger);
  }

  static async findByCompany(
    client: DbClient,
    companyId: string,
    groupId?: string
  ): Promise<LedgerRow[]> {
    if (groupId) {
      const query = 'SELECT * FROM ledgers WHERE company_id = $1 AND group_id = $2 AND is_active = true';
      const result: DbQueryResult<any> = await client.query(query, [companyId, groupId]);
      return result.rows.map(mapRow);
    } else {
      const query = 'SELECT * FROM ledgers WHERE company_id = $1 AND is_active = true';
      const result: DbQueryResult<any> = await client.query(query, [companyId]);
      return result.rows.map(mapRow);
    }
  }

  static async findById(
    client: DbClient,
    companyId: string,
    ledgerId: string
  ): Promise<LedgerRow | null> {
    const query = `
      SELECT l.*, s.code as state_code, s.name as state_name, h.code as hsn_code, h.gst_rate
      FROM ledgers l
      LEFT JOIN states s ON l.state_id = s.id
      LEFT JOIN hsn_codes h ON l.hsn_code_id = h.id
      WHERE l.id = $1 AND l.company_id = $2 AND l.is_active = true
    `;
    const result: DbQueryResult<any> = await client.query(query, [ledgerId, companyId]);
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  static async update(
    client: DbClient,
    companyId: string,
    ledgerId: string,
    data: Partial<Omit<LedgerRow, 'id' | 'company_id' | 'created_at' | 'updated_at' | 'is_active'>>
  ): Promise<LedgerRow> {
    const snakeData = mapKeysToSnakeCase(data);
    const fields = Object.keys(snakeData);
    if (fields.length === 0) {
      throw new Error('No data provided for update');
    }

    const setClause = fields
      .map((field, index) => `${field} = $${index + 3}`)
      .join(', ');
    const values = [companyId, ledgerId, ...fields.map((field) => snakeData[field])];

    const query = `
      UPDATE ledgers
      SET ${setClause}, updated_at = NOW()
      WHERE id = $2 AND company_id = $1
      RETURNING *
    `;


    const result: DbQueryResult<any> = await client.query(query, values);
    const ledger = result.rows[0];
    if (!ledger) {
      throw new Error('Failed to update ledger');
    }
    return mapRow(ledger);
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

  static async getAllBalances(
    client: DbClient,
    companyId: string
  ): Promise<Array<{ ledgerId: string; groupId: string; debitTotal: number; creditTotal: number; balance: number }>> {
    const query = `
      SELECT
        l.id AS ledger_id,
        l.group_id,
        COALESCE(SUM(CASE WHEN ve.is_debit THEN ve.amount ELSE 0 END), 0) AS debit_total,
        COALESCE(SUM(CASE WHEN NOT ve.is_debit THEN ve.amount ELSE 0 END), 0) AS credit_total
      FROM ledgers l
      LEFT JOIN voucher_entries ve ON l.id = ve.ledger_id
      LEFT JOIN vouchers v ON ve.voucher_id = v.id
      WHERE l.company_id = $1
      GROUP BY l.id, l.group_id
    `;

    const result: DbQueryResult<{ 
      ledger_id: string; 
      group_id: string; 
      debit_total: string; 
      credit_total: string; 
    }> = await client.query(query, [companyId]);

    return result.rows.map(row => {
      const debitTotal = parseFloat(row.debit_total);
      const creditTotal = parseFloat(row.credit_total);
      return {
        ledgerId: row.ledger_id,
        groupId: row.group_id,
        debitTotal,
        creditTotal,
        balance: debitTotal - creditTotal
      };
    });
  }
}
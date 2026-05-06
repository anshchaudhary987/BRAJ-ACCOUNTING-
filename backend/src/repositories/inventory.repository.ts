import { v4 as uuidv4 } from 'uuid';
import type { DbClient, DbQueryResult } from '../types/database.js';
import { VoucherRepository } from './voucher.repository.js';

export interface StockItemRow {
  id: string;
  companyId: string;
  name: string;
  sku?: string;
  stockGroupId?: string;
  unitId: string;
  openingStock: number;
  openingRate: number;
  currentStock: number;
}

export class InventoryRepository {
  // ─── Units ───
  static async listUnits(client: DbClient, companyId: string) {
    const query = 'SELECT * FROM units WHERE company_id = $1';
    const result: DbQueryResult<any> = await client.query(query, [companyId]);
    return result.rows;
  }

  static async createUnit(client: DbClient, companyId: string, name: string, symbol: string) {
    const query = 'INSERT INTO units (id, company_id, name, symbol) VALUES ($1, $2, $3, $4) RETURNING *';
    const result: DbQueryResult<any> = await client.query(query, [uuidv4(), companyId, name, symbol]);
    return result.rows[0];
  }

  // ─── Godowns ───
  static async listGodowns(client: DbClient, companyId: string) {
    const query = 'SELECT * FROM godowns WHERE company_id = $1';
    const result: DbQueryResult<any> = await client.query(query, [companyId]);
    return result.rows;
  }

  static async createGodown(client: DbClient, companyId: string, name: string, location?: string) {
    const query = 'INSERT INTO godowns (id, company_id, name, location) VALUES ($1, $2, $3, $4) RETURNING *';
    const result: DbQueryResult<any> = await client.query(query, [uuidv4(), companyId, name, location]);
    return result.rows[0];
  }

  // ─── Stock Groups ───
  static async listStockGroups(client: DbClient, companyId: string) {
    const query = 'SELECT * FROM stock_groups WHERE company_id = $1';
    const result: DbQueryResult<any> = await client.query(query, [companyId]);
    return result.rows;
  }

  static async createStockGroup(client: DbClient, companyId: string, name: string, parentId?: string) {
    const query = 'INSERT INTO stock_groups (id, company_id, name, parent_id) VALUES ($1, $2, $3, $4) RETURNING *';
    const result: DbQueryResult<any> = await client.query(query, [uuidv4(), companyId, name, parentId]);
    return result.rows[0];
  }

  // ─── Stock Items ───
  static async listStockItems(client: DbClient, companyId: string) {
    const query = `
      SELECT si.*, u.symbol as unit_symbol, sg.name as group_name 
      FROM stock_items si
      LEFT JOIN units u ON si.unit_id = u.id
      LEFT JOIN stock_groups sg ON si.stock_group_id = sg.id
      WHERE si.company_id = $1
    `;
    const result: DbQueryResult<any> = await client.query(query, [companyId]);
    return result.rows;
  }

  static async createStockItem(client: DbClient, companyId: string, item: any) {
    const query = `
      INSERT INTO stock_items (id, company_id, name, sku, stock_group_id, unit_id, opening_stock, opening_rate, current_stock)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const result: DbQueryResult<any> = await client.query(query, [
      uuidv4(), companyId, item.name, item.sku, item.stockGroupId, item.unitId,
      item.openingStock || 0, item.openingRate || 0, item.openingStock || 0
    ]);
    return result.rows[0];
  }

  // ─── Stock Journals ───
  static async saveStockJournal(client: DbClient, companyId: string, journal: any) {
    const journalId = uuidv4();
    const query = `
      INSERT INTO stock_journals (id, company_id, date, journal_type, narration)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await client.query(query, [journalId, companyId, journal.date, journal.journalType, journal.narration]);

    for (const entry of journal.entries) {
      const entryId = uuidv4();
      const entryQuery = `
        INSERT INTO stock_journal_entries (id, stock_journal_id, stock_item_id, godown_id, quantity, rate, amount, is_inward)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
      await client.query(entryQuery, [
        entryId, journalId, entry.stockItemId, entry.godownId,
        entry.quantity, entry.rate, entry.amount, entry.isInward
      ]);

      // Update Stock Level
      const stockUpdateQuery = entry.isInward 
        ? 'UPDATE stock_items SET current_stock = current_stock + $1 WHERE id = $2'
        : 'UPDATE stock_items SET current_stock = current_stock - $1 WHERE id = $2';
      await client.query(stockUpdateQuery, [entry.quantity, entry.stockItemId]);
    }

    // ─── Auto-create Accounting Voucher ───
    // For simplicity, if it's a "Receipt" type, we assume it's a purchase-like entry.
    // We'll debit Stock-in-Hand group and credit a generic "Suspense" or "Purchases" ledger.
    // In a real system, the user would select the ledger.
    
    if (journal.autoPostVoucher && journal.ledgerId) {
      // Find or verify the Stock Asset Ledger
      // Usually, there's a ledger linked to the stock item or a global Stock Ledger.
      
      const totalAmount = journal.entries.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
      
      const voucherData = {
        voucherNumber: `AUTO-SJ-${Date.now()}`, // Temporary formatted number
        voucherType: journal.journalType === 'Receipt' ? 'Journal' : 'Journal',
        date: journal.date,
        effectiveDate: journal.date,
        narration: `Auto-posted from Stock Journal: ${journal.narration || ''}`,
        totalDebit: totalAmount,
        totalCredit: totalAmount,
        financialYear: journal.financialYear || '2024-25',
        entries: [
          {
            ledgerId: journal.journalType === 'Receipt' ? journal.stockLedgerId : journal.ledgerId,
            amount: totalAmount,
            isDebit: true
          },
          {
            ledgerId: journal.journalType === 'Receipt' ? journal.ledgerId : journal.stockLedgerId,
            amount: totalAmount,
            isDebit: false
          }
        ]
      };

      await VoucherRepository.saveVoucher(client, companyId, voucherData);
    }

    return { id: journalId };
  }
}

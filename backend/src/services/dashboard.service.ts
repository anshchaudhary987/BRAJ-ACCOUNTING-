import { DbClient } from '../types/database.js';
import { LedgerRepository } from '../repositories/ledger.repository.js';
import { GroupRepository } from '../repositories/group.repository.js';

export class DashboardService {
  static async getStats(client: DbClient, companyId: string) {
    // 1. Get all groups and ledgers with balances
    const [groups, ledgerBalances] = await Promise.all([
      GroupRepository.findAll(client),
      LedgerRepository.getAllBalances(client, companyId)
    ]);

    // Create a group mapping for easy lookup
    const groupMap = new Map(groups.map(g => [g.id, g]));

    // Helper to check if a group or its ancestors match a name
    const isUnderGroup = (groupId: string, targetNames: string[]): boolean => {
      let currentId: string | null = groupId;
      while (currentId) {
        const group = groupMap.get(currentId);
        if (!group) break;
        if (targetNames.includes(group.name)) return true;
        currentId = group.parentId;
      }
      return false;
    };

    // 2. Aggregate Metrics
    let liquidity = 0;
    let risk = 0;
    let reserves = 0;
    
    ledgerBalances.forEach(lb => {
      // Liquidity: Cash and Bank
      if (isUnderGroup(lb.groupId, ['Cash', 'Bank Accounts', 'Cash-in-Hand'])) {
        liquidity += lb.balance;
      }
      
      // Risk: Sundry Debtors
      if (isUnderGroup(lb.groupId, ['Sundry Debtors'])) {
        risk += lb.balance;
      }
      
      // Reserves: Investments, Reserves & Surplus
      if (isUnderGroup(lb.groupId, ['Investments', 'Reserves & Surplus', 'Reserves and Surplus'])) {
        reserves += Math.abs(lb.balance); // Usually credit, but we want the magnitude
      }
    });

    // 3. Calculate Yield (Profit for current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const yieldQuery = `
      SELECT
        COALESCE(SUM(CASE WHEN g.type IN ('Income', 'Revenue') THEN ve.amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN g.type IN ('Expenditure', 'Expense') THEN ve.amount ELSE 0 END), 0) AS expenses
      FROM voucher_entries ve
      JOIN vouchers v ON ve.voucher_id = v.id
      JOIN ledgers l ON ve.ledger_id = l.id
      JOIN groups g ON l.group_id = g.id
      WHERE v.company_id = $1
        AND v.date >= $2
    `;
    const yieldResult = await client.query(yieldQuery, [companyId, startOfMonth]);
    const income = parseFloat(yieldResult.rows[0].income);
    const expenses = parseFloat(yieldResult.rows[0].expenses);
    const netYield = income - expenses;

    // 4. Monthly Trend (placeholder calculation)
    // In a real app, we'd compare this month to last month
    const change = {
      liquidity: "+12.4%",
      yield: "+5.2%",
      risk: "-2.1%",
      reserves: "+0.8%"
    };

    return {
      liquidity: {
        value: liquidity,
        change: change.liquidity,
        trend: liquidity >= 0 ? 'up' : 'down'
      },
      yield: {
        value: netYield,
        change: change.yield,
        trend: netYield >= 0 ? 'up' : 'down'
      },
      risk: {
        value: risk,
        change: change.risk,
        trend: risk >= 0 ? 'up' : 'down'
      },
      reserves: {
        value: reserves,
        change: change.reserves,
        trend: 'up'
      }
    };
  }

  static async getAnomalies(client: DbClient, companyId: string) {
    // 1. Detect unlinked vouchers (vouchers without entries or asymmetric entries)
    // This is a simplified anomaly detection
    const query = `
      SELECT 
        v.id, v.voucher_number, v.date, v.type,
        SUM(CASE WHEN ve.is_debit THEN ve.amount ELSE -ve.amount END) as balance
      FROM vouchers v
      LEFT JOIN voucher_entries ve ON v.id = ve.voucher_id
      WHERE v.company_id = $1
      GROUP BY v.id, v.voucher_number, v.date, v.type
      HAVING ABS(SUM(CASE WHEN ve.is_debit THEN ve.amount ELSE -ve.amount END)) > 0.01
    `;
    const result = await client.query(query, [companyId]);
    
    return result.rows.map(row => ({
      id: row.id,
      title: `Asymmetric Voucher: ${row.voucher_number}`,
      description: `Voucher is out of balance by ${row.balance}. Possible data corruption.`,
      severity: 'high',
      type: 'structural'
    }));
  }
}

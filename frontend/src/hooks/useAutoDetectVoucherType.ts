'use client';

import { useMemo } from 'react';
import { Ledger, VoucherEntryFormValue } from '@/types';

export type VoucherType = 'Journal' | 'Payment' | 'Receipt' | 'Contra' | 'Sales' | 'Purchase';

export function useAutoDetectVoucherType(entries: VoucherEntryFormValue[], ledgers: Ledger[]) {
  return useMemo(() => {
    if (entries.length < 2) return 'Journal';

    const drEntries = entries.filter(e => e.type === 'Dr' && e.ledgerId);
    const crEntries = entries.filter(e => e.type === 'Cr' && e.ledgerId);

    const getGroup = (id: string) => ledgers.find(l => l.id === id)?.groupName || '';

    const drGroups = drEntries.map(e => getGroup(e.ledgerId));
    const crGroups = crEntries.map(e => getGroup(e.ledgerId));

    const isCashBank = (group: string) => 
      group.includes('Cash') || group.includes('Bank Accounts') || group.includes('Bank OD');

    const hasDrCashBank = drGroups.some(isCashBank);
    const hasCrCashBank = crGroups.some(isCashBank);

    // 1. Contra: Only Cash/Bank on both sides
    if (hasDrCashBank && hasCrCashBank && drGroups.every(isCashBank) && crGroups.every(isCashBank)) {
      return 'Contra';
    }

    // 2. Sales: Sales ledger on Credit side
    if (crGroups.some(g => g.includes('Sales Accounts'))) {
      return 'Sales';
    }

    // 3. Purchase: Purchase ledger on Debit side
    if (drGroups.some(g => g.includes('Purchase Accounts'))) {
      return 'Purchase';
    }

    // 4. Receipt: Debit is Cash/Bank, Credit is not only Cash/Bank
    if (hasDrCashBank && !crGroups.every(isCashBank)) {
      return 'Receipt';
    }

    // 5. Payment: Credit is Cash/Bank, Debit is not only Cash/Bank
    if (hasCrCashBank && !drGroups.every(isCashBank)) {
      return 'Payment';
    }

    return 'Journal';
  }, [entries, ledgers]);
}

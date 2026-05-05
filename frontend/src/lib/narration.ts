import { Ledger, VoucherEntryFormValue } from '@/types';
import { VoucherType } from '@/hooks/useAutoDetectVoucherType';

export interface NarrationContext {
  voucherType: VoucherType;
  entries: VoucherEntryFormValue[];
  ledgers: Ledger[];
  date: string;
}

export function generateNarration({ voucherType, entries, ledgers, date }: NarrationContext): string {
  if (entries.length < 2 || !entries.every(e => e.ledgerId)) {
    return `Being accounting entry dated ${date}.`;
  }

  const getLedger = (id: string) => ledgers.find(l => l.id === id);
  const getGroupName = (id: string) => getLedger(id)?.groupName || '';

  const isCashBank = (id: string) => {
    const group = getGroupName(id);
    return group.includes('Cash') || group.includes('Bank Accounts') || group.includes('Bank OD');
  };

  const drEntries = entries.filter(e => e.type === 'Dr');
  const crEntries = entries.filter(e => e.type === 'Cr');

  const drLedgerNames = drEntries.map(e => getLedger(e.ledgerId)?.name || '');
  const crLedgerNames = crEntries.map(e => getLedger(e.ledgerId)?.name || '');

  const findParty = () => {
    const partyEntry = entries.find(e => !isCashBank(e.ledgerId));
    return getLedger(partyEntry?.ledgerId || '')?.name || 'Party';
  };

  switch (voucherType) {
    case 'Receipt': {
      const fromParty = findParty();
      return `Being amount received from ${fromParty} against reference.`;
    }
    case 'Payment': {
      const toParty = findParty();
      return `Being amount paid to ${toParty} for expenses.`;
    }
    case 'Contra': {
      const from = crLedgerNames[0] || 'Cash/Bank';
      const to = drLedgerNames[0] || 'Cash/Bank';
      return `Being amount transferred from ${from} to ${to}.`;
    }
    case 'Sales': {
      const party = drLedgerNames.find(name => {
        const id = ledgers.find(l => l.name === name)?.id;
        return id && !isCashBank(id);
      }) || 'Customer';
      return `Being goods sold to ${party} vide invoice.`;
    }
    case 'Purchase': {
      const party = crLedgerNames.find(name => {
        const id = ledgers.find(l => l.name === name)?.id;
        return id && !isCashBank(id);
      }) || 'Supplier';
      return `Being goods purchased from ${party} vide bill.`;
    }
    case 'Journal': {
      const dr = drLedgerNames[0] || 'Account';
      const cr = crLedgerNames[0] || 'Account';
      return `Being adjustment entry for ${dr} and ${cr}.`;
    }
    default:
      return `Being accounting entry for ${date}.`;
  }
}

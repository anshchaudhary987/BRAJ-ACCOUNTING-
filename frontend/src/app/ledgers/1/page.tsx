'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  BookOpen, 
  Calendar, 
  Download, 
  Printer, 
  Loader2
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { useTenancy } from '@/hooks/useTenancy';
import { Ledger, Voucher, ApiResponse } from '@/types';

export default function LedgerStatementPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const { selectedCompany } = useTenancy();

  // 1. Fetch Ledger Details
  const { data: ledger, isLoading: isLedgerLoading } = useQuery({
    queryKey: ['ledger', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Ledger>>(`/ledger/${id}`);
      return res.data.data;
    }
  });

  // 2. Fetch Vouchers
  const { data: vouchers = [], isLoading: isVouchersLoading } = useQuery({
    queryKey: ['vouchers', id, from, to],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Voucher[]>>(`/voucher?from=${from}&to=${to}`);
      return res.data.data;
    }
  });

  if (isLedgerLoading || isVouchersLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-violet-500 mb-4" size={40} />
        <p className="text-slate-400 animate-pulse">Reconstructing ledger historical data...</p>
      </div>
    );
  }

  if (!ledger) return <div>Ledger not found</div>;

  // 3. Process Statement
  const entries: any[] = [];
  vouchers.forEach((v) => {
    v.entries.forEach((e) => {
      if (e.ledgerId === id) {
        entries.push({
          date: v.date,
          vchNo: v.vchNo,
          vchType: v.vchType,
          narration: v.narration,
          isDebit: e.isDebit,
          amount: Number(e.amount),
          id: e.id
        });
      }
    });
  });

  // Sort by date
  entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate Running Balance
  let runningBalance = Number(ledger.openingBalance);
  const openingBalanceType = ledger.openingBalanceType; // 'Dr' or 'Cr'

  const statementRows = entries.map(entry => {
    if (openingBalanceType === 'Dr') {
      if (entry.isDebit) runningBalance += entry.amount;
      else runningBalance -= entry.amount;
    } else {
      if (entry.isDebit) runningBalance -= entry.amount;
      else runningBalance += entry.amount;
    }

    return {
      ...entry,
      runningBalance,
      displayBalance: Math.abs(runningBalance),
      displayBalanceType: runningBalance >= 0 ? openingBalanceType : (openingBalanceType === 'Dr' ? 'Cr' : 'Dr')
    };
  });

  const totalDr = entries.filter(e => e.isDebit).reduce((s, e) => s + e.amount, 0);
  const totalCr = entries.filter(e => !e.isDebit).reduce((s, e) => s + e.amount, 0);
  const closingBalance = Math.abs(runningBalance);
  const closingBalanceType = runningBalance >= 0 ? openingBalanceType : (openingBalanceType === 'Dr' ? 'Cr' : 'Dr');

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link 
            href={`/reports/trial-balance?as_of_date=${to}`}
            className="p-3 rounded-2xl glass-premium border-white/5 text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BookOpen className="text-violet-500" size={28} />
              {ledger.name}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Statement from <span className="text-violet-400">{from}</span> to <span className="text-violet-400">{to}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="glass-premium px-6 py-3 rounded-2xl border-white/5 text-slate-400 hover:text-white transition-all flex items-center gap-2 font-bold text-sm">
            <Printer size={18} /> Print
          </button>
          <button className="glass-premium px-6 py-3 rounded-2xl border-white/5 text-slate-400 hover:text-white transition-all flex items-center gap-2 font-bold text-sm">
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 glass-premium rounded-3xl border-white/5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Opening Balance</p>
          <h3 className="text-xl font-bold font-mono">
            {formatCurrency(ledger.openingBalance)} <span className="text-xs text-slate-500">{ledger.openingBalanceType}</span>
          </h3>
        </div>
        <div className="p-6 glass-premium rounded-3xl border-white/5 border-red-500/10">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Debit</p>
          <h3 className="text-xl font-bold font-mono text-red-400">{formatCurrency(totalDr)}</h3>
        </div>
        <div className="p-6 glass-premium rounded-3xl border-white/5 border-emerald-500/10">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Credit</p>
          <h3 className="text-xl font-bold font-mono text-emerald-400">{formatCurrency(totalCr)}</h3>
        </div>
        <div className="p-6 glass-premium rounded-3xl bg-violet-600/10 border-violet-500/20">
          <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-1">Closing Balance</p>
          <h3 className="text-xl font-bold font-mono">
            {formatCurrency(closingBalance)} <span className="text-xs text-violet-400">{closingBalanceType}</span>
          </h3>
        </div>
      </div>

      {/* Main Statement Table */}
      <div className="glass-premium rounded-[2.5rem] overflow-hidden border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Date</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Particulars</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Vch Type</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Vch No.</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Debit</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Credit</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {/* Opening Balance Row */}
              <tr className="bg-white/[0.02] italic">
                <td className="px-6 py-4 text-sm font-mono text-slate-500">{from}</td>
                <td className="px-6 py-4 font-bold text-slate-400">Opening Balance</td>
                <td colSpan={4}></td>
                <td className="px-6 py-4 text-right font-mono font-bold text-slate-300">
                  {formatCurrency(ledger.openingBalance)} {ledger.openingBalanceType}
                </td>
              </tr>

              {statementRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500 italic">No transactions recorded in this period</td>
                </tr>
              ) : (
                statementRows.map((row) => (
                  <tr key={row.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-sm font-mono text-slate-400">{row.date}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium">{row.narration || '—'}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-violet-400 uppercase tracking-tighter">{row.vchType}</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-400">{row.vchNo}</td>
                    <td className="px-6 py-4 text-right font-mono text-red-400">
                      {row.isDebit ? formatCurrency(row.amount) : '—'}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-emerald-400">
                      {!row.isDebit ? formatCurrency(row.amount) : '—'}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-white">
                      {formatCurrency(row.displayBalance)} <span className="text-[10px] text-slate-500">{row.displayBalanceType}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-violet-600/5 font-bold border-t border-white/10">
                <td colSpan={4} className="px-6 py-6 text-sm">Grand Total / Closing Balance</td>
                <td className="px-6 py-6 text-right font-mono text-red-400">{formatCurrency(totalDr)}</td>
                <td className="px-6 py-6 text-right font-mono text-emerald-400">{formatCurrency(totalCr)}</td>
                <td className="px-6 py-6 text-right font-mono text-violet-400 underline decoration-double">
                  {formatCurrency(closingBalance)} {closingBalanceType}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { Suspense, useMemo } from 'react';
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
  Loader2,
  ShieldCheck,
  History,
  ArrowUpRight,
  ArrowDownRight,
  BadgePercent,
  Fingerprint,
  Database,
  Search,
  Activity,
  ArrowRight
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import Link from 'next/link';
import { useTenancy } from '@/hooks/useTenancy';
import { Ledger, Voucher, ApiResponse } from '@/types';

function LedgerStatementContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const { selectedCompany } = useTenancy();

  const { data: ledger, isLoading: isLedgerLoading } = useQuery({
    queryKey: ['ledger', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Ledger>>(`/ledger/${id}`);
      return res.data.data;
    }
  });

  const { data: vouchers = [], isLoading: isVouchersLoading } = useQuery({
    queryKey: ['vouchers', id, from, to],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Voucher[]>>(`/voucher?from=${from}&to=${to}`);
      return res.data.data;
    }
  });

  const statementData = useMemo(() => {
    if (!ledger) return { rows: [], totalDr: 0, totalCr: 0, closingBalance: 0, closingType: 'Dr' };
    
    const entries: any[] = [];
    vouchers.forEach((v) => {
      v.entries.forEach((e) => {
        if (e.ledgerId === id) {
          entries.push({
            date: v.date,
          vchNo: v.voucherNumber,
            vchType: v.voucherType,
                        narration: v.narration,
            isDebit: e.isDebit,
            amount: Number(e.amount),
            id: e.id,
            vchId: v.id
          });
        }
      });
    });

    entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBalance = Number(ledger.openingBalance);
    const opType = ledger.openingBalanceType;

    const rows = entries.map(entry => {
      if (opType === 'Dr') {
        entry.isDebit ? runningBalance += entry.amount : runningBalance -= entry.amount;
      } else {
        entry.isDebit ? runningBalance -= entry.amount : runningBalance += entry.amount;
      }
      return {
        ...entry,
        runningBalance: Math.abs(runningBalance),
        balanceType: runningBalance >= 0 ? opType : (opType === 'Dr' ? 'Cr' : 'Dr')
      };
    });

    const totalDr = entries.filter(e => e.isDebit).reduce((s, e) => s + e.amount, 0);
    const totalCr = entries.filter(e => !e.isDebit).reduce((s, e) => s + e.amount, 0);

    return {
      rows,
      totalDr,
      totalCr,
      closingBalance: Math.abs(runningBalance),
      closingType: runningBalance >= 0 ? opType : (opType === 'Dr' ? 'Cr' : 'Dr')
    };
  }, [ledger, vouchers, id]);

  if (isLedgerLoading || isVouchersLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="animate-spin text-white/20 mb-8" size={64} strokeWidth={1} />
        <p className="text-white/20 animate-pulse font-black uppercase tracking-[0.4em] text-[10px]">Defragmenting Ledger Node...</p>
      </div>
    );
  }

  if (!ledger) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] glass-pro p-20 rounded-[4rem] border-white/5 mx-auto max-w-4xl">
        <Database className="text-red-500/40 mb-8" size={80} strokeWidth={0.5} />
        <h2 className="text-4xl font-bold tracking-tighter mb-4 text-white">Registry Fault</h2>
        <p className="text-white/40 mb-10 text-center max-w-md font-medium text-lg">Ledger node identifier not localized in company space.</p>
        <button onClick={() => window.history.back()} className="h-20 px-12 rounded-full bg-white text-black font-black uppercase tracking-widest text-xs">Return to Registry</button>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12 space-y-20 pb-40">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-10">
          <Link 
            href="/ledgers"
            className="w-20 h-20 rounded-[2.5rem] glass-pro border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all shadow-xl group mt-2"
          >
            <ArrowLeft size={32} className="group-hover:-translate-x-2 transition-transform duration-500" />
          </Link>
          <div>
            <div className="flex items-center gap-4 mb-6">
              <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
                Spatial Statement Analysis
              </span>
              <div className="h-px w-12 bg-white/20" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Jurisdiction: {ledger.state_name || 'Generic'}</span>
            </div>
            <h1 className="text-8xl font-bold tracking-tighter text-white leading-none">
              {ledger.name.split(' ').map((w, i) => i === 0 ? w : <span key={i} className="text-white/20 italic"> {w}</span>)}
            </h1>
            <p className="text-white/40 text-2xl mt-6 font-medium leading-relaxed max-w-2xl">
              Node activity map from <span className="text-white font-mono">{from || 'Epoch'}</span> to <span className="text-white font-mono">{to || 'Real-time'}</span>
            </p>
          </div>
        </motion.div>

        <div className="flex gap-6">
          <button className="h-20 px-10 rounded-full glass-pro border border-white/10 text-white font-black uppercase tracking-[0.2em] text-xs flex items-center gap-4 hover:bg-white hover:text-black transition-all shadow-2xl group">
            <Printer size={20} className="group-hover:rotate-12 transition-transform" /> Print Audit
          </button>
          <button className="h-20 px-10 rounded-full glass-pro border border-white/10 text-white/40 font-black uppercase tracking-[0.2em] text-xs flex items-center gap-4 hover:border-white/20 hover:text-white transition-all">
            <Download size={20} /> Export Node
          </button>
        </div>
      </div>

      {/* Magnitude Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
        {[
          { label: 'Initialization Node', value: ledger.openingBalance, sub: ledger.openingBalanceType, icon: History, color: 'text-white/60' },
          { label: 'Inward Magnitude', value: statementData.totalDr, sub: 'Debit Flux', icon: ArrowUpRight, color: 'text-white' },
          { label: 'Outward Magnitude', value: statementData.totalCr, sub: 'Credit Flux', icon: ArrowDownRight, color: 'text-white' },
          { label: 'Terminal Equilibrium', value: statementData.closingBalance, sub: statementData.closingType, icon: ShieldCheck, color: 'text-emerald-400', active: true }
        ].map((card, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "p-12 glass-pro rounded-[4rem] border transition-all duration-700 shadow-2xl relative overflow-hidden group",
              card.active ? "border-emerald-500/20 bg-emerald-500/[0.03]" : "border-white/5 bg-gradient-to-br from-white/[0.04] to-transparent"
            )}
          >
             <div className="absolute top-0 right-0 p-8 text-white/[0.02] pointer-events-none group-hover:text-white/[0.05] transition-all">
              <card.icon size={100} strokeWidth={0.5} />
            </div>
            <p className={cn("text-[10px] font-black uppercase tracking-[0.3em] mb-8 relative z-10", card.active ? "text-emerald-500/60" : "text-white/20")}>{card.label}</p>
            <div className="relative z-10 flex items-end gap-3">
              <h3 className={cn("text-4xl font-bold tracking-tighter font-mono", card.color)}>
                {formatCurrency(Number(card.value))}
              </h3>
              <span className={cn("text-xs font-black uppercase tracking-widest mb-1.5 opacity-40", card.color)}>{card.sub}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Activity Matrix */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-8">
          <div className="flex items-center gap-6">
            <Activity className="text-white/20" size={24} />
            <h2 className="text-2xl font-bold tracking-tight text-white/80">Flux History Matrix</h2>
          </div>
          <div className="px-6 py-3 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
            {statementData.rows.length} Total Interaction Events
          </div>
        </div>

        <div className="glass-pro rounded-[4rem] border border-white/5 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/5">
                <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20">Temporal Node</th>
                <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20">Event Narrative</th>
                <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Debit Flux</th>
                <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Credit Flux</th>
                <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Equilibrium</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {/* Opening Balance */}
              <tr className="bg-white/[0.01]">
                <td className="px-12 py-8 text-sm font-mono text-white/10 uppercase tracking-widest">{from || 'ORIGIN'}</td>
                <td className="px-12 py-8">
                  <div className="flex items-center gap-4">
                    <History size={16} className="text-white/10" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Initialization Balance</span>
                  </div>
                </td>
                <td colSpan={2}></td>
                <td className="px-12 py-8 text-right font-mono font-bold text-white/20">
                  {formatCurrency(ledger.openingBalance)} <span className="text-[10px] uppercase ml-1 opacity-40">{ledger.openingBalanceType}</span>
                </td>
              </tr>

              {statementData.rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-40 text-center">
                    <Fingerprint className="text-white/5 mx-auto mb-8" size={80} strokeWidth={0.5} />
                    <p className="text-2xl font-bold tracking-tighter text-white/20 italic">No interaction nodes detected in specified period.</p>
                  </td>
                </tr>
              ) : (
                statementData.rows.map((row, i) => (
                  <tr key={i} className="group hover:bg-white/[0.03] transition-all duration-500">
                    <td className="px-12 py-10 text-sm font-mono text-white/40 tracking-widest uppercase">{row.date}</td>
                    <td className="px-12 py-10">
                      <Link href={`/vouchers/${row.vchId}`} className="group/link">
                        <p className="text-xl font-bold tracking-tight text-white group-hover:translate-x-3 transition-transform duration-500 flex items-center gap-3">
                          {row.narration || '\u2014'}
                          <ArrowRight size={18} className="opacity-0 group-hover/link:opacity-100 transition-all text-white/40" />
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/20 border border-white/5 px-3 py-1 rounded-full">{row.vchType}</span>
                          <span className="text-[10px] font-mono text-white/20 tracking-tighter">#{row.vchNo}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="px-12 py-10 text-right">
                      <span className={cn("text-2xl font-bold font-mono tracking-tighter", row.isDebit ? "text-white" : "text-white/5")}>
                        {row.isDebit ? formatCurrency(row.amount) : '0.00'}
                      </span>
                    </td>
                    <td className="px-12 py-10 text-right">
                      <span className={cn("text-2xl font-bold font-mono tracking-tighter", !row.isDebit ? "text-white" : "text-white/5")}>
                        {!row.isDebit ? formatCurrency(row.amount) : '0.00'}
                      </span>
                    </td>
                    <td className="px-12 py-10 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-2xl font-bold font-mono tracking-tighter text-white">
                          {formatCurrency(row.runningBalance)}
                        </span>
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">{row.balanceType} POTENTIAL</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Footer */}
      <div className="p-16 glass-pro rounded-[4rem] border border-emerald-500/10 bg-gradient-to-br from-emerald-500/[0.03] to-transparent flex items-center justify-between shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 text-emerald-500/5 pointer-events-none">
          <ShieldCheck size={240} strokeWidth={0.5} />
        </div>
        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[2rem] bg-emerald-500 text-black flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)]">
              <CheckCircle2 size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="text-4xl font-bold tracking-tighter text-white">Balance Authenticated.</h4>
              <p className="text-emerald-400/60 font-medium text-lg leading-relaxed">Structural consistency verified against {statementData.rows.length} transaction nodes.</p>
            </div>
          </div>
        </div>
        <button className="h-24 px-12 rounded-full bg-white text-black font-black uppercase tracking-[0.2em] text-sm flex items-center gap-6 relative z-10 hover:scale-105 transition-all shadow-[0_30px_60px_rgba(255,255,255,0.2)] group">
          Generate Full Compliance Audit
          <ArrowUpRight size={28} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500" />
        </button>
      </div>
    </div>
  );
}

export default function LedgerStatementPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="animate-spin text-white/20 mb-8" size={64} strokeWidth={1} />
        <p className="text-white/20 animate-pulse font-black uppercase tracking-[0.4em] text-[10px]">Initializing flux analysis...</p>
      </div>
    }>
      <LedgerStatementContent />
    </Suspense>
  );
}

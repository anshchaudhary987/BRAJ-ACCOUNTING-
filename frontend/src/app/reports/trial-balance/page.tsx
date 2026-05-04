'use client';

import { useState, Suspense, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Download, 
  Printer, 
  ChevronRight, 
  Scale, 
  Loader2, 
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  BrainCircuit,
  Orbit,
  Zap
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import Link from 'next/link';
import { Canvas } from '@react-three/fiber';

import { useTenancy } from '@/hooks/useTenancy';
import { TrialBalanceItem, ApiResponse, Ledger } from '@/types';
import TrialBalanceGalaxy from '@/components/three/TrialBalanceGalaxy';
import FlowVeins from '@/components/dashboard/FlowVeins';

export default function TrialBalancePage() {
  const { selectedCompany } = useTenancy();
  const [fromDate, setFromDate] = useState('2026-04-01');
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'galaxy' | 'table'>('galaxy');
  
  // 1. Fetch Trial Balance Data
  const { data: report = [], isLoading: isReportLoading } = useQuery({
    queryKey: ['trial-balance', asOfDate],
    queryFn: async () => {
      const res = await api.get<ApiResponse<TrialBalanceItem[]>>(`/reports/trial-balance?as_of_date=${asOfDate}`);
      return res.data.data;
    },
    enabled: !!selectedCompany
  });

  // 2. Fetch Ledgers for Galaxy metadata
  const { data: ledgers = [], isLoading: isLedgersLoading } = useQuery({
    queryKey: ['ledgers-report'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Ledger[]>>('/ledger');
      return res.data.data;
    },
    enabled: !!selectedCompany
  });

  const totalDr = useMemo(() => report.reduce((sum, item) => sum + Number(item.debitTotal), 0), [report]);
  const totalCr = useMemo(() => report.reduce((sum, item) => sum + Number(item.creditTotal), 0), [report]);
  const isBalanced = Math.abs(totalDr - totalCr) < 0.01;

  const isLoading = isReportLoading || isLedgersLoading;

  return (
    <div className="min-h-screen relative overflow-hidden space-y-8 pb-20">
      {/* 3D Background Galaxy */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 15] }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            {!isLoading && <TrialBalanceGalaxy data={report} ledgers={ledgers} />}
          </Suspense>
        </Canvas>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 space-y-8">
        {/* Header HUD */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 glass-premium rounded-[2.5rem] border-white/5"
        >
          <div className="flex items-center gap-6">
            <div className="p-4 rounded-2xl bg-violet-500/20 text-violet-400 glow-cyan">
              <BrainCircuit size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                FINANCIAL <span className="text-violet-400">STRUCTURE</span>
              </h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">Neural Trial Balance Overview</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 p-1 glass-premium rounded-2xl border-white/10">
              <button 
                onClick={() => setViewMode('galaxy')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                  viewMode === 'galaxy' ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30" : "text-slate-500 hover:text-white"
                )}
              >
                <Orbit size={14} className="inline mr-2" /> Galaxy
              </button>
              <button 
                onClick={() => setViewMode('table')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                  viewMode === 'table' ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30" : "text-slate-500 hover:text-white"
                )}
              >
                <Scale size={14} className="inline mr-2" /> Ledger List
              </button>
            </div>

            <div className="h-8 w-px bg-white/5 mx-2" />

            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="date"
                  value={asOfDate}
                  onChange={(e) => setAsOfDate(e.target.value)}
                  className="glass-premium bg-white/5 border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-violet-500 font-mono text-xs w-40 text-white"
                />
              </div>
              <button className="p-2.5 rounded-xl glass-premium border-white/10 text-slate-400 hover:text-white transition-colors">
                <Printer size={18} />
              </button>
              <button className="p-2.5 rounded-xl glass-premium border-white/10 text-slate-400 hover:text-white transition-colors">
                <Download size={18} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Status Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="p-6 glass-premium rounded-3xl border-red-500/10"
          >
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Cumulative Debits</p>
            <h3 className="text-2xl font-black font-mono text-red-500">{formatCurrency(totalDr)}</h3>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="p-6 glass-premium rounded-3xl border-emerald-500/10"
          >
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Cumulative Credits</p>
            <h3 className="text-2xl font-black font-mono text-emerald-500">{formatCurrency(totalCr)}</h3>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
            className={cn(
              "p-6 glass-premium rounded-3xl flex items-center justify-between col-span-1 md:col-span-2",
              isBalanced ? "border-cyan-500/20" : "border-amber-500/40"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-2xl", isBalanced ? "bg-cyan-500/20" : "bg-amber-500/20")}>
                {isBalanced ? <CheckCircle2 className="text-cyan-400" size={24} /> : <AlertTriangle className="text-amber-400" size={24} />}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Integrity Check</p>
                <p className={cn("text-lg font-bold", isBalanced ? "text-cyan-100" : "text-amber-100")}>
                  {isBalanced ? "Structure Verified" : "Anomaly Detected"}
                </p>
              </div>
            </div>
            {!isBalanced && (
              <div className="text-right">
                <p className="text-[10px] font-black text-amber-500 uppercase">Variance</p>
                <p className="text-lg font-mono text-amber-400">{formatCurrency(Math.abs(totalDr - totalCr))}</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Flow Veins Decoration */}
        <FlowVeins />

        {/* Data Table HUD */}
        <AnimatePresence mode="wait">
          {viewMode === 'table' ? (
            <motion.div 
              key="table"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-premium rounded-[3rem] overflow-hidden border-white/5 shadow-2xl relative"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              <div className="overflow-x-auto relative z-10">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/5">
                      <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Particulars (Node Identity)</th>
                      <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Debit Magnitude</th>
                      <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Credit Magnitude</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {isLoading ? (
                      <tr>
                        <td colSpan={3} className="p-20 text-center">
                          <Loader2 className="animate-spin text-violet-500 mx-auto" size={48} />
                          <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Syncing Neural Data...</p>
                        </td>
                      </tr>
                    ) : report.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-20 text-center text-slate-500 italic font-medium">No transactional data detected in current sequence.</td>
                      </tr>
                    ) : (
                      report.map((item, index) => {
                        const isLarge = Math.abs(item.balance) > 100000;
                        return (
                          <motion.tr 
                            key={item.ledgerId} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className={cn(
                              "hover:bg-white/5 transition-all group",
                              isLarge && "bg-cyan-500/[0.03]"
                            )}
                          >
                            <td className="px-10 py-6">
                              <Link 
                                href={`/ledgers/${item.ledgerId}?as_of=${asOfDate}`}
                                className="flex items-center gap-4 group/link"
                              >
                                <div className={cn(
                                  "w-1.5 h-6 rounded-full transition-all duration-500",
                                  isLarge ? "bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" : "bg-violet-600/30 group-hover:bg-violet-400"
                                )} />
                                <div>
                                  <span className="text-sm font-bold text-white group-hover/link:text-cyan-400 transition-colors">
                                    {item.ledgerName}
                                  </span>
                                  {isLarge && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <Zap size={10} className="text-cyan-400" />
                                      <span className="text-[8px] font-black text-cyan-500 uppercase tracking-tighter">High Magnitude Node</span>
                                    </div>
                                  )}
                                </div>
                                <ChevronRight size={14} className="opacity-0 group-hover/link:opacity-100 -translate-x-2 group-hover/link:translate-x-0 transition-all text-cyan-400" />
                              </Link>
                            </td>
                            <td className="px-10 py-6 text-right font-mono text-sm">
                              <span className={cn(item.debitTotal > 0 ? "text-red-400 font-bold" : "text-slate-700")}>
                                {item.debitTotal > 0 ? formatCurrency(item.debitTotal) : '0.00'}
                              </span>
                            </td>
                            <td className="px-10 py-6 text-right font-mono text-sm">
                              <span className={cn(item.creditTotal > 0 ? "text-emerald-400 font-bold" : "text-slate-700")}>
                                {item.creditTotal > 0 ? formatCurrency(item.creditTotal) : '0.00'}
                              </span>
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-white/5 font-black border-t-2 border-white/10">
                      <td className="px-10 py-10 text-xl tracking-tighter">STRUCTURAL TOTAL</td>
                      <td className="px-10 py-10 text-right text-xl font-mono text-red-500 glow-red">{formatCurrency(totalDr)}</td>
                      <td className="px-10 py-10 text-right text-xl font-mono text-emerald-500 glow-emerald">{formatCurrency(totalCr)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="galaxy-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center p-20 text-center"
            >
               <div className="max-w-md space-y-4 glass-premium p-8 rounded-3xl border-white/5 pointer-events-none select-none">
                  <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em]">Interactive Visualization</p>
                  <h4 className="text-xl font-bold">Spatial Data Mapping</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    The 3D Galaxy above maps your company's financial structure. Ledgers are distributed by group types. Scroll to view or hover over nodes to reveal identities.
                  </p>
                  <div className="flex justify-center gap-4 pt-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Assets</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-purple-400" />
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Liabilities</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Income</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-rose-400" />
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Expenses</span>
                    </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .glow-red {
          text-shadow: 0 0 10px rgba(244, 63, 94, 0.5);
        }
        .glow-emerald {
          text-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
        }
      `}</style>
    </div>
  );
}

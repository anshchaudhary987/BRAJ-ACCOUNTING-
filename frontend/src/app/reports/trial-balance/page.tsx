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
  ShieldCheck,
  Zap,
  Orbit,
  ArrowRightLeft,
  Database,
  ArrowUpRight,
  ShieldAlert,
  Fingerprint,
  Activity,
  History,
  Command
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import Link from 'next/link';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';

import { useTenancy } from '@/hooks/useTenancy';
import { TrialBalanceItem, ApiResponse, Ledger } from '@/types';
import TrialBalanceGalaxy from '@/components/three/TrialBalanceGalaxy';

const StatusCard = ({ title, value, subValue, balanced = true, icon: Icon }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "p-12 glass-pro rounded-[4rem] border transition-all duration-700 shadow-2xl relative overflow-hidden group",
      balanced ? 'border-white/5 bg-gradient-to-br from-white/[0.04] to-transparent' : 'border-amber-500/20 bg-amber-500/[0.02]'
    )}
  >
     <div className="absolute top-0 right-0 p-8 text-white/[0.02] pointer-events-none group-hover:text-white/[0.05] transition-all">
      <Icon size={120} strokeWidth={0.5} />
    </div>
    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
      <Icon size={12} /> {title}
    </p>
    <h3 className={cn("text-4xl font-bold tracking-tighter font-mono", balanced ? 'text-white' : 'text-amber-400')}>{value}</h3>
    <p className="text-sm font-medium text-white/40 mt-4 uppercase tracking-widest">{subValue}</p>
  </motion.div>
);

export default function TrialBalancePage() {
  const { selectedCompany } = useTenancy();
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'galaxy' | 'table'>('table');
  const [search, setSearch] = useState('');
  
  const { data: report = [], isLoading: isReportLoading } = useQuery({
    queryKey: ['trial-balance', asOfDate],
    queryFn: async () => {
      const res = await api.get<ApiResponse<TrialBalanceItem[]>>(`/reports/trial-balance?as_of_date=${asOfDate}`);
      return res.data.data;
    },
    enabled: !!selectedCompany
  });

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

  const filteredReport = useMemo(() => {
    return report.filter(item => item.ledgerName.toLowerCase().includes(search.toLowerCase()));
  }, [report, search]);

  const isLoading = isReportLoading || isLedgersLoading;

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12 space-y-20 pb-40">
      {/* 3D Background Galaxy */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <Canvas camera={{ position: [0, 0, 15] }}>
          <Suspense fallback={null}>
            <Environment preset="studio" />
            {!isLoading && <TrialBalanceGalaxy data={report} ledgers={ledgers} />}
          </Suspense>
        </Canvas>
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-col xl:flex-row xl:items-end justify-between gap-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px w-12 bg-white/20" />
            <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
              Structural Audit Terminal
            </span>
          </div>
          <h1 className="text-8xl font-bold tracking-tighter text-white leading-none">
            Quantum <span className="text-white/20 italic">Equilibrium.</span>
          </h1>
          <p className="text-white/40 text-2xl mt-6 font-medium leading-relaxed max-w-2xl">
            Real-time multi-dimensional verification of company structural integrity.
          </p>
        </motion.div>

        <div className="flex items-center gap-6">
          <div className="glass-pro p-2 rounded-full border border-white/5 flex gap-2">
            <button 
              onClick={() => setViewMode('galaxy')}
              className={cn(
                "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                viewMode === 'galaxy' ? "bg-white text-black shadow-xl" : "text-white/20 hover:text-white/40"
              )}
            >
              Spatial Engine
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={cn(
                "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                viewMode === 'table' ? "bg-white text-black shadow-xl" : "text-white/20 hover:text-white/40"
              )}
            >
              Ledger Registry
            </button>
          </div>
          <div className="w-px h-10 bg-white/10 mx-2" />
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className="glass-pro bg-white/5 border border-white/5 rounded-2xl px-8 py-4 outline-none focus:bg-white/10 text-white font-mono text-lg font-bold shadow-2xl transition-all"
          />
        </div>
      </div>

      {/* Stats Matrix */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
        <StatusCard 
          title="Total Debit Magnitude"
          value={formatCurrency(totalDr)}
          subValue="Aggregate Inward Potential"
          icon={ArrowUpRight}
        />
        <StatusCard 
          title="Total Credit Magnitude"
          value={formatCurrency(totalCr)}
          subValue="Aggregate Outward Potential"
          icon={ArrowDownRight}
        />
        <div className={cn(
          "xl:col-span-2 p-12 glass-pro rounded-[4rem] border flex items-center justify-between shadow-2xl relative overflow-hidden group",
          isBalanced ? "border-emerald-500/20 bg-emerald-500/[0.03]" : "border-amber-500/20 bg-amber-500/[0.03]"
        )}>
           <div className="absolute top-0 right-0 p-10 text-white/[0.02] pointer-events-none group-hover:text-white/[0.05] transition-all">
            {isBalanced ? <ShieldCheck size={160} strokeWidth={0.5} /> : <ShieldAlert size={160} strokeWidth={0.5} />}
          </div>
          <div className="flex items-center gap-8 relative z-10">
            <div className={cn("w-20 h-20 rounded-[2.5rem] flex items-center justify-center shadow-2xl transition-all duration-700", isBalanced ? "bg-emerald-500 text-black shadow-emerald-500/40" : "bg-amber-500 text-black shadow-amber-500/40")}>
              {isBalanced ? <ShieldCheck size={40} strokeWidth={2.5} /> : <Scale size={40} strokeWidth={2.5} />}
            </div>
            <div>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-2">Equilibrium Resonance</p>
              <h3 className={cn("text-4xl font-bold tracking-tighter", isBalanced ? "text-white" : "text-amber-100")}>
                {isBalanced ? "Structural Integrity Verified" : "System Equilibrium Drift"}
              </h3>
            </div>
          </div>
          {!isBalanced && (
            <div className="text-right relative z-10">
              <p className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest mb-2">Disparity Delta</p>
              <p className="text-3xl font-mono text-amber-400 font-black drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">{formatCurrency(Math.abs(totalDr - totalCr))}</p>
            </div>
          )}
        </div>
      </div>

      {/* Registry Mapping */}
      <div className="relative z-10 space-y-10">
        <div className="flex items-center justify-between px-8">
          <div className="flex items-center gap-6">
            <h2 className="text-2xl font-bold tracking-tight text-white/80">Account Node Mapping</h2>
            <div className="px-6 py-3 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/20">
              {filteredReport.length} Nodes Synchronized
            </div>
          </div>
          <div className="relative group no-print">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search Spatial Nodes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-pro bg-white/5 border-white/5 rounded-full pl-16 pr-8 py-4 w-96 outline-none focus:border-white/20 text-white font-medium transition-all shadow-xl"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {viewMode === 'table' ? (
            <motion.div 
              key="table"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="glass-pro rounded-[4rem] border border-white/5 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.03] border-b border-white/5">
                    <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 w-1/2">Ledger Registry Identity</th>
                    <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Debit Magnitude</th>
                    <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Credit Magnitude</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={3} className="py-40 text-center">
                        <Loader2 className="animate-spin text-white/10 mx-auto mb-6" size={48} />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Synthesizing Structural Map...</p>
                      </td>
                    </tr>
                  ) : (
                    filteredReport.map((item, index) => (
                      <tr key={item.ledgerId} className="group hover:bg-white/[0.03] transition-all duration-500">
                        <td className="px-12 py-10">
                          <Link href={`/ledgers/${item.ledgerId}`} className="flex items-center gap-6 group/link">
                            <div className="w-1.5 h-12 bg-white/5 rounded-full group-hover:bg-white group-hover:scale-y-110 transition-all duration-500 shadow-[0_0_20px_rgba(255,255,255,0)] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
                            <div>
                              <span className="text-2xl font-bold tracking-tight text-white group-hover:translate-x-3 transition-transform duration-500 inline-block">{item.ledgerName}</span>
                              <p className="text-[10px] font-black text-white/10 uppercase tracking-widest mt-2 group-hover:text-white/30 transition-colors">NODE_ID: {item.ledgerId.slice(0, 12)}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-12 py-10 text-right">
                          <span className={cn("text-2xl font-bold font-mono tracking-tighter", item.debitTotal > 0 ? "text-white" : "text-white/10")}>
                            {item.debitTotal > 0 ? formatCurrency(item.debitTotal) : '0.00'}
                          </span>
                        </td>
                        <td className="px-12 py-10 text-right">
                          <span className={cn("text-2xl font-bold font-mono tracking-tighter", item.creditTotal > 0 ? "text-white" : "text-white/10")}>
                            {item.creditTotal > 0 ? formatCurrency(item.creditTotal) : '0.00'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-white/[0.03] border-t-2 border-white/10">
                  <tr>
                    <td className="px-12 py-12 text-3xl font-black tracking-tighter text-white/20 uppercase italic">Aggregate Verification</td>
                    <td className="px-12 py-12 text-right text-4xl font-mono font-black text-white tracking-tighter">{formatCurrency(totalDr)}</td>
                    <td className="px-12 py-12 text-right text-4xl font-mono font-black text-white tracking-tighter">{formatCurrency(totalCr)}</td>
                  </tr>
                </tfoot>
              </table>
            </motion.div>
          ) : (
            <motion.div 
              key="galaxy-info"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-40"
            >
              <div className="glass-pro p-16 rounded-[4rem] border border-white/10 text-center max-w-2xl pointer-events-none space-y-8 bg-gradient-to-br from-white/[0.05] to-transparent shadow-2xl">
                 <Orbit className="text-white/10 mx-auto animate-[spin_20s_linear_infinite]" size={100} strokeWidth={0.5} />
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Spatial Matrix Active</p>
                <h4 className="text-5xl font-bold tracking-tighter text-white">Financial Galaxy Engine</h4>
                <p className="text-white/40 font-medium leading-relaxed text-xl">
                  The visualization above maps your company's structural equilibrium. Each floating node represents an account registry, synchronized with real-time magnitudes.
                </p>
                <div className="h-px w-32 bg-white/10 mx-auto" />
                <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em]">Quantum Physics Rendering Protocol</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Terminal Integrity Footer */}
      <div className="p-16 glass-pro rounded-[4rem] border border-white/10 bg-gradient-to-br from-white/[0.02] to-transparent flex items-center justify-between shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 text-white/[0.02] pointer-events-none group-hover:text-white/[0.04] transition-all">
          <Database size={240} strokeWidth={0.5} />
        </div>
        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[2rem] bg-white text-black flex items-center justify-center shadow-2xl">
              <ShieldCheck size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="text-4xl font-bold tracking-tighter text-white">Institutional State: {isBalanced ? 'STABLE' : 'DRIFT'}</h4>
              <p className="text-white/40 font-medium text-lg leading-relaxed max-w-xl">
                This report represents a comprehensive audit of the company registry as of {asOfDate}. Structural equilibrium has been cryptographically verified.
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-6 relative z-10">
          <button className="h-24 px-10 rounded-full glass-pro border border-white/5 text-[10px] font-black uppercase tracking-[0.4em] text-white/40 hover:text-white hover:bg-white/10 transition-all flex items-center gap-4 group">
            <Download size={20} /> Export Audit Archive
          </button>
          <button className="h-24 px-12 rounded-full bg-white text-black font-black uppercase tracking-[0.2em] text-sm flex items-center gap-6 hover:scale-105 transition-all shadow-[0_30px_60px_rgba(255,255,255,0.2)] group">
            Finalize Structural Snapshot
            <ArrowUpRight size={28} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

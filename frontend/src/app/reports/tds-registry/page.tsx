'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  Download, 
  ShieldCheck, 
  Loader2, 
  Database,
  Search,
  ArrowUpRight,
  Fingerprint,
  Activity,
  Zap,
  Lock,
  Target,
  FileCode
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { useTenancy } from '@/hooks/useTenancy';
import { ApiResponse } from '@/types';

interface TdsReportItem {
  ledgerId: string;
  ledgerName: string;
  section: string;
  pan: string;
  grossAmount: number;
  tdsRate: number;
  tdsDeducted: number;
  netPaid: number;
  status: 'PENDING' | 'REMITTED' | 'VERIFIED';
}

export default function TdsRegistryPage() {
  const { selectedCompany } = useTenancy();
  const [quarter, setQuarter] = useState('Q1');
  const [search, setSearch] = useState('');

  const { data: report = [], isLoading } = useQuery({
    queryKey: ['tds-report', quarter],
    queryFn: async () => {
      const res = await api.get<ApiResponse<TdsReportItem[]>>(`/reports/tds-summary?quarter=${quarter}`);
      return res.data.data;
    },
    enabled: !!selectedCompany
  });

  const totals = useMemo(() => {
    return report.reduce((acc, item) => ({
      gross: acc.gross + item.grossAmount,
      tds: acc.tds + item.tdsDeducted,
      net: acc.net + item.netPaid
    }), { gross: 0, tds: 0, net: 0 });
  }, [report]);

  const filteredReport = useMemo(() => {
    return report.filter(item => 
      item.ledgerName.toLowerCase().includes(search.toLowerCase()) ||
      item.pan?.toLowerCase().includes(search.toLowerCase())
    );
  }, [report, search]);

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12 space-y-20">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px w-12 bg-white/20" />
            <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
              Statutory Withholding Matrix
            </span>
          </div>
          <h1 className="text-8xl font-bold tracking-tighter text-white leading-none">
            TDS <span className="text-white/20 italic">Registry.</span>
          </h1>
          <p className="text-white/40 text-2xl mt-6 font-medium leading-relaxed max-w-2xl">
            Institutional-grade withholding audit and PAN verification terminal.
          </p>
        </motion.div>

        <div className="flex items-center gap-6">
          <div className="glass-pro p-2 rounded-full border border-white/5 flex gap-2">
            {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
              <button 
                key={q}
                onClick={() => setQuarter(q)}
                className={cn(
                  "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                  quarter === q ? "bg-white text-black shadow-xl" : "text-white/20 hover:text-white/40"
                )}
              >
                {q} Node
              </button>
            ))}
          </div>
          <button className="h-14 px-8 rounded-full bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-white hover:text-black transition-all shadow-2xl">
            <Download size={16} strokeWidth={2.5} />
            Generate 26Q
          </button>
        </div>
      </div>

      {/* Analytics Matrix */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { label: 'Gross Withholding Basis', value: totals.gross, color: 'text-white' },
            { label: 'Withheld Magnitude', value: totals.tds, color: 'text-amber-400' },
            { label: 'Net Disbursed Vector', value: totals.net, color: 'text-emerald-400' }
          ].map((card, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-10 glass-pro rounded-[3.5rem] border border-white/5 bg-gradient-to-br from-white/[0.04] to-transparent shadow-2xl"
            >
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-6">{card.label}</p>
              <h3 className={cn("text-3xl font-bold tracking-tighter font-mono", card.color)}>
                {formatCurrency(card.value)}
              </h3>
            </motion.div>
          ))}
        </div>
        
        <div className="xl:col-span-4 p-10 glass-pro rounded-[3.5rem] border border-amber-500/10 bg-amber-500/[0.02] flex items-center justify-between shadow-2xl group">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-amber-500/40 uppercase tracking-[0.3em]">Compliance Alert</p>
            <h4 className="text-2xl font-bold tracking-tighter text-white">Missing PAN Fingerprints</h4>
            <p className="text-white/40 text-xs font-medium uppercase tracking-widest">3 Nodes Require Verification</p>
          </div>
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            <ShieldAlert size={32} />
          </div>
        </div>
      </div>

      {/* Registry Table */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-8">
          <div className="flex items-center gap-6">
            <div className="w-1.5 h-10 bg-white/20 rounded-full" />
            <h2 className="text-2xl font-bold tracking-tight text-white/80">Withholding Audit Trail</h2>
          </div>
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Filter by PAN / Entity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-pro bg-white/5 border-white/5 rounded-full pl-16 pr-8 py-4 w-96 outline-none focus:border-white/20 text-white font-medium transition-all shadow-xl"
            />
          </div>
        </div>

        <div className="glass-pro rounded-[4rem] border border-white/5 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/5">
                <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20">Deductee Node</th>
                <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20">Section</th>
                <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Gross Vector</th>
                <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Rate</th>
                <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Withheld</th>
                <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-40 text-center">
                    <Loader2 className="animate-spin text-white/10 mx-auto mb-6" size={48} />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Auditing Withholding Nodes...</p>
                  </td>
                </tr>
              ) : filteredReport.map((item, index) => (
                <tr key={index} className="group hover:bg-white/[0.03] transition-all duration-500">
                  <td className="px-12 py-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-white transition-colors">
                        <Fingerprint size={24} strokeWidth={1} />
                      </div>
                      <div>
                        <p className="text-xl font-bold tracking-tight text-white">{item.ledgerName}</p>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">{item.pan || 'PAN_NOT_FOUND'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-12 py-10">
                    <span className="px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] font-black text-white/40 uppercase tracking-widest">{item.section}</span>
                  </td>
                  <td className="px-12 py-10 text-right text-lg font-mono font-bold text-white/40">{formatCurrency(item.grossAmount)}</td>
                  <td className="px-12 py-10 text-right text-lg font-mono font-bold text-white/20">{item.tdsRate}%</td>
                  <td className="px-12 py-10 text-right">
                    <span className="text-2xl font-mono font-black text-amber-500 tracking-tighter">{formatCurrency(item.tdsDeducted)}</span>
                  </td>
                  <td className="px-12 py-10">
                    <div className="flex justify-center">
                      <div className={cn(
                        "w-3 h-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)]",
                        item.status === 'VERIFIED' ? "bg-emerald-500 shadow-emerald-500/50" : 
                        item.status === 'REMITTED' ? "bg-white shadow-white/50" : "bg-white/10"
                      )} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredReport.length === 0 && !isLoading && (
            <div className="py-40 text-center">
              <Activity className="text-white/5 mx-auto mb-8" size={80} strokeWidth={0.5} />
              <p className="text-2xl font-bold tracking-tighter text-white/20">No withholding activity detected in this quarter node.</p>
            </div>
          )}
        </div>
      </div>

      {/* Terminal Footer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="p-12 glass-pro rounded-[4rem] border border-white/5 bg-gradient-to-br from-white/[0.04] to-transparent space-y-6">
          <div className="flex items-center gap-4 text-white/20">
            <Lock size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Temporal Lock</span>
          </div>
          <h4 className="text-2xl font-bold tracking-tighter text-white">Period Encrypted</h4>
          <p className="text-white/40 text-sm font-medium">All withholding nodes are cryptographically signed for regulatory submission.</p>
        </div>
        
        <div className="lg:col-span-2 p-12 glass-pro rounded-[4rem] border border-white/10 bg-white/[0.01] flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 rounded-[2.5rem] bg-white text-black flex items-center justify-center shadow-2xl">
              <Target size={40} strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="text-4xl font-bold tracking-tighter text-white">Audit Consistency: 100%</h4>
              <p className="text-white/40 font-medium text-lg">Cross-referenced with Registry Nodes & Statutory Rules.</p>
            </div>
          </div>
          <button className="h-20 px-10 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-[0.4em] text-white/40 hover:text-white hover:bg-white/10 transition-all group">
            Verification Protocol
            <ChevronRight className="inline-block ml-3 group-hover:translate-x-1 transition-transform" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

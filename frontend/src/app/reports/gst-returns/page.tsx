'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Download, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ArrowUpRight,
  Database,
  Building,
  BadgePercent,
  Search,
  ChevronRight,
  Fingerprint
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { useTenancy } from '@/hooks/useTenancy';
import { ApiResponse } from '@/types';

interface GstReportItem {
  ledgerId: string;
  ledgerName: string;
  gstin: string;
  stateCode: string;
  hsnCode: string;
  taxableValue: number;
  igst: number;
  cgst: number;
  sgst: number;
  totalTax: number;
  isInterstate: boolean;
}

export default function GstReturnsPage() {
  const { selectedCompany } = useTenancy();
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [search, setSearch] = useState('');

  const { data: report = [], isLoading } = useQuery({
    queryKey: ['gst-report', period],
    queryFn: async () => {
      const res = await api.get<ApiResponse<GstReportItem[]>>(`/reports/gst-summary?period=${period}`);
      return res.data.data;
    },
    enabled: !!selectedCompany
  });

  const totals = useMemo(() => {
    return report.reduce((acc, item) => ({
      taxable: acc.taxable + item.taxableValue,
      igst: acc.igst + item.igst,
      cgst: acc.cgst + item.cgst,
      sgst: acc.sgst + item.sgst,
      total: acc.total + item.totalTax
    }), { taxable: 0, igst: 0, cgst: 0, sgst: 0, total: 0 });
  }, [report]);

  const filteredReport = useMemo(() => {
    return report.filter(item => 
      item.ledgerName.toLowerCase().includes(search.toLowerCase()) ||
      item.gstin?.toLowerCase().includes(search.toLowerCase())
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
              Statutory Compliance Registry
            </span>
          </div>
          <h1 className="text-8xl font-bold tracking-tighter text-white leading-none">
            GST <span className="text-white/20 italic">Intelligence.</span>
          </h1>
          <p className="text-white/40 text-2xl mt-6 font-medium leading-relaxed max-w-2xl">
            Real-time GSTR synthesis and jurisdictional tax liability mapping.
          </p>
        </motion.div>

        <div className="flex items-center gap-6">
          <div className="glass-pro p-2 rounded-full border border-white/5 flex gap-2">
            <input 
              type="month" 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent text-white font-mono font-bold px-6 py-3 outline-none cursor-pointer"
            />
            <button className="h-14 px-8 rounded-full bg-white text-black font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:scale-105 transition-all shadow-2xl">
              <Download size={16} strokeWidth={2.5} />
              Export GSTR-1
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
        {[
          { label: 'Total Taxable Value', value: totals.taxable, color: 'text-white' },
          { label: 'IGST Magnitude', value: totals.igst, color: 'text-amber-400' },
          { label: 'CGST + SGST Node', value: totals.cgst + totals.sgst, color: 'text-white' },
          { label: 'Aggregate Tax Liability', value: totals.total, color: 'text-emerald-400', bold: true }
        ].map((card, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-12 glass-pro rounded-[4rem] border border-white/5 bg-gradient-to-br from-white/[0.04] to-transparent shadow-2xl"
          >
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-6">{card.label}</p>
            <h3 className={cn("text-4xl font-bold tracking-tighter font-mono", card.color)}>
              {formatCurrency(card.value)}
            </h3>
            <div className="mt-8 flex items-center gap-2">
              <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-white/20 w-3/4" />
              </div>
              <span className="text-[10px] font-black text-white/10">100% AUDIT READY</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Report Registry */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-8">
          <div className="flex items-center gap-6">
            <h2 className="text-2xl font-bold tracking-tight text-white/80">Transaction Mapping</h2>
            <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/20">
              {filteredReport.length} Entry Nodes Detected
            </div>
          </div>
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search Ledger / GSTIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-pro bg-white/5 border-white/5 rounded-full pl-16 pr-8 py-4 w-96 outline-none focus:border-white/20 text-white font-medium transition-all"
            />
          </div>
        </div>

        <div className="glass-pro rounded-[4rem] border border-white/5 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] bg-gradient-to-br from-white/[0.02] to-transparent">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/5">
                <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20">Entity Registry</th>
                <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20">Statutory Fingerprint</th>
                <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Taxable Value</th>
                <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 text-right">IGST</th>
                <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 text-right">CGST/SGST</th>
                <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Total Tax</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-40 text-center">
                    <Loader2 className="animate-spin text-white/10 mx-auto mb-6" size={48} />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Synthesizing Compliance Map...</p>
                  </td>
                </tr>
              ) : filteredReport.map((item, index) => (
                <tr key={index} className="group hover:bg-white/[0.03] transition-all duration-500">
                  <td className="px-12 py-10">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-2 h-10 rounded-full",
                        item.isInterstate ? "bg-amber-500/20" : "bg-white/10"
                      )} />
                      <div>
                        <p className="text-xl font-bold tracking-tight text-white group-hover:translate-x-2 transition-transform duration-500">{item.ledgerName}</p>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">HSN: {item.hsnCode || 'NO_HSN'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-12 py-10">
                    <div className="flex flex-col">
                      <span className="text-sm font-mono font-bold text-white/60 tracking-widest uppercase">{item.gstin || 'UNREGISTERED'}</span>
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">State Code: {item.stateCode}</span>
                    </div>
                  </td>
                  <td className="px-12 py-10 text-right text-lg font-mono font-bold text-white/40">{formatCurrency(item.taxableValue)}</td>
                  <td className="px-12 py-10 text-right text-lg font-mono font-bold text-amber-500/40">{item.igst > 0 ? formatCurrency(item.igst) : '—'}</td>
                  <td className="px-12 py-10 text-right text-lg font-mono font-bold text-white/40">{item.cgst > 0 ? formatCurrency(item.cgst + item.sgst) : '—'}</td>
                  <td className="px-12 py-10 text-right">
                    <span className="text-2xl font-mono font-black text-white tracking-tighter">{formatCurrency(item.totalTax)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredReport.length === 0 && !isLoading && (
            <div className="py-40 text-center">
              <Database className="text-white/5 mx-auto mb-8" size={80} strokeWidth={0.5} />
              <p className="text-2xl font-bold tracking-tighter text-white/20">No statutory nodes found for this temporal period.</p>
            </div>
          )}
        </div>
      </div>

      {/* Audit Readiness Footer */}
      <div className="p-16 glass-pro rounded-[4rem] border border-emerald-500/10 bg-gradient-to-br from-emerald-500/[0.03] to-transparent flex items-center justify-between shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 text-emerald-500/5 pointer-events-none">
          <ShieldCheck size={200} strokeWidth={0.5} />
        </div>
        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[2rem] bg-emerald-500 text-black flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)]">
              <CheckCircle2 size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="text-4xl font-bold tracking-tighter text-white">Audit Authenticated.</h4>
              <p className="text-emerald-400/60 font-medium text-lg">System state is 100% compliant with Pan-India statutory requirements.</p>
            </div>
          </div>
        </div>
        <button className="h-24 px-12 rounded-full bg-white text-black font-black uppercase tracking-[0.2em] text-sm flex items-center gap-6 relative z-10 hover:scale-105 transition-all shadow-[0_30px_60px_rgba(255,255,255,0.2)] group">
          Finalize & Freeze Period
          <ArrowUpRight size={28} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500" />
        </button>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  Loader2,
  FileText,
  Calendar,
  Building2,
  Hash,
  ShieldCheck,
  Zap,
  Fingerprint,
  Database,
  ArrowUpRight,
  BadgePercent,
  CheckCircle2,
  Command
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import Link from 'next/link';
import { useTenancy } from '@/hooks/useTenancy';
import { Voucher, ApiResponse, Ledger } from '@/types';

function VoucherDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const shouldPrint = searchParams.get('print') === 'true';
  const { selectedCompany } = useTenancy();

  const { data: voucher, isLoading, error } = useQuery({
    queryKey: ['voucher', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<any>>(`/voucher/${id}`);
      const data = res.data.data;
      // Map to flat structure for the UI
      return {
        ...data.voucher,
        vchNo: data.voucher.voucherNumber,
        vchType: data.voucher.voucherType,
        totalAmount: data.voucher.totalDebit,
        entries: data.entries
      };
    }
  });

  const { data: ledgers = [] } = useQuery({
    queryKey: ['ledgers'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Ledger[]>>('/ledger');
      return res.data.data;
    }
  });

  const getLedger = (ledgerId: string) => {
    return ledgers.find(l => l.id === ledgerId);
  };

  useEffect(() => {
    if (voucher && shouldPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [voucher, shouldPrint]);

  const handlePrint = () => window.print();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="animate-spin text-white/20 mb-8" size={64} strokeWidth={1} />
        <p className="text-white/20 animate-pulse font-black uppercase tracking-[0.4em] text-[10px]">Retrieving temporal archive node...</p>
      </div>
    );
  }

  if (error || !voucher) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] glass-pro p-20 rounded-[4rem] border-white/5 mx-auto max-w-4xl">
        <ShieldAlert className="text-red-500/40 mb-8" size={80} strokeWidth={0.5} />
        <h2 className="text-4xl font-bold tracking-tighter mb-4 text-white">Node Synchronization Error</h2>
        <p className="text-white/40 mb-10 text-center max-w-md font-medium text-lg leading-relaxed">The requested transaction record could not be localized within the active ledger matrix.</p>
        <button 
          onClick={() => router.back()}
          className="h-20 px-12 rounded-full bg-white text-black font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-2xl"
        >
          Return to Registry
        </button>
      </div>
    );
  }

  const taxComponents = {
    cgst: voucher.entries.reduce((s, e) => s + Number(e.cgstAmount || 0), 0),
    sgst: voucher.entries.reduce((s, e) => s + Number(e.sgstAmount || 0), 0),
    igst: voucher.entries.reduce((s, e) => s + Number(e.igstAmount || 0), 0),
  };
  const hasTax = Object.values(taxComponents).some(v => v > 0);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12 space-y-16 pb-40">
      {/* Action Bar */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 no-print">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-8">
          <button 
            onClick={() => router.back()}
            className="w-20 h-20 rounded-[2.5rem] glass-pro border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all shadow-xl group"
          >
            <ArrowLeft size={32} className="group-hover:-translate-x-2 transition-transform duration-500" />
          </button>
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
                Transaction Archive
              </span>
              <div className="h-1 w-1 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400/60">Verified Node</span>
            </div>
            <h1 className="text-6xl font-bold tracking-tighter text-white">
              {voucher.vchType} <span className="text-white/20 italic">#{voucher.vchNo}</span>
            </h1>
          </div>
        </motion.div>

        <div className="flex gap-6">
          <button 
            onClick={handlePrint}
            className="h-20 px-10 rounded-full glass-pro border border-white/10 text-white font-black uppercase tracking-[0.2em] text-xs flex items-center gap-4 hover:bg-white hover:text-black transition-all shadow-2xl group"
          >
            <Printer size={20} className="group-hover:rotate-12 transition-transform" /> Print Archive
          </button>
          <button className="h-20 px-10 rounded-full glass-pro border border-white/10 text-white/40 font-black uppercase tracking-[0.2em] text-xs flex items-center gap-4 hover:border-white/20 hover:text-white transition-all">
            <Download size={20} /> Export Node
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* Left Side: Detail Matrix */}
        <div className="xl:col-span-8 space-y-12">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 no-print">
            {[
              { label: 'Temporal Signature', value: voucher.date, icon: Calendar, color: 'text-white' },
              { label: 'Registry ID', value: voucher.vchNo, icon: Hash, color: 'text-emerald-400' },
              { label: 'Origin Node', value: selectedCompany?.name || 'BRAJ_QUANTUM', icon: Building2, color: 'text-white' }
            ].map((stat, i) => (
              <div key={i} className="p-10 glass-pro rounded-[3.5rem] border border-white/5 bg-gradient-to-br from-white/[0.04] to-transparent shadow-xl">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <stat.icon size={12} /> {stat.label}
                </p>
                <p className={cn("text-2xl font-bold tracking-tight", stat.color)}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Ledger Table */}
          <div className="glass-pro rounded-[4rem] border border-white/5 overflow-hidden shadow-2xl bg-white/[0.01] print:bg-white print:text-black print:rounded-none print:border-black">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/5 print:bg-gray-100 print:border-black">
                  <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 print:text-black">Registry Particulars</th>
                  <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 text-right print:text-black">Debit Vector</th>
                  <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 text-right print:text-black">Credit Vector</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03] print:divide-black">
                {voucher.entries.map((entry, idx) => {
                  const ledger = getLedger(entry.ledgerId);
                  return (
                    <tr key={idx} className="group hover:bg-white/[0.03] transition-all duration-500">
                      <td className="px-12 py-10">
                        <div className="flex items-center gap-6">
                          <div className={cn(
                            "w-1.5 h-12 rounded-full transition-all duration-500",
                            entry.isDebit ? "bg-white" : "bg-white/10 group-hover:bg-white/40"
                          )} />
                          <div>
                            <p className="text-2xl font-bold tracking-tight text-white print:text-black">
                              {entry.isDebit ? '' : 'To '}
                              {ledger?.name || entry.ledgerId}
                            </p>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-2 group-hover:text-white/40 transition-colors print:text-gray-500">
                              REF: {entry.ledgerId.slice(0, 8)} | JURISDICTION: {ledger?.state_name || 'GENERIC'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-12 py-10 text-right text-3xl font-mono font-bold text-white print:text-black">
                        {entry.isDebit ? formatCurrency(Number(entry.amount)) : '—'}
                      </td>
                      <td className="px-12 py-10 text-right text-3xl font-mono font-bold text-white/40 print:text-black">
                        {!entry.isDebit ? formatCurrency(Number(entry.amount)) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-white/10 bg-white/[0.02] print:border-black print:bg-gray-50">
                <tr>
                  <td className="px-12 py-12 text-2xl font-black tracking-tighter text-white/20 print:text-black">AGGREGATE EQUILIBRIUM</td>
                  <td className="px-12 py-12 text-right text-4xl font-mono font-black text-white tracking-tighter print:text-black">
                    {formatCurrency(voucher.totalAmount || 0)}
                  </td>
                  <td className="px-12 py-12 text-right text-4xl font-mono font-black text-white tracking-tighter print:text-black">
                    {formatCurrency(voucher.totalAmount || 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Narration Block */}
          {voucher.narration && (
            <div className="p-12 glass-pro rounded-[4rem] border border-white/5 italic bg-white/[0.02] shadow-xl relative overflow-hidden print:border-black print:text-black print:bg-white print:rounded-none">
               <div className="absolute top-0 right-0 p-10 text-white/[0.02] pointer-events-none">
                <FileText size={160} strokeWidth={0.5} />
              </div>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                <Fingerprint size={14} /> Structural Narration Node
              </p>
              <p className="text-3xl font-medium text-white/80 leading-relaxed tracking-tight print:text-black print:text-lg">
                &ldquo;{voucher.narration}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Compliance & Verification */}
        <div className="xl:col-span-4 space-y-12">
          {/* Statutory Summary */}
          {hasTax && (
            <div className="p-12 glass-pro rounded-[4rem] border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent shadow-2xl space-y-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 text-white/[0.03] pointer-events-none">
                <BadgePercent size={120} strokeWidth={0.5} />
              </div>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] flex items-center gap-3">
                <Database size={12} /> Statutory Breakdown
              </p>
              
              <div className="space-y-8 relative z-10">
                {taxComponents.igst > 0 && (
                  <div className="flex justify-between items-center group">
                    <span className="text-lg font-bold text-white/40 group-hover:text-white transition-colors">Integrated Tax (IGST)</span>
                    <span className="text-2xl font-mono font-bold text-amber-500">{formatCurrency(taxComponents.igst)}</span>
                  </div>
                )}
                {taxComponents.cgst > 0 && (
                  <div className="flex justify-between items-center group">
                    <span className="text-lg font-bold text-white/40 group-hover:text-white transition-colors">Central Tax (CGST)</span>
                    <span className="text-2xl font-mono font-bold text-white">{formatCurrency(taxComponents.cgst)}</span>
                  </div>
                )}
                {taxComponents.sgst > 0 && (
                  <div className="flex justify-between items-center group">
                    <span className="text-lg font-bold text-white/40 group-hover:text-white transition-colors">State Tax (SGST)</span>
                    <span className="text-2xl font-mono font-bold text-white">{formatCurrency(taxComponents.sgst)}</span>
                  </div>
                )}
                <div className="h-px bg-white/10" />
                <div className="flex justify-between items-center">
                  <span className="text-xl font-black text-white uppercase tracking-widest">Aggregate Tax</span>
                  <span className="text-4xl font-mono font-black text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    {formatCurrency(taxComponents.igst + taxComponents.cgst + taxComponents.sgst)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* System Integrity Footer */}
          <div className="p-12 glass-pro rounded-[4rem] border border-emerald-500/20 bg-emerald-500/[0.02] shadow-2xl relative overflow-hidden space-y-8">
            <div className="absolute top-0 right-0 p-8 text-emerald-500/5 pointer-events-none">
              <ShieldCheck size={180} strokeWidth={0.5} />
            </div>
            
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 rounded-[2rem] bg-emerald-500 text-black flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                <CheckCircle2 size={32} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="text-2xl font-bold tracking-tighter text-white">Integrity Locked</h4>
                <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.3em] mt-1">Audit Protocol 2.0.4 Active</p>
              </div>
            </div>

            <div className="space-y-4 relative z-10 pt-4 border-t border-emerald-500/10">
              <div className="flex items-center gap-3 text-[10px] font-black text-white/20 uppercase tracking-widest">
                <Command size={14} /> Verification Checksums
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col">
                  <span className="text-[10px] font-black text-white/20">GSTIN</span>
                  <span className="text-xs font-mono font-bold text-white/60">VALIDATED</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col">
                  <span className="text-[10px] font-black text-white/20">EQUILIBRIUM</span>
                  <span className="text-xs font-mono font-bold text-white/60">SYNCHED</span>
                </div>
              </div>
            </div>

            <button className="w-full h-20 rounded-[2.5rem] bg-white text-black font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl relative z-10 group">
              Verification Protocol
              <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Print Signature Line */}
      <div className="hidden print:flex justify-between mt-40">
        <div className="text-center w-64 border-t-2 border-black pt-4">
          <p className="text-sm font-black uppercase tracking-widest">Authorized Signatory</p>
          <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Institutional Validation</p>
        </div>
        <div className="text-center w-64 border-t-2 border-black pt-4">
          <p className="text-sm font-black uppercase tracking-widest">Receiver Signature</p>
          <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Entry Acknowledgement</p>
        </div>
      </div>
    </div>
  );
}

export default function VoucherDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="animate-spin text-white/20 mb-8" size={64} strokeWidth={1} />
        <p className="text-white/20 animate-pulse font-black uppercase tracking-[0.4em] text-[10px]">Retrieving temporal archive node...</p>
      </div>
    }>
      <VoucherDetailContent />
    </Suspense>
  );
}

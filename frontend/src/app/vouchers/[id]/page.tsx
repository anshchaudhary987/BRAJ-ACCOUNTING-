'use client';

import { useEffect } from 'react';
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
  Hash
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { useTenancy } from '@/hooks/useTenancy';
import { Voucher, ApiResponse, Ledger } from '@/types/api';

export default function VoucherDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const shouldPrint = searchParams.get('print') === 'true';
  const { selectedCompany } = useTenancy();

  const { data: voucher, isLoading, error } = useQuery({
    queryKey: ['voucher', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Voucher>>(`/voucher/${id}`);
      return res.data.data;
    }
  });

  const { data: ledgers = [] } = useQuery({
    queryKey: ['ledgers'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Ledger[]>>('/ledger');
      return res.data.data;
    }
  });

  const getLedgerName = (ledgerId: string) => {
    return ledgers.find(l => l.id === ledgerId)?.name || ledgerId;
  };

  useEffect(() => {
    if (voucher && shouldPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [voucher, shouldPrint]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-violet-500 mb-4" size={40} />
        <p className="text-muted-foreground animate-pulse font-medium">Retrieving digital voucher archives...</p>
      </div>
    );
  }

  if (error || !voucher) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] glass-premium p-12 rounded-[2.5rem]">
        <FileText className="text-red-500 mb-4" size={48} />
        <h2 className="text-2xl font-bold mb-2 text-foreground">Voucher Not Found</h2>
        <p className="text-muted-foreground mb-6 text-center max-w-md">The voucher record you're looking for might have been archived or deleted.</p>
        <button 
          onClick={() => router.back()}
          className="px-6 py-3 rounded-full bg-violet-600 text-white font-bold hover:bg-violet-700 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Action Bar */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-3 rounded-2xl glass-premium border-border text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="text-violet-500" size={24} />
              {voucher.vchType} Voucher
            </h1>
            <p className="text-sm text-muted-foreground">Vch No: {voucher.vchNo}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="print-button glass-premium px-6 py-3 rounded-2xl border-border text-foreground hover:border-violet-500/50 hover:bg-violet-500/10 transition-all flex items-center gap-2 font-bold text-sm"
          >
            <Printer size={18} /> Print Voucher
          </button>
          <button className="glass-premium px-6 py-3 rounded-2xl border-border text-muted-foreground hover:text-foreground transition-all flex items-center gap-2 font-bold text-sm">
            <Download size={18} /> PDF
          </button>
        </div>
      </div>

      {/* Main Voucher Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-premium rounded-[2.5rem] overflow-hidden border-border shadow-2xl p-10 print:p-0 print:border-none print:shadow-none bg-white/5"
      >
        {/* Print Header */}
        <div className="hidden print:block mb-10 border-b-2 border-black pb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-serif font-black uppercase tracking-tighter mb-2">{selectedCompany?.name || 'BRAJ ACCOUNTING'}</h1>
              <p className="text-sm uppercase font-bold tracking-widest text-gray-600 mb-1">{selectedCompany?.state}</p>
              {selectedCompany?.gstin && (
                <p className="text-xs font-mono">GSTIN: {selectedCompany.gstin}</p>
              )}
            </div>
            <div className="text-right">
              <div className="bg-black text-white px-4 py-2 font-black text-xl mb-2">
                {voucher.vchType.toUpperCase()}
              </div>
              <p className="font-bold">No: <span className="font-mono">{voucher.vchNo}</span></p>
              <p className="font-bold text-sm">Date: <span className="font-mono">{new Date(voucher.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></p>
            </div>
          </div>
        </div>

        {/* Desktop Header Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 print:hidden">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <Calendar size={12} /> Date
            </p>
            <p className="text-lg font-bold font-mono">{voucher.date}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <Hash size={12} /> Voucher Number
            </p>
            <p className="text-lg font-bold font-mono text-violet-400">{voucher.vchNo}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <Building2 size={12} /> Entity
            </p>
            <p className="text-lg font-bold">{selectedCompany?.name || 'Loading...'}</p>
          </div>
        </div>

        {/* Entries Table */}
        <div className="print:mt-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border/50 print:border-black print:bg-gray-100">
                <th className="py-4 px-2 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground print:text-black print:text-sm">Particulars</th>
                <th className="py-4 px-2 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground print:text-black print:text-sm">Debit (₹)</th>
                <th className="py-4 px-2 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground print:text-black print:text-sm">Credit (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 print:divide-black">
              {voucher.entries.map((entry, idx) => (
                <tr key={entry.id || idx} className="group hover:bg-white/5 transition-colors">
                  <td className="py-6 px-2">
                    <p className="text-base font-bold text-foreground print:text-black print:font-black">
                      {entry.isDebit ? '' : 'To '}
                      {getLedgerName(entry.ledgerId)}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1 uppercase print:hidden">Ledger Reference: {entry.ledgerId}</p>
                  </td>
                  <td className="py-6 px-2 text-right font-mono text-lg font-medium print:text-black">
                    {entry.isDebit ? formatCurrency(Number(entry.amount)) : ''}
                  </td>
                  <td className="py-6 px-2 text-right font-mono text-lg font-medium print:text-black">
                    {!entry.isDebit ? formatCurrency(Number(entry.amount)) : ''}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border print:border-black font-black">
                <td className="py-6 px-2 text-sm uppercase tracking-widest text-muted-foreground print:text-black print:text-base">Total</td>
                <td className="py-6 px-2 text-right font-mono text-xl text-violet-400 print:text-black">
                  {formatCurrency(voucher.totalAmount || voucher.totalDebit || 0)}
                </td>
                <td className="py-6 px-2 text-right font-mono text-xl text-violet-400 print:text-black">
                  {formatCurrency(voucher.totalAmount || voucher.totalCredit || 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Tax Summary Table (India Compliance) */}
        {voucher.entries.some(e => (Number(e.cgst_amount || 0) > 0 || Number(e.sgst_amount || 0) > 0 || Number(e.igst_amount || 0) > 0)) && (
          <div className="mt-8 pt-8 border-t border-border/30 print:border-black">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 print:text-black print:text-sm">Tax Summary (GST)</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/20 print:border-black">
                  <th className="text-left py-2 font-medium text-muted-foreground print:text-black">Tax Component</th>
                  <th className="text-right py-2 font-medium text-muted-foreground print:text-black">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10 print:divide-black">
                {(() => {
                  const cgst = voucher.entries.reduce((s, e) => s + Number(e.cgst_amount || 0), 0);
                  const sgst = voucher.entries.reduce((s, e) => s + Number(e.sgst_amount || 0), 0);
                  const igst = voucher.entries.reduce((s, e) => s + Number(e.igst_amount || 0), 0);
                  return (
                    <>
                      {cgst > 0 && (
                        <tr>
                          <td className="py-2 text-muted-foreground print:text-black">Central Tax (CGST)</td>
                          <td className="py-2 text-right font-mono print:text-black">{formatCurrency(cgst)}</td>
                        </tr>
                      )}
                      {sgst > 0 && (
                        <tr>
                          <td className="py-2 text-muted-foreground print:text-black">State Tax (SGST)</td>
                          <td className="py-2 text-right font-mono print:text-black">{formatCurrency(sgst)}</td>
                        </tr>
                      )}
                      {igst > 0 && (
                        <tr>
                          <td className="py-2 text-muted-foreground print:text-black">Integrated Tax (IGST)</td>
                          <td className="py-2 text-right font-mono print:text-black">{formatCurrency(igst)}</td>
                        </tr>
                      )}
                    </>
                  );
                })()}
              </tbody>
            </table>
          </div>
        )}

        {/* Narration */}
        {voucher.narration && (
          <div className="mt-12 p-6 rounded-3xl bg-white/5 border border-border/50 italic print:bg-transparent print:border-none print:p-0 print:mt-10">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 print:text-black print:not-italic">Narration:</p>
            <p className="text-foreground print:text-black print:font-serif">{voucher.narration}</p>
          </div>
        )}

        {/* Print Signature Line */}
        <div className="hidden print:flex justify-between mt-32">
          <div className="text-center w-48 border-t border-black pt-2">
            <p className="text-xs font-bold uppercase">Receiver's Signature</p>
          </div>
          <div className="text-center w-48 border-t border-black pt-2">
            <p className="text-xs font-bold uppercase">Authorised Signatory</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

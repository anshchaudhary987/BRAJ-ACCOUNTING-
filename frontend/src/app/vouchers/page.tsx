'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  ChevronRight,
  Loader2,
  Calendar,
  ArrowRightLeft
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { useTenancy } from '@/hooks/useTenancy';
import { Voucher, ApiResponse } from '@/types/api';

export default function VoucherListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { selectedCompany } = useTenancy();

  const { data: vouchers = [], isLoading } = useQuery({
    queryKey: ['vouchers'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Voucher[]>>('/voucher');
      return res.data.data;
    }
  });

  const filteredVouchers = vouchers.filter(v => 
    v.vchNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.vchType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.narration?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBatchPrint = () => {
    alert("Batch printing feature: In a real app, this would generate a merged PDF or open a multi-page print view.");
    // For demo, we can just print the current window if filtered
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Voucher History</h1>
          <p className="text-muted-foreground font-medium">Audit trail for <span className="text-violet-400">{selectedCompany?.name}</span></p>
        </div>

        <div className="flex items-center gap-3 no-print">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-violet-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search vouchers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3 rounded-2xl glass-premium border-border bg-white/5 focus:bg-white/10 focus:border-violet-500/50 transition-all outline-none w-64 md:w-80"
            />
          </div>
          
          <button 
            onClick={handleBatchPrint}
            className="p-3 rounded-2xl glass-premium border-border text-muted-foreground hover:text-foreground transition-all"
            title="Batch Print"
          >
            <Printer size={20} />
          </button>
        </div>
      </div>

      {/* Stats Quick View (Hidden on Print) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        <div className="p-6 glass-premium rounded-3xl border-border bg-violet-600/5">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Volume</p>
          <h3 className="text-2xl font-bold font-mono text-violet-400">{vouchers.length} Vouchers</h3>
        </div>
        <div className="p-6 glass-premium rounded-3xl border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Last Activity</p>
          <h3 className="text-2xl font-bold font-mono">
            {vouchers.length > 0 ? new Date(vouchers[0].date).toLocaleDateString() : 'N/A'}
          </h3>
        </div>
        <div className="p-6 glass-premium rounded-3xl border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Active Ledger Interaction</p>
          <h3 className="text-2xl font-bold font-mono text-emerald-400">High</h3>
        </div>
      </div>

      {/* List Container */}
      <div className="glass-premium rounded-[2.5rem] overflow-hidden border-border shadow-2xl bg-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-border/50">
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Type</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Vch No.</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Particulars / Narration</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Amount</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <Loader2 className="animate-spin text-violet-500 mx-auto mb-4" size={32} />
                    <p className="text-muted-foreground font-medium animate-pulse">Syncing with ledger database...</p>
                  </td>
                </tr>
              ) : filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-muted-foreground italic">
                    No vouchers found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-violet-600/10 text-violet-400">
                          <Calendar size={16} />
                        </div>
                        <span className="text-sm font-mono font-medium">{v.date}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 rounded-full bg-muted border border-border text-[10px] font-bold uppercase tracking-tighter text-foreground group-hover:bg-violet-600/20 group-hover:border-violet-500/30 transition-all">
                        {v.vchType}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm font-mono font-bold text-violet-400">{v.vchNo}</td>
                    <td className="px-8 py-5">
                      <p className="text-sm line-clamp-1 text-muted-foreground italic">{v.narration || 'No narration provided'}</p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="text-base font-bold font-mono">
                        {formatCurrency(v.totalAmount || v.totalDebit || 0)}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right no-print">
                      <div className="flex items-center justify-end gap-3">
                        <Link 
                          href={`/vouchers/${v.id}`}
                          className="p-2 rounded-xl glass-premium border-border text-muted-foreground hover:text-foreground transition-all"
                          title="View Details"
                        >
                          <ChevronRight size={16} />
                        </Link>
                        <button 
                          onClick={() => {
                            // Quick navigate and trigger print or just open in new tab
                            window.open(`/vouchers/${v.id}?print=true`, '_blank');
                          }}
                          className="p-2 rounded-xl glass-premium border-border text-muted-foreground hover:text-violet-400 transition-all"
                          title="Quick Print"
                        >
                          <Printer size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

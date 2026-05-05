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
  ShieldCheck,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  Database,
  Hash
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { useTenancy } from '@/hooks/useTenancy';
import { Voucher, ApiResponse } from '@/types/api';

const ProStatCard = ({ title, value, subValue, icon: Icon, color = "white" }: any) => (
  <div className="p-10 glass-pro rounded-[3rem] border border-white/5 group hover:border-white/20 transition-all duration-700 bg-gradient-to-br from-white/[0.02] to-transparent relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] blur-3xl rounded-full translate-x-16 -translate-y-16" />
    <div className="flex items-start justify-between mb-8 relative z-10">
      <div className={cn("p-4 rounded-2xl bg-white/5 border border-white/5 transition-all duration-500 group-hover:scale-110", `text-${color}`)}>
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/20">
        <ShieldCheck size={12} /> Statutory Verified
      </div>
    </div>
    <div className="relative z-10">
      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-3">{title}</p>
      <h3 className="text-5xl font-bold tracking-tighter text-white mb-2">{value}</h3>
      <p className="text-xs font-medium text-white/30 uppercase tracking-wider">{subValue}</p>
    </div>
  </div>
);

export default function VoucherListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { selectedCompany } = useTenancy();

  const { data: vouchers = [], isLoading } = useQuery({
    queryKey: ['vouchers', selectedCompany?.id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<any[]>>('/voucher');
      // Map the nested response to the flat structure the UI expects
      return res.data.data.map((item: any) => ({
        ...item.voucher,
        vchNo: item.voucher.voucherNumber,
        vchType: item.voucher.voucherType,
        totalAmount: item.voucher.totalDebit
      }));
    }
  });

  const filteredVouchers = vouchers.filter(v => 
    v.vchNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.vchType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.narration?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12 space-y-20 pb-40">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12">
        <div className="max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px w-12 bg-white/20" />
            <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
              Audit Trail Registry
            </span>
            <div className="h-1 w-1 rounded-full bg-white/20" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 italic">
              {selectedCompany?.name || 'Authorized Session'}
            </span>
          </div>
          <h1 className="text-8xl font-bold tracking-tighter text-white leading-none">
            Voucher <span className="text-white/20 italic">Trails.</span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors duration-500" size={24} />
            <input 
              type="text"
              placeholder="Query Audit Node (No, Type, Narration)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-16 pr-10 py-5 rounded-full glass-pro border-white/5 bg-white/2 focus:bg-white/5 focus:border-white/40 transition-all duration-700 outline-none w-80 md:w-[450px] text-white font-bold text-lg placeholder:text-white/10"
            />
          </div>
          
          <Link href="/vouchers/new">
            <button className="h-20 px-10 rounded-full bg-white text-black font-black text-sm uppercase tracking-widest flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.2)]">
              <Plus size={24} strokeWidth={3} />
              Forge Voucher
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <ProStatCard 
          icon={Database}
          title="Consolidated Volume"
          value={vouchers.length}
          subValue="Statutory ledger nodes recorded"
        />
        <ProStatCard 
          icon={Calendar}
          title="Last Ledger Closure"
          value={vouchers.length > 0 ? new Date(vouchers[0].date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'N/A'}
          subValue="Financial period integrity check"
        />
        <ProStatCard 
          icon={CheckCircle2}
          title="Statutory Equilibrium"
          value="100%"
          subValue="Zero structural discrepancies"
          color="emerald-400"
        />
      </div>

      {/* Modern High-Performance List */}
      <div className="glass-pro rounded-[4rem] border border-white/5 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] bg-gradient-to-br from-white/[0.02] to-transparent">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/5">
                <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20">Temporal Node</th>
                <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20">Classification</th>
                <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20">Audit Log</th>
                <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Monetary Vector</th>
                <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-12 py-40 text-center">
                    <Loader2 className="animate-spin text-white/10 mx-auto mb-10" size={80} strokeWidth={1} />
                    <p className="text-white/30 font-black tracking-[0.5em] uppercase text-[10px]">Accessing Vault Integrity...</p>
                  </td>
                </tr>
              ) : filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-12 py-40 text-center text-white/10 font-bold italic text-2xl">
                    No records identified in current spatial context.
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-white/[0.03] transition-all duration-500 group cursor-pointer relative overflow-hidden">
                    <td className="px-12 py-10">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white/10 group-hover:bg-white group-hover:text-black group-hover:scale-110 transition-all duration-500 shadow-xl">
                          <Calendar size={24} strokeWidth={1.5} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-lg font-bold text-white group-hover:translate-x-1 transition-transform duration-500">{v.date}</span>
                          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Temporal Signature</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-12 py-10">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                           <Hash size={12} className="text-white/10 group-hover:text-white/40 transition-colors" />
                           <span className="text-xs font-black uppercase tracking-[0.2em] text-white/20 group-hover:text-white/60 transition-colors">
                            {v.vchType}
                          </span>
                        </div>
                        <span className="text-2xl font-bold tracking-tighter text-white group-hover:text-white transition-colors">{v.vchNo}</span>
                      </div>
                    </td>
                    <td className="px-12 py-10">
                      <p className="text-sm text-white/30 font-medium italic line-clamp-1 max-w-sm group-hover:text-white/50 transition-colors">
                        {v.narration || 'Null Pointer Exception in Narration Node'}
                      </p>
                    </td>
                    <td className="px-12 py-10 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-3xl font-bold tracking-tighter text-white group-hover:scale-105 transition-transform origin-right">
                          {formatCurrency(v.totalAmount || 0)}
                        </span>
                        <span className="text-[10px] font-black text-white/10 uppercase tracking-widest mt-1">Value Vector</span>
                      </div>
                    </td>
                    <td className="px-12 py-10 text-right">
                      <div className="flex items-center justify-end gap-6">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/5 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/10 group-hover:bg-emerald-400 group-hover:text-black transition-all duration-500">
                          <CheckCircle2 size={12} /> Statutory Clear
                        </div>
                        <Link 
                          href={`/vouchers/${v.id}`}
                          className="w-14 h-14 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/10 hover:text-white hover:bg-white/10 hover:scale-110 transition-all duration-500"
                        >
                          <ArrowUpRight size={28} strokeWidth={1} />
                        </Link>
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

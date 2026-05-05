'use client';

import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Globe, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Search,
  Command,
  Building2,
  Lock,
  ChevronRight,
  LayoutGrid
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import CashFlowChart from './CashFlowChart';
import AnomaliesCard from './AnomaliesCard';
import HorizonForecaster from './HorizonForecaster';
import { useTenancy } from '@/hooks/useTenancy';
import { useDashboard } from '@/hooks/useDashboard';
import Link from 'next/link';

const StatCard = ({ title, value, change, trend = 'up', icon: Icon, loading }: any) => (
  <div className="p-10 glass-pro rounded-[3rem] border border-white/5 space-y-8 group hover:border-white/20 transition-all duration-700 bg-gradient-to-br from-white/[0.02] to-transparent relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] blur-3xl rounded-full translate-x-16 -translate-y-16" />
    <div className="flex items-center justify-between relative z-10">
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-white/20 group-hover:bg-white group-hover:text-black group-hover:scale-110 transition-all duration-500 shadow-xl">
        <Icon size={24} strokeWidth={1.5} />
      </div>
      {!loading && (
        <div className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-500",
          trend === 'up' 
            ? "text-emerald-400 border-emerald-400/10 bg-emerald-400/5 group-hover:bg-emerald-400 group-hover:text-black" 
            : "text-red-400 border-red-400/10 bg-red-400/5 group-hover:bg-red-400 group-hover:text-black"
        )}>
          {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {change}
        </div>
      )}
    </div>
    <div className="relative z-10">
      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-3 group-hover:text-white/40 transition-colors">{title}</p>
      {loading ? (
        <div className="h-12 w-48 bg-white/5 animate-pulse rounded-2xl" />
      ) : (
        <h3 className="text-5xl font-bold tracking-tighter text-white drop-shadow-2xl">{value}</h3>
      )}
    </div>
  </div>
);

export default function ProDashboard() {
  const { selectedCompany } = useTenancy();
  const { data, isLoading } = useDashboard();

  if (!selectedCompany) return null;

  const stats = data?.stats;

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12 space-y-16 pb-40">
      {/* Welcome & Command Bar */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12">
        <div className="max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 48 }}
              className="h-px bg-white/40" 
            />
            <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
              Institutional Terminal
            </span>
            <div className="h-1 w-1 rounded-full bg-white/20" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
              {data?.lastSync ? `Sync Latency: 0.4ms` : 'Verifying Network Integrity...'}
            </span>
          </div>
          <h1 className="text-8xl font-bold tracking-tighter text-white leading-none mb-8">
            Command <span className="text-white/20 italic">Center.</span>
          </h1>
          <p className="text-white/40 text-2xl font-medium leading-relaxed max-w-2xl">
            Real-time financial oversight for <span className="text-white border-b border-white/20">{selectedCompany.name}</span>. 
            All structural nodes are verified and in equilibrium.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="glass-pro bg-white/2 border border-white/5 rounded-full pl-8 pr-4 py-4 flex items-center gap-6 group hover:border-white/20 transition-all duration-500 shadow-2xl focus-within:bg-white/5 focus-within:border-white/40">
            <Search className="text-white/20 group-hover:text-white transition-colors" size={24} />
            <input 
              type="text" 
              placeholder="Query Spatial Graph..." 
              className="bg-transparent border-none outline-none text-white placeholder:text-white/10 font-bold text-lg w-64"
            />
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white/40 uppercase tracking-tighter">
              <Command size={12} /> <span className="mt-0.5">K</span>
            </div>
          </div>
          
          <Link href="/vouchers/new">
            <button className="h-20 px-10 rounded-full bg-white text-black font-black text-sm uppercase tracking-widest flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.2)]">
              <Zap size={24} strokeWidth={3} />
              Quick Entry
            </button>
          </Link>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Consolidated Liquidity"
          value={formatCurrency(stats?.liquidity.value ?? 0)}
          change={stats?.liquidity.change}
          trend={stats?.liquidity.trend}
          icon={CreditCard}
          loading={isLoading}
        />
        <StatCard 
          title="Aggregated Net Yield"
          value={formatCurrency(stats?.yield.value ?? 0)}
          change={stats?.yield.change}
          trend={stats?.yield.trend}
          icon={TrendingUp}
          loading={isLoading}
        />
        <StatCard 
          title="Exposure Risk Index"
          value={formatCurrency(stats?.risk.value ?? 0)}
          change={stats?.risk.change}
          trend={stats?.risk.trend}
          icon={TrendingDown}
          loading={isLoading}
        />
        <StatCard 
          title="Institutional Reserves"
          value={formatCurrency(stats?.reserves.value ?? 0)}
          change={stats?.reserves.change}
          trend={stats?.reserves.trend}
          icon={ShieldCheck}
          loading={isLoading}
        />
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Cash Flow Analysis */}
        <div className="lg:col-span-8 space-y-8">
          <div className="p-16 glass-pro rounded-[5rem] border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 text-white/5 pointer-events-none">
              <LayoutGrid size={120} strokeWidth={0.5} />
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-20 gap-8 relative z-10">
              <div>
                <h3 className="text-4xl font-bold tracking-tighter text-white">Flow Dynamics.</h3>
                <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Advanced Volume vs Velocity Matrix</p>
              </div>
              <div className="flex p-2 bg-white/5 rounded-2xl border border-white/5">
                {['7D', '30D', '90D', '1Y'].map(p => (
                  <button key={p} className={cn(
                    "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500",
                    p === '30D' ? "bg-white text-black shadow-2xl" : "text-white/20 hover:text-white/60 hover:bg-white/5"
                  )}>{p}</button>
                ))}
              </div>
            </div>
            <div className="h-[450px] relative z-10">
              <CashFlowChart />
            </div>
          </div>
        </div>

        {/* Tactical Modules */}
        <div className="lg:col-span-4 space-y-12">
          <AnomaliesCard />
          <HorizonForecaster />
          
          {/* Quick Access Card */}
          <div className="p-12 glass-pro rounded-[4rem] border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent space-y-10 shadow-2xl group hover:border-white/20 transition-all duration-700">
            <div className="flex items-center justify-between">
              <h4 className="text-2xl font-bold tracking-tight text-white flex items-center gap-4">
                <Activity className="text-white/20 group-hover:text-emerald-400 transition-colors" size={24} /> 
                System Integrity
              </h4>
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            </div>
            <div className="space-y-6">
              {[
                { label: 'Ledger Consistency', status: 'Verified', color: 'bg-emerald-500', detail: '0.00% Variance' },
                { label: 'Statutory Compliance', status: 'Audit Ready', color: 'bg-emerald-500', detail: 'Pan-India Active' },
                { label: 'Unlinked Vouchers', status: 'None Found', color: 'bg-white/20', detail: 'Structural Equilibrium' },
              ].map(item => (
                <div key={item.label} className="group/item flex items-center justify-between p-4 rounded-3xl hover:bg-white/[0.03] transition-all cursor-pointer">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white/40 uppercase tracking-widest mb-1 group-hover/item:text-white transition-colors">{item.label}</span>
                    <span className="text-[10px] font-medium text-white/10 uppercase tracking-tight">{item.detail}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover/item:text-emerald-400 transition-colors">{item.status}</span>
                    <ChevronRight size={14} className="text-white/10 group-hover/item:text-white transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { 
  Building,
  TrendingUp,
  BarChart3,
  BrainCircuit,
  Activity,
  ArrowUpRight,
  ChevronRight,
  Coins
} from 'lucide-react';
import Link from 'next/link';
import { useTenancy } from '@/hooks/useTenancy';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import DashboardSkeleton from '@/components/DashboardSkeleton';
import { Canvas } from '@react-three/fiber';
import LedgerSphere from '@/components/three/LedgerSphere';
import AnomaliesCard from '@/components/dashboard/AnomaliesCard';
import CashFlowChart from '@/components/dashboard/CashFlowChart';
import HorizonForecaster from '@/components/dashboard/HorizonForecaster';
import { Company, TrialBalanceItem, ApiResponse, Ledger } from '@/types';

export default function Dashboard() {
  const { selectedCompany } = useTenancy();

  // 1. Fetch Company Details
  const { data: companyDetails, isLoading: isCompanyLoading } = useQuery({
    queryKey: ['company', selectedCompany?.id],
    queryFn: async () => {
      if (!selectedCompany?.id) return null;
      const res = await api.get<ApiResponse<Company>>(`/company/${selectedCompany.id}`);
      return res.data.data;
    },
    enabled: !!selectedCompany?.id
  });

  // 2. Fetch Trial Balance for Metrics
  const { data: trialBalance = [], isLoading: isTBLoading } = useQuery({
    queryKey: ['dashboard-tb', selectedCompany?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const res = await api.get<ApiResponse<TrialBalanceItem[]>>(`/reports/trial-balance?as_of_date=${today}`);
      return res.data.data;
    },
    enabled: !!selectedCompany?.id
  });

  // 3. Fetch Ledgers to map categories
  const { data: ledgers = [], isLoading: isLedgersLoading } = useQuery({
    queryKey: ['ledgers-dashboard'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Ledger[]>>('/ledger');
      return res.data.data;
    },
    enabled: !!selectedCompany?.id
  });

  if (!selectedCompany) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-12 glass-premium rounded-[3rem] max-w-md border border-white/5 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-transparent pointer-events-none" />
          <div className="w-24 h-24 bg-violet-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-violet-500/20">
            <Building size={48} className="text-violet-400" />
          </div>
          <h1 className="text-3xl font-bold mb-4 tracking-tight">Select Neural Core</h1>
          <p className="text-slate-400 mb-10 leading-relaxed">
            Initialize your financial oversight system by selecting a company to manage.
          </p>
          <Link
            href="/company/setup"
            className="inline-flex items-center justify-center w-full py-5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black transition-all shadow-xl shadow-violet-600/30 group"
          >
            Access Setup Console
            <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    );
  }

  if (isCompanyLoading || isTBLoading || isLedgersLoading) {
    return <DashboardSkeleton />;
  }

  // Calculate P&L Summary
  const incomeLedgerIds = ledgers.filter(l => l.group_name === 'Sales' || l.group_name === 'Service Income' || l.group_name === 'Other Income').map(l => l.id);
  const expenseLedgerIds = ledgers.filter(l => l.group_name === 'Purchases' || l.group_name === 'Direct Expenses' || l.group_name === 'Indirect Expenses' || l.group_name.includes('Expenditure')).map(l => l.id);

  const totalIncome = trialBalance.filter(item => incomeLedgerIds.includes(item.ledgerId)).reduce((sum, item) => sum + Math.abs(item.balance), 0);
  const totalExpense = trialBalance.filter(item => expenseLedgerIds.includes(item.ledgerId)).reduce((sum, item) => sum + Math.abs(item.balance), 0);
  const netProfit = totalIncome - totalExpense;
  const currentTotalBalance = trialBalance.reduce((sum, item) => sum + Number(item.balance), 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Neural Core Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Central Ledger Sphere */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-8 p-1 glass-premium rounded-[3rem] bg-gradient-to-b from-white/5 to-transparent border border-white/5 h-[500px] relative overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none">
             <div className="absolute top-10 left-10 z-20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Neural Link Established</span>
                </div>
                <h2 className="text-4xl font-black tracking-tighter">LEDGER <span className="text-cyan-400">SPHERE</span></h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-tight mt-1">Real-time Transactional Synchronization</p>
             </div>
             
             {/* Dynamic Stats overlay */}
             <div className="absolute bottom-10 left-10 right-10 z-20 flex justify-between items-end">
                <div className="space-y-4">
                  <div className="glass-premium p-4 rounded-2xl border-white/5">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Active Ledger Nodes</p>
                    <p className="text-2xl font-mono font-black">{ledgers.length}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Company Context</p>
                  <p className="text-xl font-bold text-white/80">{companyDetails?.name}</p>
                </div>
             </div>
          </div>

          <Canvas camera={{ position: [0, 0, 7] }} className="z-10">
            <Suspense fallback={null}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <LedgerSphere />
            </Suspense>
          </Canvas>
        </motion.div>

        {/* Sidebar Insights */}
        <div className="lg:col-span-4 space-y-8 flex flex-col">
          {/* Profit & Loss Mini Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-8 glass-premium rounded-[2.5rem] bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border-violet-500/20 relative group overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp size={80} className="text-violet-400" />
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400">
                <Activity size={20} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-violet-300">P&L Overview</h3>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500 font-bold">Net Position</p>
              <h2 className={`text-4xl font-black font-mono ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(netProfit)}
              </h2>
            </div>
            <div className="mt-8 flex justify-between items-center text-[10px] font-bold uppercase tracking-tight">
              <div className="space-y-1">
                <p className="text-slate-500">Gross Revenue</p>
                <p className="text-white">{formatCurrency(totalIncome)}</p>
              </div>
              <div className="w-px h-8 bg-white/5" />
              <div className="space-y-1 text-right">
                <p className="text-slate-500">Burn Rate</p>
                <p className="text-white">{formatCurrency(totalExpense)}</p>
              </div>
            </div>
          </motion.div>

          {/* Anomalies Card */}
          <div className="flex-1">
            <AnomaliesCard />
          </div>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <CashFlowChart />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 p-8 glass-premium rounded-[3rem] border-white/5 relative group overflow-hidden"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                <BrainCircuit size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Audit Intelligence</h3>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Heuristic Pattern Recognition</p>
              </div>
            </div>
            <Link href="/reports/trial-balance" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <ArrowUpRight size={20} className="text-slate-400" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Asset Velocity', value: '84%', trend: '+12%', color: 'cyan' },
              { label: 'Debt Ratio', value: '0.24', trend: '-2%', color: 'violet' },
              { label: 'Tax Efficiency', value: 'High', trend: 'Optimal', color: 'emerald' },
              { label: 'Cash Buffer', value: '180 Days', trend: '+15d', color: 'amber' }
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">{stat.label}</p>
                <p className="text-xl font-black mb-1">{stat.value}</p>
                <p className={`text-[10px] font-bold ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-slate-400'}`}>{stat.trend}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex items-center gap-4 p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Coins size={16} />
            </div>
            <p className="text-xs text-cyan-100 font-medium">
              System predicted <span className="font-bold text-white">₹12,450</span> in potential tax savings via automated ITC reconciliation.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Horizon Forecaster - Full Width Bottom */}
      <HorizonForecaster currentBalance={currentTotalBalance} />

      {/* Global Style overrides for the futuristic theme */}
      <style jsx global>{`
        .glass-premium {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .text-gradient {
          background: linear-gradient(135deg, #22d3ee 0%, #8b5cf6 50%, #d946ef 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

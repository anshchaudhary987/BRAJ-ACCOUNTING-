'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  BookOpen, 
  X,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTenancy } from '@/hooks/useTenancy';
import { Ledger, LedgerGroup, ApiResponse } from '@/types';

export default function LedgersPage() {
  const { selectedCompany } = useTenancy();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: ledgers = [], isLoading } = useQuery({
    queryKey: ['ledgers'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Ledger[]>>('/ledger');
      return res.data.data;
    }
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<LedgerGroup[]>>('/company/groups');
      return res.data.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newLedger: any) => {
      const res = await api.post<ApiResponse<Ledger>>('/ledger', newLedger);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledgers'] });
      setIsPanelOpen(false);
      toast.success('Ledger created successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create ledger');
    }
  });

  const filteredLedgers = ledgers.filter((l: Ledger) => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    l.group_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="text-violet-500" size={24} />
            Ledger Masters
          </h1>
          <p className="text-sm text-slate-500">Manage all your account heads and opening balances.</p>
        </div>
        <button
          onClick={() => setIsPanelOpen(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-600/20"
        >
          <Plus size={20} />
          Create Ledger
        </button>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search ledgers by name or group..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-premium bg-white/2 border-white/5 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-violet-500 transition-all"
          />
        </div>
        <button className="glass-premium px-4 py-3 rounded-2xl border-white/5 text-slate-400 hover:text-white transition-colors">
          <Filter size={20} />
        </button>
      </div>

      {/* Table */}
      <div className="glass-premium rounded-3xl overflow-hidden border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Ledger Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Group</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">GSTIN</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Balance</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <Loader2 className="animate-spin text-violet-500 mx-auto" size={32} />
                  </td>
                </tr>
              ) : filteredLedgers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500 italic">No ledgers found</td>
                </tr>
              ) : (
                filteredLedgers.map((ledger) => (
                  <tr key={ledger.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-bold">{ledger.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-xs font-bold">
                        {ledger.group_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-mono">{ledger.gstin || '—'}</td>
                    <td className="px-6 py-4 text-right font-mono font-bold">
                      <span className={ledger.openingBalanceType === 'Dr' ? 'text-red-400' : 'text-emerald-400'}>
                        {formatCurrency(ledger.openingBalance)} {ledger.openingBalanceType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                        <MoreVertical size={16} className="text-slate-500" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide Over Panel */}
      <AnimatePresence>
        {isPanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPanelOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-xl glass-premium bg-slate-900 border-l border-white/5 z-[70] shadow-2xl p-8"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-bold">Create New Ledger</h2>
                <button 
                  onClick={() => setIsPanelOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <LedgerForm 
                groups={groups} 
                onSubmit={(data: any) => createMutation.mutate(data)} 
                loading={createMutation.isPending}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function LedgerForm({ groups, onSubmit, loading }: { groups: LedgerGroup[], onSubmit: (data: any) => void, loading: boolean }) {
  const [formData, setFormData] = useState({
    name: '',
    groupId: '',
    openingBalance: 0,
    openingBalanceType: 'Dr',
    gstin: '',
    gstType: 'Regular'
  });

  return (
    <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Account Name</label>
          <input
            required
            autoFocus
            type="text"
            className="w-full glass-premium bg-white/2 border-white/5 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-violet-500 transition-all font-bold"
            placeholder="e.g. State Bank of India"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Account Group</label>
          <select
            required
            className="w-full glass-premium bg-white/2 border-white/5 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-violet-500 transition-all appearance-none"
            value={formData.groupId}
            onChange={(e) => setFormData({...formData, groupId: e.target.value})}
          >
            <option value="" disabled>Select a group...</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Opening Balance</label>
            <input
              type="number"
              className="w-full glass-premium bg-white/2 border-white/5 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-violet-500 transition-all font-mono"
              value={formData.openingBalance}
              onChange={(e) => setFormData({...formData, openingBalance: Number(e.target.value)})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Type</label>
            <div className="grid grid-cols-2 p-1 glass-premium bg-white/2 rounded-2xl border-white/5">
              <button
                type="button"
                onClick={() => setFormData({...formData, openingBalanceType: 'Dr'})}
                className={cn(
                  "py-3 rounded-xl font-bold text-sm transition-all",
                  formData.openingBalanceType === 'Dr' ? "bg-violet-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                )}
              >
                Debit (Dr)
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, openingBalanceType: 'Cr'})}
                className={cn(
                  "py-3 rounded-xl font-bold text-sm transition-all",
                  formData.openingBalanceType === 'Cr' ? "bg-violet-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                )}
              >
                Credit (Cr)
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t border-white/5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">GSTIN (Optional)</label>
          <input
            type="text"
            className="w-full glass-premium bg-white/2 border-white/5 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-violet-500 transition-all font-mono uppercase"
            placeholder="27AAACR1234A1Z1"
            value={formData.gstin}
            onChange={(e) => setFormData({...formData, gstin: e.target.value})}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-violet-600/20 disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" size={24} /> : (
          <>
            <CheckCircle2 size={24} />
            Save Ledger Master
          </>
        )}
      </button>
    </form>
  );
}

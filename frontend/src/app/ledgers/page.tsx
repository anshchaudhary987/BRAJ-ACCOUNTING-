'use client';

import { useState, useMemo } from 'react';
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
  Loader2,
  ShieldCheck,
  Building2,
  ArrowRight,
  Info,
  Trash2,
  AlertCircle,
  Hash,
  Globe,
  Database,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTenancy } from '@/hooks/useTenancy';
import { Ledger, LedgerGroup, ApiResponse } from '@/types';
import StateSelect from '@/components/ui/StateSelect';
import HsnSelect from '@/components/ui/HsnSelect';
import { ledgerSchema } from '@/lib/validations';

const ProHeader = ({ title, subtitle, onAction }: any) => (
  <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 mb-20">
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-px w-12 bg-white/20" />
        <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
          Chart of Accounts Registry
        </span>
        <div className="h-1 w-1 rounded-full bg-white/20" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 italic">
          Architectural Core
        </span>
      </div>
      <h1 className="text-8xl font-bold tracking-tighter text-white leading-none">
        Ledger <span className="text-white/20 italic">Vault.</span>
      </h1>
      <p className="text-white/40 text-2xl mt-6 font-medium leading-relaxed max-w-2xl">
        Manage the foundational nodes of your financial spatial graph. Every account is a statutory coordinate.
      </p>
    </div>
    <button
      onClick={onAction}
      className="h-24 px-12 rounded-full bg-white text-black font-black text-xl hover:scale-105 transition-all active:scale-95 flex items-center gap-5 shadow-[0_30px_60px_rgba(255,255,255,0.2)]"
    >
      <Plus size={32} strokeWidth={3} />
      Initialize Node
    </button>
  </div>
);

export default function LedgersPage() {
  const { selectedCompany } = useTenancy();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: ledgers = [], isLoading } = useQuery({
    queryKey: ['ledgers', selectedCompany?.id],
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
      toast.success('Account Node Synchronized', {
        description: 'The ledger has been successfully etched into the statutory registry.'
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to sync ledger');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<ApiResponse<any>>(`/ledger/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledgers'] });
      toast.success('Node Decommissioned');
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || 'Deletion failed';
      if (message.toLowerCase().includes('foreign key') || message.toLowerCase().includes('vouchers')) {
        toast.error('Integrity Constraint Violation', {
          description: 'This node has existing temporal links (vouchers). Deactivation recommended over deletion.',
          duration: 6000,
          icon: <AlertCircle size={20} className="text-red-500" />
        });
      } else {
        toast.error(message);
      }
    }
  });

  const filteredLedgers = ledgers.filter((l: Ledger) => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    (l.groupName && l.groupName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12 pb-40">
      <ProHeader 
        title="Ledger Vault."
        subtitle="Manage the architectural foundations of your financial ecosystem."
        onAction={() => setIsPanelOpen(true)}
      />

      <div className="flex flex-col sm:flex-row gap-6 mb-16">
        <div className="relative flex-1 group">
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors duration-500" size={24} />
          <input
            type="text"
            placeholder="Query Node Identity or Classification..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-pro bg-white/2 border-white/5 rounded-full pl-20 pr-10 py-6 outline-none focus:bg-white/5 focus:border-white/40 transition-all duration-700 text-white font-bold text-xl placeholder:text-white/10"
          />
        </div>
        <button className="h-20 w-20 flex items-center justify-center rounded-full glass-pro border-white/5 text-white/20 hover:text-white hover:bg-white/10 transition-all">
          <Filter size={28} />
        </button>
      </div>

      <div className="glass-pro rounded-[4rem] border border-white/5 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] bg-gradient-to-br from-white/[0.02] to-transparent">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/5">
                <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20">Node Identity</th>
                <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20">Classification</th>
                <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20">Statutory State</th>
                <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Value Vector</th>
                <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 text-center">Operations</th>
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
              ) : filteredLedgers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-12 py-40 text-center text-white/10 font-bold italic text-2xl">No node configurations identified.</td>
                </tr>
              ) : (
                filteredLedgers.map((ledger) => (
                  <tr key={ledger.id} className="hover:bg-white/[0.03] transition-all duration-500 group relative">
                    <td className="px-12 py-10">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/5 flex items-center justify-center text-white/10 group-hover:bg-white group-hover:text-black group-hover:scale-110 transition-all duration-500 shadow-2xl">
                          <Building2 size={28} strokeWidth={1.5} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-2xl font-bold tracking-tight text-white group-hover:translate-x-1 transition-transform duration-500">{ledger.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Hash size={10} className="text-white/10" />
                            <span className="text-[10px] font-black text-white/20 tracking-[0.2em] uppercase">{ledger.gstin || 'Unregistered Registry'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-12 py-10">
                      <span className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 group-hover:text-white group-hover:bg-white/10 transition-all duration-500">
                        {ledger.groupName}
                      </span>
                    </td>
                    <td className="px-12 py-10">
                      <div className="flex items-center gap-3">
                        <Globe size={14} className="text-white/10 group-hover:text-white/40 transition-colors" />
                        <span className="text-sm font-bold text-white/40 uppercase tracking-widest">{ledger.stateName || 'Generic Node'}</span>
                      </div>
                    </td>
                    <td className="px-12 py-10 text-right">
                      <div className="flex flex-col items-end">
                        <span className={cn(
                          "text-3xl font-bold tracking-tighter group-hover:scale-105 transition-transform origin-right duration-500",
                          ledger.openingBalanceType === 'Dr' ? 'text-white' : 'text-emerald-400'
                        )}>
                          {formatCurrency(ledger.openingBalance)}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10 mt-1">
                          {ledger.openingBalanceType === 'Dr' ? 'Debit Momentum' : 'Credit Momentum'}
                        </span>
                      </div>
                    </td>
                    <td className="px-12 py-10">
                      <div className="flex items-center justify-center gap-4">
                        <button 
                          onClick={() => deleteMutation.mutate(ledger.id)}
                          className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 text-white/10 hover:text-red-400 hover:bg-red-400/10 transition-all duration-500 flex items-center justify-center shadow-xl"
                        >
                          <Trash2 size={22} strokeWidth={1.5} />
                        </button>
                        <button className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 text-white/10 hover:text-white hover:bg-white/10 transition-all duration-500 flex items-center justify-center shadow-xl">
                          <MoreVertical size={22} strokeWidth={1.5} />
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

      <AnimatePresence>
        {isPanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPanelOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-3xl z-[60]"
            />
            <motion.div
              initial={{ x: '100%', filter: 'blur(10px)' }}
              animate={{ x: 0, filter: 'blur(0px)' }}
              exit={{ x: '100%', filter: 'blur(10px)' }}
              transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-4xl bg-black border-l border-white/10 z-[70] shadow-[-50px_0_100px_rgba(0,0,0,1)] p-16 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-20">
                <div className="max-w-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <Database size={16} className="text-white/20" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Node Initialization</span>
                  </div>
                  <h2 className="text-6xl font-bold tracking-tighter text-white">Initialize <br/> <span className="text-white/20 italic">Registry Node.</span></h2>
                  <p className="text-white/40 text-xl font-medium mt-6 leading-relaxed">Map a new statutory coordinate into the financial spatial graph.</p>
                </div>
                <button 
                  onClick={() => setIsPanelOpen(false)}
                  className="w-20 h-20 bg-white/5 hover:bg-white/10 rounded-full transition-all flex items-center justify-center text-white/40 hover:text-white hover:rotate-90 duration-500 shadow-2xl"
                >
                  <X size={40} strokeWidth={1} />
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
    openingBalanceType: 'Dr' as 'Dr' | 'Cr',
    gstin: '',
    stateId: '',
    hsnCodeId: '',
    tdsApplicable: false,
    tdsNatureCode: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const validation = ledgerSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      toast.error('Statutory Validation Failed', {
        description: 'Check highlighted registry coordinates.'
      });
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form className="space-y-16 pb-32" onSubmit={handleFormSubmit}>
      <div className="space-y-12">
        <div className="space-y-4">
          <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
            <Hash size={12} /> Account Title
          </label>
          <input
            autoFocus
            type="text"
            className={cn(
              "w-full bg-white/5 border rounded-[2rem] px-10 py-8 outline-none focus:bg-white/10 focus:border-white/40 transition-all font-bold text-3xl text-white placeholder:text-white/5 shadow-inner",
              errors.name ? "border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.1)]" : "border-white/5"
            )}
            placeholder="e.g. Strategic Growth Reserve"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          {errors.name && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider pl-6">{errors.name}</p>}
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
            <LayoutGrid size={12} /> Classification Group
          </label>
          <div className="relative">
            <select
              className={cn(
                "w-full bg-white/5 border rounded-[2rem] px-10 py-8 outline-none focus:bg-white/10 focus:border-white/40 transition-all appearance-none text-white font-bold text-xl shadow-inner",
                errors.groupId ? "border-red-500/40" : "border-white/5"
              )}
              value={formData.groupId}
              onChange={(e) => setFormData({...formData, groupId: e.target.value})}
            >
              <option value="" disabled className="bg-black text-white">Select structural coordinate...</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id} className="bg-black text-white">{g.name}</option>
              ))}
            </select>
            <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
              <ChevronRight size={32} strokeWidth={1} />
            </div>
          </div>
          {errors.groupId && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider pl-6">{errors.groupId}</p>}
        </div>

        <div className="grid grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Opening Balance</label>
            <input
              type="number"
              className="w-full bg-white/5 border border-white/5 rounded-[2rem] px-10 py-8 outline-none focus:bg-white/10 transition-all font-mono text-3xl text-white shadow-inner"
              value={formData.openingBalance}
              onChange={(e) => setFormData({...formData, openingBalance: Number(e.target.value)})}
            />
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Flow Momentum</label>
            <div className="grid grid-cols-2 p-2 bg-white/5 rounded-[2.5rem] border border-white/5 shadow-inner">
              <button
                type="button"
                onClick={() => setFormData({...formData, openingBalanceType: 'Dr'})}
                className={cn(
                  "py-6 rounded-[1.8rem] font-black text-sm uppercase tracking-widest transition-all duration-500 shadow-2xl",
                  formData.openingBalanceType === 'Dr' ? "bg-white text-black scale-100" : "text-white/10 hover:text-white/30 scale-95"
                )}
              >
                Debit
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, openingBalanceType: 'Cr'})}
                className={cn(
                  "py-6 rounded-[1.8rem] font-black text-sm uppercase tracking-widest transition-all duration-500 shadow-2xl",
                  formData.openingBalanceType === 'Cr' ? "bg-white text-black scale-100" : "text-white/10 hover:text-white/30 scale-95"
                )}
              >
                Credit
              </button>
            </div>
          </div>
        </div>

        {/* Indian Compliance Section */}
        <div className="space-y-12 pt-16 border-t border-white/10">
          <div className="flex items-center gap-4">
            <ShieldCheck size={24} className="text-white/20" />
            <h3 className="text-xl font-bold tracking-tight text-white uppercase tracking-[0.1em]">Statutory Compliance Registry</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
                <Globe size={12} /> Jurisdiction State
              </label>
              <StateSelect 
                value={formData.stateId} 
                onChange={(val) => setFormData({...formData, stateId: val})} 
                className="h-24 rounded-[1.5rem] border-white/5 bg-white/2 text-lg font-bold"
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
                <ShieldCheck size={12} /> GSTIN Identifier
              </label>
              <input
                type="text"
                className={cn(
                  "w-full bg-white/5 border rounded-[1.5rem] px-8 py-7 outline-none focus:bg-white/10 transition-all font-mono uppercase text-xl text-white tracking-widest shadow-inner",
                  errors.gstin ? "border-red-500/40" : "border-white/5"
                )}
                placeholder="27AAAAA0000A1Z1"
                value={formData.gstin}
                onChange={(e) => setFormData({...formData, gstin: e.target.value.toUpperCase()})}
              />
              {errors.gstin && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider pl-4">{errors.gstin}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
              <Search size={12} /> HSN / SAC Taxonomy
            </label>
            <HsnSelect 
              value={formData.hsnCodeId} 
              onChange={(val) => setFormData({...formData, hsnCodeId: val})} 
            />
          </div>

          <div className="p-10 rounded-[3rem] bg-white/[0.01] border border-white/5 space-y-10 group/tds">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover/tds:text-white transition-colors">
                  <Info size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-white">TDS Configuration</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Nature of Statutory Deduction</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({...formData, tdsApplicable: !formData.tdsApplicable})}
                className={cn(
                  "w-16 h-8 rounded-full transition-all duration-500 relative",
                  formData.tdsApplicable ? "bg-white" : "bg-white/10"
                )}
              >
                <motion.div 
                  className={cn("absolute top-1 w-6 h-6 rounded-full shadow-2xl", formData.tdsApplicable ? "right-1 bg-black" : "left-1 bg-white/20")}
                  layout
                />
              </button>
            </div>
            
            <AnimatePresence>
              {formData.tdsApplicable && (
                <motion.div
                  initial={{ height: 0, opacity: 0, filter: 'blur(10px)' }}
                  animate={{ height: 'auto', opacity: 1, filter: 'blur(0px)' }}
                  exit={{ height: 0, opacity: 0, filter: 'blur(10px)' }}
                  className="overflow-hidden space-y-6 pt-6 border-t border-white/5"
                >
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Section Nature Code</label>
                    <div className="relative">
                      <select
                        className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-8 py-6 outline-none text-white font-bold text-lg appearance-none shadow-inner"
                        value={formData.tdsNatureCode}
                        onChange={(e) => setFormData({...formData, tdsNatureCode: e.target.value})}
                      >
                        <option value="" className="bg-black">Select Statutory Section...</option>
                        <option value="194C" className="bg-black">194C - Contractor Liability</option>
                        <option value="194J" className="bg-black">194J - Professional Optimization</option>
                        <option value="194I" className="bg-black">194I - Infrastructure Rent</option>
                        <option value="194H" className="bg-black">194H - Agency Commission</option>
                      </select>
                      <ChevronRight className="absolute right-8 top-1/2 -translate-y-1/2 rotate-90 text-white/20 pointer-events-none" size={24} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-10 rounded-full bg-white text-black font-black text-2xl flex items-center justify-center gap-6 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_40px_80px_rgba(255,255,255,0.2)] disabled:opacity-50 group"
      >
        {loading ? <Loader2 className="animate-spin" size={40} /> : (
          <>
            <ShieldCheck size={40} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform" />
            COMMIT NODE INITIALIZATION
          </>
        )}
      </button>
    </form>
  );
}

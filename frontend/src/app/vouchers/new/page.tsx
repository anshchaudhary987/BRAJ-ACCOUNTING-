'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, 
  Trash2, 
  Plus, 
  AlertTriangle,
  CheckCircle2,
  Calendar,
  FileText,
  Keyboard,
  ChevronDown,
  Lock,
  Loader2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Command,
  Info,
  BadgePercent,
  Hash,
  ArrowUpRight,
  Database
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { useHotkeys } from 'react-hotkeys-hook';
import { useRouter } from 'next/navigation';
import { useTenancy } from '@/hooks/useTenancy';

// UI Components & Types
import LedgerCombobox from '@/components/ui/LedgerCombobox';
import AmountInput from '@/components/ui/AmountInput';
import { useTableNavigation } from '@/hooks/useTableNavigation';
import { useLedgers } from '@/hooks/useLedgers';
import { useAutoDetectVoucherType, VoucherType } from '@/hooks/useAutoDetectVoucherType';
import { generateNarration } from '@/lib/narration';
import { VoucherEntryFormValue, ApiResponse, Voucher, Ledger } from '@/types';
import { voucherSchema } from '@/lib/validations';

export default function NewVoucherPage() {
  const { selectedCompany } = useTenancy();
  const { data: ledgers = [] } = useLedgers();
  
  const [voucherType, setVoucherType] = useState<VoucherType>('Journal');
  const [isManualType, setIsManualType] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [narration, setNarration] = useState('');
  const [entries, setEntries] = useState<VoucherEntryFormValue[]>([
    { ledgerId: '', amount: 0, type: 'Dr' },
    { ledgerId: '', amount: 0, type: 'Cr' },
  ]);
  const [isShaking, setIsShaking] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const router = useRouter();
  const narrationRef = useRef<HTMLTextAreaElement>(null);

  // Auto-detection logic
  const detectedType = useAutoDetectVoucherType(entries, ledgers);

  useEffect(() => {
    if (!isManualType && detectedType !== voucherType) {
      setVoucherType(detectedType);
    }
  }, [detectedType, isManualType, voucherType]);

  const { handleKeyDown } = useTableNavigation({
    rowCount: entries.length,
    colCount: 3,
    onAddRow: () => addLine()
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post<ApiResponse<Voucher>>('/voucher', data);
      return res.data.data;
    },
    onSuccess: (data: Voucher) => {
      toast.success('Temporal Signature Authenticated', {
        description: 'The transaction node has been successfully etched into the ledger.'
      });
      router.push(`/vouchers/${data.id}`);
    },
    onError: (err: any) => {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      toast.error(err.response?.data?.message || 'Transaction Initialization Failed');
    }
  });

  const drTotal = useMemo(() => entries.filter(e => e.type === 'Dr').reduce((sum, e) => sum + Number(e.amount), 0), [entries]);
  const crTotal = useMemo(() => entries.filter(e => e.type === 'Cr').reduce((sum, e) => sum + Number(e.amount), 0), [entries]);
  const variance = Math.abs(drTotal - crTotal);
  const isBalanced = useMemo(() => variance < 0.01 && drTotal > 0, [drTotal, crTotal, variance]);
  
  // Real-time tax applicability alerts
  const taxAlerts = useMemo(() => {
    const alerts: string[] = [];
    const selectedLedgers = entries.map(e => ledgers.find(l => l.id === e.ledgerId)).filter(Boolean) as Ledger[];
    
    if (voucherType === 'Sales' || voucherType === 'Purchase') {
      const hasHsn = selectedLedgers.some(l => l.hsnCodeId);
      if (!hasHsn) alerts.push('Taxonomy Error: Missing HSN classification.');
    }
    
    const partyLedger = selectedLedgers.find(l => l.gstin);
    if (partyLedger && selectedCompany && partyLedger.stateId !== selectedCompany.stateId) {
      alerts.push(`Jurisdiction Shift: Interstate [${partyLedger.stateName || 'Generic'}]`);
    }

    const hasTds = selectedLedgers.some(l => l.tdsApplicable);
    if (hasTds && voucherType === 'Payment') {
      alerts.push('Statutory Trigger: TDS Applicability active.');
    }

    return alerts;
  }, [entries, ledgers, voucherType, selectedCompany]);

  const isFormValid = useMemo(() => isBalanced && entries.length >= 2 && entries.every(e => e.ledgerId && e.amount > 0), [isBalanced, entries]);

  const addLine = useCallback(() => setEntries(prev => [...prev, { ledgerId: '', amount: 0, type: 'Dr' }]), []);
  
  const removeLine = useCallback((index: number) => {
    setEntries(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);
  
  const updateEntry = useCallback((index: number, field: keyof VoucherEntryFormValue, value: any) => {
    setEntries(prev => {
      const newEntries = [...prev];
      newEntries[index] = { ...newEntries[index], [field]: value };
      return newEntries;
    });
  }, []);

  const handleSuggestNarration = useCallback(() => {
    const suggested = generateNarration({ 
      voucherType, 
      entries, 
      ledgers, 
      date 
    });
    setNarration(suggested);
    toast.info('Narration Synthesized', { icon: <Sparkles size={14} /> });
  }, [voucherType, entries, ledgers, date]);

  const handleSave = useCallback(() => {
    setErrors({});
    
    const validation = voucherSchema.safeParse({ type: voucherType, date, narration, entries });
    if (!validation.success) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      toast.error('Statutory verification failed. Check equilibrium.');
      return;
    }

    if (!isFormValid || mutation.isPending) return;
    
    // Map entries to match backend expectation (isDebit instead of type)
    const processedEntries = entries.map(e => ({
      ledgerId: e.ledgerId,
      amount: e.amount,
      isDebit: e.type === 'Dr'
    }));

    mutation.mutate({ 
      voucherType, 
      date, 
      narration, 
      entries: processedEntries 
    });
  }, [isFormValid, mutation, voucherType, date, narration, entries]);

  useHotkeys('alt+l', (e) => { e.preventDefault(); addLine(); });
  useHotkeys('ctrl+enter', (e) => { e.preventDefault(); handleSave(); });

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12 space-y-20 pb-40">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px w-12 bg-white/20" />
            <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
              Voucher Forge Terminal
            </span>
            <div className="h-1 w-1 rounded-full bg-white/20" />
            <span className={cn(
              "text-[10px] font-black uppercase tracking-[0.2em] transition-all",
              isManualType ? "text-amber-400" : "text-white/20 italic"
            )}>
              {isManualType ? "Manual Node Override" : "Compliance Guard Active"}
            </span>
          </div>
          <h1 className="text-8xl font-bold tracking-tighter text-white leading-none">
            Entry <span className="text-white/20 italic">Forge.</span>
          </h1>
          <p className="text-white/40 text-2xl mt-6 font-medium leading-relaxed max-w-2xl">
            Synchronize temporal transaction nodes with the institutional spatial ledger.
          </p>
        </motion.div>
        
        <div className="flex items-center gap-6">
          <motion.button
            whileHover={isFormValid ? { scale: 1.02 } : {}}
            whileTap={isFormValid ? { scale: 0.98 } : {}}
            disabled={!isFormValid || mutation.isPending}
            onClick={handleSave}
            className={cn(
              "h-24 px-12 rounded-full font-black uppercase tracking-widest text-sm flex items-center gap-5 transition-all shadow-[0_30px_60px_rgba(255,255,255,0.2)]",
              isFormValid 
                ? "bg-white text-black" 
                : "bg-white/5 text-white/10 border border-white/5 cursor-not-allowed"
            )}
          >
            {mutation.isPending ? <Loader2 className="animate-spin" size={28} /> : <ShieldCheck size={32} strokeWidth={2.5} />}
            <span>{mutation.isPending ? 'Committing...' : isFormValid ? 'Commit to Ledger' : 'Equilibrium Required'}</span>
          </motion.button>
        </div>
      </div>

      <motion.div animate={{ y: isShaking ? [-5, 5, -5, 5, 0] : 0 }} className="space-y-12">
        {/* Compliance Advisory Strip */}
        <AnimatePresence>
          {taxAlerts.length > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex items-center gap-8 p-8 rounded-[3rem] bg-amber-500/5 border border-amber-500/10 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 text-amber-500/5 pointer-events-none">
                <BadgePercent size={80} strokeWidth={0.5} />
              </div>
              <div className="flex items-center gap-4 shrink-0 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <AlertCircle size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500/60">Statutory Advisor</span>
              </div>
              <div className="h-10 w-px bg-amber-500/20 relative z-10" />
              <div className="flex gap-6 overflow-x-auto no-scrollbar relative z-10">
                {taxAlerts.map((alert, i) => (
                  <span key={i} className="text-xs font-bold text-amber-200/40 whitespace-nowrap bg-amber-500/10 px-6 py-2.5 rounded-full uppercase tracking-tighter border border-amber-500/10">
                    {alert}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Configuration Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-2 p-12 glass-pro rounded-[4rem] border border-white/5 space-y-6 bg-gradient-to-br from-white/[0.04] to-transparent shadow-2xl">
            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] flex items-center gap-2">
              <Database size={12} /> Structural Classification
            </label>
            <div className="relative group">
              <select
                value={voucherType}
                onChange={(e) => {
                  setVoucherType(e.target.value as VoucherType);
                  setIsManualType(true);
                }}
                className="w-full bg-transparent border-b border-white/10 py-6 outline-none focus:border-white text-4xl font-bold text-white transition-all appearance-none cursor-pointer tracking-tighter"
              >
                {['Journal', 'Payment', 'Receipt', 'Contra', 'Sales', 'Purchase'].map(t => (
                  <option key={t} value={t} className="bg-black">{t}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none group-hover:text-white transition-colors" size={32} />
            </div>
          </div>

          <div className="p-12 glass-pro rounded-[4rem] border border-white/5 space-y-6 bg-gradient-to-br from-white/[0.04] to-transparent shadow-2xl">
            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] flex items-center gap-2">
              <Calendar size={12} /> Temporal Node
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-transparent border-b border-white/10 py-6 outline-none focus:border-white text-2xl font-mono font-bold text-white transition-all cursor-pointer"
            />
          </div>

          <div className={cn(
            "p-12 glass-pro rounded-[4rem] border flex flex-col justify-center transition-all duration-700 shadow-2xl",
            isBalanced ? "border-emerald-500/20 bg-emerald-500/[0.02]" : "border-amber-500/20 bg-amber-500/[0.02]"
          )}>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">Equilibrium Phase</p>
            <div className="flex items-center gap-6">
              <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-700", isBalanced ? "bg-emerald-500 text-black shadow-[0_0_40px_rgba(16,185,129,0.3)]" : "bg-amber-500/20 text-amber-400 shadow-inner")}>
                {isBalanced ? <CheckCircle2 size={32} strokeWidth={2.5} /> : <AlertTriangle size={32} strokeWidth={2} />}
              </div>
              <div className="flex flex-col">
                <span className={cn("text-2xl font-bold tracking-tighter transition-colors", isBalanced ? "text-white" : "text-amber-100")}>
                  {isBalanced ? "Stable" : "Unstable"}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/10">Structural Balance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Spatial Entry Matrix */}
        <div className="glass-pro rounded-[4rem] border border-white/5 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] bg-gradient-to-br from-white/[0.02] to-transparent">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/5">
                <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 w-48">Momentum</th>
                <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20">Registry Node</th>
                <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 text-right w-96">Magnitude Vector</th>
                <th className="px-12 py-10 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {entries.map((entry, index) => (
                <tr key={index} className="group hover:bg-white/[0.03] transition-all duration-500 relative">
                  <td className="px-12 py-10">
                    <button
                      type="button"
                      onClick={() => updateEntry(index, 'type', entry.type === 'Dr' ? 'Cr' : 'Dr')}
                      className={cn(
                        "w-24 h-12 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 border shadow-2xl",
                        entry.type === 'Dr' 
                          ? "bg-white text-black border-white" 
                          : "bg-white/5 text-white/20 border-white/5 hover:text-white/40"
                      )}
                    >
                      {entry.type === 'Dr' ? 'Debit' : 'Credit'}
                    </button>
                  </td>
                  <td className="px-12 py-10">
                    <LedgerCombobox
                      value={entry.ledgerId}
                      onChange={(val) => updateEntry(index, 'ledgerId', val)}
                      onKeyDown={(e) => handleKeyDown(e as any, index, 1)}
                      className="[&_input]:bg-transparent [&_input]:border-none [&_input]:p-0 [&_input]:text-2xl [&_input]:font-bold [&_input]:text-white [&_input]:focus:ring-0 [&_input]:placeholder:text-white/5"
                    />
                  </td>
                  <td className="px-12 py-10 text-right">
                    <AmountInput
                      value={entry.amount}
                      onAmountChange={(val) => updateEntry(index, 'amount', val)}
                      onKeyDown={(e) => handleKeyDown(e as any, index, 2)}
                      className="bg-transparent border-none p-0 text-right text-3xl font-mono font-bold text-white focus:ring-0 placeholder:text-white/5 group-hover:scale-105 transition-transform origin-right duration-500"
                    />
                  </td>
                  <td className="px-12 py-10 text-center">
                    <button
                      onClick={() => removeLine(index)}
                      className="w-12 h-12 rounded-2xl text-white/10 hover:text-red-400 hover:bg-red-400/10 transition-all duration-500 opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-xl"
                    >
                      <Trash2 size={20} strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="p-12 border-t border-white/5 bg-white/[0.01]">
            <button
              onClick={addLine}
              className="h-16 px-10 rounded-full bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all duration-500 flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white group"
            >
              <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" />
              Append Temporal Line (Alt+L)
            </button>
          </div>
        </div>

        {/* Footer Integrity Analysis */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          <div className="xl:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-4">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] flex items-center gap-2">
                <FileText size={12} /> Institutional Narration Node
              </label>
              <button 
                onClick={handleSuggestNarration}
                className="flex items-center gap-3 text-[10px] font-black text-white/40 hover:text-white transition-all uppercase tracking-[0.2em] bg-white/5 px-5 py-2.5 rounded-full border border-white/5 hover:border-white/20 shadow-xl"
              >
                <Sparkles size={14} className="text-white/60 animate-pulse" /> Auto-Synthesize Signature
              </button>
            </div>
            <textarea
              ref={narrationRef}
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              rows={4}
              className="w-full glass-pro bg-white/2 border border-white/10 rounded-[4rem] px-12 py-10 outline-none focus:border-white/40 text-xl text-white font-medium leading-relaxed transition-all duration-700 placeholder:text-white/5 shadow-inner"
              placeholder="Record the structural essence of this transaction node..."
            />
          </div>

          <div className="xl:col-span-4 p-12 glass-pro rounded-[4rem] border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent flex flex-col justify-between shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none">
              <ShieldCheck size={160} strokeWidth={0.5} />
            </div>
            <div className="space-y-8 relative z-10">
              <div className="flex justify-between items-center group/total">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] group-hover/total:text-white/40 transition-colors">Aggregate Debit</span>
                <span className="text-3xl font-mono font-bold text-white tracking-tighter group-hover/total:scale-110 transition-transform origin-right duration-500">{formatCurrency(drTotal)}</span>
              </div>
              <div className="flex justify-between items-center group/total">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] group-hover/total:text-white/40 transition-colors">Aggregate Credit</span>
                <span className="text-3xl font-mono font-bold text-white tracking-tighter group-hover/total:scale-110 transition-transform origin-right duration-500">{formatCurrency(crTotal)}</span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xl font-black text-white uppercase tracking-[0.1em]">Variance</span>
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">Delta Potential</span>
                </div>
                <span className={cn(
                  "text-5xl font-mono font-black tracking-tighter transition-all duration-700",
                  isBalanced ? "text-white/5 scale-90" : "text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                )}>
                  {formatCurrency(variance)}
                </span>
              </div>
            </div>
            
            <div className="mt-12 relative z-10">
              <div className="flex items-center gap-3 text-[10px] font-black text-white/10 uppercase tracking-[0.4em] mb-6">
                <Command size={14} /> Equilibrium Resonance
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  className={cn("h-full shadow-[0_0_20px_rgba(255,255,255,0.5)]", isBalanced ? "bg-white" : "bg-amber-500")} 
                  animate={{ width: isFormValid ? '100%' : '30%', opacity: isBalanced ? 1 : 0.4 }} 
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

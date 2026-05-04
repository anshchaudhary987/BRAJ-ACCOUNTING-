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
  Zap,
  Sparkles
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
import { VoucherEntryFormValue, ApiResponse, Voucher } from '@/types';

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
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const router = useRouter();
  const narrationRef = useRef<HTMLTextAreaElement>(null);

  // Auto-detection logic
  const detectedType = useAutoDetectVoucherType(entries, ledgers);

  useEffect(() => {
    if (!isManualType && detectedType !== voucherType) {
      setVoucherType(detectedType);
    }
  }, [detectedType, isManualType, voucherType]);

  // Rule Validation Logic
  const getEntryWarning = (entry: VoucherEntryFormValue) => {
    if (!entry.ledgerId) return null;
    const ledger = ledgers.find(l => l.id === entry.ledgerId);
    if (!ledger) return null;

    const group = ledger.group_name;
    const isCashBank = group.includes('Cash') || group.includes('Bank Accounts') || group.includes('Bank OD');

    switch (voucherType) {
      case 'Contra':
        if (!isCashBank) return 'Contra vouchers should only involve Cash or Bank accounts.';
        break;
      case 'Payment':
        if (entry.type === 'Cr' && !isCashBank) return 'Payment vouchers typically credit Cash or Bank.';
        if (entry.type === 'Dr' && isCashBank) return 'Cash/Bank withdrawal should be a Contra or Transfer.';
        break;
      case 'Receipt':
        if (entry.type === 'Dr' && !isCashBank) return 'Receipt vouchers typically debit Cash or Bank.';
        if (entry.type === 'Cr' && isCashBank) return 'Cash/Bank deposit should be a Contra or Transfer.';
        break;
      case 'Sales':
        if (entry.type === 'Cr' && !group.includes('Sales Accounts')) return 'Sales vouchers typically credit a Sales account.';
        break;
      case 'Purchase':
        if (entry.type === 'Dr' && !group.includes('Purchase Accounts')) return 'Purchase vouchers typically debit a Purchase account.';
        break;
      case 'Journal':
        if (isCashBank) return 'Journal vouchers are for non-cash adjustments. Use Payment/Receipt/Contra for Cash/Bank.';
        break;
    }
    return null;
  };

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
      toast.success('Voucher saved successfully');
      router.push(`/vouchers/${data.id}`);
    },
    onError: (err: any) => {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      toast.error(err.response?.data?.message || 'Failed to save voucher');
    }
  });

  const drTotal = useMemo(() => entries.filter(e => e.type === 'Dr').reduce((sum, e) => sum + Number(e.amount), 0), [entries]);
  const crTotal = useMemo(() => entries.filter(e => e.type === 'Cr').reduce((sum, e) => sum + Number(e.amount), 0), [entries]);
  const isBalanced = useMemo(() => Math.abs(drTotal - crTotal) < 0.01 && drTotal > 0, [drTotal, crTotal]);
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
    toast.info('Smart Narration applied ✨', { duration: 1500 });
    
    if (narrationRef.current) {
      narrationRef.current.classList.add('animate-pulse');
      setTimeout(() => narrationRef.current?.classList.remove('animate-pulse'), 1000);
    }
  }, [voucherType, entries, ledgers, date]);

  const handleSave = useCallback(() => {
    if (!isFormValid || mutation.isPending) return;
    mutation.mutate({ type: voucherType, date, narration, entries });
  }, [isFormValid, mutation, voucherType, date, narration, entries]);

  useHotkeys('alt+l', (e) => { e.preventDefault(); addLine(); });
  useHotkeys('alt+j', (e) => { e.preventDefault(); narrationRef.current?.focus(); });
  useHotkeys('ctrl+shift+n', (e) => { e.preventDefault(); handleSuggestNarration(); });
  useHotkeys('ctrl+enter', (e) => { e.preventDefault(); handleSave(); });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32 relative">
      {/* Data Stream Particles */}
      <div className="fixed inset-0 pointer-events-none opacity-30 z-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px h-20 bg-gradient-to-b from-transparent via-cyan-500 to-transparent"
            initial={{ top: -100, left: `${Math.random() * 100}%`, opacity: 0 }}
            animate={{ 
              top: '110%', 
              opacity: [0, 0.5, 0],
              height: [40, 100, 40]
            }}
            transition={{ 
              duration: Math.random() * 3 + 2, 
              repeat: Infinity, 
              delay: Math.random() * 5,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-black flex items-center gap-4 tracking-tighter">
            <span className="text-cyan-500 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)] uppercase italic">Neural</span>
            <span className="text-white">{voucherType} Terminal</span>
            {isManualType ? (
              <span className="text-[10px] bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-white/5 uppercase tracking-[0.2em] font-black">Manual_Override</span>
            ) : (
              <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/20 uppercase tracking-[0.2em] font-black flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Auto_Detect
              </span>
            )}
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-xs text-slate-500 flex items-center gap-2 font-bold uppercase tracking-widest">
              <Keyboard size={12} className="text-cyan-500" /> System_Access: Authorized
            </p>
            <div className="h-1 w-24 bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-cyan-500" 
                animate={{ width: isFormValid ? '100%' : '40%' }} 
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </motion.div>
        
        <div className="flex gap-4">
          <motion.button
            whileHover={isFormValid ? { scale: 1.05, filter: "brightness(1.2)" } : {}}
            whileTap={isFormValid ? { scale: 0.95 } : {}}
            disabled={!isFormValid || mutation.isPending}
            onClick={handleSave}
            className={cn(
              "group px-10 py-5 rounded-2xl font-black uppercase tracking-tighter flex items-center gap-4 transition-all relative overflow-hidden",
              isFormValid 
                ? "bg-cyan-600 text-white shadow-[0_0_30px_rgba(6,182,212,0.4)] border border-cyan-400/50" 
                : "bg-slate-900 text-slate-700 cursor-not-allowed border border-white/5"
            )}
          >
            {mutation.isPending ? (
              <Loader2 className="animate-spin" size={24} />
            ) : isFormValid ? (
              <Zap size={24} className="group-hover:animate-pulse" />
            ) : (
              <Lock size={20} className="opacity-30" />
            )}
            <span className="text-lg italic">
              {mutation.isPending ? 'Processing...' : isFormValid ? 'Dispatch to Ledger Sphere' : 'Terminal Locked'}
            </span>
            {isFormValid && (
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                animate={{ translateX: ["100%", "-100%"] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />
            )}
            {/* Subtle 3D Ripple on Balanced */}
            {isBalanced && (
              <span className="absolute inset-0 pointer-events-none border-2 border-cyan-400/30 rounded-2xl animate-ping" />
            )}
          </motion.button>
        </div>
      </div>

      <motion.div
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{
          rotateX: isHovered ? -mousePos.y * 5 : 0,
          rotateY: isHovered ? mousePos.x * 5 : 0,
          y: isShaking ? [-5, 5, -5, 5, 0] : 0
        }}
        style={{ perspective: 1000 }}
        className="relative z-10"
      >
        <div className={cn(
          "glass-premium rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border transition-all duration-500",
          isBalanced ? "border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]" : "border-cyan-500/20"
        )}>
          {/* Holographic Grid Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
               style={{ backgroundImage: 'linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

          <div className="p-10 border-b border-white/5 grid grid-cols-1 md:grid-cols-3 gap-10 bg-black/40 backdrop-blur-3xl">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center justify-between">
                Voucher_Type_Selector
                {!isManualType && <span className="text-cyan-400 lowercase italic flex items-center gap-1 animate-pulse"><Zap size={10}/> live_sync</span>}
              </label>
              <div className="relative group">
                <select
                  value={voucherType}
                  onChange={(e) => {
                    setVoucherType(e.target.value as VoucherType);
                    setIsManualType(true);
                  }}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 appearance-none font-black text-cyan-50 text-lg transition-all"
                >
                  <option value="Journal">Journal</option>
                  <option value="Payment">Payment</option>
                  <option value="Receipt">Receipt</option>
                  <option value="Contra">Contra</option>
                  <option value="Sales">Sales</option>
                  <option value="Purchase">Purchase</option>
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-cyan-500 pointer-events-none group-hover:scale-110 transition-transform" size={20} />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Calendar size={12} className="text-cyan-500" /> Transaction_Epoch
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-cyan-100 font-bold"
              />
            </div>

            <div className="flex flex-col justify-center items-end">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Integrity_Check</p>
              <div className={cn(
                "px-6 py-3 rounded-2xl font-black flex items-center gap-3 transition-all border",
                isFormValid 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                  : "bg-red-500/10 text-red-400 border-red-500/30 animate-pulse"
              )}>
                {isFormValid ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                <span className="tracking-tighter italic">{isFormValid ? 'CORE_STABLE' : 'DATA_DRIFT_DETECTED'}</span>
              </div>
            </div>
          </div>

          <div className="p-10 bg-black/20">
            <table className="w-full border-separate border-spacing-y-4">
              <thead>
                <tr className="text-left text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                  <th className="pb-4 pl-6 w-28 text-center">Flow</th>
                  <th className="pb-4 pl-4">Ledger_Node</th>
                  <th className="pb-4 pr-6 text-right w-72">Magnitude</th>
                  <th className="pb-4 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => {
                  const warning = getEntryWarning(entry);
                  return (
                    <tr key={index} className="group/row relative">
                      <td className="py-2 pr-4" data-nav-row={index} data-nav-col={0}>
                        <button
                          type="button"
                          onClick={() => updateEntry(index, 'type', entry.type === 'Dr' ? 'Cr' : 'Dr')}
                          onKeyDown={(e) => handleKeyDown(e, index, 0)}
                          className={cn(
                            "w-full py-4 rounded-2xl font-black text-sm transition-all focus:ring-2 focus:outline-none border-2 tracking-widest",
                            entry.type === 'Dr' 
                              ? "bg-red-500/10 text-red-500 border-red-500/20 focus:ring-red-500 hover:bg-red-500/20" 
                              : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 focus:ring-emerald-500 hover:bg-emerald-500/20"
                          )}
                        >
                          {entry.type}
                        </button>
                      </td>

                      <td className="py-2 px-2" data-nav-row={index} data-nav-col={1}>
                        <div className="relative group/ledger">
                          <LedgerCombobox
                            value={entry.ledgerId}
                            onChange={(val) => updateEntry(index, 'ledgerId', val)}
                            onKeyDown={(e) => handleKeyDown(e as any, index, 1)}
                            error={!entry.ledgerId}
                            className="[&_input]:bg-slate-900/50 [&_input]:border-white/10 [&_input]:rounded-2xl [&_input]:py-4 [&_input]:focus:ring-cyan-500 [&_input]:font-black"
                          />
                          {warning && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                              <div className="relative group/tooltip">
                                <AlertCircle size={16} className="text-amber-500 animate-bounce cursor-help" />
                                <div className="absolute bottom-full right-0 mb-3 w-64 p-4 glass-premium border-amber-500/40 rounded-2xl text-xs text-amber-200 font-bold leading-relaxed opacity-0 group-hover/tooltip:opacity-100 transition-all scale-95 group-hover/tooltip:scale-100 pointer-events-none shadow-2xl backdrop-blur-3xl">
                                  <div className="flex items-center gap-2 mb-1 text-amber-500">
                                    <AlertTriangle size={12} /> SYSTEM_ADVISORY
                                  </div>
                                  {warning}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-2 pl-4" data-nav-row={index} data-nav-col={2}>
                        <AmountInput
                          value={entry.amount}
                          onAmountChange={(val) => updateEntry(index, 'amount', val)}
                          onKeyDown={(e) => handleKeyDown(e as any, index, 2)}
                          error={entry.amount <= 0}
                          className={cn(
                            "bg-slate-900/50 border-white/10 rounded-2xl py-4 focus:ring-cyan-500 font-mono font-black text-xl transition-all",
                            entry.amount > 0 ? "text-cyan-400" : "text-slate-600"
                          )}
                        />
                      </td>

                      <td className="py-2 pl-4 text-center">
                        <button
                          tabIndex={-1} 
                          onClick={() => removeLine(index)}
                          className="p-4 rounded-2xl text-slate-700 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover/row:opacity-100"
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <motion.button
              whileHover={{ scale: 1.02, x: 5 }}
              onClick={addLine}
              className="mt-8 flex items-center gap-3 text-sm font-black text-cyan-500 hover:text-cyan-400 transition-all px-6 py-3 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 hover:border-cyan-500/40 uppercase tracking-widest"
            >
              <Plus size={18} />
              Inject Node Line (Alt+L)
            </motion.button>
          </div>

          <div className="p-10 bg-black/40 backdrop-blur-3xl border-t border-white/5 flex flex-col lg:flex-row gap-12 items-start relative">
            <div className="flex-1 w-full space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center justify-between">
                <span className="flex items-center gap-2"><FileText size={14} className="text-cyan-500" /> Narrative_Log</span>
                <button 
                  onClick={handleSuggestNarration}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 text-[10px] font-black hover:bg-cyan-500/20 transition-all border border-cyan-500/30 uppercase tracking-widest group/sparkle"
                >
                  <Sparkles size={12} className="group-hover/sparkle:rotate-180 transition-transform duration-500" />
                  <span>Synthesize</span>
                </button>
              </label>
              <textarea
                ref={narrationRef}
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                rows={3}
                className="w-full bg-slate-900/50 border border-white/10 rounded-[2rem] px-8 py-6 outline-none focus:ring-2 focus:ring-cyan-500 transition-all resize-none font-bold text-cyan-50 text-lg"
                placeholder="Log transaction essence here..."
              />
            </div>

            <div className="flex flex-col gap-6 w-full lg:w-[400px]">
              <div className="glass-premium bg-slate-950/50 rounded-[2.5rem] p-8 space-y-6 border-white/5 shadow-inner">
                <div className="flex items-center justify-between gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Aggregate_Debit</span>
                      <div className="font-mono font-black text-2xl text-red-500/80 tracking-tighter">{formatCurrency(drTotal)}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Aggregate_Credit</span>
                      <div className="font-mono font-black text-2xl text-emerald-500/80 tracking-tighter">{formatCurrency(crTotal)}</div>
                    </div>
                  </div>
                  
                  {/* Neural Balance Ring */}
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="64" cy="64" r="56" className="fill-none stroke-white/5 stroke-[8]" />
                      <motion.circle
                        cx="64" cy="64" r="56"
                        className={cn("fill-none stroke-[8] transition-all duration-700", isBalanced ? "stroke-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" : "stroke-red-500")}
                        initial={{ strokeDasharray: 352, strokeDashoffset: 352 }}
                        animate={{ 
                          strokeDashoffset: isBalanced ? 0 : 352 * (1 - Math.min(1, Math.max(0, drTotal && crTotal ? (1 - Math.abs(drTotal - crTotal) / Math.max(drTotal, crTotal)) : 0)))
                        }}
                        style={{ strokeDasharray: 352 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <AnimatePresence mode="wait">
                        {isBalanced ? (
                          <motion.div 
                            key="check"
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                            className="text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                          >
                            <CheckCircle2 size={40} />
                          </motion.div>
                        ) : (
                          <motion.div 
                            key="lock"
                            animate={{ 
                              scale: [1, 1.1, 1],
                              opacity: [1, 0.7, 1]
                            }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="text-red-500"
                          >
                            <Lock size={32} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {!isBalanced && drTotal + crTotal > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 text-center"
                  >
                    <div className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Differential_Detected</div>
                    <div className="font-mono font-black text-red-500">{formatCurrency(Math.abs(drTotal - crTotal))}</div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
          
          {/* Neural HUD Bar */}
          <div className="px-10 py-4 bg-cyan-500/5 border-t border-white/5 flex items-center justify-between text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
            <div className="flex gap-6">
              <span className="flex items-center gap-2"><kbd className="bg-slate-800 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20 font-mono">Alt+L</kbd> Inject_Line</span>
              <span className="flex items-center gap-2"><kbd className="bg-slate-800 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20 font-mono">Alt+J</kbd> Focus_Narrative</span>
              <span className="flex items-center gap-2"><kbd className="bg-slate-800 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20 font-mono">Ctrl+N</kbd> Synthesize</span>
            </div>
            <div className="flex items-center gap-2 text-cyan-500/50">
              <span className="animate-pulse">Neural_Link_Active</span>
              <div className="w-1 h-1 rounded-full bg-cyan-500" />
              <span>v.2064.05.04</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Decorative Scanlines */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
    </div>
  );
}

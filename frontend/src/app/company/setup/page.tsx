'use client';

import { useState, useEffect } from 'react';
import { useCompanyStore } from '@/store/useCompanyStore';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Plus, 
  ChevronRight, 
  Loader2, 
  ShieldCheck,
  AlertCircle,
  Hash,
  Globe,
  ArrowUpRight,
  Fingerprint
} from 'lucide-react';
import { toast } from 'sonner';
import StateSelect from '@/components/ui/StateSelect';
import { companySchema } from '@/lib/validations';
import { Company, ApiResponse } from '@/types';
import { cn } from '@/lib/utils';

export default function CompanySetup() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { setSelectedCompany } = useCompanyStore();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    stateId: '',
    gstin: '',
    pan: '',
    financialYearStart: new Date().getFullYear() + '-04-01',
    booksBeginningDate: new Date().getFullYear() + '-04-01',
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await api.get<ApiResponse<Company[]>>('/company');
      setCompanies(res.data.data);
    } catch (err) {
      toast.error('Failed to access organization registry');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (company: Company) => {
    setSelectedCompany(company);
    toast.success(`Authorized: ${company.name}`, {
      description: `Access granted for ${company.stateName || 'Generic'} jurisdiction.`
    });
    router.push('/');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setErrors({});

    const validation = companySchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
          validation.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      toast.error('Statutory verification failed', {
        description: 'Please correct the highlighted compliance errors.'
      });
      setCreating(false);
      return;
    }

    try {
      const res = await api.post<ApiResponse<Company>>('/company', formData);
      const newCompany = res.data.data;
      setCompanies([...companies, newCompany]);
      setSelectedCompany(newCompany);
      toast.success('Organization initialized successfully');
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to initialize organization');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-20 min-h-screen flex flex-col justify-center">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-white/[0.02] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/[0.01] blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10">
        <div className="mb-24 max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
              <Fingerprint size={12} className="text-white/40" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Identity Gateway</span>
            </div>
            <div className="h-px w-24 bg-gradient-to-r from-white/10 to-transparent" />
          </div>
          <h1 className="text-8xl font-bold tracking-tighter text-white leading-none mb-8">
            Structural <br/> <span className="text-white/20 italic">Authentication.</span>
          </h1>
          <p className="text-white/40 text-2xl font-medium leading-relaxed">
            Initialize or select a verified entity node to begin your financial journey.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          {/* Registry List */}
          <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-3">
                <Building2 size={14} /> Active Node Registry
              </h2>
              <span className="text-[10px] font-bold text-white/10 uppercase tracking-widest">
                {companies.length} Entities Found
              </span>
            </div>
            
            {loading ? (
              <div className="p-32 glass-pro rounded-[4rem] border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-white/[0.01] animate-pulse" />
                <Loader2 className="animate-spin text-white/20 mb-8" size={64} strokeWidth={1} />
                <p className="text-white/30 font-black uppercase tracking-[0.4em] text-[10px]">Accessing Vault Integrity...</p>
              </div>
            ) : companies.length === 0 ? (
              <div className="p-20 glass-pro rounded-[4rem] border border-dashed border-white/10 text-center">
                <Building2 className="mx-auto text-white/5 mb-8" size={64} strokeWidth={0.5} />
                <p className="text-white/40 font-medium italic text-lg mb-4">No registered organizations identified.</p>
                <button 
                   onClick={() => setShowCreate(true)}
                   className="text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors"
                >
                  Create Initial Node
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {companies.map((company) => (
                  <motion.button
                    key={company.id}
                    whileHover={{ scale: 1.02, x: 10 }}
                    onClick={() => handleSelect(company)}
                    className="w-full p-10 glass-pro rounded-[3rem] flex items-center justify-between group border border-white/5 hover:border-white/20 hover:bg-white/[0.03] transition-all duration-500 shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                    <div className="flex items-center gap-8 text-left">
                      <div className="w-20 h-20 rounded-[1.5rem] bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/20 group-hover:bg-white group-hover:text-black transition-all duration-700 shadow-inner">
                        <Building2 size={32} strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-3xl font-bold tracking-tight text-white">{company.name}</h3>
                          <ArrowUpRight size={20} className="text-white/0 group-hover:text-white/20 transition-all" />
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-white/50 transition-colors">
                            {company.stateName || 'Generic'} Jurisdiction
                          </span>
                          <div className="w-1 h-1 rounded-full bg-white/10" />
                          <span className="text-[10px] font-mono tracking-widest text-white/20 uppercase">
                            {company.gstin || 'Unregistered'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center text-white/10 group-hover:text-white group-hover:border-white/20 transition-all duration-500">
                      <ChevronRight size={24} strokeWidth={1} />
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
            
            {!showCreate && (
              <button
                onClick={() => setShowCreate(true)}
                className="w-full p-12 rounded-[3.5rem] border-2 border-dashed border-white/5 hover:border-white/20 hover:bg-white/[0.02] transition-all duration-700 flex flex-col items-center justify-center gap-4 text-white/20 hover:text-white group"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus size={32} strokeWidth={1.5} />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.4em]">Initialize New Entity Node</span>
              </button>
            )}
          </div>

          {/* Creation Section */}
          <AnimatePresence mode="wait">
            {showCreate ? (
              <motion.div
                initial={{ opacity: 0, x: 40, filter: 'blur(20px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: 40, filter: 'blur(20px)' }}
                className="p-16 glass-pro rounded-[5rem] border border-white/10 relative overflow-hidden bg-gradient-to-b from-white/[0.03] to-transparent shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                
                <div className="flex items-center justify-between mb-16">
                  <div>
                    <h2 className="text-4xl font-bold tracking-tighter text-white">Node Initialization</h2>
                    <p className="text-white/30 text-sm font-medium mt-2">Map a new statutory entity to the spatial graph.</p>
                  </div>
                  <button 
                    onClick={() => setShowCreate(false)}
                    className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Plus size={24} className="rotate-45" />
                  </button>
                </div>

                <form onSubmit={handleCreate} className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
                      <Hash size={10} /> Corporate Name
                    </label>
                    <input
                      type="text"
                      autoFocus
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={cn(
                        "w-full bg-white/5 border rounded-[2rem] px-10 py-6 focus:bg-white/10 outline-none transition-all text-white font-bold text-2xl shadow-inner",
                        errors.name ? "border-red-500/40" : "border-white/5"
                      )}
                      placeholder="e.g. Braj Quantum Systems"
                    />
                    {errors.name && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 px-4">
                        <AlertCircle size={12} className="text-red-500" />
                        <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{errors.name}</p>
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
                      <Globe size={10} /> Legal Jurisdiction
                    </label>
                    <StateSelect 
                      value={formData.stateId} 
                      onChange={(id) => setFormData({ ...formData, stateId: id })}
                      className={errors.stateId ? "border-red-500/40" : ""}
                    />
                    {errors.stateId && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 px-4">
                        <AlertCircle size={12} className="text-red-500" />
                        <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{errors.stateId}</p>
                      </motion.div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Permanent Acc. (PAN)</label>
                      <input
                        type="text"
                        value={formData.pan}
                        onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                        className={cn(
                          "w-full bg-white/5 border rounded-[1.5rem] px-8 py-5 outline-none transition-all text-white font-mono uppercase text-lg tracking-widest",
                          errors.pan ? "border-red-500/40" : "border-white/5"
                        )}
                        placeholder="ABCDE1234F"
                      />
                      {errors.pan && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider pl-4">{errors.pan}</p>}
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Statutory GSTIN</label>
                      <input
                        type="text"
                        value={formData.gstin}
                        onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                        className={cn(
                          "w-full bg-white/5 border rounded-[1.5rem] px-8 py-5 outline-none transition-all text-white font-mono uppercase text-lg tracking-widest",
                          errors.gstin ? "border-red-500/40" : "border-white/5"
                        )}
                        placeholder="27AAACR1234A1Z1"
                      />
                      {errors.gstin && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider pl-4">{errors.gstin}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">FY Cycle Start</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={formData.financialYearStart}
                          onChange={(e) => setFormData({ ...formData, financialYearStart: e.target.value })}
                          className="w-full bg-white/5 border border-white/5 rounded-[1.5rem] px-8 py-5 outline-none text-white font-mono text-xs uppercase"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Ledger Origins</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={formData.booksBeginningDate}
                          onChange={(e) => setFormData({ ...formData, booksBeginningDate: e.target.value })}
                          className="w-full bg-white/5 border border-white/5 rounded-[1.5rem] px-8 py-5 outline-none text-white font-mono text-xs uppercase"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={creating}
                    className="w-full py-8 rounded-[2.5rem] bg-white text-black font-black text-xl flex items-center justify-center gap-4 transition-all hover:scale-[1.02] shadow-[0_20px_60px_rgba(255,255,255,0.2)] disabled:opacity-50 mt-8 group"
                  >
                    {creating ? <Loader2 className="animate-spin" size={28} /> : (
                      <>
                        <ShieldCheck size={28} strokeWidth={2.5} />
                        COMMIT INITIALIZATION
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <div className="hidden lg:flex flex-col items-center justify-center text-center p-32 glass-pro rounded-[5rem] border border-white/5 opacity-40 hover:opacity-100 transition-opacity duration-1000 group">
                <div className="relative mb-12">
                  <div className="absolute inset-0 bg-white/10 blur-[80px] rounded-full animate-pulse group-hover:bg-white/20 transition-all" />
                  <Building2 className="relative z-10 text-white/10 group-hover:text-white/40 transition-colors" size={160} strokeWidth={0.5} />
                </div>
                <h3 className="text-4xl font-bold tracking-tighter text-white/60 mb-6 group-hover:text-white transition-colors">Quantum Node Vault</h3>
                <p className="text-lg font-medium leading-relaxed max-w-sm text-white/20 group-hover:text-white/40 transition-colors">
                  Authorize an existing statutory node from the left-hand registry or establish a new coordinate in the financial spatial graph.
                </p>
                <div className="mt-12 flex gap-4">
                  <div className="w-1 h-1 rounded-full bg-white/10" />
                  <div className="w-1 h-1 rounded-full bg-white/20" />
                  <div className="w-1 h-1 rounded-full bg-white/10" />
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

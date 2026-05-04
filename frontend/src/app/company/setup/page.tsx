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
  Globe, 
  MapPin, 
  FileText,
  CreditCard,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

import { Company, ApiResponse } from '@/types';

export default function CompanySetup() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const { setSelectedCompany } = useCompanyStore();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    state: 'Maharashtra',
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
      console.error(err);
      toast.error('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (company: Company) => {
    setSelectedCompany(company);
    toast.success(`Switched to ${company.name}`);
    router.push('/');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    
    // Basic validation for required fields
    if (!formData.name || !formData.state || !formData.gstin || !formData.pan) {
      toast.error('Please fill in all required fields (Name, State, GSTIN, PAN)');
      setCreating(false);
      return;
    }

    try {
      const res = await api.post<ApiResponse<Company>>('/company', formData);
      const newCompany = res.data.data;
      setCompanies([...companies, newCompany]);
      setSelectedCompany(newCompany);
      toast.success('Company created successfully!');
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create company');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-gradient">Select Your Organization</h1>
        <p className="text-slate-400">Choose a company to manage or create a new one to get started.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Company List */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 px-2">Existing Companies</h2>
          {loading ? (
            <div className="flex items-center justify-center p-12 glass-premium rounded-3xl border-white/5 shadow-2xl">
              <Loader2 className="animate-spin text-violet-500" size={32} />
            </div>
          ) : companies.length === 0 ? (
            <div className="p-8 glass-premium rounded-3xl border-dashed text-center border-white/5">
              <Building2 className="mx-auto text-slate-600 mb-4" size={32} />
              <p className="text-sm text-slate-500">No companies found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {companies.map((company) => (
                <motion.button
                  key={company.id}
                  whileHover={{ x: 5 }}
                  onClick={() => handleSelect(company)}
                  className="w-full p-5 glass-premium rounded-2xl flex items-center justify-between group hover:bg-violet-600/5 transition-all border-white/5 hover:border-violet-500/30"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-all shadow-xl">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold">{company.name}</h3>
                      <p className="text-xs text-slate-500">{company.state} • {company.gstin}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-600 group-hover:text-violet-400 transition-colors" />
                </motion.button>
              ))}
            </div>
          )}
          
          {!showCreate && (
            <button
              onClick={() => setShowCreate(true)}
              className="w-full p-4 rounded-2xl border-2 border-dashed border-white/10 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all flex items-center justify-center gap-2 text-slate-400 hover:text-violet-400 font-bold"
            >
              <Plus size={18} />
              Add New Company
            </button>
          )}
        </div>

        {/* Create Form */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-8 glass-premium rounded-3xl h-fit border-white/5 bg-gradient-to-b from-white/2 to-transparent"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold">New Company</h2>
                <button 
                  onClick={() => setShowCreate(false)}
                  className="text-xs text-slate-500 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                    <Globe size={12} /> Company Name
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                    placeholder="e.g. Acme Corp India"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                      <MapPin size={12} /> State
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 outline-none transition-all appearance-none"
                    >
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Gujarat">Gujarat</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                      <CreditCard size={12} /> PAN
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.pan}
                      onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                      placeholder="ABCDE1234F"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                    <FileText size={12} /> GSTIN
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                    placeholder="27AAACR1234A1Z1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                      <Calendar size={12} /> FY Start
                    </label>
                    <input
                      type="date"
                      value={formData.financialYearStart}
                      onChange={(e) => setFormData({ ...formData, financialYearStart: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                      <Calendar size={12} /> Books From
                    </label>
                    <input
                      type="date"
                      value={formData.booksBeginningDate}
                      onChange={(e) => setFormData({ ...formData, booksBeginningDate: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  disabled={creating}
                  className="w-full py-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-600/20 disabled:opacity-50"
                >
                  {creating ? <Loader2 className="animate-spin" size={20} /> : 'Initialize Company'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

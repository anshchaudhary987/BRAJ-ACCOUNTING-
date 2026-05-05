'use client';

import { useState, useEffect } from 'react';
import { useCompanyStore } from '@/store/useCompanyStore';
import { User, Shield, Mail, UserPlus, Trash2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

export default function UsersPage() {
  const { selectedCompany } = useCompanyStore();
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', roleId: '' });

  useEffect(() => {
    if (selectedCompany) {
      fetchUsers();
      fetchRoles();
    }
  }, [selectedCompany]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/user');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await api.get('/user/roles');
      setRoles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/user/invite', inviteForm);
      if (res.status === 200 || res.status === 201) {
        setShowInvite(false);
        setInviteForm({ name: '', email: '', roleId: '' });
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!selectedCompany) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <Shield size={64} className="text-white/10 mb-6" />
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Access Control</h1>
        <p className="text-white/40 max-w-md">Please select a company to manage users and role-based permissions.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 pt-32 pb-24">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase mb-2">Team & Security</h1>
          <p className="text-white/40 font-medium">Manage access control for {selectedCompany.name}</p>
        </div>
        <button 
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-3 px-8 py-4 rounded-3xl bg-white text-black font-black hover:scale-105 transition-all active:scale-95"
        >
          <UserPlus size={20} />
          Invite User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {users.map((user, idx) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-pro rounded-[2.5rem] border border-white/5 p-8 group hover:border-white/20 transition-all relative overflow-hidden"
            >
              <div className="flex items-start justify-between relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-black transition-all duration-500">
                  <User size={32} />
                </div>
                <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
                  {user.role}
                </div>
              </div>

              <div className="mt-6 relative z-10">
                <h3 className="text-xl font-bold text-white group-hover:translate-x-1 transition-transform">{user.name}</h3>
                <div className="flex items-center gap-2 text-white/40 text-sm mt-1">
                  <Mail size={14} />
                  {user.email}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-white/10'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20">
                    {user.isActive ? 'Active Session' : 'Offline'}
                  </span>
                </div>
                <button className="p-3 rounded-xl bg-white/5 border border-white/5 text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[80px] -mr-16 -mt-16 rounded-full group-hover:bg-white/10 transition-all" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Invite Dialog */}
      <AnimatePresence>
        {showInvite && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInvite(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-xl glass-pro rounded-[3rem] border border-white/10 p-12 relative overflow-hidden"
            >
              <div className="relative z-10">
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">New Security Mandate</h2>
                <p className="text-white/40 mb-8 font-medium">Issue digital credentials for a new team member.</p>

                <form onSubmit={handleInvite} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Full Identity</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Aansh Chaudhary"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-white/30 transition-all"
                      value={inviteForm.name}
                      onChange={e => setInviteForm({...inviteForm, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Secure Endpoint (Email)</label>
                    <input 
                      required
                      type="email" 
                      placeholder="e.g. aansh@braj.com"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-white/30 transition-all"
                      value={inviteForm.email}
                      onChange={e => setInviteForm({...inviteForm, email: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Access Tier</label>
                    <select 
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-white/30 transition-all appearance-none"
                      value={inviteForm.roleId}
                      onChange={e => setInviteForm({...inviteForm, roleId: e.target.value})}
                    >
                      <option value="" className="bg-black">Select Access Level</option>
                      {roles.map(role => (
                        <option key={role.id} value={role.id} className="bg-black">{role.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-6 flex gap-4">
                    <button 
                      type="submit"
                      className="flex-1 bg-white text-black font-black py-5 rounded-2xl hover:scale-[1.02] transition-all active:scale-95"
                    >
                      Authorize & Send Invitation
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowInvite(false)}
                      className="px-8 bg-white/5 text-white/40 font-bold py-5 rounded-2xl hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
              
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/5 blur-[100px] rounded-full" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

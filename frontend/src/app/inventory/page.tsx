'use client';

import { useState, useEffect } from 'react';
import { useCompanyStore } from '@/store/useCompanyStore';
import { 
  Box, 
  Package, 
  Warehouse, 
  Ruler, 
  ArrowLeftRight, 
  Plus, 
  Search,
  ChevronRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

export default function InventoryPage() {
  const { selectedCompany } = useCompanyStore();
  const [activeTab, setActiveTab] = useState<'items' | 'godowns' | 'units' | 'journals'>('items');
  const [items, setItems] = useState<any[]>([]);
  const [godowns, setGodowns] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedCompany) {
      fetchData();
    }
  }, [selectedCompany, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoints = {
        items: '/inventory/items',
        godowns: '/inventory/godowns',
        units: '/inventory/units',
        journals: '/inventory/journals'
      };
      
      const res = await api.get(endpoints[activeTab]);
      const data = res.data;
      if (activeTab === 'items') setItems(data);
      if (activeTab === 'godowns') setGodowns(data);
      if (activeTab === 'units') setUnits(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'items', name: 'Stock Items', icon: Package },
    { id: 'godowns', name: 'Godowns', icon: Warehouse },
    { id: 'units', name: 'Units', icon: Ruler },
    { id: 'journals', name: 'Stock Journals', icon: ArrowLeftRight },
  ];

  if (!selectedCompany) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <Box size={64} className="text-white/10 mb-6" />
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Inventory Core</h1>
        <p className="text-white/40 max-w-md">Connect to a company environment to initiate structural inventory synchronization.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 pt-32 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">
            <span className="w-1 h-1 rounded-full bg-white/40 animate-pulse" />
            Structural Asset Matrix
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase mb-2">Inventory Ledger</h1>
          <p className="text-white/40 font-medium">Equilibrium tracking for {selectedCompany.name}</p>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-[2rem] border border-white/5 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-6 py-3 rounded-[1.5rem] text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all relative",
                activeTab === tab.id ? "text-black" : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute inset-0 bg-white rounded-[1.5rem] -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <tab.icon size={16} />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {activeTab === 'items' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 relative max-w-md">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="text" 
                  placeholder="Search assets..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white focus:outline-none focus:border-white/30 transition-all font-medium"
                />
              </div>
              <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-black font-black hover:scale-105 transition-all active:scale-95">
                <Plus size={20} />
                Create Stock Item
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {items.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-pro rounded-[2.5rem] border border-white/5 p-8 group hover:border-white/20 transition-all relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-black transition-all duration-500">
                        <Box size={28} />
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Stock Level</div>
                        <div className={cn(
                          "text-2xl font-black",
                          item.current_stock < 10 ? "text-red-400" : "text-white"
                        )}>
                          {item.current_stock} <span className="text-xs font-bold text-white/20 uppercase ml-1">{item.unit_symbol}</span>
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10">
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:translate-x-1 transition-transform tracking-tight">{item.name}</h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{item.group_name || 'Uncategorized'}</p>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4 relative z-10">
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <div className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">Valuation</div>
                        <div className="text-sm font-bold text-white/60">₹{item.opening_rate} / {item.unit_symbol}</div>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <div className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">SKU Identity</div>
                        <div className="text-sm font-bold text-white/60 uppercase">{item.sku || 'N/A'}</div>
                      </div>
                    </div>

                    {item.current_stock < 10 && (
                      <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-red-400/5 border border-red-400/20 text-red-400 text-[10px] font-black uppercase tracking-widest relative z-10">
                        <AlertTriangle size={12} />
                        Structural Depletion Detected
                      </div>
                    )}
                    
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[80px] -mr-16 -mt-16 rounded-full group-hover:bg-white/10 transition-all" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Similar sections for Godowns, Units, and Journals... */}
        {activeTab !== 'items' && (
          <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
            <TrendingUp size={48} className="text-white/10 mb-6" />
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Section Under Synchronization</h2>
            <p className="text-white/40 max-w-xs mt-2">Connecting to structural endpoints for {activeTab}...</p>
          </div>
        )}
      </div>
    </div>
  );
}

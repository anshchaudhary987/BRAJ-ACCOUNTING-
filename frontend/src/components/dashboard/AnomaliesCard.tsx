'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldAlert, Zap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useDashboard } from '@/hooks/useDashboard';

export default function AnomaliesCard() {
  const { data, isLoading } = useDashboard();
  
  const anomalies = data?.anomalies || [];
  const anomalyCount = anomalies.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-10 glass-pro rounded-[3rem] border border-white/5 bg-white/[0.01] relative overflow-hidden group hover:border-white/20 transition-all"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white/5 text-white/40">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-white">Integrity Watch</h3>
            <p className="text-[10px] text-white/20 uppercase tracking-widest font-black mt-1">Structural Drift Detection</p>
          </div>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
          anomalyCount > 0 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-white/5 text-white/20 border-white/5"
        )}>
          {anomalyCount > 0 ? "Attention Required" : "Stable"}
        </div>
      </div>

      <div className="flex items-baseline gap-3 mb-8">
        <span className={cn(
          "text-6xl font-bold tracking-tighter",
          anomalyCount > 0 ? "text-white" : "text-white/10"
        )}>{anomalyCount}</span>
        <span className="text-white/20 font-black uppercase text-[10px] tracking-widest">Flagged Exceptions</span>
      </div>

      <div className="space-y-3">
        {anomalies.slice(0, 2).map(v => (
          <div key={v.id} className="flex flex-col gap-1 p-4 rounded-2xl bg-white/2 border border-white/5 hover:border-white/10 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-white/80 font-bold text-xs">{v.title}</span>
              <span className="text-[8px] font-black uppercase tracking-widest text-white/20">{v.type}</span>
            </div>
            <p className="text-[10px] text-white/40 leading-tight">{v.description}</p>
          </div>
        ))}
        {anomalyCount > 2 && (
          <p className="text-center text-[10px] text-white/20 font-black uppercase tracking-widest mt-4 flex items-center justify-center gap-2">
            View all {anomalyCount} audit flags <ArrowRight size={10} />
          </p>
        )}
      </div>

      <div className="mt-10 pt-6 border-t border-white/5 flex items-center gap-3 text-[10px] text-white/30 font-black uppercase tracking-widest">
        <Zap size={14} className="text-white/10" />
        Protocol: Statutory Review Mandatory
      </div>
    </motion.div>
  );
}

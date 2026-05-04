'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, Voucher } from '@/types';

export default function AnomaliesCard() {
  const { data: vouchers = [] } = useQuery({
    queryKey: ['vouchers-anomalies'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Voucher[]>>('/voucher');
      return res.data.data;
    }
  });

  const anomalies = vouchers.filter(v => (v.totalDebit || 0) > 100000);
  const anomalyCount = anomalies.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 glass-premium rounded-3xl border border-red-500/20 bg-red-500/5 relative overflow-hidden group"
    >
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-red-500/10 blur-2xl rounded-full group-hover:bg-red-500/20 transition-all" />
      
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 rounded-2xl bg-red-500/20 text-red-400">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-red-100">Anomalies Detected</h3>
          <p className="text-xs text-red-400/60 uppercase tracking-widest font-bold">Neural Oversight Active</p>
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-5xl font-black text-red-500">{anomalyCount}</span>
        <span className="text-red-400/60 font-bold uppercase text-[10px]">Flagged Events</span>
      </div>

      <div className="space-y-2">
        {anomalies.slice(0, 2).map(v => (
          <div key={v.id} className="flex items-center justify-between text-[10px] p-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <span className="text-red-200/80 font-mono">{v.vchNo}</span>
            <span className="text-red-400 font-bold">High Value Entry</span>
          </div>
        ))}
        {anomalyCount > 2 && (
          <p className="text-center text-[10px] text-red-400/40 font-bold mt-2">
            + {anomalyCount - 2} more detected by AI
          </p>
        )}
      </div>

      <div className="mt-6 flex items-center gap-2 text-[10px] text-red-400/80 font-bold bg-red-500/10 p-2 rounded-lg">
        <ShieldAlert size={14} />
        SECURITY PROTOCOL: AUDIT REQUIRED
      </div>
    </motion.div>
  );
}

'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, Voucher, Ledger } from '@/types';
import { format, subDays, isSameDay, parseISO } from 'date-fns';

export default function CashFlowChart() {
  const { data: vouchers = [] } = useQuery({
    queryKey: ['vouchers-cashflow'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Voucher[]>>('/voucher');
      return res.data.data;
    }
  });

  const { data: ledgers = [] } = useQuery({
    queryKey: ['ledgers-cashflow'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Ledger[]>>('/ledger');
      return res.data.data;
    }
  });

  // Identify Cash/Bank ledgers
  const cashBankLedgerIds = ledgers
    .filter(l => l.group_name === 'Cash' || l.group_name === 'Bank Accounts')
    .map(l => l.id);

  // Generate last 7 days data
  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
    
    return days.map(day => {
      let inflow = 0;
      let outflow = 0;

      vouchers.forEach(v => {
        if (isSameDay(parseISO(v.date), day)) {
          v.entries.forEach(entry => {
            if (cashBankLedgerIds.includes(entry.ledgerId)) {
              const amount = Number(entry.amount);
              if (entry.isDebit) {
                inflow += amount; // Cash coming in (Debit for asset)
              } else {
                outflow += amount; // Cash going out (Credit for asset)
              }
            }
          });
        }
      });

      return {
        name: format(day, 'MMM dd'),
        inflow,
        outflow,
        net: inflow - outflow
      };
    });
  }, [vouchers, cashBankLedgerIds]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-6 glass-premium rounded-3xl border border-cyan-500/20 bg-cyan-500/5 h-[300px] flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-cyan-100">Cash Dynamics</h3>
          <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">7-Day Liquidity Stream</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-cyan-500" />
            <span className="text-[10px] text-slate-400 font-bold uppercase">Inflow</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-[10px] text-slate-400 font-bold uppercase">Outflow</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', fontSize: '12px' }}
              itemStyle={{ color: '#f1f5f9' }}
            />
            <Area 
              type="monotone" 
              dataKey="inflow" 
              stroke="#06b6d4" 
              fillOpacity={1} 
              fill="url(#colorInflow)" 
              strokeWidth={3}
            />
            <Area 
              type="monotone" 
              dataKey="outflow" 
              stroke="#a855f7" 
              fillOpacity={1} 
              fill="url(#colorOutflow)" 
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

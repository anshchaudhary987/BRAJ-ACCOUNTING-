'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, Voucher, Ledger } from '@/types';
import { format, subDays, isSameDay, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

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
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white" />
            <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Inflow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Outflow</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.05}/>
                <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#ffffff20', fontSize: 10, fontWeight: '900' }}
              dy={10}
            />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#000000', 
                borderRadius: '20px', 
                border: '1px solid #ffffff10', 
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#ffffff'
              }}
              itemStyle={{ color: '#ffffff' }}
              cursor={{ stroke: '#ffffff10', strokeWidth: 1 }}
            />
            <Area 
              type="monotone" 
              dataKey="inflow" 
              stroke="#ffffff" 
              fillOpacity={1} 
              fill="url(#colorInflow)" 
              strokeWidth={3}
            />
            <Area 
              type="monotone" 
              dataKey="outflow" 
              stroke="#ffffff30" 
              fillOpacity={1} 
              fill="url(#colorOutflow)" 
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

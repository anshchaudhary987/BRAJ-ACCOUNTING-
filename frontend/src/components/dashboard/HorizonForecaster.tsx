'use client';

import React, { useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface HorizonForecasterProps {
  currentBalance: number;
}

export default function HorizonForecaster({ currentBalance }: HorizonForecasterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Generate months from Oct 2024 to Dec 2064
  const timelineData = useMemo(() => {
    const data = [];
    const startDate = new Date(2024, 9, 1); // Oct 2024
    const endDate = new Date(2064, 11, 31); // Dec 2064
    
    let currentDate = new Date(startDate);
    let runningBalance = currentBalance;
    
    // Seed random walk
    const seed = currentBalance || 500000;
    
    while (currentDate <= endDate) {
      // Simple random walk with upward bias (inflation/growth)
      const change = (Math.random() - 0.45) * (seed * 0.05); 
      runningBalance += change;
      
      data.push({
        date: new Date(currentDate),
        balance: runningBalance,
        label: currentDate.toLocaleString('default', { month: 'short' }),
        year: currentDate.getFullYear()
      });
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return data;
  }, [currentBalance]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <Zap size={18} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Horizon Forecaster</h3>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">Predictive Quantum Ledger • 2024 - 2064</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => scroll('left')}
            className="p-2 rounded-xl glass-premium border-white/5 hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="p-2 rounded-xl glass-premium border-white/5 hover:bg-white/10 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="glass-premium rounded-[2rem] p-8 overflow-x-auto no-scrollbar relative"
      >
        <div className="flex gap-8 items-end min-w-max h-[150px]">
          {timelineData.map((item, idx) => {
            const isYearStart = item.date.getMonth() === 0;
            const height = Math.max(20, Math.min(100, (item.balance / (currentBalance * 5)) * 100));
            
            return (
              <div key={idx} className="flex flex-col items-center gap-4 group cursor-pointer">
                <div className="relative flex flex-col items-center">
                  {/* Predicted Line Segment */}
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    className={`w-1 rounded-full ${isYearStart ? 'bg-amber-500' : 'bg-white/10 group-hover:bg-amber-500/50'} transition-colors`}
                  />
                  
                  {/* Tooltip on hover */}
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-white/10 p-2 rounded-lg text-[10px] whitespace-nowrap z-50">
                    <p className="font-bold text-amber-400">{item.label} {item.year}</p>
                    <p className="font-mono">{formatCurrency(item.balance)}</p>
                  </div>
                </div>
                
                <div className="text-center">
                  {isYearStart && (
                    <span className="text-[10px] font-black text-slate-500 mb-1 block">{item.year}</span>
                  )}
                  <span className={`text-[8px] font-bold uppercase tracking-tighter ${isYearStart ? 'text-amber-500' : 'text-slate-600'}`}>
                    {item.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Connection Line */}
        <div className="absolute bottom-[6.5rem] left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}

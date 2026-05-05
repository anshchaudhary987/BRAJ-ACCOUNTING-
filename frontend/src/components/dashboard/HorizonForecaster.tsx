'use client';

import React, { useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Zap, Orbit } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface HorizonForecasterProps {
  currentBalance?: number;
}

export default function HorizonForecaster({ currentBalance = 1245000 }: HorizonForecasterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Generate months from Oct 2024 to Dec 2064
  const timelineData = useMemo(() => {
    const data = [];
    const startDate = new Date(2024, 9, 1); // Oct 2024
    const endDate = new Date(2030, 11, 31); // Shorter range for better UI
    
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
    <div className="p-10 glass-pro rounded-[3rem] border border-white/5 space-y-8 bg-white/[0.01]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white/5 text-white/40">
            <Orbit size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-white">Equilibrium Projection</h3>
            <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.2em] mt-1">Predictive Analytics • 2024 - 2030</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => scroll('left')}
            className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-white/20 hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-white/20 hover:text-white"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="overflow-x-auto no-scrollbar relative"
      >
        <div className="flex gap-8 items-end min-w-max h-[200px] pb-4">
          {timelineData.map((item, idx) => {
            const isYearStart = item.date.getMonth() === 0;
            const height = Math.max(20, Math.min(100, (item.balance / (currentBalance * 5)) * 100));
            
            return (
              <div key={idx} className="flex flex-col items-center gap-6 group cursor-pointer">
                <div className="relative flex flex-col items-center">
                  {/* Predicted Line Segment */}
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    className={cn(
                      "w-1.5 rounded-full transition-all duration-500",
                      isYearStart ? "bg-white" : "bg-white/10 group-hover:bg-white/40"
                    )}
                  />
                  
                  {/* Tooltip on hover */}
                  <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-all bg-black border border-white/10 p-3 rounded-2xl text-[10px] whitespace-nowrap z-50 shadow-2xl translate-y-2 group-hover:translate-y-0">
                    <p className="font-black uppercase tracking-widest text-white/40 mb-1">{item.label} {item.year}</p>
                    <p className="font-mono font-bold text-white text-sm">{formatCurrency(item.balance)}</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-tighter transition-colors",
                    isYearStart ? "text-white" : "text-white/20"
                  )}>
                    {isYearStart ? item.year : item.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Connection Line */}
        <div className="absolute bottom-12 left-0 right-0 h-px bg-white/5 pointer-events-none" />
      </div>
    </div>
  );
}

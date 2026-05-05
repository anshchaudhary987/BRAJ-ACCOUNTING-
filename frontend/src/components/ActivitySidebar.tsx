'use client';

import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  X, 
  History, 
  FileText, 
  UserPlus, 
  Clock,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useActivityStore } from '@/store/useActivityStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useCompanyStore } from '@/store/useCompanyStore';
import { useHotkeys } from 'react-hotkeys-hook';
import { Voucher, Ledger, ApiResponse } from '@/types';
import Link from 'next/link';
import { cn, formatCurrency } from '@/lib/utils';

type ActivityItem = {
  id: string;
  type: 'voucher' | 'ledger';
  title: string;
  subtitle: string;
  timestamp: Date;
  link: string;
};

function ActivitySidebarComponent() {
  const { isOpen, close, toggle } = useActivityStore();
  const token = useAuthStore(state => state.token);
  const selectedCompany = useCompanyStore(state => state.selectedCompany);

  useHotkeys('ctrl+shift+a', (e) => {
    e.preventDefault();
    toggle();
  });

  // Fetch Vouchers
  const { data: vouchers = [], isLoading: isVouchersLoading } = useQuery({
    queryKey: ['recent-vouchers-activity', selectedCompany?.id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Voucher[]>>('/voucher');
      return res.data.data;
    },
    enabled: isOpen && !!token && !!selectedCompany?.id,
    staleTime: 1000 * 30, // 30 seconds
  });

  // Fetch Ledgers
  const { data: ledgers = [], isLoading: isLedgersLoading } = useQuery({
    queryKey: ['recent-ledgers-activity', selectedCompany?.id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Ledger[]>>('/ledger');
      return res.data.data;
    },
    enabled: isOpen && !!token && !!selectedCompany?.id,
    staleTime: 1000 * 30,
  });

  const activities = useMemo(() => {
    const items: ActivityItem[] = [];

    vouchers.forEach((v) => {
      items.push({
        id: v.id,
        type: 'voucher',
        title: `${v.vchType} Voucher`,
        subtitle: `Vch No: ${v.vchNo}`,
        timestamp: new Date(v.createdAt || v.date),
        link: `/vouchers/${v.id}`,
      });
    });

    ledgers.forEach((l) => {
      items.push({
        id: l.id,
        type: 'ledger',
        title: `Ledger Added`,
        subtitle: l.name,
        timestamp: new Date(l.createdAt || new Date()),
        link: `/ledgers/${l.id}`,
      });
    });

    return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 15);
  }, [vouchers, ledgers]);

  const isLoading = isVouchersLoading || isLedgersLoading;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] no-print"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 150 }}
            className="fixed top-0 right-0 h-full w-full max-w-md glass-premium z-[101] border-l border-border shadow-2xl flex flex-col no-print"
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
                  <History size={20} />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Audit Timeline</h2>
              </div>
              <button 
                onClick={close}
                className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-40 space-y-4">
                  <Loader2 className="animate-spin text-violet-500" size={32} />
                  <p className="text-sm text-muted-foreground font-medium animate-pulse">Syncing audit logs...</p>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto opacity-20">
                    <Clock size={32} />
                  </div>
                  <p className="text-muted-foreground italic">No recent activity found</p>
                </div>
              ) : (
                <div className="relative space-y-8 before:absolute before:left-6 before:top-2 before:bottom-2 before:w-px before:bg-border/50 before:dashed">
                  {activities.map((item, index) => (
                    <motion.div
                      key={`${item.type}-${item.id}-${index}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative pl-12 group"
                    >
                      {/* Timeline Dot/Icon */}
                      <div className="absolute left-0 top-1 w-12 h-12 flex items-center justify-center">
                        <div className={cn(
                          "w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-all group-hover:scale-110",
                          item.type === 'voucher' 
                            ? "bg-violet-600 text-white" 
                            : "bg-emerald-600 text-white"
                        )}>
                          {item.type === 'voucher' ? <FileText size={18} /> : <UserPlus size={18} />}
                        </div>
                      </div>

                      {/* Content Card */}
                      <Link 
                        href={item.link} 
                        onClick={close}
                        className="block p-4 rounded-2xl bg-muted/20 border border-transparent hover:border-violet-500/30 hover:bg-muted/40 transition-all"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium flex items-center justify-between">
                          {item.subtitle}
                          <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </p>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border bg-muted/10 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                Ctrl + Shift + A to toggle
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default React.memo(ActivitySidebarComponent);

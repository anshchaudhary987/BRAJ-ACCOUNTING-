'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Book, 
  Home, 
  BarChart, 
  Moon, 
  Sun, 
  History, 
  Settings,
  X,
  Command
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { useActivityStore } from '@/store/useActivityStore';
import { useLedgers } from '@/hooks/useLedgers';
import { cn } from '@/lib/utils';

function CommandPaletteComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const router = useRouter();
  const { theme, toggleTheme } = useThemeStore();
  const { toggle: toggleActivity } = useActivityStore();
  const { data: ledgers = [] } = useLedgers();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const actions = useMemo(() => {
    const baseActions = [
      { id: 'home', name: 'Go to Dashboard', icon: Home, section: 'Navigation', perform: () => router.push('/') },
      { id: 'vouchers', name: 'Create New Voucher', icon: Plus, section: 'Navigation', perform: () => router.push('/vouchers/new') },
      { id: 'ledgers', name: 'View Ledgers', icon: Book, section: 'Navigation', perform: () => router.push('/ledgers') },
      { id: 'reports', name: 'Trial Balance', icon: BarChart, section: 'Reports', perform: () => router.push('/reports/trial-balance') },
      { id: 'theme', name: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, icon: theme === 'dark' ? Sun : Moon, section: 'Appearance', perform: toggleTheme },
      { id: 'activity', name: 'Toggle Activity Sidebar', icon: History, section: 'Appearance', perform: toggleActivity },
    ];

    const ledgerActions = ledgers.map(l => ({
      id: `ledger-${l.id}`,
      name: `View Ledger: ${l.name}`,
      icon: Book,
      section: 'Ledgers',
      perform: () => router.push(`/ledgers/${l.id}`)
    }));

    return [...baseActions, ...ledgerActions].filter(action => 
      action.name.toLowerCase().includes(query.toLowerCase()) || 
      action.section.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8);
  }, [query, ledgers, theme, router, toggleTheme, toggleActivity]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => (i + 1) % actions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => (i - 1 + actions.length) % actions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (actions[selectedIndex]) {
        actions[selectedIndex].perform();
        setIsOpen(false);
        setQuery('');
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] no-print"
          />
          <div className="fixed inset-0 z-[201] flex items-start justify-center pt-[15vh] px-4 pointer-events-none no-print">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              className="w-full max-w-xl glass-premium rounded-[2rem] border-violet-500/20 shadow-2xl overflow-hidden pointer-events-auto"
              onKeyDown={handleKeyDown}
            >
              <div className="p-4 border-b border-white/10 flex items-center gap-3">
                <Search size={20} className="text-violet-400" />
                <input
                  autoFocus
                  placeholder="Type a command or search for a ledger..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground font-medium py-2"
                />
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted text-[10px] font-bold text-muted-foreground uppercase border border-border">
                  <span className="text-xs">esc</span>
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
                {actions.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground italic">
                    No results found for "{query}"
                  </div>
                ) : (
                  <div className="space-y-1">
                    {actions.map((action, index) => {
                      const isSelected = index === selectedIndex;
                      return (
                        <button
                          key={action.id}
                          onClick={() => {
                            action.perform();
                            setIsOpen(false);
                            setQuery('');
                          }}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={cn(
                            "w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all text-left group",
                            isSelected ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20" : "hover:bg-white/5"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-xl transition-colors",
                              isSelected ? "bg-white/20 text-white" : "bg-muted text-violet-400 group-hover:bg-violet-500/10"
                            )}>
                              <action.icon size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold leading-none">{action.name}</p>
                              <p className={cn(
                                "text-[10px] mt-1 font-medium",
                                isSelected ? "text-violet-200" : "text-muted-foreground"
                              )}>{action.section}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-violet-200">
                              <span>Enter</span>
                              <Command size={10} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-white/10 bg-white/2 flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1"><span className="px-1.5 py-0.5 rounded border border-border bg-muted">↑↓</span> to navigate</span>
                  <span className="flex items-center gap-1"><span className="px-1.5 py-0.5 rounded border border-border bg-muted">↵</span> to select</span>
                </div>
                <div className="flex items-center gap-1">
                  <Command size={12} />
                  <span>K Palette</span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default React.memo(CommandPaletteComponent);

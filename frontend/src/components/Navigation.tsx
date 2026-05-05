'use client';

import React, { memo, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCompanyStore } from '@/store/useCompanyStore';
import { 
  LayoutDashboard, 
  BookOpen, 
  PlusSquare, 
  BarChart3, 
  Settings,
  Building2,
  ChevronDown,
  History,
  Package,
  Users,
  LogOut,
  User
} from 'lucide-react';
import { useActivityStore } from '@/store/useActivityStore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import Logo3D from './Logo3D';
import { useAuthStore } from '@/store/useAuthStore';
import ThemeToggle from './ui/ThemeToggle';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Ledgers', href: '/ledgers', icon: BookOpen },
  { name: 'Vouchers', href: '/vouchers', icon: PlusSquare },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Reports', href: '/reports/trial-balance', icon: BarChart3 },
];

const Navigation = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { selectedCompany } = useCompanyStore();
  const { logout, user } = useAuthStore();
  const settingsRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (pathname === '/login' || pathname === '/signup') return null;

  return (
    <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-7xl px-4 pointer-events-none">
      <div className="glass-pro rounded-[2rem] border border-white/5 h-20 flex items-center justify-between px-8 pointer-events-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Logo3D />
          <span className="font-bold text-xl tracking-tighter text-white ml-1">Braj Quantum</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2 bg-white/5 p-1.5 rounded-full border border-white/5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-semibold transition-all relative flex items-center gap-2",
                  isActive 
                    ? "text-black" 
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-white rounded-full -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon size={16} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Action Bar */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {selectedCompany ? (
                <button className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                  <Building2 size={16} className="text-white/60" />
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold leading-none text-white">{selectedCompany.name}</p>
                    <p className="text-[10px] text-white/40">{selectedCompany.state}</p>
                  </div>
                  <ChevronDown size={14} className="text-white/20" />
                </button>
              ) : (
                <Link 
                  href="/company/setup"
                  className="text-xs font-black px-6 py-3 rounded-full bg-white text-black hover:scale-105 transition-all active:scale-95"
                >
                  Select Company
                </Link>
              )}
              
              <div className="w-[1px] h-8 bg-white/10 mx-2" />

              <button 
                onClick={() => useActivityStore.getState().toggle()}
                className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all relative"
                title="History"
              >
                <History size={18} className="text-white/60" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-white rounded-full border-2 border-black" />
              </button>
              
              <ThemeToggle />
              
              <Link 
                href="/users"
                className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
                title="Users"
              >
                <Users size={18} className="text-white/60" />
              </Link>

              <div className="relative" ref={settingsRef}>
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={cn(
                    "p-3 rounded-2xl border transition-all",
                    isMenuOpen 
                      ? "bg-white text-black border-white" 
                      : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  )}
                  title="Settings & Account"
                >
                  <Settings size={18} />
                </button>

                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-64 glass-premium rounded-[2rem] border border-white/10 p-2 shadow-2xl overflow-hidden pointer-events-auto"
                    >
                      <div className="px-4 py-3 border-b border-white/5 mb-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">Authenticated as</p>
                        <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                        <p className="text-[10px] text-white/40 truncate">{user?.email}</p>
                      </div>
                      
                      <Link 
                        href="/users/profile"
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-white/60 hover:text-white group"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User size={16} className="group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold">Profile Settings</span>
                      </Link>

                      <button 
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-red-500/10 transition-all text-white/60 hover:text-red-400 group"
                      >
                        <LogOut size={16} className="group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold">Logout Session</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link 
                href="/login"
                className="text-xs font-black px-8 py-3 rounded-full bg-white text-black hover:scale-105 transition-all active:scale-95"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
});

Navigation.displayName = 'Navigation';
export default Navigation;

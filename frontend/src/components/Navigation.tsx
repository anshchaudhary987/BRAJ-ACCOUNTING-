'use client';

import { memo } from 'react';

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
  History
} from 'lucide-react';
import { useActivityStore } from '@/store/useActivityStore';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

import Logo3D from './Logo3D';
import ThemeToggle from './ui/ThemeToggle';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Ledgers', href: '/ledgers', icon: BookOpen },
  { name: 'New Voucher', href: '/vouchers/new', icon: PlusSquare },
  { name: 'Reports', href: '/reports/trial-balance', icon: BarChart3 },
];

const Navigation = memo(() => {
  const pathname = usePathname();
  const { selectedCompany } = useCompanyStore();

  return (
    <header className="sticky top-0 z-50 w-full glass-premium border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Logo3D />
          <span className="font-bold text-lg tracking-tight text-gradient ml-2">Braj Accounting</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all relative flex items-center gap-2",
                  isActive 
                    ? "text-white" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-violet-600 rounded-full -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon size={16} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Company Selector */}
        <div className="flex items-center gap-4">
          {selectedCompany ? (
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border hover:bg-muted/80 transition-colors">
              <Building2 size={16} className="text-violet-400" />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold leading-none text-foreground">{selectedCompany.name}</p>
                <p className="text-[10px] text-muted-foreground">{selectedCompany.state}</p>
              </div>
              <ChevronDown size={14} className="text-muted-foreground" />
            </button>
          ) : (
            <Link 
              href="/company/setup"
              className="text-xs font-bold px-4 py-2 rounded-full bg-violet-600 text-white hover:bg-violet-700 transition-colors"
            >
              Select Company
            </Link>
          )}
          
          <button 
            onClick={() => useActivityStore.getState().toggle()}
            className="p-2 rounded-xl glass-premium border-border hover:border-violet-500/50 hover:bg-muted transition-all relative"
            title="Activity Log (Ctrl+Shift+A)"
          >
            <History size={18} className="text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full border-2 border-background" />
          </button>
          
          <ThemeToggle />
          
          <button className="p-2 rounded-xl glass-premium border-border hover:border-violet-500/50 hover:bg-muted transition-all">
            <Settings size={18} className="text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
});

Navigation.displayName = 'Navigation';
export default Navigation;

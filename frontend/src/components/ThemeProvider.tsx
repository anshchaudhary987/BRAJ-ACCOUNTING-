'use client';

import { useEffect, useState } from 'react';
import { useThemeStore } from '@/store/useThemeStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Sync with DOM
  useEffect(() => {
    setMounted(true);
    const root = window.document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Handle keyboard shortcut
  useHotkeys('ctrl+shift+t', (e) => {
    e.preventDefault();
    handleToggle();
  });

  const handleToggle = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      toggleTheme();
    }, 150);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 600);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <>
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] pointer-events-none bg-background backdrop-blur-md"
          />
        )}
      </AnimatePresence>
      {children}
    </>
  );
}

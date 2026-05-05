'use client';

import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingScreen = memo(() => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem('bql-loaded')) {
      setIsLoading(false);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 100);

    const timer = setTimeout(() => {
      setIsLoading(false);
      sessionStorage.setItem('bql-loaded', '1');
    }, 1800);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center"
        >
          {/* Pulsing core */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center mb-16"
          >
            <div className="w-6 h-6 rounded-full bg-white" />
          </motion.div>

          {/* Text */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40 mb-8"
          >
            Initializing Quantum Ledger
          </motion.p>

          {/* Progress bar */}
          <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white/60 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Version */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-[9px] font-black uppercase tracking-[0.8em] text-white/15"
          >
            BQL v2.0.0
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

LoadingScreen.displayName = 'LoadingScreen';
export default LoadingScreen;

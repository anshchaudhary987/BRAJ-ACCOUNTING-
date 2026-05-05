'use client';

import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { X } from 'lucide-react';

const shortcuts = [
  { keys: ['Ctrl', 'K'], description: 'Command Palette' },
  { keys: ['Ctrl', 'Shift', 'T'], description: 'Toggle Theme' },
  { keys: ['Ctrl', 'Shift', 'A'], description: 'Activity Log' },
  { keys: ['?'], description: 'Keyboard Shortcuts' },
  { keys: ['G', 'D'], description: 'Go to Dashboard' },
  { keys: ['G', 'L'], description: 'Go to Ledgers' },
  { keys: ['G', 'V'], description: 'Go to New Voucher' },
  { keys: ['G', 'R'], description: 'Go to Reports' },
  { keys: ['Esc'], description: 'Close Modal / Panel' },
];

const KeyboardShortcuts = memo(() => {
  const [open, setOpen] = useState(false);

  useHotkeys('shift+/', (e) => {
    e.preventDefault();
    setOpen((prev) => !prev);
  });

  useHotkeys('escape', () => setOpen(false), { enabled: open });

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9991] w-full max-w-lg"
          >
            <div className="glass-pro rounded-3xl border border-white/10 p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-bold tracking-tight">Keyboard Shortcuts</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X size={18} className="text-white/40" />
                </button>
              </div>

              <div className="space-y-3">
                {shortcuts.map((shortcut, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 px-4 rounded-xl hover:bg-white/5 transition-colors">
                    <span className="text-sm text-white/60">{shortcut.description}</span>
                    <div className="flex items-center gap-1.5">
                      {shortcut.keys.map((key, j) => (
                        <span key={j}>
                          <kbd className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-[11px] font-mono font-bold text-white/70">
                            {key}
                          </kbd>
                          {j < shortcut.keys.length - 1 && (
                            <span className="text-white/20 mx-0.5 text-xs">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-center text-[10px] text-white/20 uppercase tracking-[0.3em] font-black">
                Press ? to toggle
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

KeyboardShortcuts.displayName = 'KeyboardShortcuts';
export default KeyboardShortcuts;

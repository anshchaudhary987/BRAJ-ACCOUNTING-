'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, ShieldAlert, Cpu } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class QuantumBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Quantum State Collapse:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-12 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mb-12 relative"
          >
            <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full animate-pulse" />
            <ShieldAlert size={48} className="text-white/20 relative z-10" />
          </motion.div>

          <h1 className="text-5xl font-bold tracking-tighter text-white mb-6">Quantum State Collapse.</h1>
          <p className="text-white/40 text-xl font-medium max-w-md mx-auto mb-12">
            The architectural integrity of this component has been compromised. A recursive stabilization is required.
          </p>

          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl mb-12 text-left max-w-2xl w-full overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <Cpu size={16} className="text-white/20" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Error Log Entry</span>
            </div>
            <code className="text-xs text-red-400/80 font-mono break-all leading-relaxed">
              {this.state.error?.message || 'Undefined Exception'}
            </code>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="px-12 py-6 rounded-full bg-white text-black font-black text-lg hover:scale-105 transition-all active:scale-95 flex items-center gap-3 shadow-[0_20px_50px_rgba(255,255,255,0.1)] mx-auto"
          >
            <RefreshCw size={24} strokeWidth={3} />
            Stabilize Ecosystem
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

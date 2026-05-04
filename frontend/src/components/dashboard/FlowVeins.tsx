'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function FlowVeins() {
  return (
    <div className="w-full h-32 relative overflow-hidden pointer-events-none opacity-40">
      <svg className="w-full h-full" viewBox="0 0 1000 100" preserveAspectRatio="none">
        {/* Vein 1 */}
        <motion.path
          d="M0 50 Q 250 10, 500 50 T 1000 50"
          stroke="url(#grad-cyan)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        {/* Vein 2 */}
        <motion.path
          d="M0 70 Q 250 90, 500 70 T 1000 70"
          stroke="url(#grad-purple)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1 }}
        />
        {/* Particles */}
        {[...Array(5)].map((_, i) => (
          <motion.circle
            key={i}
            r="2"
            fill="#22d3ee"
            initial={{ offsetDistance: "0%" }}
            animate={{ offsetDistance: "100%" }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: i * 0.6 }}
            style={{ offsetPath: "path('M0 50 Q 250 10, 500 50 T 1000 50')" }}
          />
        ))}

        <defs>
          <linearGradient id="grad-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="grad-purple" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

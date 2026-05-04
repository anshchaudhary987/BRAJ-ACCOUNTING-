'use client';

import { motion } from 'framer-motion';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Welcome & Stats Skeleton */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 h-64 glass-premium rounded-3xl bg-white/5" />
        <div className="h-64 glass-premium rounded-3xl bg-white/5" />
      </section>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <section className="lg:col-span-3 space-y-6">
          <div className="h-8 w-48 bg-white/5 rounded-lg" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 glass-premium rounded-2xl bg-white/5" />
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="h-8 w-32 bg-white/5 rounded-lg" />
          <div className="h-[300px] glass-premium rounded-3xl bg-white/5 border-dashed border-white/10" />
        </section>
      </div>
    </div>
  );
}

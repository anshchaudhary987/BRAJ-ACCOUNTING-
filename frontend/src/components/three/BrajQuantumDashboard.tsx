'use client';

import * as THREE from 'three';
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import QuantumCore from './QuantumCore';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Activity, LayoutGrid, Zap, ShieldCheck, ChevronRight } from 'lucide-react';

function StatCard({ title, value, icon: Icon, className = "" }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`glass-apple p-10 rounded-[3rem] border-white/5 flex flex-col justify-between group cursor-pointer hover:border-white/20 transition-all duration-500 ${className}`}
    >
      <div className="flex justify-between items-start">
        <div className="p-4 rounded-[1.2rem] bg-white/5 border border-white/10 text-white group-hover:scale-110 transition-transform duration-500">
          <Icon size={24} />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Live Data</span>
        </div>
      </div>
      <div>
        <p className="text-white/40 text-sm font-semibold mb-2 uppercase tracking-widest">{title}</p>
        <p className="text-5xl font-bold text-white tracking-tighter leading-none">{value}</p>
      </div>
    </motion.div>
  );
}

export default function BrajQuantumDashboard() {
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/reports/dashboard-stats');
      return res.data.data;
    }
  });

  const displayStats = dashboardData || {
    totalRevenue: 0,
    totalAssets: 0,
    cashBalance: 0,
    anomalyCount: 0
  };

  return (
    <div className="w-full h-screen bg-[#000] relative overflow-hidden font-sans selection:bg-white selection:text-black">
      
      {/* 3D Scene - Pure Apple Minimalist Background */}
      <div className="absolute inset-0 z-0">
        <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
          <PerspectiveCamera makeDefault position={[0, 0, 18]} fov={35} />
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            rotateSpeed={0.4}
            autoRotate
            autoRotateSpeed={0.15}
          />

          <Suspense fallback={null}>
            <Environment preset="studio" />
            <QuantumCore />
            <ContactShadows 
              position={[0, -8, 0]} 
              opacity={0.3} 
              scale={30} 
              blur={3} 
              far={15} 
              color="#000000" 
            />
          </Suspense>

          <ambientLight intensity={0.1} />
          <spotLight position={[15, 20, 15]} angle={0.2} penumbra={1} intensity={2} color="#ffffff" castShadow />
          <pointLight position={[-15, -15, -15]} intensity={1} color="#0066cc" />
        </Canvas>
      </div>

      {/* 2D Overlay (HUD) - Apple Aesthetic */}
      <div className="relative z-10 w-full h-full p-12 flex flex-col justify-between pointer-events-none">
        
        {/* Top Header */}
        <div className="flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black shadow-2xl shadow-white/20">
                <Zap size={20} fill="currentColor" />
              </div>
              <span className="text-white font-bold tracking-tight text-xl">BRAJ QUANTUM</span>
            </div>
            <div className="h-4 w-px bg-white/20" />
            <span className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase">V 4.0.2</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 pointer-events-auto"
          >
            <button className="px-8 py-3 rounded-full bg-white text-black text-sm font-bold hover:scale-105 transition-all active:scale-95 shadow-xl shadow-white/10">
              Enter Ledger
            </button>
            <button className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-white/10 transition-all backdrop-blur-xl group">
              Explore <ChevronRight size={16} className="inline ml-1 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>

        {/* Center Text - Huge Impact */}
        <div className="flex-1 flex flex-col justify-center items-center text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <h1 className="text-[10rem] font-bold text-white tracking-tighter leading-[0.75] filter drop-shadow-2xl">
              Spatial<br/><span className="text-white/20">Intelligence.</span>
            </h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-white/40 text-2xl font-medium tracking-tight max-w-xl mx-auto"
            >
              Experience your financial ecosystem in a whole new dimension. Pure performance, reimagined.
            </motion.p>
          </motion.div>
        </div>

        {/* Bottom Bento Grid */}
        <div className="grid grid-cols-4 gap-8 pointer-events-auto max-w-[1600px] mx-auto w-full pb-8">
          <StatCard 
            title="Total Revenue" 
            value={formatCurrency(displayStats.totalRevenue)} 
            icon={Activity}
          />
          <StatCard 
            title="Total Assets" 
            value={formatCurrency(displayStats.totalAssets)} 
            icon={LayoutGrid}
          />
          <StatCard 
            title="Integrity Index" 
            value="99.9%" 
            icon={ShieldCheck}
          />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-apple p-10 rounded-[3rem] border-white/10 bg-white text-black flex flex-col justify-between group cursor-pointer shadow-2xl shadow-white/5"
          >
            <div className="flex justify-between items-start">
               <p className="text-black/40 text-[10px] font-bold uppercase tracking-[0.2em]">Quantum Engine</p>
               <Zap size={24} fill="currentColor" className="text-black" />
            </div>
            <div>
              <p className="text-sm font-semibold mb-2 uppercase tracking-widest text-black/60">Processing Power</p>
              <p className="text-5xl font-bold tracking-tighter leading-none">1.2 P/s</p>
            </div>
          </motion.div>
        </div>

      </div>

      {/* Premium Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] z-50 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px] mix-blend-overlay" />
    </div>
  );
}



'use client';

import React, { useRef, useMemo, memo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import HeroSection from './HeroSection';
import { ShieldCheck, Zap, Globe, Lock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as THREE from 'three';

import TextReveal from '@/components/ui/TextReveal';
import CountUp from '@/components/ui/CountUp';
import TiltCard from '@/components/ui/TiltCard';

// ─── Mobile detection hook ───
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
}

// ─── Intersection-observer gated canvas ───
function LazyCanvas({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: '200px', once: false });
  return (
    <div ref={ref} className={className} style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      {isInView && (
        <Canvas
          dpr={[1, 1.2]}
          gl={{ antialias: false, alpha: true, powerPreference: 'high-performance', stencil: false, depth: true }}
          performance={{ min: 0.5 }}
          camera={{ position: [0, 0, 8], fov: 40 }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <ambientLight intensity={0.1} />
          {children}
        </Canvas>
      )}
    </div>
  );
}

// ─── Floating 3D Toroid ───
const FloatingToroid = memo(({ color = '#ffffff', opacity = 0.06, speed = 0.1 }: any) => {
  const mesh = useRef<THREE.Mesh>(null!);
  useFrame((s) => {
    const t = s.clock.getElapsedTime();
    mesh.current.rotation.x = t * speed;
    mesh.current.rotation.y = t * speed * 0.7;
  });
  return (
    <Float speed={1} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={mesh}>
        <torusGeometry args={[2.5, 0.6, 16, 64]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={opacity} />
      </mesh>
    </Float>
  );
});
FloatingToroid.displayName = 'FloatingToroid';

// ─── Dust Particles ───
const DustParticles = memo(({ count = 200 }: { count?: number }) => {
  const ref = useRef<THREE.Points>(null!);
  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count]);

  useFrame((s) => { ref.current.rotation.y = s.clock.getElapsedTime() * 0.02; });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.02} transparent opacity={0.2} color="#888" blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
    </points>
  );
});
DustParticles.displayName = 'DustParticles';

// ─── Interactive Globe ───
const InteractiveGlobe = memo(() => {
  const group = useRef<THREE.Group>(null!);
  const wireframe = useRef<THREE.Mesh>(null!);
  const nodesGeo = useMemo(() => {
    const count = 80;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = 2.2;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = t * 0.08;
    group.current.rotation.x = Math.sin(t * 0.05) * 0.15;
    wireframe.current.rotation.y = -t * 0.04;
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      <mesh ref={wireframe}>
        <sphereGeometry args={[2.2, 24, 24]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.04} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.15, 16, 16]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.02} />
      </mesh>
      <points geometry={nodesGeo}>
        <pointsMaterial size={0.06} transparent opacity={0.6} color="#ffffff" blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
      </points>
    </group>
  );
});
InteractiveGlobe.displayName = 'InteractiveGlobe';

// ─── Magnetic Button ───
const MagneticButton = memo(({ children, className, onClick }: any) => {
  const ref = useRef<HTMLButtonElement>(null);
  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = ref.current!.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.12;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.12;
    ref.current!.style.transform = `translate(${x}px, ${y}px)`;
  };
  const reset = () => { if (ref.current) ref.current.style.transform = 'translate(0, 0)'; };
  return (
    <button ref={ref} onMouseMove={handleMouse} onMouseLeave={reset} className={cn('transition-transform duration-300 ease-out', className)} onClick={onClick}>
      {children}
    </button>
  );
});
MagneticButton.displayName = 'MagneticButton';

// ─── Feature Card with TiltCard + hover glow ───
const FeatureCard = memo(({ icon: Icon, title, description, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as any }}
  >
    <TiltCard className="h-full">
      <div className="glass-pro p-8 sm:p-12 md:p-14 rounded-[2rem] sm:rounded-[3rem] border border-white/5 flex flex-col gap-6 sm:gap-8 group hover:border-white/20 transition-all duration-700 bg-gradient-to-br from-white/[0.04] to-transparent shadow-2xl relative overflow-hidden will-change-auto h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white/30 group-hover:text-white group-hover:border-white/30 transition-all duration-500">
          <Icon size={28} className="sm:hidden" />
          <Icon size={36} className="hidden sm:block" />
        </div>
        <div className="space-y-3 relative z-10">
          <h3 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">{title}</h3>
          <p className="text-white/35 text-base sm:text-xl leading-relaxed font-medium">{description}</p>
        </div>
        <div className="mt-auto pt-6 sm:pt-8 border-t border-white/5 group-hover:border-white/15 flex items-center gap-3 text-white/15 group-hover:text-white transition-all relative z-10">
          <span className="text-xs sm:text-sm font-black uppercase tracking-[0.2em]">Protocol Verified</span>
          <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500" />
        </div>
      </div>
    </TiltCard>
  </motion.div>
));
FeatureCard.displayName = 'FeatureCard';

// ─── Aurora Background ───
const AuroraBackground = memo(() => (
  <div className="aurora-bg">
    <div className="aurora-blob" />
    <div className="aurora-blob" />
    <div className="aurora-blob" />
  </div>
));
AuroraBackground.displayName = 'AuroraBackground';

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Removed auto-redirect to allow users to view the landing page even with stale auth state

  const quoteScale = useTransform(scrollYProgress, [0.4, 0.6], [0.85, 1]);
  const quoteOpacity = useTransform(scrollYProgress, [0.3, 0.5, 0.7], [0, 1, 0.3]);
  const isMobile = useIsMobile();

  return (
    <main className="bg-black text-white min-h-screen selection:bg-white/20 overflow-x-hidden">
      <HeroSection />

      {/* ═══ Stats Section ═══ */}
      <section className="relative z-20 py-24 sm:py-40 md:py-60 border-y border-white/5 bg-black overflow-hidden">
        <AuroraBackground />
        {!isMobile && (
          <div className="absolute inset-0 pointer-events-none">
            <LazyCanvas>
              <FloatingToroid opacity={0.04} speed={0.05} />
              <DustParticles count={100} />
            </LazyCanvas>
          </div>
        )}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.04)_0%,transparent_70%)]" />
        <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16 md:gap-24 relative z-10">
          {[
            { label: 'Network Latency', value: 0.42, suffix: 'ms', prefix: '< ', decimals: 2, sub: 'Real-time Ledger Sync' },
            { label: 'Data Integrity', value: 100, suffix: '%', decimals: 0, sub: 'Verified by Quantum Proofs' },
            { label: 'Security Class', staticVal: 'Vault-V', sub: 'Military-Grade Encryption' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] as any }}
              className="text-center md:text-left group cursor-default"
            >
              <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.5em] text-white/25 mb-4 sm:mb-6 group-hover:text-white/60 transition-colors duration-500">{stat.label}</p>
              <h4 className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tighter text-white mb-3 sm:mb-4">
                {'value' in stat ? (
                  <CountUp target={stat.value!} suffix={stat.suffix} prefix={stat.prefix || ''} decimals={stat.decimals} />
                ) : (
                  <motion.span initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                    {stat.staticVal}
                  </motion.span>
                )}
              </h4>
              <p className="text-white/30 text-sm sm:text-lg font-medium">{stat.sub}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ Architecture Grid ═══ */}
      <section className="relative z-10 max-w-[1600px] mx-auto px-6 py-24 sm:py-40 md:py-80 overflow-hidden">
        {!isMobile && (
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none opacity-30">
            <LazyCanvas>
              <FloatingToroid opacity={0.08} speed={0.08} />
              <DustParticles count={60} />
            </LazyCanvas>
          </div>
        )}

        <div className="flex flex-col xl:flex-row items-start xl:items-end justify-between mb-16 sm:mb-24 md:mb-40 gap-8 sm:gap-16">
          <div className="max-w-4xl">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.6em] text-white/30 mb-6 sm:mb-10 block flex items-center gap-4">
              <span className="w-8 sm:w-12 h-px bg-white/30" />
              The Architecture
            </span>
            <h2 className="text-4xl sm:text-6xl md:text-[9rem] font-bold tracking-tighter leading-[0.85] mb-4 sm:mb-8">
              <TextReveal text="Built for the" mode="word" className="inline" />
              {' '}<span className="text-white/15 italic"><TextReveal text="Elite." mode="letter" delay={0.4} className="inline" /></span>
            </h2>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-white/40 text-lg sm:text-2xl md:text-3xl font-medium max-w-lg leading-snug pb-4 sm:pb-6"
          >
            We don&apos;t just record transactions. We engineer financial absolute truths.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 md:gap-16">
          <FeatureCard icon={Zap} title="Structural Sync" description="Real-time engine ensuring every ledger node achieves perfect equilibrium across all dimensions simultaneously." delay={0.1} />
          <FeatureCard icon={ShieldCheck} title="CA-Verified Logic" description="Statutory compliance baked into our neural network. Automated GST, VAT, and Global Audit Readiness." delay={0.2} />
          <FeatureCard icon={Globe} title="Spatial Topology" description="Navigate your wealth through interactive 3D visualizations. See hidden connections in your capital flow." delay={0.15} />
          <FeatureCard icon={Lock} title="Quantum Vault" description="Financial secrets guarded by atomic-level security. Private, encrypted, and immutable." delay={0.25} />
        </div>
      </section>

      {/* ═══ Cinematic Quote Section ═══ */}
      <section className="relative h-[80vh] sm:h-[100vh] flex flex-col items-center justify-center text-center overflow-hidden bg-black">
        <AuroraBackground />
        {!isMobile && (
          <div className="absolute inset-0 pointer-events-none">
            <LazyCanvas>
              <DustParticles count={150} />
              <FloatingToroid opacity={0.03} speed={0.03} />
            </LazyCanvas>
          </div>
        )}
        <motion.div style={{ scale: quoteScale, opacity: quoteOpacity }} className="absolute inset-0 z-[1] pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] rounded-full bg-white/5 blur-[100px] sm:blur-[150px]" />
        </motion.div>

        <div className="relative z-10 px-6 w-full">
          <h2 className="text-4xl sm:text-6xl md:text-[10rem] xl:text-[12rem] font-bold tracking-tighter leading-[0.8] mb-8 sm:mb-16 mix-blend-difference">
            <TextReveal text="THE END OF" mode="word" as="span" className="block" />
            <span className="text-white/15"><TextReveal text="GRID VIEW." mode="letter" delay={0.3} as="span" /></span>
          </h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] as any }}
            className="flex justify-center max-w-2xl mx-auto origin-center"
          >
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* ═══ Final CTA with Globe ═══ */}
      <section className="max-w-[1600px] mx-auto px-6 py-24 sm:py-40 md:py-80 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as any }}
          className="glass-pro p-10 sm:p-16 md:p-40 rounded-[2rem] sm:rounded-[4rem] md:rounded-[6rem] border border-white/10 relative overflow-hidden bg-gradient-to-b from-white/[0.06] to-black shadow-[0_0_100px_rgba(255,255,255,0.04)]"
        >
          <div className="absolute inset-0 pointer-events-none">
            <LazyCanvas>
              {isMobile ? <DustParticles count={50} /> : <InteractiveGlobe />}
            </LazyCanvas>
          </div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          <h2 className="text-3xl sm:text-5xl md:text-[8rem] font-bold tracking-tighter mb-6 sm:mb-10 md:mb-16 leading-none relative z-10">
            <TextReveal text="Initialize your future." mode="word" />
          </h2>
          <p className="text-base sm:text-xl md:text-3xl text-white/30 mb-10 sm:mb-16 md:mb-24 max-w-3xl mx-auto leading-relaxed relative z-10">
            The transition to Spatial Finance has begun. Secure your seat in the first generation of Quantum Ledger users.
          </p>

          <div className="flex flex-col md:flex-row gap-6 sm:gap-8 justify-center relative z-10">
            <Link href={isAuthenticated ? "/dashboard" : "/login"}>
              <MagneticButton className="group relative px-10 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 rounded-full bg-white text-black font-black text-lg sm:text-xl md:text-3xl overflow-hidden shadow-[0_0_80px_rgba(255,255,255,0.3)] hover:shadow-[0_0_150px_rgba(255,255,255,0.5)] transition-shadow duration-700">
                <span className="relative z-10 tracking-tight">{isAuthenticated ? 'ENTER DASHBOARD' : 'INITIALIZE SESSION'}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </MagneticButton>
            </Link>
            <Link href="/signup">
              <MagneticButton className="group relative px-10 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 rounded-full glass-pro border border-white/10 text-white font-black text-lg sm:text-xl md:text-3xl overflow-hidden hover:bg-white/5 transition-all">
                <span className="relative z-10 tracking-tight">CREATE IDENTITY</span>
              </MagneticButton>
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="py-16 sm:py-32 md:py-60 text-center border-t border-white/5 relative z-10 bg-black">
        <div className="flex flex-col items-center gap-8 sm:gap-12 md:gap-16">
          <div className="flex items-center gap-4 sm:gap-8 md:gap-12 opacity-30 hover:opacity-100 transition-opacity duration-500">
            {['Privacy', 'Terms', 'Security'].map((item, i) => (
              <React.Fragment key={item}>
                {i > 0 && <span className="w-1 h-1 rounded-full bg-white/20" />}
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] cursor-pointer hover:text-white transition-colors">{item}</span>
              </React.Fragment>
            ))}
          </div>
          <p className="text-white/15 font-black tracking-[0.3em] sm:tracking-[0.6em] uppercase text-[9px] sm:text-xs px-4">
            Braj Quantum Ledger &bull; Institutional Financial Architecture &bull; 2026
          </p>
        </div>
      </footer>
    </main>
  );
}

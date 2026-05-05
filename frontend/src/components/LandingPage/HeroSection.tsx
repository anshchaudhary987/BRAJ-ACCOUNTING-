'use client';

import React, { useRef, useMemo, memo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Float, MeshDistortMaterial, Text } from '@react-three/drei';
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion';
import Link from 'next/link';
import * as THREE from 'three';
import { useAuthStore } from '@/store/useAuthStore';

// ─── Mouse tracker ───
function useMousePosition() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(y, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      x.set((e.clientX / window.innerWidth) * 2 - 1);
      y.set(-(e.clientY / window.innerHeight) * 2 + 1);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [x, y]);

  return { x: smoothX, y: smoothY };
}

// ─── Scroll-linked camera ───
const ScrollCamera = memo(({ containerRef }: { containerRef: React.RefObject<HTMLElement | null> }) => {
  const { camera } = useThree();
  const scrollRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / rect.height));
      scrollRef.current = progress;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [containerRef]);

  useFrame(() => {
    const p = scrollRef.current;
    camera.position.z = 18 + p * 8;
    camera.position.y = p * 4;
    (camera as THREE.PerspectiveCamera).fov = 35 + p * 15;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  });

  return null;
});
ScrollCamera.displayName = 'ScrollCamera';

// ─── Orbital Ring ───
const OrbitalRing = memo(({ radius, speed, tilt, opacity }: {
  radius: number; speed: number; tilt: number; opacity: number;
}) => {
  const ref = useRef<THREE.Line>(null!);
  const geometry = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [radius]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ref.current.rotation.x = tilt;
    ref.current.rotation.y = t * speed;
    ref.current.rotation.z = Math.sin(t * speed * 0.5) * 0.1;
  });

  return (
    <line ref={ref} geometry={geometry}>
      <lineBasicMaterial color="#ffffff" transparent opacity={opacity} depthWrite={false} />
    </line>
  );
});
OrbitalRing.displayName = 'OrbitalRing';

// ─── Morphing Core ───
const MorphingCore = memo(() => {
  const mesh = useRef<THREE.Mesh>(null!);
  const innerMesh = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.y = t * 0.1;
    mesh.current.rotation.x = Math.sin(t * 0.07) * 0.2;
    innerMesh.current.rotation.y = -t * 0.15;
    innerMesh.current.rotation.z = t * 0.08;
    const breathe = 1 + Math.sin(t * 0.5) * 0.04;
    mesh.current.scale.setScalar(breathe);
  });

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.6}>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[3.2, 16]} />
        <MeshDistortMaterial
          color="#ffffff" metalness={0.4} roughness={0.05}
          transparent opacity={0.08} clearcoat={1} clearcoatRoughness={0.02}
          distort={0.25} speed={1.5} side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={innerMesh}>
        <icosahedronGeometry args={[2.4, 1]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.06} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
      </mesh>
    </Float>
  );
});
MorphingCore.displayName = 'MorphingCore';

// ─── 3D Floating Text ───
const FloatingText = memo(() => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(t * 0.05) * 0.1;
    groupRef.current.position.y = Math.sin(t * 0.3) * 0.2;
  });

  return (
    <group ref={groupRef} position={[0, 0, -6]}>
      <Text
        fontSize={3.5} letterSpacing={0.15} color="#ffffff"
        anchorX="center" anchorY="middle"
        fillOpacity={0.03}
      >
        BQL
      </Text>
      <Text
        fontSize={1} letterSpacing={0.4} color="#ffffff"
        anchorX="center" anchorY="middle" position={[0, -2.5, 0]}
        fillOpacity={0.02}
      >
        QUANTUM LEDGER
      </Text>
    </group>
  );
});
FloatingText.displayName = 'FloatingText';

// ─── Vortex Particles ───
const VortexParticles = memo(() => {
  const points = useRef<THREE.Points>(null!);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const count = isMobile ? 300 : 800;

  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 30;
      const radius = 1.5 + Math.pow(i / count, 0.6) * 10;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geo;
  }, [count]);

  useFrame((state) => {
    points.current.rotation.y = state.clock.getElapsedTime() * 0.06;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial size={0.025} transparent opacity={0.3} color="#aaaaaa"
        blending={THREE.AdditiveBlending} sizeAttenuation depthWrite={false} />
    </points>
  );
});
VortexParticles.displayName = 'VortexParticles';

// ─── Mouse-reactive light ───
const ReactiveLight = memo(() => {
  const light = useRef<THREE.PointLight>(null!);
  useFrame((state) => {
    light.current.position.x = state.pointer.x * 8;
    light.current.position.y = state.pointer.y * 5 + 3;
  });
  return <pointLight ref={light} color="#ffffff" intensity={1.2} distance={20} />;
});
ReactiveLight.displayName = 'ReactiveLight';

// ─── Data Nodes ───
const DataNodes = memo(() => {
  const group = useRef<THREE.Group>(null!);
  const nodes = useMemo(() => {
    const items: { angle: number; radius: number; y: number; speed: number; size: number }[] = [];
    for (let i = 0; i < 20; i++) {
      items.push({
        angle: (i / 20) * Math.PI * 2,
        radius: 5 + Math.random() * 3,
        y: (Math.random() - 0.5) * 6,
        speed: 0.1 + Math.random() * 0.15,
        size: 0.04 + Math.random() * 0.06,
      });
    }
    return items;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.children.forEach((child, i) => {
      const node = nodes[i];
      child.position.x = Math.cos(node.angle + t * node.speed) * node.radius;
      child.position.z = Math.sin(node.angle + t * node.speed) * node.radius;
      child.position.y = node.y + Math.sin(t * 0.5 + i) * 0.5;
    });
  });

  return (
    <group ref={group}>
      {nodes.map((node, i) => (
        <mesh key={i}>
          <boxGeometry args={[node.size, node.size, node.size]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
});
DataNodes.displayName = 'DataNodes';

// ─── Full scene ───
const HeroScene = memo(({ containerRef }: { containerRef: React.RefObject<HTMLElement | null> }) => (
  <>
    <PerspectiveCamera makeDefault position={[0, 0, 18]} fov={35} />
    <ScrollCamera containerRef={containerRef} />
    <ambientLight intensity={0.08} />
    <spotLight position={[15, 15, 15]} angle={0.3} penumbra={1} intensity={1.5} />
    <pointLight position={[-15, -10, -15]} color="#ffffff" intensity={0.5} />
    <ReactiveLight />
    <MorphingCore />
    <FloatingText />
    <VortexParticles />
    <DataNodes />
    <OrbitalRing radius={5.5} speed={0.12} tilt={1.2} opacity={0.06} />
    <OrbitalRing radius={7} speed={-0.08} tilt={0.8} opacity={0.04} />
    <OrbitalRing radius={9} speed={0.05} tilt={1.5} opacity={0.03} />
  </>
));
HeroScene.displayName = 'HeroScene';

// ─── Stagger animation ───
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 60, filter: 'blur(10px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function HeroSection() {
  const { isAuthenticated } = useAuthStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse = useMousePosition();
  const textX = useTransform(mouse.x, [-1, 1], [-15, 15]);
  const textY = useTransform(mouse.y, [-1, 1], [15, -15]);
  const badgeX = useTransform(mouse.x, [-1, 1], [-8, 8]);
  const badgeY = useTransform(mouse.y, [-1, 1], [8, -8]);

  return (
    <section ref={containerRef} className="relative h-[120vh] w-full flex items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <Canvas
          dpr={[1, 1.5]}
          gl={{ antialias: false, alpha: true, powerPreference: 'high-performance', stencil: false, depth: true }}
          performance={{ min: 0.5 }}
        >
          <HeroScene containerRef={containerRef} />
        </Canvas>
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.85)_100%)]" />

      {/* Scan lines */}
      <div className="absolute inset-0 z-[2] pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)' }}
      />

      {/* Content */}
      <motion.div style={{ x: textX, y: textY }} className="relative z-20 text-center max-w-7xl px-6 pointer-events-none mt-[-8vh]">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants} className="flex justify-center mb-12">
            <motion.span style={{ x: badgeX, y: badgeY }}
              className="px-6 py-2.5 rounded-full glass-pro border border-white/20 text-[10px] font-black uppercase tracking-[0.5em] text-white/60 shadow-[0_0_40px_rgba(255,255,255,0.08)]"
            >
              ◆ Structural Financial Intelligence
            </motion.span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-7xl sm:text-[9rem] md:text-[11rem] xl:text-[14rem] font-bold tracking-tighter leading-[0.75] mb-8">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/20">BRAJ</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white/30 to-white/5 italic">QUANTUM</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-white/30 text-base sm:text-lg md:text-2xl font-medium max-w-2xl mx-auto tracking-wide mb-12 md:mb-16">
            The world&#39;s most advanced monochromatic accounting ecosystem for institutional-grade financial oversight.
          </motion.p>

          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-6 md:gap-12 max-w-3xl mx-auto mb-14 md:mb-20 opacity-60">
            {[
              { label: 'Latency', value: '0.42ms' },
              { label: 'Integrity', value: 'Verified' },
              { label: 'Security', value: 'Vault-V' },
            ].map((stat) => (
              <div key={stat.label} className="text-center group cursor-default">
                <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.5em] mb-2 text-white/40 group-hover:text-white transition-colors duration-500">{stat.label}</p>
                <p className="text-lg md:text-2xl font-mono tracking-tighter group-hover:scale-110 transition-transform duration-500">{stat.value}</p>
              </div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center pointer-events-auto">
            <Link href={isAuthenticated ? '/dashboard' : '/login'}>
              <button className="group relative px-10 sm:px-16 py-5 sm:py-6 rounded-full bg-white text-black font-bold text-sm tracking-[0.15em] overflow-hidden transition-all duration-500 active:scale-95 hover:shadow-[0_0_80px_rgba(255,255,255,0.3)]">
                <span className="relative z-10">ACCESS VAULT</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>
            </Link>
            <Link href="/signup">
              <button className="px-10 sm:px-16 py-5 sm:py-6 rounded-full glass-pro text-white/80 font-bold text-sm tracking-[0.15em] border-white/10 hover:bg-white/10 hover:text-white transition-all duration-500">
                JOIN NETWORK
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <div className="absolute bottom-12 sm:bottom-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center gap-4">
        <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-5 h-9 rounded-full border border-white/20 flex items-start justify-center p-1.5"
        >
          <motion.div animate={{ opacity: [1, 0.3, 1], height: ['6px', '12px', '6px'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="w-1 bg-white/60 rounded-full" />
        </motion.div>
        <span className="text-[9px] font-black uppercase tracking-[0.6em] text-white/30">Scroll to Explore</span>
      </div>
    </section>
  );
}

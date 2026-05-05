'use client';

import { useRef, useMemo, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useThemeStore } from '@/store/useThemeStore';
import { usePathname } from 'next/navigation';

// Simple icosahedron with standard material — NO MeshTransmissionMaterial
const Crystal = memo(() => {
  const mesh = useRef<THREE.Mesh>(null!);
  const theme = useThemeStore((state) => state.theme);

  useFrame((state, delta) => {
    mesh.current.rotation.y += delta * 0.05;
    mesh.current.rotation.z += delta * 0.02;
  });

  return (
    <mesh ref={mesh} scale={2.2}>
      <icosahedronGeometry args={[1, 0]} />
      <meshPhysicalMaterial
        color={theme === 'dark' ? '#ffffff' : '#000000'}
        metalness={0.5}
        roughness={0.1}
        transparent
        opacity={0.15}
        clearcoat={1}
        clearcoatRoughness={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
});
Crystal.displayName = 'Crystal';

const StructuralSparkles = memo(() => (
  <Sparkles 
    count={120}
    scale={12} 
    size={0.6} 
    speed={0.08} 
    opacity={0.08} 
    color="#ffffff" 
  />
));
StructuralSparkles.displayName = 'StructuralSparkles';

const SceneContent = memo(() => {
  const theme = useThemeStore((state) => state.theme);

  return (
    <>
      <ambientLight intensity={theme === 'dark' ? 0.2 : 0.8} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={theme === 'dark' ? 0.5 : 1} />
      <Crystal />
      <StructuralSparkles />
    </>
  );
});
SceneContent.displayName = 'SceneContent';

const Scene = memo(() => {
  const pathname = usePathname();
  
  // Hide the global scene on the landing page to avoid 2 canvases
  if (pathname === '/') return null;

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden select-none opacity-20">
      <div className="vignette-overlay" />
      
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.2]}
        gl={{ 
          antialias: false,
          alpha: true,
          stencil: false,
          depth: true,
          powerPreference: "high-performance"
        }}
        performance={{ min: 0.5 }}
        frameloop="demand"
      >
        <SceneContent />
      </Canvas>
    </div>
  );
});

Scene.displayName = 'Scene';
export default Scene;

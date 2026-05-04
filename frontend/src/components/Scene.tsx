'use client';

import { useRef, useMemo, memo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Float, 
  MeshTransmissionMaterial, 
  Sparkles, 
  Environment,
  Icosahedron
} from '@react-three/drei';
import * as THREE from 'three';
import { useThemeStore } from '@/store/useThemeStore';

const Crystal = memo(() => {
  const mesh = useRef<THREE.Mesh>(null!);
  const theme = useThemeStore((state) => state.theme);

  // Use simple lerping in useFrame - it's already performant if geometry is low-poly
  useFrame((state, delta) => {
    // Subtle auto-rotation
    mesh.current.rotation.y += delta * 0.1;
    mesh.current.rotation.z += delta * 0.05;

    // Mouse tilt interaction - Subtle lerping
    const targetX = state.mouse.y * 0.1;
    const targetY = state.mouse.x * 0.1;
    
    mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, targetX, 0.03);
    mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, targetY, 0.03);
  });

  // Memoize material props to avoid re-calculating
  const materialProps = useMemo(() => ({
    backside: true,
    samples: 4, // Reduced from 8 for performance
    thickness: 1.0,
    chromaticAberration: 0.05,
    anisotropy: 0.1,
    distortion: 0.1,
    distortionScale: 0.2,
    temporalDistortion: 0.1,
    clearcoat: 0.5,
    attenuationDistance: 0.5,
    attenuationColor: theme === 'dark' ? "#ffffff" : "#000000",
    color: theme === 'dark' ? "#c084fc" : "#8b5cf6",
  }), [theme]);

  return (
    <Icosahedron ref={mesh} args={[1, 0]} scale={1.8}>
      <MeshTransmissionMaterial {...materialProps} />
    </Icosahedron>
  );
});

Crystal.displayName = 'Crystal';

const InteractiveSparkles = memo(() => {
  const sparklesRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (sparklesRef.current) {
      // Move sparkles group based on mouse for parallax depth
      const targetX = state.mouse.x * 0.3;
      const targetY = state.mouse.y * 0.3;
      
      sparklesRef.current.position.x = THREE.MathUtils.lerp(sparklesRef.current.position.x, targetX, 0.02);
      sparklesRef.current.position.y = THREE.MathUtils.lerp(sparklesRef.current.position.y, targetY, 0.02);
    }
  });

  return (
    <group ref={sparklesRef}>
      <Sparkles 
        count={400} // Reduced from 600
        scale={10} 
        size={1.2} 
        speed={0.2} 
        opacity={0.3} 
        color="#8b5cf6" 
      />
      <Sparkles 
        count={100} // Reduced from 150
        scale={8} 
        size={2} 
        speed={0.1} 
        opacity={0.15} 
        color="#fbbf24" 
      />
    </group>
  );
});

InteractiveSparkles.displayName = 'InteractiveSparkles';

const SceneContent = memo(() => {
  const theme = useThemeStore((state) => state.theme);

  return (
    <>
      <ambientLight intensity={theme === 'dark' ? 0.5 : 1.2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={theme === 'dark' ? 1 : 1.5} />
      <pointLight position={[-10, -10, -10]} color="#8b5cf6" intensity={theme === 'dark' ? 2 : 1} />
      
      <Environment preset={theme === 'dark' ? "city" : "apartment"} />
      
      <Crystal />
      <InteractiveSparkles />
    </>
  );
});

SceneContent.displayName = 'SceneContent';

const Scene = memo(() => {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden select-none">
      <div className="vignette-overlay" />
      
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.2]} // Capped at 1.2 for performance
        gl={{ 
          antialias: false, // Disabling antialias as we have high pixel density usually
          alpha: true,
          stencil: false,
          depth: true,
          powerPreference: "high-performance"
        }}
        performance={{ min: 0.5 }}
        frameloop="always" // Keep always for smooth sparkles, but optimized content
      >
        <SceneContent />
      </Canvas>
    </div>
  );
});

Scene.displayName = 'Scene';
export default Scene;

'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function LogoMesh() {
  const mesh = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.x = Math.cos(t / 4) / 4;
    mesh.current.rotation.y = Math.sin(t / 4) / 4;
    mesh.current.rotation.z = Math.sin(t / 2) / 4;
  });

  return (
    <Float speed={4} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={mesh} args={[1, 16, 16]} scale={1.5}>
        <MeshDistortMaterial
          color="#8b5cf6"
          speed={5}
          distort={0.4}
          radius={1}
        />
      </Sphere>
    </Float>
  );
}

export default function Logo3D() {
  return (
    <div className="w-10 h-10">
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <LogoMesh />
      </Canvas>
    </div>
  );
}

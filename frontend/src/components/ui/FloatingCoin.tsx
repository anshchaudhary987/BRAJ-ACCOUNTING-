'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

export default function FloatingCoin() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
    }
  });

  return (
    <Float speed={4} rotationIntensity={1} floatIntensity={2}>
      <Cylinder ref={meshRef} args={[1, 1, 0.1, 32]} rotation={[Math.PI / 2, 0, 0]} scale={1.5}>
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.5}
          chromaticAberration={0.02}
          anisotropy={0.1}
          distortion={0}
          distortionScale={0}
          temporalDistortion={0}
          clearcoat={1}
          attenuationDistance={1}
          attenuationColor="#ffffff"
          color="#ffffff"
          metalness={0.9}
          roughness={0.1}
        />
      </Cylinder>
      
      {/* Internal Rim Glow */}
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={1.05}>
        <torusGeometry args={[1, 0.02, 16, 100]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
      </mesh>
    </Float>
  );
}

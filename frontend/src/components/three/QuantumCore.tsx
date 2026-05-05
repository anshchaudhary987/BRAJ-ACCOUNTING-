'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function QuantumCore() {
  const outerRef = useRef<THREE.Mesh>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (outerRef.current) {
      outerRef.current.rotation.y = time * 0.2;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -time * 0.4;
    }
  });

  return (
    <group>
      {/* Premium Outer Shell - Glassy but Stable */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={1}>
        <mesh ref={outerRef}>
          <icosahedronGeometry args={[4, 15]} />
          <meshPhysicalMaterial
            color="#ffffff"
            metalness={0.1}
            roughness={0}
            transmission={0.6}
            thickness={2}
            clearcoat={1}
            clearcoatRoughness={0}
            envMapIntensity={1}
          />
        </mesh>
      </Float>

      {/* "Liquid Metal" Inner Core */}
      <Float speed={5} rotationIntensity={1} floatIntensity={2}>
        <mesh ref={innerRef}>
          <Sphere args={[1.8, 64, 64]}>
            <MeshDistortMaterial
              color="#ffffff"
              metalness={1}
              roughness={0.1}
              distort={0.4}
              speed={2}
              envMapIntensity={2}
            />
          </Sphere>
        </mesh>
      </Float>

      {/* Orbiting Elements */}
      <group rotation={[0, 0, Math.PI / 4]}>
        <mesh>
          <torusGeometry args={[6, 0.02, 16, 100]} />
          <meshStandardMaterial color="#0066cc" emissive="#0066cc" emissiveIntensity={5} />
        </mesh>
      </group>

      <group rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <torusGeometry args={[7, 0.01, 16, 100]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.2} />
        </mesh>
      </group>

      {/* Global Lights within the group for local effect */}
      <pointLight position={[5, 5, 5]} intensity={2} color="#0066cc" />
      <pointLight position={[-5, -5, -5]} intensity={1} color="#ffffff" />
    </group>
  );
}

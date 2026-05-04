'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function LedgerSphere() {
  const sphereRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  
  // Create random points for the "neural" network
  const count = 100;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      
      const radius = 2 + Math.random() * 0.2;
      pos[i * 3] = radius * Math.cos(theta) * Math.sin(phi);
      pos[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, [count]);

  // Lines connecting points
  const lines = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const linePositions: number[] = [];
    
    // Connect each point to its nearest neighbors
    for (let i = 0; i < count; i++) {
      const p1 = new THREE.Vector3(positions[i*3], positions[i*3+1], positions[i*3+2]);
      
      // Check 5 other points to connect to
      for (let j = i + 1; j < count; j++) {
        const p2 = new THREE.Vector3(positions[j*3], positions[j*3+1], positions[j*3+2]);
        if (p1.distanceTo(p2) < 1.2) {
          linePositions.push(p1.x, p1.y, p1.z);
          linePositions.push(p2.x, p2.y, p2.z);
        }
      }
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    return geometry;
  }, [positions]);

  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.002;
      sphereRef.current.rotation.x += 0.001;
      
      // Mouse reaction (parallax)
      const targetRotationX = state.mouse.y * 0.2;
      const targetRotationY = state.mouse.x * 0.2;
      sphereRef.current.rotation.x = THREE.MathUtils.lerp(sphereRef.current.rotation.x, targetRotationX, 0.05);
      sphereRef.current.rotation.y = THREE.MathUtils.lerp(sphereRef.current.rotation.y, targetRotationY, 0.05);
    }
  });

  return (
    <group ref={sphereRef}>
      {/* Inner Glowing Core */}
      <Sphere args={[1.5, 32, 32]}>
        <MeshDistortMaterial
          color="#8b5cf6"
          speed={2}
          distort={0.4}
          radius={1}
          opacity={0.3}
          transparent
          emissive="#c084fc"
          emissiveIntensity={2}
        />
      </Sphere>

      {/* Neural Points */}
      <Points positions={positions}>
        <PointMaterial
          transparent
          color="#22d3ee"
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>

      {/* Connection Lines */}
      <lineSegments geometry={lines}>
        <lineBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Pulsing Outer Rings */}
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.5, 2.52, 64]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[2.8, 2.82, 64]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.1} side={THREE.DoubleSide} />
        </mesh>
      </Float>
    </group>
  );
}

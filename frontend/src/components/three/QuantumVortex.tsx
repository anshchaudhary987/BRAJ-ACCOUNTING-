'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

const NUM_SHARDS = 60; // Optimized for performance and sleekness
const NUM_PARTICLES = 1500; // Reduced density for stable 60fps

import { useDashboard } from '@/hooks/useDashboard';

const DataStreamParticles = ({ liquidityFactor }: { liquidityFactor: number }) => {
  const points = useRef<THREE.Points>(null!);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(NUM_PARTICLES * 3);
    const scales = new Float32Array(NUM_PARTICLES);
    const phases = new Float32Array(NUM_PARTICLES); // For animation
    
    for (let i = 0; i < NUM_PARTICLES; i++) {
      const t = i / NUM_PARTICLES;
      const angle = t * Math.PI * 40; 
      const radius = 2 + Math.random() * 8 * Math.pow(t, 0.5); 
      const height = (Math.random() - 0.5) * 30; 
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      
      scales[i] = Math.random();
      phases[i] = Math.random() * Math.PI * 2;
    }
    return { positions, scales, phases };
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // Speed increases with liquidity
    const speed = 0.15 + (liquidityFactor * 0.5);
    points.current.rotation.y = time * speed;
    
    const positions = points.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < NUM_PARTICLES; i++) {
      const i3 = i * 3;
      const phase = particles.phases[i];
      positions[i3 + 1] += Math.sin(time * 2 + phase) * 0.01;
    }
    points.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-scale"
          args={[particles.scales, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        transparent
        opacity={0.3}
        color="#a0a0a0"
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </points>
  );
};

const StructuredShards = ({ riskFactor }: { riskFactor: number }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const shardData = useMemo(() => {
    const data = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); 
    
    for (let i = 0; i < NUM_SHARDS; i++) {
      const y = 1 - (i / (NUM_SHARDS - 1)) * 2; 
      const radius = Math.sqrt(1 - y * y); 
      const theta = phi * i; 
      const distance = 4 + Math.random() * 6; 
      
      const x = Math.cos(theta) * radius * distance;
      const z = Math.sin(theta) * radius * distance;
      const actualY = y * distance * 1.5; 
      
      data.push({
        position: new THREE.Vector3(x, actualY, z),
        rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
        scale: 0.1 + Math.random() * 0.4,
        speed: 0.5 + Math.random() * 1.5
      });
    }
    return data;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // Shard instability increases with risk
    const instability = 1 + riskFactor;
    
    shardData.forEach((data, i) => {
      const angle = time * 0.1 * data.speed * instability;
      const x = data.position.x * Math.cos(angle) - data.position.z * Math.sin(angle);
      const z = data.position.x * Math.sin(angle) + data.position.z * Math.cos(angle);
      
      dummy.position.set(x, data.position.y + Math.sin(time * 2 + i) * 0.5, z);
      dummy.rotation.x = data.rotation.x + time * 0.5 * data.speed * instability;
      dummy.rotation.y = data.rotation.y + time * 0.3 * data.speed * instability;
      dummy.rotation.z = data.rotation.z;
      
      dummy.scale.setScalar(data.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null as any, null as any, NUM_SHARDS]}>
      <octahedronGeometry args={[1, 0]} />
      <MeshTransmissionMaterial
        backside
        samples={3} 
        thickness={0.2}
        chromaticAberration={0.02} 
        anisotropy={0.1}
        distortion={0.1}
        distortionScale={0.1}
        temporalDistortion={0.05}
        clearcoat={1}
        attenuationDistance={1}
        attenuationColor="#ffffff"
        color="#eeeeee"
        metalness={0.6}
        roughness={0.15}
      />
    </instancedMesh>
  );
};

export default function QuantumVortex() {
  const group = useRef<THREE.Group>(null!);
  const { data } = useDashboard();

  // Normalize factors (0 to 1 range for visual mapping)
  const stats = data?.stats;
  const liquidityFactor = Math.min((stats?.liquidity.value || 0) / 10000000, 1);
  const yieldFactor = Math.min((stats?.yield.value || 0) / 2000000, 1);
  const riskFactor = Math.min((stats?.risk.value || 0) / 1000000, 1);
  const reserveFactor = Math.min((stats?.reserves.value || 0) / 50000000, 1);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    group.current.rotation.x = Math.sin(time * 0.1) * 0.1;
    group.current.rotation.z = Math.cos(time * 0.1) * 0.1;
  });

  return (
    <group ref={group}>
      <Float speed={2 + yieldFactor * 5} rotationIntensity={0.5} floatIntensity={1}>
        <mesh scale={1 + reserveFactor * 0.2}>
          <icosahedronGeometry args={[2.5, 2]} />
          <MeshTransmissionMaterial
            backside
            samples={6} 
            thickness={2}
            chromaticAberration={0.03 + yieldFactor * 0.1}
            anisotropy={0.5}
            distortion={0.2 + yieldFactor * 0.3}
            distortionScale={0.2}
            temporalDistortion={0.1}
            clearcoat={1}
            attenuationDistance={2}
            attenuationColor="#ffffff"
            color="#ffffff"
            metalness={0.5}
            roughness={0.05}
          />
        </mesh>
        
        <mesh scale={0.9}>
          <icosahedronGeometry args={[2, 0]} />
          <meshBasicMaterial color="#a0a0a0" wireframe transparent opacity={0.15} />
        </mesh>
        <mesh scale={0.5 + reserveFactor * 0.1}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </Float>

      <StructuredShards riskFactor={riskFactor} />
      <DataStreamParticles liquidityFactor={liquidityFactor} />
    </group>
  );
}

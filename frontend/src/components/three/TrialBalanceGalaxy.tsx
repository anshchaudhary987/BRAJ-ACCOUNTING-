'use client';

import React, { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, Float, Sphere, Torus, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { TrialBalanceItem, Ledger } from '@/types';

interface GalaxyNodeProps {
  item: TrialBalanceItem & { groupName?: string; groupType?: string };
  position: [number, number, number];
  color: string;
  size: number;
}

function GalaxyNode({ item, position, color, size }: GalaxyNodeProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      if (hovered) {
        meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, 1.5, 0.1));
      } else {
        meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, 1, 0.1));
      }
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        onClick={() => router.push(`/ledgers/${item.ledgerId}`)}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 2 : 0.5}
          transparent
          opacity={0.8}
        />
        
        {hovered && (
          <Html distanceFactor={10}>
            <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl pointer-events-none whitespace-nowrap z-50">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{item.groupName}</p>
              <p className="text-sm font-bold text-white mb-1">{item.ledgerName}</p>
              <p className="text-xs font-mono text-cyan-400">{formatCurrency(item.balance)}</p>
            </div>
          </Html>
        )}
      </mesh>
      
      {/* Outer glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[size * 1.2, size * 1.3, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

interface TrialBalanceGalaxyProps {
  data: TrialBalanceItem[];
  ledgers: Ledger[];
}

export default function TrialBalanceGalaxy({ data, ledgers }: TrialBalanceGalaxyProps) {
  const groupRef = useRef<THREE.Group>(null);

  const nodes = useMemo(() => {
    // Map ledger groups to trial balance items
    const enrichedData = data.map(item => {
      const ledger = ledgers.find(l => l.id === item.ledgerId);
      return {
        ...item,
        groupName: ledger?.group_name || 'Other',
        // We'll estimate group type based on name for now if not available
        groupType: ledger?.group_name?.match(/Sales|Income|Other Income/i) ? 'Income' :
                   ledger?.group_name?.match(/Purchases|Expenses|Charges|Expenditure/i) ? 'Expenditure' :
                   ledger?.group_name?.match(/Cash|Bank|Debtors|Assets/i) ? 'Assets' : 'Liabilities'
      };
    });

    return enrichedData.map((item, idx) => {
      const angle = (idx / enrichedData.length) * Math.PI * 2;
      const radius = 5 + Math.random() * 2;
      
      // Position based on group type
      let x = radius * Math.cos(angle);
      let y = radius * Math.sin(angle);
      let z = (Math.random() - 0.5) * 5;

      // Color and size
      const isDebit = item.balance > 0;
      const color = item.groupType === 'Assets' ? '#22d3ee' : // Cyan
                    item.groupType === 'Liabilities' ? '#a855f7' : // Purple
                    item.groupType === 'Income' ? '#10b981' : // Emerald
                    '#f43f5e'; // Rose for Expenses

      const size = Math.max(0.1, Math.min(0.5, Math.log10(Math.abs(item.balance) + 1) / 10));

      return {
        item,
        position: [x, y, z] as [number, number, number],
        color,
        size
      };
    });
  }, [data, ledgers]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
      groupRef.current.rotation.z += 0.0005;
      
      // Parallax
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, state.mouse.x * 0.5, 0.05);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, state.mouse.y * 0.5, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {nodes.map((node, i) => (
          <GalaxyNode key={node.item.ledgerId} {...node} />
        ))}
      </Float>
      
      {/* Background Star Particles */}
      <Points count={500} />
    </group>
  );
}

function Points({ count = 500 }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 40;
      p[i * 3 + 1] = (Math.random() - 0.5) * 40;
      p[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return p;
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
          args={[points, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#ffffff" transparent opacity={0.2} sizeAttenuation />
    </points>
  );
}

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { FlueGasSystem as FlueGasSystemType } from '@/types';

interface FlueGasProps {
  data: FlueGasSystemType;
}

export default function FlueGas({ data }: FlueGasProps) {
  const groupRef = useRef<THREE.Group>(null);
  const sprayParticlesRef = useRef<THREE.Points>(null);

  const sprayParticles = useMemo(() => {
    const positions = new Float32Array(200 * 3);
    const velocities = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 3;
      positions[i * 3 + 1] = 6 + Math.random() * 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = -Math.random() * 0.05 - 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    return { positions, velocities };
  }, []);

  useFrame((state) => {
    if (sprayParticlesRef.current && data.sprayActive) {
      const positions = sprayParticlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 200; i++) {
        positions[i * 3] += sprayParticles.velocities[i * 3];
        positions[i * 3 + 1] += sprayParticles.velocities[i * 3 + 1];
        positions[i * 3 + 2] += sprayParticles.velocities[i * 3 + 2];
        
        if (positions[i * 3 + 1] < 0) {
          positions[i * 3] = (Math.random() - 0.5) * 3;
          positions[i * 3 + 1] = 10;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
        }
      }
      sprayParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const bodyColor = data.status === 'alarm' ? '#991b1b' : data.status === 'warning' ? '#92400e' : '#1e3a5f';

  return (
    <group ref={groupRef} position={[data.position.x, data.position.y, data.position.z]}>
      {/* 净化塔底座 */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3.5, 4, 2, 16]} />
        <meshStandardMaterial color="#1f2937" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 主塔体 */}
      <mesh position={[0, 6, 0]} castShadow>
        <cylinderGeometry args={[2.8, 3, 8, 16]} />
        <meshStandardMaterial color={bodyColor} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* 塔顶盖 */}
      <mesh position={[0, 10.5, 0]} castShadow>
        <coneGeometry args={[3.5, 1.5, 16]} />
        <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 观察窗 */}
      <mesh position={[0, 5, 2.9]}>
        <boxGeometry args={[1.5, 2, 0.1]} />
        <meshStandardMaterial color="#87ceeb" transparent opacity={0.6} />
      </mesh>

      {/* 喷淋层可视化 */}
      <mesh position={[0, 7, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 0.2, 16]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 0.2, 16]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.4} />
      </mesh>

      {/* 喷淋粒子效果 */}
      {data.sprayActive && (
        <points ref={sprayParticlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={200}
              array={sprayParticles.positions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial size={0.1} color="#60a5fa" transparent opacity={0.8} sizeAttenuation />
        </points>
      )}

      {/* 入口烟道 */}
      <mesh position={[-3.5, 4, 0]} rotation={[0, 0, 0.2]} castShadow>
        <boxGeometry args={[3, 2, 2]} />
        <meshStandardMaterial color="#4b5563" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 出口烟道 */}
      <mesh position={[0, 11, 0]} castShadow>
        <boxGeometry args={[1.5, 1.5, 4]} />
        <meshStandardMaterial color="#4b5563" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 脱硫设备指示灯 */}
      <mesh position={[-2, 9, 2.5]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={data.desulfurizationRunning ? '#22c55e' : '#ef4444'}
          emissive={data.desulfurizationRunning ? '#22c55e' : '#ef4444'}
          emissiveIntensity={1}
        />
      </mesh>

      {/* 脱硝设备指示灯 */}
      <mesh position={[2, 9, 2.5]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={data.denitrificationRunning ? '#22c55e' : '#ef4444'}
          emissive={data.denitrificationRunning ? '#22c55e' : '#ef4444'}
          emissiveIntensity={1}
        />
      </mesh>

      {/* 状态指示灯 */}
      <mesh position={[0, 12, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial
          color={data.status === 'alarm' ? '#ef4444' : data.status === 'warning' ? '#f59e0b' : '#22c55e'}
          emissive={data.status === 'alarm' ? '#ef4444' : data.status === 'warning' ? '#f59e0b' : '#22c55e'}
          emissiveIntensity={1}
        />
      </mesh>

      {/* 爬梯 */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <mesh key={`ladder-${i}`} position={[2.7, 1.5 + i, 0]}>
          <boxGeometry args={[0.1, 0.8, 0.6]} />
          <meshStandardMaterial color="#6b7280" />
        </mesh>
      ))}
    </group>
  );
}

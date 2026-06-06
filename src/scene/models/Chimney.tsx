import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ChimneyProps {
  position: [number, number, number];
  isAlarm: boolean;
}

export default function Chimney({ position, isAlarm }: ChimneyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const smokeRef = useRef<THREE.Points>(null);

  const smokeParticles = useMemo(() => {
    const positions = new Float32Array(150 * 3);
    const velocities = new Float32Array(150 * 3);
    for (let i = 0; i < 150; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1.5;
      positions[i * 3 + 1] = 18 + Math.random() * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
      velocities[i * 3] = (Math.random() - 0.5) * 0.01;
      velocities[i * 3 + 1] = Math.random() * 0.03 + 0.01;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }
    return { positions, velocities };
  }, []);

  useFrame(() => {
    if (smokeRef.current) {
      const positions = smokeRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 150; i++) {
        positions[i * 3] += smokeParticles.velocities[i * 3];
        positions[i * 3 + 1] += smokeParticles.velocities[i * 3 + 1];
        positions[i * 3 + 2] += smokeParticles.velocities[i * 3 + 2];
        
        if (positions[i * 3 + 1] > 28) {
          positions[i * 3] = (Math.random() - 0.5) * 1.5;
          positions[i * 3 + 1] = 18;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
        }
      }
      smokeRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* 烟囱底座 */}
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.5, 3, 4, 16]} />
        <meshStandardMaterial color="#1f2937" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 烟囱主体 */}
      <mesh position={[0, 11, 0]} castShadow>
        <cylinderGeometry args={[1.5, 2, 14, 16]} />
        <meshStandardMaterial
          color={isAlarm ? '#991b1b' : '#374151'}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* 烟囱顶部 */}
      <mesh position={[0, 18.5, 0]} castShadow>
        <cylinderGeometry args={[1.8, 1.5, 1, 16]} />
        <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 顶部警示灯 */}
      <mesh position={[1.5, 19, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color={isAlarm ? '#ef4444' : '#f59e0b'}
          emissive={isAlarm ? '#ef4444' : '#f59e0b'}
          emissiveIntensity={1}
        />
      </mesh>
      <mesh position={[-1.5, 19, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color={isAlarm ? '#ef4444' : '#f59e0b'}
          emissive={isAlarm ? '#ef4444' : '#f59e0b'}
          emissiveIntensity={1}
        />
      </mesh>

      {/* 烟雾粒子 */}
      <points ref={smokeRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={150}
            array={smokeParticles.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.5}
          color={isAlarm ? '#666666' : '#aaaaaa'}
          transparent
          opacity={0.4}
          sizeAttenuation
        />
      </points>

      {/* 爬梯 */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
        <mesh key={`ladder-${i}`} position={[1.3, 3 + i * 1.2, 0]}>
          <boxGeometry args={[0.1, 0.8, 0.5]} />
          <meshStandardMaterial color="#6b7280" />
        </mesh>
      ))}
    </group>
  );
}

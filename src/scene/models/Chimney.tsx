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
  const glowRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

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

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
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

    if (glowRef.current && isAlarm) {
      const pulse = 1 + Math.sin(time * 4) * 0.2;
      glowRef.current.scale.set(pulse, pulse, pulse);
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.3 + Math.sin(time * 4) * 0.15;
    }

    if (lightRef.current) {
      lightRef.current.intensity = isAlarm ? (2 + Math.sin(time * 6) * 1) : 0.5;
      lightRef.current.color.set(isAlarm ? '#ff0000' : '#ffaa00');
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* 报警辉光 */}
      {isAlarm && (
        <mesh ref={glowRef} position={[0, 11, 0]}>
          <cylinderGeometry args={[3, 4, 16, 16]} />
          <meshBasicMaterial color="#ff0000" transparent opacity={0.3} />
        </mesh>
      )}

      {/* 报警光源 */}
      <pointLight
        ref={lightRef}
        position={[0, 12, 0]}
        intensity={0.5}
        color={isAlarm ? '#ff0000' : '#ffaa00'}
        distance={15}
      />

      {/* 烟囱底座 */}
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.5, 3, 4, 16]} />
        <meshStandardMaterial color="#1f2937" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 烟囱主体 */}
      <mesh position={[0, 11, 0]} castShadow>
        <cylinderGeometry args={[1.5, 2, 14, 16]} />
        <meshStandardMaterial
          color={isAlarm ? '#7f1d1d' : '#374151'}
          emissive={isAlarm ? '#450a0a' : '#000000'}
          emissiveIntensity={isAlarm ? 0.5 : 0}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* 烟囱顶部 */}
      <mesh position={[0, 18.5, 0]} castShadow>
        <cylinderGeometry args={[1.8, 1.5, 1, 16]} />
        <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 顶部警示灯 - 双灯交替闪烁 */}
      <mesh position={[1.5, 19, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial
          color={isAlarm ? '#ef4444' : '#f59e0b'}
          emissive={isAlarm ? '#ef4444' : '#f59e0b'}
          emissiveIntensity={isAlarm ? 2 : 1}
        />
      </mesh>
      <mesh position={[-1.5, 19, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial
          color={isAlarm ? '#ef4444' : '#f59e0b'}
          emissive={isAlarm ? '#ef4444' : '#f59e0b'}
          emissiveIntensity={isAlarm ? 2 : 1}
        />
      </mesh>

      {/* 烟雾粒子 - 报警时变成深灰色 */}
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
          size={0.6}
          color={isAlarm ? '#444444' : '#888888'}
          transparent
          opacity={isAlarm ? 0.6 : 0.4}
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

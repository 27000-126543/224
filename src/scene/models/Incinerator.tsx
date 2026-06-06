import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Incinerator as IncineratorType } from '@/types';

interface IncineratorProps {
  data: IncineratorType;
}

export default function Incinerator({ data }: IncineratorProps) {
  const groupRef = useRef<THREE.Group>(null);
  const fireRef = useRef<THREE.PointLight>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const alarmPulseRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const intensity = 0.8 + Math.sin(time * 10) * 0.2;
    
    if (fireRef.current) {
      fireRef.current.intensity = intensity;
    }

    if (glowRef.current) {
      const glowMat = glowRef.current.material as THREE.MeshStandardMaterial;
      glowMat.emissiveIntensity = 0.5 + Math.sin(time * 5) * 0.2;
    }

    if (alarmPulseRef.current && data.status === 'alarm') {
      const scale = 1 + Math.sin(time * 8) * 0.1;
      alarmPulseRef.current.scale.set(scale, scale, scale);
    } else if (alarmPulseRef.current) {
      alarmPulseRef.current.scale.set(1, 1, 1);
    }
  });

  const bodyColor = data.status === 'alarm' ? '#991b1b' : data.status === 'warning' ? '#92400e' : '#374151';
  const fireColor = data.furnaceTemperature > 1000 ? '#ff4400' : '#ff8800';

  const particles = useMemo(() => {
    const positions = new Float32Array(100 * 3);
    for (let i = 0; i < 100; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1.5;
      positions[i * 3 + 1] = Math.random() * 3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    }
    return positions;
  }, []);

  return (
    <group ref={groupRef} position={[data.position.x, data.position.y, data.position.z]}>
      {/* 炉体底座 */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 2, 5]} />
        <meshStandardMaterial color="#1f2937" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 主炉体 */}
      <mesh position={[0, 4.5, 0]} castShadow>
        <cylinderGeometry args={[2.2, 2.5, 5, 16]} />
        <meshStandardMaterial color={bodyColor} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* 炉顶 */}
      <mesh position={[0, 7.5, 0]} castShadow>
        <cylinderGeometry args={[2.5, 2.8, 0.8, 16]} />
        <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 观察窗 */}
      <mesh position={[0, 4.5, 2.55]}>
        <boxGeometry args={[1.5, 1.5, 0.1]} />
        <meshStandardMaterial color={fireColor} emissive={fireColor} emissiveIntensity={0.8} transparent opacity={0.9} />
      </mesh>

      {/* 内部火焰光 */}
      <pointLight
        ref={fireRef}
        position={[0, 4.5, 2]}
        intensity={1}
        color={fireColor}
        distance={10}
        castShadow
      />

      {/* 火焰粒子效果 */}
      <points position={[0, 3.5, 1.5]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={100}
            array={particles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.15} color={fireColor} transparent opacity={0.8} sizeAttenuation />
      </points>

      {/* 发光效果 */}
      <mesh ref={glowRef} position={[0, 4.5, 2.5]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial color={fireColor} transparent opacity={0.3} />
      </mesh>

      {/* 进料口 */}
      <mesh position={[-2.8, 4, 0]} rotation={[0, 0, -0.3]} castShadow>
        <boxGeometry args={[1.5, 1, 2]} />
        <meshStandardMaterial color="#4b5563" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 出渣口 */}
      <mesh position={[2.5, 1.5, 0]} castShadow>
        <boxGeometry args={[1, 1, 1.5]} />
        <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 蒸汽管道 */}
      <mesh position={[0, 8, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 3, 8]} />
        <meshStandardMaterial color="#6b7280" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 报警脉冲效果 */}
      {data.status === 'alarm' && (
        <mesh ref={alarmPulseRef} position={[0, 4.5, 0]}>
          <sphereGeometry args={[3.5, 32, 32]} />
          <meshBasicMaterial color="#ff0000" transparent opacity={0.2} />
        </mesh>
      )}

      {/* 状态指示灯 */}
      <mesh position={[0, 8.5, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial
          color={data.status === 'alarm' ? '#ef4444' : data.status === 'warning' ? '#f59e0b' : '#22c55e'}
          emissive={data.status === 'alarm' ? '#ef4444' : data.status === 'warning' ? '#f59e0b' : '#22c55e'}
          emissiveIntensity={1}
        />
      </mesh>

      {/* 设备编号牌 */}
      <mesh position={[0, 2.5, -2.6]}>
        <boxGeometry args={[2, 0.8, 0.1]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
    </group>
  );
}

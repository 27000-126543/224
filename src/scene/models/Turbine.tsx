import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Turbine as TurbineType } from '@/types';

interface TurbineProps {
  data: TurbineType;
}

export default function Turbine({ data }: TurbineProps) {
  const groupRef = useRef<THREE.Group>(null);
  const rotorRef = useRef<THREE.Mesh>(null);
  const fanRef = useRef<THREE.Group>(null);
  const alarmPulseRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (rotorRef.current) {
      const speed = (data.rpm / 60) * Math.PI * 2 * 0.016;
      rotorRef.current.rotation.y += speed;
    }

    if (fanRef.current) {
      fanRef.current.rotation.z += 0.05;
    }

    if (alarmPulseRef.current && data.status === 'alarm') {
      const scale = 1 + Math.sin(time * 8) * 0.1;
      alarmPulseRef.current.scale.set(scale, scale, scale);
    }
  });

  const bodyColor = data.status === 'alarm' ? '#991b1b' : data.status === 'warning' ? '#92400e' : '#1e3a5f';

  return (
    <group ref={groupRef} position={[data.position.x, data.position.y, data.position.z]}>
      {/* 底座 */}
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[8, 1.6, 4]} />
        <meshStandardMaterial color="#1f2937" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 汽轮机主体 */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[1.8, 2, 5, 16]} />
        <meshStandardMaterial color={bodyColor} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 端盖 */}
      <mesh position={[0, 2.5, 2.6]} castShadow>
        <cylinderGeometry args={[2, 2, 0.3, 16]} />
        <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 2.5, -2.6]} castShadow>
        <cylinderGeometry args={[2, 2, 0.3, 16]} />
        <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 转子可视化 */}
      <mesh ref={rotorRef} position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 4.5, 12]} />
        <meshStandardMaterial color="#4b5563" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* 转子叶片 */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh
          key={i}
          position={[0, 2.5, -1.8 + i * 0.7]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[1.5, 1.5, 0.1, 6, 1, true]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.9} roughness={0.1} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* 发电机部分 */}
      <mesh position={[0, 2.5, 5]} castShadow>
        <boxGeometry args={[3, 3, 3]} />
        <meshStandardMaterial color="#1e40af" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* 散热风扇 */}
      <mesh position={[0, 2.5, 6.8]}>
        <cylinderGeometry args={[0.3, 0.3, 0.5, 8]} />
        <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.3} />
      </mesh>
      <group ref={fanRef} position={[0, 2.5, 7.2]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, (i * Math.PI) / 2, 0]}>
            <boxGeometry args={[0.1, 0.8, 0.05]} />
            <meshStandardMaterial color="#6b7280" metalness={0.8} />
          </mesh>
        ))}
      </group>

      {/* 蒸汽管道入口 */}
      <mesh position={[-2.5, 3.5, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 3, 8]} />
        <meshStandardMaterial color="#4b5563" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 冷凝器 */}
      <mesh position={[0, 1.5, -2]} castShadow>
        <boxGeometry args={[4, 1.5, 2]} />
        <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 状态指示灯 */}
      <mesh position={[0, 4.5, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial
          color={data.status === 'alarm' ? '#ef4444' : data.status === 'warning' ? '#f59e0b' : '#22c55e'}
          emissive={data.status === 'alarm' ? '#ef4444' : data.status === 'warning' ? '#f59e0b' : '#22c55e'}
          emissiveIntensity={1}
        />
      </mesh>

      {/* 报警脉冲效果 */}
      {data.status === 'alarm' && (
        <mesh ref={alarmPulseRef} position={[0, 2.5, 1]}>
          <sphereGeometry args={[4, 32, 32]} />
          <meshBasicMaterial color="#ff0000" transparent opacity={0.15} />
        </mesh>
      )}

      {/* 振动可视化 */}
      {data.status !== 'normal' && (
        <mesh position={[0, 5, 0]}>
          <boxGeometry args={[3, 0.3, 0.3]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  );
}

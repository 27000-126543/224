import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AshBin as AshBinType } from '@/types';

interface AshBinProps {
  data: AshBinType;
}

export default function AshBin({ data }: AshBinProps) {
  const groupRef = useRef<THREE.Group>(null);
  const warningPulseRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (warningPulseRef.current && (data.status === 'warning' || data.status === 'full')) {
      const scale = 1 + Math.sin(time * 6) * 0.05;
      warningPulseRef.current.scale.set(scale, 1, scale);
    }
  });

  const fillHeight = (data.currentLevel / data.capacity) * 8;
  const bodyColor = data.status === 'full' ? '#991b1b' : data.status === 'warning' ? '#92400e' : '#374151';

  return (
    <group ref={groupRef} position={[data.position.x, data.position.y, data.position.z]}>
      {/* 底座 */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3.5, 4, 1, 16]} />
        <meshStandardMaterial color="#1f2937" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 仓体 */}
      <mesh position={[0, 5, 0]} castShadow>
        <cylinderGeometry args={[3, 3, 8, 16]} />
        <meshStandardMaterial color={bodyColor} metalness={0.6} roughness={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* 内部灰渣 */}
      <mesh position={[0, 1 + fillHeight / 2, 0]}>
        <cylinderGeometry args={[2.8, 2.8, fillHeight, 16]} />
        <meshStandardMaterial color="#6b7280" roughness={0.9} />
      </mesh>

      {/* 顶部 */}
      <mesh position={[0, 9.5, 0]} castShadow>
        <cylinderGeometry args={[3.2, 3, 1, 16]} />
        <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 进料口 */}
      <mesh position={[0, 10.2, 0]} castShadow>
        <cylinderGeometry args={[1, 0.8, 0.8, 8]} />
        <meshStandardMaterial color="#4b5563" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 出料口 */}
      <mesh position={[2.5, 1.5, 0]} rotation={[0, 0, -0.5]} castShadow>
        <boxGeometry args={[1.5, 1, 1.5]} />
        <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 仓容标尺 */}
      {[0, 2, 4, 6, 8].map((h, i) => (
        <mesh key={i} position={[2.8, 1 + h, 0]}>
          <boxGeometry args={[0.3, 0.1, 0.5]} />
          <meshStandardMaterial color={h <= fillHeight ? '#22c55e' : '#6b7280'} />
        </mesh>
      ))}

      {/* 百分比显示 */}
      <mesh position={[0, 11, 0]}>
        <boxGeometry args={[2, 0.8, 0.2]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[0, 11, 0.15]}>
        <boxGeometry args={[1.8 * (data.fillPercent / 100), 0.6, 0.05]} />
        <meshStandardMaterial
          color={data.status === 'full' ? '#ef4444' : data.status === 'warning' ? '#f59e0b' : '#22c55e'}
          emissive={data.status === 'full' ? '#ef4444' : data.status === 'warning' ? '#f59e0b' : '#22c55e'}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* 预警脉冲 */}
      {(data.status === 'warning' || data.status === 'full') && (
        <mesh ref={warningPulseRef} position={[0, 5, 0]}>
          <cylinderGeometry args={[3.5, 3.5, 9, 16]} />
          <meshBasicMaterial
            color={data.status === 'full' ? '#ff0000' : '#ff8800'}
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* 状态指示灯 */}
      <mesh position={[0, 12, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial
          color={data.status === 'full' ? '#ef4444' : data.status === 'warning' ? '#f59e0b' : '#22c55e'}
          emissive={data.status === 'full' ? '#ef4444' : data.status === 'warning' ? '#f59e0b' : '#22c55e'}
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

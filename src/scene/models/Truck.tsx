import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Truck as TruckType } from '@/types';

interface TruckProps {
  data: TruckType;
}

export default function Truck({ data }: TruckProps) {
  const groupRef = useRef<THREE.Group>(null);
  const wheelRefs = useRef<THREE.Mesh[]>([]);
  const dumpRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    wheelRefs.current.forEach((wheel) => {
      if (wheel) {
        wheel.rotation.x += data.status === 'approaching' ? 0.3 : 0;
      }
    });

    if (dumpRef.current) {
      if (data.status === 'discharging') {
        dumpRef.current.rotation.x = Math.sin(time * 2) * 0.2 + 0.3;
      } else {
        dumpRef.current.rotation.x = 0;
      }
    }
  });

  const statusColor = {
    waiting: '#6b7280',
    approaching: '#22c55e',
    discharging: '#eab308',
    leaving: '#3b82f6'
  }[data.status];

  return (
    <group ref={groupRef} position={[data.position.x, 0, data.position.z]}>
      {/* 车身主体 */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[2.5, 1.5, 5]} />
        <meshStandardMaterial color="#1e40af" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* 驾驶室 */}
      <mesh position={[0, 1.5, 2.2]} castShadow>
        <boxGeometry args={[2.3, 1.2, 1.5]} />
        <meshStandardMaterial color="#1e3a8a" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* 驾驶室窗户 */}
      <mesh position={[0, 1.8, 2.96]}>
        <boxGeometry args={[1.8, 0.8, 0.05]} />
        <meshStandardMaterial color="#87ceeb" transparent opacity={0.7} />
      </mesh>

      {/* 车斗 */}
      <mesh ref={dumpRef} position={[0, 2, -0.5]} castShadow>
        <boxGeometry args={[2.4, 0.8, 3]} />
        <meshStandardMaterial color="#374151" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* 车斗边缘 */}
      <mesh position={[0, 2.5, -0.5]}>
        <boxGeometry args={[2.6, 0.1, 3.2]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>

      {/* 车轮 */}
      {[[-1, -1.5], [1, -1.5], [-1, 1.5], [1, 1.5]].map(([x, z], i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) wheelRefs.current[i] = el;
          }}
          position={[x, 0.5, z]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <cylinderGeometry args={[0.45, 0.45, 0.3, 16]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      ))}

      {/* 轮毂 */}
      {[[-1, -1.5], [1, -1.5], [-1, 1.5], [1, 1.5]].map(([x, z], i) => (
        <mesh
          key={`hub-${i}`}
          position={[x + (x > 0 ? 0.16 : -0.16), 0.5, z]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.2, 0.2, 0.32, 8]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.8} />
        </mesh>
      ))}

      {/* 状态指示灯 */}
      <pointLight position={[0, 3, 0]} intensity={0.5} color={statusColor} distance={5} />
      <mesh position={[0, 2.8, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={0.8} />
      </mesh>

      {/* 车顶标识 */}
      <mesh position={[0, 2.3, 2.2]}>
        <boxGeometry args={[1.5, 0.1, 0.8]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
    </group>
  );
}

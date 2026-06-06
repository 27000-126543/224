import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { PitZone } from '@/types';

interface PitProps {
  zones: PitZone[];
}

export default function Pit({ zones }: PitProps) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef} position={[0, 0, -8]}>
      {/* 垃圾坑外围墙体 */}
      <mesh position={[0, 3, 0]} castShadow>
        <boxGeometry args={[22, 6, 16]} />
        <meshStandardMaterial color="#1f2937" side={THREE.BackSide} metalness={0.5} roughness={0.5} />
      </mesh>

      {/* 坑底 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} receiveShadow>
        <planeGeometry args={[20, 14]} />
        <meshStandardMaterial color="#374151" roughness={0.8} />
      </mesh>

      {/* 各区域垃圾堆积 */}
      {zones.map((zone) => (
        <group key={zone.id} position={[zone.position.x, 0, zone.position.z]}>
          {/* 垃圾堆主体 */}
          <mesh position={[0, zone.height / 2, 0]} castShadow>
            <boxGeometry args={[5, zone.height, 5]} />
            <meshStandardMaterial color={zone.color} roughness={0.9} transparent opacity={0.85} />
          </mesh>

          {/* 垃圾堆顶部不规则 */}
          <mesh position={[0.3, zone.height + 0.3, 0.2]}>
            <sphereGeometry args={[0.8, 8, 8]} />
            <meshStandardMaterial color={zone.color} roughness={0.9} />
          </mesh>
          <mesh position={[-0.4, zone.height + 0.2, -0.3]}>
            <sphereGeometry args={[0.6, 8, 8]} />
            <meshStandardMaterial color={zone.color} roughness={0.9} />
          </mesh>
          <mesh position={[0.2, zone.height + 0.5, -0.1]}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshStandardMaterial color={zone.color} roughness={0.9} />
          </mesh>

          {/* 区域标识 */}
          <mesh position={[0, zone.height + 1, 0]}>
            <boxGeometry args={[2, 0.6, 0.1]} />
            <meshStandardMaterial color={zone.color} emissive={zone.color} emissiveIntensity={0.3} />
          </mesh>

          {/* 掺烧比例指示条 */}
          {zone.blendRatio > 0 && (
            <group position={[-2.8, 0.1, 2.6]}>
              <mesh position={[0, zone.blendRatio / 20, 0]}>
                <boxGeometry args={[0.3, zone.blendRatio / 10, 0.3]} />
                <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
              </mesh>
            </group>
          )}
        </group>
      ))}

      {/* 抓斗起重机轨道 */}
      <mesh position={[0, 8, 0]} castShadow>
        <boxGeometry args={[24, 0.3, 1]} />
        <meshStandardMaterial color="#4b5563" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 8, 0]} castShadow>
        <boxGeometry args={[1, 0.3, 18]} />
        <meshStandardMaterial color="#4b5563" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 抓斗 */}
      <CraneGrab />

      {/* 坑沿护栏 */}
      {[-10, -5, 0, 5, 10].map((x, i) => (
        <mesh key={`rail1-${i}`} position={[x, 6.2, 7.8]} castShadow>
          <boxGeometry args={[0.1, 0.6, 0.1]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
      ))}
      {[-10, -5, 0, 5, 10].map((x, i) => (
        <mesh key={`rail2-${i}`} position={[x, 6.2, -7.8]} castShadow>
          <boxGeometry args={[0.1, 0.6, 0.1]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
      ))}
    </group>
  );
}

function CraneGrab() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.x = Math.sin(time * 0.3) * 8;
      groupRef.current.position.z = Math.cos(time * 0.2) * 5;
    }
  });

  return (
    <group ref={groupRef} position={[0, 7.5, 0]}>
      {/* 小车 */}
      <mesh castShadow>
        <boxGeometry args={[1.5, 0.5, 1.5]} />
        <meshStandardMaterial color="#6b7280" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* 钢缆 */}
      <mesh position={[0, -1.5, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 3, 8]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.9} />
      </mesh>
      <mesh position={[-0.3, -1.5, 0.3]}>
        <cylinderGeometry args={[0.03, 0.03, 3, 8]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.9} />
      </mesh>
      <mesh position={[0.3, -1.5, -0.3]}>
        <cylinderGeometry args={[0.03, 0.03, 3, 8]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.9} />
      </mesh>

      {/* 抓斗 */}
      <mesh position={[0, -3.2, 0]} castShadow>
        <boxGeometry args={[1.2, 0.3, 1.2]} />
        <meshStandardMaterial color="#4b5563" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-0.5, -3.8, 0]} rotation={[0, 0, 0.5]} castShadow>
        <boxGeometry args={[0.15, 1, 1]} />
        <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.5, -3.8, 0]} rotation={[0, 0, -0.5]} castShadow>
        <boxGeometry args={[0.15, 1, 1]} />
        <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

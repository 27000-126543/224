import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import type { AshBin as AshBinType } from '@/types';

interface AshBinProps {
  data: AshBinType;
}

export default function AshBin({ data }: AshBinProps) {
  const groupRef = useRef<THREE.Group>(null);
  const warningPulseRef = useRef<THREE.Mesh>(null);
  const warningLightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (warningPulseRef.current && (data.status === 'warning' || data.status === 'full')) {
      const scale = 1 + Math.sin(time * 8) * 0.1;
      warningPulseRef.current.scale.set(scale, 1, scale);
      const mat = warningPulseRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.2 + Math.sin(time * 6) * 0.15;
    }

    if (warningLightRef.current && (data.status === 'warning' || data.status === 'full')) {
      warningLightRef.current.intensity = 1 + Math.sin(time * 10) * 0.8;
      warningLightRef.current.color.set(data.status === 'full' ? '#ff0000' : '#ff8800');
    }
  });

  const fillHeight = (data.currentLevel / data.capacity) * 8;
  const bodyColor = data.status === 'full' ? '#7f1d1d' : data.status === 'warning' ? '#78350f' : '#374151';
  const fillColor = data.status === 'full' ? '#ef4444' : data.status === 'warning' ? '#f59e0b' : '#6b7280';

  return (
    <group ref={groupRef} position={[data.position.x, data.position.y, data.position.z]}>
      {(data.status === 'warning' || data.status === 'full') && (
        <pointLight
          ref={warningLightRef}
          position={[0, 6, 0]}
          intensity={1}
          color={data.status === 'full' ? '#ff0000' : '#ff8800'}
          distance={10}
        />
      )}

      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3.5, 4, 1, 16]} />
        <meshStandardMaterial color="#1f2937" metalness={0.7} roughness={0.3} />
      </mesh>

      <mesh position={[0, 5, 0]} castShadow>
        <cylinderGeometry args={[3, 3, 8, 16]} />
        <meshStandardMaterial
          color={bodyColor}
          emissive={data.status === 'full' ? '#450a0a' : data.status === 'warning' ? '#431407' : '#000000'}
          emissiveIntensity={data.status === 'normal' ? 0 : 0.3}
          metalness={0.6}
          roughness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 1 + fillHeight / 2, 0]}>
        <cylinderGeometry args={[2.8, 2.8, fillHeight, 16]} />
        <meshStandardMaterial color={fillColor} roughness={0.9} />
      </mesh>

      <mesh position={[0, 9.5, 0]} castShadow>
        <cylinderGeometry args={[3.2, 3, 1, 16]} />
        <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.2} />
      </mesh>

      <mesh position={[0, 10.2, 0]} castShadow>
        <cylinderGeometry args={[1, 0.8, 0.8, 8]} />
        <meshStandardMaterial color="#4b5563" metalness={0.7} roughness={0.3} />
      </mesh>

      <mesh position={[2.5, 1.5, 0]} rotation={[0, 0, -0.5]} castShadow>
        <boxGeometry args={[1.5, 1, 1.5]} />
        <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.3} />
      </mesh>

      {[0, 25, 50, 75, 100].map((pct, i) => {
        const h = (pct / 100) * 8;
        return (
          <group key={i} position={[3, 1 + h, 0]}>
            <mesh>
              <boxGeometry args={[0.4, 0.15, 0.1]} />
              <meshStandardMaterial color={pct <= data.fillPercent ? (pct > 85 ? '#ef4444' : '#22c55e') : '#4b5563'} />
            </mesh>
          </group>
        );
      })}

      <mesh position={[0, 11, 0]}>
        <boxGeometry args={[2.5, 0.8, 0.2]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[-1.2 + 1.2 * (data.fillPercent / 100), 11, 0.15]}>
        <boxGeometry args={[2.4 * (data.fillPercent / 100), 0.6, 0.05]} />
        <meshStandardMaterial
          color={data.status === 'full' ? '#ef4444' : data.status === 'warning' ? '#f59e0b' : '#22c55e'}
          emissive={data.status === 'full' ? '#ef4444' : data.status === 'warning' ? '#f59e0b' : '#22c55e'}
          emissiveIntensity={data.status === 'normal' ? 0.5 : 1}
        />
      </mesh>

      {(data.status === 'warning' || data.status === 'full') && (
        <mesh ref={warningPulseRef} position={[0, 5, 0]}>
          <cylinderGeometry args={[4, 4, 10, 16]} />
          <meshBasicMaterial
            color={data.status === 'full' ? '#ff0000' : '#ff8800'}
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      <mesh position={[0, 12, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color={data.status === 'full' ? '#ef4444' : data.status === 'warning' ? '#f59e0b' : '#22c55e'}
          emissive={data.status === 'full' ? '#ef4444' : data.status === 'warning' ? '#f59e0b' : '#22c55e'}
          emissiveIntensity={2}
        />
      </mesh>

      <Billboard position={[0, 14, 0]}>
        <Html center distanceFactor={20}>
          <div className="bg-black/85 backdrop-blur-sm border border-cyan-500/50 rounded-lg px-3 py-2 shadow-lg">
            <p className="font-tech font-bold text-cyan-400 text-center text-sm">{data.name}</p>
            <div className="text-xs mt-1">
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">料位:</span>
                <span className={`font-bold ${data.status === 'full' ? 'text-red-400' : data.status === 'warning' ? 'text-yellow-400' : 'text-green-400'}`}>
                  {data.fillPercent}%
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">存量:</span>
                <span className="text-white">{data.currentLevel}/{data.capacity}吨</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">状态:</span>
                <span className={data.status === 'full' ? 'text-red-400' : data.status === 'warning' ? 'text-yellow-400' : 'text-green-400'}>
                  {data.status === 'full' ? '满仓' : data.status === 'warning' ? '预警' : '正常'}
                </span>
              </div>
              {data.status !== 'normal' && (
                <p className="text-center text-[10px] text-orange-400 mt-1 animate-pulse">
                  🚚 已调度运输车
                </p>
              )}
            </div>
          </div>
        </Html>
      </Billboard>

      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <mesh key={`ladder-${i}`} position={[2.7, 1.5 + i, 0]}>
          <boxGeometry args={[0.1, 0.8, 0.6]} />
          <meshStandardMaterial color="#6b7280" />
        </mesh>
      ))}
    </group>
  );
}

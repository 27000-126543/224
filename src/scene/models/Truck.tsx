import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import type { Truck as TruckType } from '@/types';
import { getWasteTypeName } from '@/utils/calc';

interface TruckProps {
  data: TruckType;
}

export default function Truck({ data }: TruckProps) {
  const groupRef = useRef<THREE.Group>(null);
  const wheelRefs = useRef<THREE.Mesh[]>([]);
  const dumpRef = useRef<THREE.Mesh>(null);
  const targetPos = useRef(new THREE.Vector3(data.position.x, 0, data.position.z));

  useEffect(() => {
    if (data.targetPosition) {
      targetPos.current.set(data.targetPosition.x, 0, data.targetPosition.z);
    } else {
      targetPos.current.set(data.position.x, 0, data.position.z);
    }
  }, [data.targetPosition, data.position.x, data.position.z]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    
    if (groupRef.current && (data.status === 'approaching' || data.status === 'leaving')) {
      const currentPos = new THREE.Vector3(
        groupRef.current.position.x,
        0,
        groupRef.current.position.z
      );
      const direction = new THREE.Vector3().subVectors(targetPos.current, currentPos);
      const distance = direction.length();
      
      if (distance > 0.1) {
        direction.normalize();
        const speed = data.status === 'leaving' ? 0.08 : 0.05;
        groupRef.current.position.x += direction.x * speed;
        groupRef.current.position.z += direction.z * speed;
        
        const angle = Math.atan2(direction.x, direction.z);
        groupRef.current.rotation.y = angle;
        
        wheelRefs.current.forEach((wheel) => {
          if (wheel) wheel.rotation.x += 0.2;
        });
      }
    } else {
      wheelRefs.current.forEach((wheel) => {
        if (wheel && data.status === 'discharging') {
          wheel.rotation.x += 0.05;
        }
      });
    }

    if (dumpRef.current) {
      if (data.status === 'discharging') {
        dumpRef.current.rotation.x = Math.sin(time * 2) * 0.1 + 0.25;
      } else {
        dumpRef.current.rotation.x = THREE.MathUtils.lerp(dumpRef.current.rotation.x, 0, 0.1);
      }
    }
  });

  const statusColor = {
    waiting: '#6b7280',
    approaching: '#22c55e',
    discharging: '#eab308',
    leaving: '#3b82f6'
  }[data.status];

  const statusName = {
    waiting: '等待中',
    approaching: '前往卸料口',
    discharging: '卸料中',
    leaving: '离场'
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

      {/* 车牌和信息标签 */}
      <Billboard position={[0, 4.5, 0]}>
        <Html center distanceFactor={15}>
          <div className="bg-black/80 backdrop-blur-sm border border-cyan-500/50 rounded-lg px-3 py-2 text-white text-xs whitespace-nowrap shadow-lg shadow-cyan-500/20">
            <p className="font-tech font-bold text-cyan-400 text-sm">{data.plateNumber}</p>
            <p className="text-gray-300 mt-0.5">
              <span className="text-yellow-400">{data.source}</span>
              <span className="mx-1">|</span>
              <span className="text-green-400">{getWasteTypeName(data.wasteType)}</span>
            </p>
            <p className="text-gray-400">
              重量: <span className="text-white font-medium">{data.weight}吨</span>
              <span className="mx-1">|</span>
              热值: <span className="text-orange-400">{data.calorificValue}</span>
            </p>
            {data.assignedPort && (
              <p className="text-green-400 font-medium mt-0.5 flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                前往 {data.assignedPort}# 卸料口
              </p>
            )}
            <p className="mt-1" style={{ color: statusColor }}>{statusName}</p>
          </div>
        </Html>
      </Billboard>
    </group>
  );
}

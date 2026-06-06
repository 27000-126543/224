import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Billboard } from '@react-three/drei';
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
  const feederRef = useRef<THREE.Mesh>(null);
  const damperRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

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
      const scale = 1 + Math.sin(time * 8) * 0.15;
      alarmPulseRef.current.scale.set(scale, scale, scale);
    } else if (alarmPulseRef.current) {
      alarmPulseRef.current.scale.set(1, 1, 1);
    }

    if (feederRef.current) {
      const targetRotation = (data.feedRate / 100) * Math.PI * 0.5;
      feederRef.current.rotation.z = THREE.MathUtils.lerp(feederRef.current.rotation.z, targetRotation, 0.05);
    }

    if (damperRef.current) {
      const targetRotation = (data.damperOpening / 100) * Math.PI;
      damperRef.current.rotation.y = THREE.MathUtils.lerp(damperRef.current.rotation.y, targetRotation, 0.05);
    }

    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 100; i++) {
        positions[i * 3 + 1] += 0.02;
        if (positions[i * 3 + 1] > 5) {
          positions[i * 3 + 1] = 0;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const bodyColor = data.status === 'alarm' ? '#991b1b' : data.status === 'warning' ? '#92400e' : '#374151';
  const fireColor = data.furnaceTemperature > 1000 ? '#ff2200' : data.furnaceTemperature > 950 ? '#ff6600' : '#ffaa00';
  const tempColor = data.furnaceTemperature > 1000 ? 'text-red-400' : data.furnaceTemperature > 950 ? 'text-orange-400' : 'text-yellow-400';
  const oxygenColor = data.oxygenContent < 6 ? 'text-red-400' : data.oxygenContent < 7 ? 'text-yellow-400' : 'text-green-400';

  const particles = useMemo(() => {
    const positions = new Float32Array(100 * 3);
    for (let i = 0; i < 100; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1.5;
      positions[i * 3 + 1] = Math.random() * 5;
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
        <meshStandardMaterial color={fireColor} emissive={fireColor} emissiveIntensity={data.status === 'alarm' ? 1.5 : 0.8} transparent opacity={0.9} />
      </mesh>

      {/* 内部火焰光 */}
      <pointLight
        ref={fireRef}
        position={[0, 4.5, 2]}
        intensity={1}
        color={fireColor}
        distance={12}
        castShadow
      />

      {/* 火焰粒子效果 */}
      <points ref={particlesRef} position={[0, 3.5, 1.5]}>
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

      {/* 进料口 - 可动画 */}
      <group position={[-2.8, 4, 0]}>
        <mesh rotation={[0, 0, -0.3]} castShadow>
          <boxGeometry args={[1.5, 1, 2]} />
          <meshStandardMaterial color="#4b5563" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh ref={feederRef} position={[0, 0.3, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[1.2, 0.2, 1.8]} />
          <meshStandardMaterial color={data.feedRate < 60 ? '#ef4444' : '#22c55e'} metalness={0.5} roughness={0.4} />
        </mesh>
      </group>

      {/* 风门 - 可动画 */}
      <group position={[2.5, 4.5, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.8, 2, 0.8]} />
          <meshStandardMaterial color="#4b5563" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh ref={damperRef} position={[0, 0, 0]}>
          <boxGeometry args={[0.1, 1.8, 0.6]} />
          <meshStandardMaterial color={data.damperOpening > 80 ? '#22c55e' : data.damperOpening > 60 ? '#eab308' : '#ef4444'} metalness={0.5} roughness={0.4} />
        </mesh>
      </group>

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
          <meshBasicMaterial color="#ff0000" transparent opacity={0.25} />
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

      {/* 运行时间指示条 */}
      <mesh position={[-2, 2, -2.5]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.1, 2.5, 0.1]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      <mesh position={[-2, 1 + Math.min(data.runningHours / 10000, 1) * 1.25, -2.5]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.12, Math.min(data.runningHours / 10000, 1) * 2.5, 0.12]} />
        <meshStandardMaterial color={data.runningHours > 8000 ? '#ef4444' : '#22c55e'} emissive={data.runningHours > 8000 ? '#ef4444' : '#22c55e'} emissiveIntensity={0.5} />
      </mesh>

      {/* 数据显示面板 */}
      <Billboard position={[0, 10, 0]}>
        <Html center distanceFactor={20}>
          <div className="bg-black/85 backdrop-blur-sm border border-cyan-500/50 rounded-xl px-4 py-3 shadow-lg shadow-cyan-500/20 min-w-[200px]">
            <p className="font-tech font-bold text-cyan-400 text-center mb-2 border-b border-gray-700 pb-2">{data.name}</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">炉膛温度:</span>
                <span className={`font-tech font-bold ${tempColor}`}>
                  {data.furnaceTemperature.toFixed(0)}℃
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${Math.min((data.furnaceTemperature / 1100) * 100, 100)}%`,
                    backgroundColor: data.furnaceTemperature > 1000 ? '#ef4444' : data.furnaceTemperature > 950 ? '#f59e0b' : '#22c55e'
                  }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">含氧量:</span>
                <span className={`font-tech font-bold ${oxygenColor}`}>
                  {data.oxygenContent.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${Math.min((data.oxygenContent / 12) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">蒸汽流量:</span>
                <span className="font-tech font-bold text-cyan-400">
                  {data.steamFlow.toFixed(0)} t/h
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-700">
                <div className="text-center">
                  <p className="text-gray-500 text-[10px]">给料量</p>
                  <p className={`font-tech font-bold ${data.feedRate < 60 ? 'text-red-400' : 'text-green-400'}`}>
                    {data.feedRate}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-[10px]">风门</p>
                  <p className={`font-tech font-bold ${data.damperOpening > 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {data.damperOpening}%
                  </p>
                </div>
              </div>
              <div className="text-center mt-2 pt-2 border-t border-gray-700">
                <p className="text-gray-500 text-[10px]">运行时长</p>
                <p className={`font-tech font-bold ${data.runningHours > 8000 ? 'text-red-400' : 'text-white'}`}>
                  {data.runningHours.toFixed(0)} / 8000 h
                </p>
              </div>
            </div>
          </div>
        </Html>
      </Billboard>
    </group>
  );
}

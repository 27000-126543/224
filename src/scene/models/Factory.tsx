import { useRef } from 'react';
import * as THREE from 'three';

export default function Factory() {
  const mainBuildingRef = useRef<THREE.Mesh>(null);

  return (
    <group>
      {/* 地面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1a1f2e" roughness={0.8} />
      </mesh>

      {/* 道路 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-20, 0.01, 10]} receiveShadow>
        <planeGeometry args={[8, 40]} />
        <meshStandardMaterial color="#2a2f3e" roughness={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-10, 0.01, 10]} receiveShadow>
        <planeGeometry args={[25, 8]} />
        <meshStandardMaterial color="#2a2f3e" roughness={0.6} />
      </mesh>

      {/* 道路标线 */}
      {[-15, -5, 5, 15].map((x, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, 10]}>
          <planeGeometry args={[0.3, 3]} />
          <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.3} />
        </mesh>
      ))}

      {/* 主厂房 */}
      <mesh position={[0, 5, -2]} castShadow receiveShadow ref={mainBuildingRef}>
        <boxGeometry args={[35, 10, 20]} />
        <meshStandardMaterial color="#2d3748" roughness={0.7} metalness={0.3} />
      </mesh>
      
      {/* 厂房屋顶 */}
      <mesh position={[0, 10.5, -2]} castShadow>
        <boxGeometry args={[37, 1, 22]} />
        <meshStandardMaterial color="#1a202c" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* 厂房窗户 */}
      {[-14, -7, 0, 7, 14].map((x, i) => (
        <mesh key={i} position={[x, 5, 8.05]}>
          <boxGeometry args={[4, 3, 0.1]} />
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.4} transparent opacity={0.7} />
        </mesh>
      ))}

      {/* 卸料大厅 */}
      <mesh position={[-10, 4, 8]} castShadow receiveShadow>
        <boxGeometry args={[20, 8, 10]} />
        <meshStandardMaterial color="#374151" roughness={0.7} metalness={0.2} />
      </mesh>
      
      {/* 卸料口 - 6个 */}
      {[-15, -9, -3, 3, 9, 15].map((x, i) => (
        <group key={i} position={[x, 3, 13]}>
          <mesh>
            <boxGeometry args={[4, 4.5, 0.5]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
          <mesh position={[0, -1.5, 0.3]}>
            <boxGeometry args={[3.5, 1, 0.1]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.3} />
          </mesh>
          {/* 卸料口编号发光标识 */}
          <mesh position={[0, 1.5, 0.3]}>
            <boxGeometry args={[2, 1, 0.1]} />
            <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.5} />
          </mesh>
        </group>
      ))}

      {/* 控制室 */}
      <mesh position={[18, 3, 15]} castShadow receiveShadow>
        <boxGeometry args={[8, 6, 10]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.6} metalness={0.4} />
      </mesh>
      
      {/* 控制室大窗户 */}
      <mesh position={[18, 3, 20.1]}>
        <boxGeometry args={[6, 4, 0.1]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.3} transparent opacity={0.6} />
      </mesh>

      {/* 路灯 */}
      {[[-25, 15], [-25, 5], [25, 15], [25, -5], [-10, -20], [10, -20]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 4, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.15, 8, 8]} />
            <meshStandardMaterial color="#4a5568" />
          </mesh>
          <mesh position={[0, 8.2, 0]}>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial color="#ffeeaa" emissive="#ffeeaa" emissiveIntensity={1} />
          </mesh>
        </group>
      ))}

      {/* 围栏 */}
      {Array.from({ length: 20 }, (_, i) => (
        <mesh key={`fence1-${i}`} position={[-30 + i * 3, 1, -25]} castShadow>
          <boxGeometry args={[0.1, 2, 0.1]} />
          <meshStandardMaterial color="#4a5568" />
        </mesh>
      ))}
      {Array.from({ length: 18 }, (_, i) => (
        <mesh key={`fence2-${i}`} position={[-30, 1, -25 + i * 3]} castShadow>
          <boxGeometry args={[0.1, 2, 0.1]} />
          <meshStandardMaterial color="#4a5568" />
        </mesh>
      ))}

      {/* 绿化 */}
      {[[-28, -20], [-28, -10], [28, -15], [28, -5], [28, 10]].map(([x, z], i) => (
        <group key={`tree-${i}`} position={[x, 0, z]}>
          <mesh position={[0, 1, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.3, 2, 8]} />
            <meshStandardMaterial color="#5c4033" />
          </mesh>
          <mesh position={[0, 3, 0]} castShadow>
            <coneGeometry args={[1.5, 3, 8]} />
            <meshStandardMaterial color="#228b22" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

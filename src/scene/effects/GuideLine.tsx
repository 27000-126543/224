import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GuideLineProps {
  start: [number, number, number];
  end: [number, number, number];
}

export default function GuideLine({ start, end }: GuideLineProps) {
  const lineRef = useRef<THREE.Line>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const curve = useMemo(() => {
    const startPoint = new THREE.Vector3(...start);
    const endPoint = new THREE.Vector3(...end);
    const midPoint = new THREE.Vector3().addVectors(startPoint, endPoint).multiplyScalar(0.5);
    midPoint.y += 1;
    return new THREE.QuadraticBezierCurve3(startPoint, midPoint, endPoint);
  }, [start, end]);

  const points = useMemo(() => curve.getPoints(50), [curve]);
  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  }, [points]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (lineRef.current) {
      const material = lineRef.current.material as THREE.LineBasicMaterial;
      material.opacity = 0.7 + Math.sin(time * 4) * 0.3;
    }

    if (glowRef.current) {
      const glowMat = glowRef.current.material as THREE.MeshBasicMaterial;
      glowMat.opacity = 0.3 + Math.sin(time * 3) * 0.2;
      const progress = ((time * 0.5) % 1);
      const point = curve.getPoint(progress);
      glowRef.current.position.copy(point);
    }
  });

  return (
    <group>
      {/* 引导线 */}
      <primitive ref={lineRef} object={new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({
        color: '#22c55e',
        transparent: true,
        opacity: 0.8,
        linewidth: 3
      }))} />

      {/* 流动光点 */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.6} />
      </mesh>

      {/* 终点指示 */}
      <mesh position={end} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.8, 32]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* 终点箭头 */}
      <mesh position={[end[0], 0.5, end[2]]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.3, 0.6, 4]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
    </group>
  );
}

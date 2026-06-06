import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import Factory from './models/Factory';
import Truck from './models/Truck';
import Incinerator from './models/Incinerator';
import Pit from './models/Pit';
import Turbine from './models/Turbine';
import FlueGas from './models/FlueGas';
import AshBin from './models/AshBin';
import Chimney from './models/Chimney';
import GuideLine from './effects/GuideLine';
import { useDeviceStore } from '@/store/useDeviceStore';

export default function Scene() {
  const { trucks, incinerators, pitZones, turbines, flueGasSystems, ashBins } = useDeviceStore();

  const guideTrucks = trucks.filter(t => t.status === 'approaching' && t.targetPosition);

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [30, 25, 30], fov: 50 }}
        shadows
        gl={{ antialias: true, toneMappingExposure: 1.2 }}
      >
        <color attach="background" args={['#0a0e1a']} />
        <fog attach="fog" args={['#0a0e1a', 50, 120]} />
        
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[20, 30, 10]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        <pointLight position={[-15, 8, 0]} intensity={0.5} color="#ff9933" distance={20} />
        <pointLight position={[0, 8, 5]} intensity={0.6} color="#ff6644" distance={25} />
        <pointLight position={[15, 8, 5]} intensity={0.6} color="#ff6644" distance={25} />
        <pointLight position={[20, 12, 0]} intensity={0.4} color="#4488ff" distance={20} />
        
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={0.5} />
        
        <Factory />
        
        {pitZones.length > 0 && <Pit zones={pitZones} />}
        
        {incinerators.map((inc) => (
          <Incinerator key={inc.id} data={inc} />
        ))}
        
        {turbines.map((tur) => (
          <Turbine key={tur.id} data={tur} />
        ))}
        
        {flueGasSystems.map((fg) => (
          <FlueGas key={fg.id} data={fg} />
        ))}
        
        {ashBins.map((ab) => (
          <AshBin key={ab.id} data={ab} />
        ))}
        
        <Chimney position={[22, 0, -5]} isAlarm={flueGasSystems[0]?.status === 'alarm'} />
        
        {trucks.map((truck) => (
          <Truck key={truck.id} data={truck} />
        ))}
        
        {guideTrucks.map((truck) => (
          <GuideLine
            key={`guide-${truck.id}`}
            start={[truck.position.x, 0.1, truck.position.z]}
            end={[truck.targetPosition!.x, 0.1, truck.targetPosition!.z]}
          />
        ))}
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={10}
          maxDistance={80}
        />
        
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            height={300}
            intensity={1.5}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

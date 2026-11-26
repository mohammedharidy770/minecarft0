import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { BiomeDefinition } from '../../data/worldsData';
import { generateBiomeWorld } from '../../voxel/worldBuilder';
import { VoxelTerrain } from './VoxelTerrain';

interface BiomeSceneProps {
  biome: BiomeDefinition;
  interactive?: boolean;
}

export function BiomeScene({ biome, interactive = true }: BiomeSceneProps) {
  const { scene, camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const blocks = useMemo(() => generateBiomeWorld(biome.id), [biome.id]);

  const particleGeo = useMemo(() => {
    const count = 85;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = ((Math.sin(i * 19.13) * 1000) % 1) * 24 - 12;
      positions[i * 3 + 1] = 1 + Math.abs((Math.cos(i * 31.7) * 1000) % 1) * 12;
      positions[i * 3 + 2] = ((Math.sin(i * 73.1) * 1000) % 1) * 24 - 12;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);

  useEffect(() => {
    const bg = new THREE.Color(biome.skyColor);
    scene.background = bg;
    scene.fog = new THREE.FogExp2(biome.fogColor, 0.022);

    // Unique camera angle per biome
    const camMap: Record<string, [number, number, number]> = {
      forest: [17, 11, 17],
      desert: [19, 9, 14],
      snow: [-16, 13, 16],
      jungle: [14, 12, 16],
      mountain: [-18, 15, 17],
      mushroom: [15, 10, -15],
    };
    const [cx, cy, cz] = camMap[biome.id] ?? [16, 11, 16];
    camera.position.set(cx, cy, cz);
    camera.lookAt(0, 2.5, 0);
  }, [biome, scene, camera]);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      // Subtle living sway/orbit unique to biome mood
      const speed = biome.id === 'mountain' ? 0.08 : biome.id === 'mushroom' ? 0.14 : 0.11;
      groupRef.current.rotation.y += dt * speed;
    }
    if (particlesRef.current) {
      if (biome.id === 'snow') {
        particlesRef.current.position.y = -((t * 0.8) % 3);
      } else {
        particlesRef.current.position.y = Math.sin(t * 0.9) * 0.35;
      }
      particlesRef.current.rotation.y = t * 0.05;
    }
  });

  const particleColor =
    biome.id === 'snow'
      ? '#EAF5FF'
      : biome.id === 'mushroom'
      ? '#C79AF7'
      : biome.id === 'desert'
      ? '#E8C564'
      : '#D6B66E';

  return (
    <>
      <hemisphereLight args={[biome.hemiSky, biome.hemiGround, 0.75]} />
      <directionalLight
        position={[18, 26, 14]}
        intensity={2.1}
        color={biome.keyLightColor}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[-14, 8, -14]} intensity={0.6} color={biome.accentColor} />

      <group ref={groupRef}>
        <VoxelTerrain blocks={blocks} />
      </group>

      <points ref={particlesRef} geometry={particleGeo}>
        <pointsMaterial size={0.16} color={particleColor} transparent opacity={0.7} sizeAttenuation />
      </points>

      {interactive && (
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={0.35}
          maxPolarAngle={Math.PI / 2.2}
        />
      )}
    </>
  );
}

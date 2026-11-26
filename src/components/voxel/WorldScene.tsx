import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { generateHeroWorld } from '../../voxel/worldBuilder';
import { VoxelTerrain } from './VoxelTerrain';
import { CameraKeyframe, ScrollCameraController } from './ScrollCameraController';

const HERO_KEYFRAMES: CameraKeyframe[] = [
  // Scene 01: Intimate close-up of single floating grass block in darkness
  { at: 0.0, position: [3.2, 3.6, 4.2], target: [0, 2.0, 0], fov: 40 },
  // Scene 02: Pull back slightly as ground forms around origin
  { at: 0.16, position: [8.5, 6.2, 9.5], target: [0, 1.5, 0], fov: 44 },
  // Scene 03: Orbit low across rolling hills, trees, and flowers
  { at: 0.34, position: [13.5, 8.5, 13.0], target: [-1, 2.2, 0], fov: 45 },
  // Scene 04: Sweep across river channel and rising stone mountains
  { at: 0.52, position: [-15.0, 11.5, 14.5], target: [0, 3.0, -3], fov: 46 },
  // Scene 05: Glide over medieval village, cottages, and lantern bridge
  { at: 0.68, position: [14.0, 9.5, 14.0], target: [2, 3.0, 0], fov: 45 },
  // Scene 06: Rise high to reveal the entire expanding voxel kingdom
  { at: 0.84, position: [24.0, 19.0, 24.0], target: [0, 2.5, -2], fov: 46 },
  // Scene 07: Grand cinematic aerial panorama
  { at: 1.0, position: [-26.0, 25.0, 26.0], target: [0, 3.0, -1], fov: 42 },
];

const _bgStart = new THREE.Color('#080D0A');
const _bgMid = new THREE.Color('#111D17');
const _bgEnd = new THREE.Color('#192924');
const _bgCurrent = new THREE.Color();

interface WorldSceneProps {
  progressRef: React.MutableRefObject<number>;
}

export function WorldScene({ progressRef }: WorldSceneProps) {
  const { scene } = useThree();
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const blocks = useMemo(() => generateHeroWorld(), []);

  const particleGeo = useMemo(() => {
    const count = 90;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.sin(i * 12.9898) * 43758.5453 % 1) * 32 - 16;
      positions[i * 3 + 1] = 2 + Math.abs(Math.cos(i * 78.233) * 14);
      positions[i * 3 + 2] = (Math.sin(i * 39.346) * 19341.12 % 1) * 32 - 16;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);

  useFrame(({ clock }) => {
    const p = progressRef.current;
    if (p < 0.5) {
      _bgCurrent.copy(_bgStart).lerp(_bgMid, p * 2);
    } else {
      _bgCurrent.copy(_bgMid).lerp(_bgEnd, (p - 0.5) * 2);
    }
    scene.background = _bgCurrent;
    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.color.copy(_bgCurrent);
      scene.fog.density = THREE.MathUtils.lerp(0.045, 0.015, Math.min(1, p * 1.4));
    }

    if (keyLightRef.current) {
      keyLightRef.current.intensity = THREE.MathUtils.lerp(1.3, 2.35, Math.min(1, p * 1.5));
    }
    if (hemiLightRef.current) {
      hemiLightRef.current.intensity = THREE.MathUtils.lerp(0.45, 0.95, Math.min(1, p * 1.5));
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.03;
    }
  });

  return (
    <>
      <fogExp2 attach="fog" args={['#080D0A', 0.04]} />
      <hemisphereLight ref={hemiLightRef} args={['#9AC9B0', '#1B281E', 0.55]} />
      <directionalLight
        ref={keyLightRef}
        position={[24, 34, 18]}
        intensity={1.6}
        color="#FFE9C2"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={24}
        shadow-camera-bottom={-24}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-18, 12, -20]} intensity={0.55} color="#6CA6C1" />

      <ScrollCameraController keyframes={HERO_KEYFRAMES} progressRef={progressRef} damping={5.5} />

      <VoxelTerrain blocks={blocks} progressRef={progressRef} />

      <points ref={particlesRef} geometry={particleGeo}>
        <pointsMaterial size={0.14} color="#D6B66E" transparent opacity={0.55} sizeAttenuation />
      </points>
    </>
  );
}

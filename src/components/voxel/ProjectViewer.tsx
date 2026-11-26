import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { generateProjectWorld, ProjectSlug } from '../../voxel/worldBuilder';
import { VoxelTerrain } from './VoxelTerrain';

export type LightingPreset = 'dawn' | 'noon' | 'twilight' | 'night';

interface ProjectViewerProps {
  slug: ProjectSlug;
  skyColor: string;
  lightingPreset?: LightingPreset;
  cameraPresetPos?: [number, number, number] | null;
  cameraPresetTarget?: [number, number, number] | null;
  autoRotate?: boolean;
  enableZoom?: boolean;
  onCameraPresetSettled?: () => void;
}

const _goalPos = new THREE.Vector3();
const _goalTarget = new THREE.Vector3();

const LIGHTING_CONFIGS: Record<
  LightingPreset,
  { keyColor: string; keyIntensity: number; hemiSky: string; hemiGround: string; hemiIntensity: number; bgTint: number }
> = {
  dawn: {
    keyColor: '#FFCE8A',
    keyIntensity: 2.0,
    hemiSky: '#9DC4C8',
    hemiGround: '#2D211B',
    hemiIntensity: 0.72,
    bgTint: 1.0,
  },
  noon: {
    keyColor: '#FFF7E8',
    keyIntensity: 2.5,
    hemiSky: '#AEE0FF',
    hemiGround: '#324234',
    hemiIntensity: 0.9,
    bgTint: 1.2,
  },
  twilight: {
    keyColor: '#E89B72',
    keyIntensity: 1.5,
    hemiSky: '#7C74B8',
    hemiGround: '#1D1829',
    hemiIntensity: 0.65,
    bgTint: 0.85,
  },
  night: {
    keyColor: '#7EA8D9',
    keyIntensity: 0.95,
    hemiSky: '#3A5378',
    hemiGround: '#0A0D12',
    hemiIntensity: 0.48,
    bgTint: 0.55,
  },
};

export function ProjectViewer({
  slug,
  skyColor,
  lightingPreset = 'dawn',
  cameraPresetPos = null,
  cameraPresetTarget = null,
  autoRotate = true,
  enableZoom = true,
  onCameraPresetSettled,
}: ProjectViewerProps) {
  const { scene, camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const transitioningRef = useRef(false);

  const blocks = useMemo(() => generateProjectWorld(slug), [slug]);
  const lightCfg = LIGHTING_CONFIGS[lightingPreset];

  useEffect(() => {
    const c = new THREE.Color(skyColor).multiplyScalar(lightCfg.bgTint);
    scene.background = c;
    scene.fog = new THREE.FogExp2(c.getHex(), 0.017);
  }, [skyColor, lightCfg.bgTint, scene]);

  useEffect(() => {
    if (cameraPresetPos && cameraPresetTarget) {
      transitioningRef.current = true;
    }
  }, [cameraPresetPos, cameraPresetTarget]);

  useFrame((_, delta) => {
    if (!transitioningRef.current || !cameraPresetPos || !cameraPresetTarget || !controlsRef.current) {
      return;
    }
    const dt = Math.min(delta, 0.05);
    _goalPos.set(...cameraPresetPos);
    _goalTarget.set(...cameraPresetTarget);

    camera.position.x = THREE.MathUtils.damp(camera.position.x, _goalPos.x, 5.5, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, _goalPos.y, 5.5, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, _goalPos.z, 5.5, dt);

    controlsRef.current.target.x = THREE.MathUtils.damp(controlsRef.current.target.x, _goalTarget.x, 5.5, dt);
    controlsRef.current.target.y = THREE.MathUtils.damp(controlsRef.current.target.y, _goalTarget.y, 5.5, dt);
    controlsRef.current.target.z = THREE.MathUtils.damp(controlsRef.current.target.z, _goalTarget.z, 5.5, dt);
    controlsRef.current.update();

    if (camera.position.distanceTo(_goalPos) < 0.15) {
      transitioningRef.current = false;
      onCameraPresetSettled?.();
    }
  });

  const isNether = slug === 'the-nether-gate';

  return (
    <>
      <hemisphereLight args={[lightCfg.hemiSky, lightCfg.hemiGround, lightCfg.hemiIntensity]} />
      <directionalLight
        position={[22, 28, 18]}
        intensity={lightCfg.keyIntensity}
        color={lightCfg.keyColor}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[-18, 10, -16]} intensity={0.65} color={isNether ? '#E8531A' : '#7CA6C4'} />
      {isNether && <pointLight position={[0, 4, -2]} intensity={14} distance={24} color="#A65CEB" />}

      <VoxelTerrain blocks={blocks} />

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.07}
        enableZoom={enableZoom}
        enablePan={false}
        autoRotate={autoRotate}
        autoRotateSpeed={0.55}
        minDistance={8}
        maxDistance={46}
        maxPolarAngle={Math.PI / 2.08}
        onStart={() => {
          transitioningRef.current = false;
        }}
      />
    </>
  );
}

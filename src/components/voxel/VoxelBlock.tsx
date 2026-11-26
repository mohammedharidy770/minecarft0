import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BlockType, getSharedVoxelGeometry, getVoxelMaterial } from '../../voxel/textures';

interface VoxelBlockProps {
  position: [number, number, number];
  type: BlockType;
  scale?: number;
  floatSpeed?: number;
  floatAmplitude?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

export function VoxelBlock({
  position,
  type,
  scale = 1,
  floatSpeed = 0,
  floatAmplitude = 0,
  castShadow = true,
  receiveShadow = true,
}: VoxelBlockProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometry = getSharedVoxelGeometry();
  const material = getVoxelMaterial(type);

  useFrame(({ clock }) => {
    if (!meshRef.current || floatSpeed <= 0) return;
    const t = clock.getElapsedTime() * floatSpeed;
    meshRef.current.position.y = position[1] + Math.sin(t) * floatAmplitude;
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={scale}
      geometry={geometry}
      material={material}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    />
  );
}

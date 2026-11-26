import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VoxelBlockData } from '../../voxel/worldBuilder';
import { BlockType, getSharedVoxelGeometry, getVoxelMaterial } from '../../voxel/textures';

const _dummy = new THREE.Object3D();
const _color = new THREE.Color();

interface InstancedBatchProps {
  type: BlockType;
  blocks: VoxelBlockData[];
  progressRef?: React.MutableRefObject<number>;
  explodeRef?: React.MutableRefObject<number>;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

function InstancedVoxelBatch({
  type,
  blocks,
  progressRef,
  explodeRef,
  castShadow = true,
  receiveShadow = true,
}: InstancedBatchProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const currentScales = useRef<Float32Array>(new Float32Array(blocks.length));
  const currentExplode = useRef(0);

  const geometry = getSharedVoxelGeometry();
  const material = useMemo(() => getVoxelMaterial(type), [type]);
  const isTranslucent = type === 'water' || type === 'glass' || type === 'ice' || type === 'cloud';

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    currentScales.current = new Float32Array(blocks.length);

    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      const initialVisible = !progressRef || (b.revealAt ?? 0) <= progressRef.current;
      const s = initialVisible ? 1 : 0.0001;
      currentScales.current[i] = initialVisible ? 1 : 0;

      _dummy.position.set(b.x, b.y, b.z);
      _dummy.rotation.set(0, 0, 0);
      _dummy.scale.setScalar(s);
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);

      if (b.tint !== undefined) {
        _color.setScalar(b.tint);
        mesh.setColorAt(i, _color);
      } else {
        _color.setScalar(1);
        mesh.setColorAt(i, _color);
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [blocks, progressRef]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dt = Math.min(delta, 0.05);
    let dirty = false;

    if (progressRef) {
      const p = progressRef.current;
      const scales = currentScales.current;
      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];
        const threshold = b.revealAt ?? 0;
        const target = p >= threshold ? 1 : 0;
        const prev = scales[i];
        if (Math.abs(target - prev) > 0.004) {
          const next = THREE.MathUtils.damp(prev, target, 10, dt);
          scales[i] = next;
          const dropY = (1 - next) * 2.2;
          _dummy.position.set(b.x, b.y + dropY, b.z);
          _dummy.scale.setScalar(Math.max(0.0001, next));
          _dummy.updateMatrix();
          mesh.setMatrixAt(i, _dummy.matrix);
          dirty = true;
        } else if (prev !== target) {
          scales[i] = target;
          _dummy.position.set(b.x, b.y, b.z);
          _dummy.scale.setScalar(target === 0 ? 0.0001 : 1);
          _dummy.updateMatrix();
          mesh.setMatrixAt(i, _dummy.matrix);
          dirty = true;
        }
      }
    } else if (explodeRef) {
      const targetExplode = explodeRef.current;
      if (Math.abs(targetExplode - currentExplode.current) > 0.001) {
        currentExplode.current = THREE.MathUtils.damp(
          currentExplode.current,
          targetExplode,
          7,
          dt
        );
        const e = currentExplode.current;
        for (let i = 0; i < blocks.length; i++) {
          const b = blocks[i];
          const off = b.explodedOffset ?? [0, 0, 0];
          _dummy.position.set(b.x + off[0] * e, b.y + off[1] * e, b.z + off[2] * e);
          _dummy.scale.setScalar(1);
          _dummy.updateMatrix();
          mesh.setMatrixAt(i, _dummy.matrix);
        }
        dirty = true;
      }
    }

    if (dirty) {
      mesh.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, blocks.length]}
      castShadow={castShadow && !isTranslucent}
      receiveShadow={receiveShadow}
      frustumCulled={false}
    />
  );
}

interface VoxelTerrainProps {
  blocks: VoxelBlockData[];
  progressRef?: React.MutableRefObject<number>;
  explodeRef?: React.MutableRefObject<number>;
  castShadow?: boolean;
  receiveShadow?: boolean;
  position?: [number, number, number];
}

export function VoxelTerrain({
  blocks,
  progressRef,
  explodeRef,
  castShadow = true,
  receiveShadow = true,
  position = [0, 0, 0],
}: VoxelTerrainProps) {
  const batches = useMemo(() => {
    const grouped = new Map<BlockType, VoxelBlockData[]>();
    for (const block of blocks) {
      let arr = grouped.get(block.type);
      if (!arr) {
        arr = [];
        grouped.set(block.type, arr);
      }
      arr.push(block);
    }
    return Array.from(grouped.entries());
  }, [blocks]);

  return (
    <group position={position}>
      {batches.map(([type, batchBlocks]) => (
        <InstancedVoxelBatch
          key={`${type}-${batchBlocks.length}`}
          type={type}
          blocks={batchBlocks}
          progressRef={progressRef}
          explodeRef={explodeRef}
          castShadow={castShadow}
          receiveShadow={receiveShadow}
        />
      ))}
    </group>
  );
}

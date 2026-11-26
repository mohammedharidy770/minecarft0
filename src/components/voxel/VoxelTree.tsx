import { useMemo } from 'react';
import { VoxelTerrain } from './VoxelTerrain';
import { VoxelBlockData } from '../../voxel/worldBuilder';
import { BlockType } from '../../voxel/textures';

interface VoxelTreeProps {
  position?: [number, number, number];
  variant?: 'oak' | 'pine' | 'jungle' | 'mushroom';
  height?: number;
}

export function VoxelTree({
  position = [0, 0, 0],
  variant = 'oak',
  height = 4,
}: VoxelTreeProps) {
  const blocks = useMemo(() => {
    const out: VoxelBlockData[] = [];
    const trunkType: BlockType = variant === 'mushroom' ? 'mushroomStem' : 'wood';
    const crownType: BlockType =
      variant === 'pine'
        ? 'pineLeaves'
        : variant === 'jungle'
        ? 'jungleLeaves'
        : variant === 'mushroom'
        ? 'mushroomCap'
        : 'oakLeaves';

    for (let y = 0; y < height; y++) {
      out.push({ x: 0, y, z: 0, type: trunkType });
    }

    if (variant === 'pine') {
      for (let layer = 0; layer < height; layer++) {
        const radius = Math.max(0, Math.floor((height - layer) * 0.55));
        for (let dx = -radius; dx <= radius; dx++) {
          for (let dz = -radius; dz <= radius; dz++) {
            if (Math.abs(dx) + Math.abs(dz) <= radius + 1) {
              out.push({ x: dx, y: 2 + layer, z: dz, type: crownType });
            }
          }
        }
      }
    } else if (variant === 'mushroom') {
      for (let dx = -2; dx <= 2; dx++) {
        for (let dz = -2; dz <= 2; dz++) {
          if (Math.abs(dx) + Math.abs(dz) <= 3) {
            out.push({
              x: dx,
              y: height + (Math.abs(dx) <= 1 && Math.abs(dz) <= 1 ? 1 : 0),
              z: dz,
              type: crownType,
            });
          }
        }
      }
    } else {
      for (let dx = -2; dx <= 2; dx++) {
        for (let dz = -2; dz <= 2; dz++) {
          for (let dy = -1; dy <= 2; dy++) {
            if (Math.abs(dx) + Math.abs(dz) + Math.abs(dy) <= 3) {
              out.push({ x: dx, y: height + dy, z: dz, type: crownType });
            }
          }
        }
      }
    }
    return out;
  }, [variant, height]);

  return <VoxelTerrain blocks={blocks} position={position} />;
}

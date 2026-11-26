import { useMemo } from 'react';
import { VoxelTerrain } from './VoxelTerrain';
import { VoxelBlockData } from '../../voxel/worldBuilder';

interface VoxelBuildingProps {
  position?: [number, number, number];
  variant?: 'cottage' | 'watchtower' | 'shrine';
}

export function VoxelBuilding({
  position = [0, 0, 0],
  variant = 'cottage',
}: VoxelBuildingProps) {
  const blocks = useMemo(() => {
    const out: VoxelBlockData[] = [];

    if (variant === 'watchtower') {
      for (let y = 0; y <= 7; y++) {
        for (let x = -1; x <= 1; x++) {
          for (let z = -1; z <= 1; z++) {
            out.push({ x, y, z, type: 'castleBrick' });
          }
        }
      }
      for (let x = -2; x <= 2; x++) {
        for (let z = -2; z <= 2; z++) {
          out.push({ x, y: 8, z, type: 'cobble' });
          if ((Math.abs(x) === 2 || Math.abs(z) === 2) && (x + z) % 2 === 0) {
            out.push({ x, y: 9, z, type: 'castleBrick' });
          }
        }
      }
      out.push({ x: 0, y: 9, z: 0, type: 'lantern' });
      return out;
    }

    if (variant === 'shrine') {
      for (let x = -2; x <= 2; x++) {
        for (let z = -2; z <= 2; z++) {
          out.push({ x, y: 0, z, type: 'mossyStone' });
        }
      }
      for (const [px, pz] of [
        [-2, -2],
        [2, -2],
        [-2, 2],
        [2, 2],
      ]) {
        for (let y = 1; y <= 4; y++) out.push({ x: px, y, z: pz, type: 'mossyStone' });
      }
      for (let x = -2; x <= 2; x++) {
        for (let z = -2; z <= 2; z++) {
          out.push({ x, y: 5, z, type: 'cobble' });
        }
      }
      out.push({ x: 0, y: 1, z: 0, type: 'lantern' });
      return out;
    }

    // Cottage
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        out.push({ x, y: 0, z, type: 'cobble' });
      }
    }
    for (let y = 1; y <= 3; y++) {
      for (let x = -2; x <= 2; x++) {
        for (let z = -2; z <= 2; z++) {
          if (Math.abs(x) !== 2 && Math.abs(z) !== 2) continue;
          if (z === 2 && x === 0 && y <= 2) continue;
          const isCorner = Math.abs(x) === 2 && Math.abs(z) === 2;
          const isWin = Math.abs(x) === 2 && z === 0 && y === 2;
          out.push({
            x,
            y,
            z,
            type: isCorner ? 'wood' : isWin ? 'glass' : 'planks',
          });
        }
      }
    }
    for (let step = 0; step <= 2; step++) {
      for (let z = -3; z <= 3; z++) {
        out.push({ x: -(2 - step), y: 4 + step, z, type: 'roofTile' });
        if (step < 2) out.push({ x: 2 - step, y: 4 + step, z, type: 'roofTile' });
      }
    }
    out.push({ x: 1, y: 2, z: 3, type: 'lantern' });
    return out;
  }, [variant]);

  return <VoxelTerrain blocks={blocks} position={position} />;
}

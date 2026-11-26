import { fbm2D, ridgeNoise2D, createSeededRandom } from './noise';
import { BlockType } from './textures';

export interface VoxelBlockData {
  x: number;
  y: number;
  z: number;
  type: BlockType;
  stage?: number; // 1..7 for progressive hero construction
  revealAt?: number; // 0..1 normalized scroll trigger
  tint?: number; // subtle brightness variation
  explodedOffset?: [number, number, number];
  layerName?: string;
}

class VoxelGrid {
  private map = new Map<string, VoxelBlockData>();

  private key(x: number, y: number, z: number): string {
    return `${Math.round(x)},${Math.round(y)},${Math.round(z)}`;
  }

  set(
    x: number,
    y: number,
    z: number,
    type: BlockType,
    opts?: Partial<Omit<VoxelBlockData, 'x' | 'y' | 'z' | 'type'>>
  ) {
    const rx = Math.round(x);
    const ry = Math.round(y);
    const rz = Math.round(z);
    this.map.set(this.key(rx, ry, rz), {
      x: rx,
      y: ry,
      z: rz,
      type,
      ...opts,
    });
  }

  has(x: number, y: number, z: number): boolean {
    return this.map.has(this.key(x, y, z));
  }

  delete(x: number, y: number, z: number) {
    this.map.delete(this.key(x, y, z));
  }

  get(x: number, y: number, z: number): VoxelBlockData | undefined {
    return this.map.get(this.key(x, y, z));
  }

  fillBox(
    x1: number,
    y1: number,
    z1: number,
    x2: number,
    y2: number,
    z2: number,
    type: BlockType,
    opts?: Partial<Omit<VoxelBlockData, 'x' | 'y' | 'z' | 'type'>>
  ) {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    const minZ = Math.min(z1, z2);
    const maxZ = Math.max(z1, z2);
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          this.set(x, y, z, type, opts);
        }
      }
    }
  }

  toArray(cullOpaque = false): VoxelBlockData[] {
    if (!cullOpaque) return Array.from(this.map.values());
    const result: VoxelBlockData[] = [];
    for (const b of this.map.values()) {
      if (b.type === 'water' || b.type === 'glass' || b.type === 'ice' || b.type === 'cloud') {
        result.push(b);
        continue;
      }
      const covered =
        this.isOpaqueAt(b.x + 1, b.y, b.z) &&
        this.isOpaqueAt(b.x - 1, b.y, b.z) &&
        this.isOpaqueAt(b.x, b.y + 1, b.z) &&
        this.isOpaqueAt(b.x, b.y - 1, b.z) &&
        this.isOpaqueAt(b.x, b.y, b.z + 1) &&
        this.isOpaqueAt(b.x, b.y, b.z - 1);
      if (!covered) result.push(b);
    }
    return result;
  }

  private isOpaqueAt(x: number, y: number, z: number): boolean {
    const b = this.get(x, y, z);
    if (!b) return false;
    return (
      b.type !== 'water' &&
      b.type !== 'glass' &&
      b.type !== 'ice' &&
      b.type !== 'cloud' &&
      b.type !== 'crystalCyan' &&
      b.type !== 'crystalAmethyst'
    );
  }
}

function addOakTree(
  grid: VoxelGrid,
  tx: number,
  ty: number,
  tz: number,
  height = 4,
  leafType: BlockType = 'oakLeaves',
  opts?: Partial<Omit<VoxelBlockData, 'x' | 'y' | 'z' | 'type'>>
) {
  for (let i = 1; i <= height; i++) {
    grid.set(tx, ty + i, tz, 'wood', opts);
  }
  const top = ty + height;
  for (let dx = -2; dx <= 2; dx++) {
    for (let dz = -2; dz <= 2; dz++) {
      for (let dy = -1; dy <= 2; dy++) {
        const dist = Math.abs(dx) + Math.abs(dz) + Math.abs(dy);
        if (dist <= 3 && !(dx === 0 && dz === 0 && dy <= 0)) {
          grid.set(tx + dx, top + dy, tz + dz, leafType, opts);
        }
      }
    }
  }
}

function addPineTree(
  grid: VoxelGrid,
  tx: number,
  ty: number,
  tz: number,
  height = 6,
  snowy = false,
  opts?: Partial<Omit<VoxelBlockData, 'x' | 'y' | 'z' | 'type'>>
) {
  for (let i = 1; i <= height; i++) {
    grid.set(tx, ty + i, tz, 'wood', opts);
  }
  const crownStart = ty + 2;
  for (let layer = 0; layer < height; layer++) {
    const radius = Math.max(0, Math.floor((height - layer) * 0.55));
    const y = crownStart + layer;
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dz = -radius; dz <= radius; dz++) {
        if (Math.abs(dx) + Math.abs(dz) <= radius + 1) {
          if (dx === 0 && dz === 0 && layer < height - 1) continue;
          grid.set(tx + dx, y, tz + dz, 'pineLeaves', opts);
          if (snowy && (layer >= height - 2 || Math.abs(dx) === radius)) {
            grid.set(tx + dx, y + 1, tz + dz, 'snow', opts);
          }
        }
      }
    }
  }
  grid.set(tx, crownStart + height, tz, snowy ? 'snow' : 'pineLeaves', opts);
}

function addVillageCottage(
  grid: VoxelGrid,
  cx: number,
  cy: number,
  cz: number,
  opts?: Partial<Omit<VoxelBlockData, 'x' | 'y' | 'z' | 'type'>>
) {
  // Foundation
  grid.fillBox(cx - 2, cy, cz - 2, cx + 2, cy, cz + 2, 'cobble', opts);
  // Walls
  for (let y = 1; y <= 3; y++) {
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        const isEdge = Math.abs(x) === 2 || Math.abs(z) === 2;
        if (!isEdge) continue;
        const isCorner = Math.abs(x) === 2 && Math.abs(z) === 2;
        const isDoor = z === 2 && x === 0 && y <= 2;
        const isWindow = (Math.abs(x) === 2 && z === 0 && y === 2) || (z === -2 && x === 0 && y === 2);
        if (isDoor) continue;
        grid.set(cx + x, cy + y, cz + z, isCorner ? 'wood' : isWindow ? 'glass' : 'planks', opts);
      }
    }
  }
  // Pitched Roof
  for (let step = 0; step <= 2; step++) {
    const ry = cy + 4 + step;
    for (let z = -3; z <= 3; z++) {
      grid.set(cx - (2 - step), ry, cz + z, 'roofTile', opts);
      grid.set(cx + (2 - step), ry, cz + z, 'roofTile', opts);
    }
  }
  // Chimney + Lantern
  grid.set(cx + 1, cy + 5, cz - 1, 'cobble', opts);
  grid.set(cx + 1, cy + 6, cz - 1, 'cobble', opts);
  grid.set(cx + 1, cy + 2, cz + 3, 'lantern', opts);
}

function addWatchtower(
  grid: VoxelGrid,
  tx: number,
  ty: number,
  tz: number,
  height = 8,
  opts?: Partial<Omit<VoxelBlockData, 'x' | 'y' | 'z' | 'type'>>
) {
  grid.fillBox(tx - 1, ty, tz - 1, tx + 1, ty + height, tz + 1, 'castleBrick', opts);
  // Hollow core top + battlement
  grid.fillBox(tx - 2, ty + height + 1, tz - 2, tx + 2, ty + height + 1, tz + 2, 'cobble', opts);
  for (let x = -2; x <= 2; x++) {
    for (let z = -2; z <= 2; z++) {
      if ((Math.abs(x) === 2 || Math.abs(z) === 2) && (x + z) % 2 === 0) {
        grid.set(tx + x, ty + height + 2, tz + z, 'castleBrick', opts);
      }
    }
  }
  grid.set(tx, ty + height + 2, tz, 'lantern', opts);
}

/**
 * HERO WORLD: 7 progressive scroll scenes
 * 1: Single grass block floating in darkness (revealAt ~ 0.0)
 * 2: Ground forms from individual blocks (revealAt 0.08 - 0.25)
 * 3: Hills, trees, grass, flowers emerge (revealAt 0.25 - 0.42)
 * 4: Mountains and winding river form (revealAt 0.42 - 0.58)
 * 5: Medieval voxel village & bridge emerge (revealAt 0.58 - 0.74)
 * 6: Enormous outer world, forest & citadel (revealAt 0.74 - 0.88)
 * 7: Clouds & golden aerial vista (revealAt 0.88 - 0.96)
 */
export function generateHeroWorld(): VoxelBlockData[] {
  const grid = new VoxelGrid();
  const rand = createSeededRandom(2026);
  const radius = 19;

  // Stage 1: Hero single floating grass block at origin (0, 2, 0)
  grid.set(0, 2, 0, 'grass', { stage: 1, revealAt: 0.0, tint: 1.05 });

  // Compute terrain heights across -radius..radius
  const surfaceY = new Map<string, number>();
  for (let x = -radius; x <= radius; x++) {
    for (let z = -radius; z <= radius; z++) {
      const dist = Math.sqrt(x * x + z * z);
      if (dist > radius + 0.5) continue;

      // River channel curving along x = sin(z * 0.22) * 4 - 2
      const riverCenter = Math.sin(z * 0.22) * 3.5 - 3;
      const riverDist = Math.abs(x - riverCenter);
      const isRiver = riverDist < 1.8 && dist < radius - 1;

      // Mountain ridge at back (-z, +x)
      const mountainWeight = Math.max(0, (-z - 3) / 14 + (x - 4) / 22);
      const mNoise = ridgeNoise2D(x * 0.09, z * 0.09, 777) * 11 * Math.pow(mountainWeight, 1.3);

      // Gentle rolling hills
      const hill = fbm2D(x * 0.08, z * 0.08, 303, 3) * 3.5;

      let h = Math.round(1 + hill + mNoise);
      if (x === 0 && z === 0) h = 2; // Align with hero origin block
      if (isRiver) h = 0;

      surfaceY.set(`${x},${z}`, h);

      const radialNorm = Math.min(1, dist / radius);

      // Stage 2: inner core terrain (dist <= 6)
      // Stage 3: rolling mid-ground hills (dist 6..12)
      // Stage 4: river & outer mountains
      // Stage 6: outer perimeter world expansion
      let stage = 2;
      let revealAt = 0.08 + radialNorm * 0.16;

      if (isRiver || h >= 5) {
        stage = 4;
        revealAt = 0.42 + (rand() * 0.12);
      } else if (dist > 13) {
        stage = 6;
        revealAt = 0.74 + ((dist - 13) / (radius - 13)) * 0.12;
      } else if (dist > 6) {
        stage = 3;
        revealAt = 0.25 + ((dist - 6) / 7) * 0.14;
      }

      if (x === 0 && z === 0) {
        // Keep stage 1 top block
        grid.set(0, 1, 0, 'dirt', { stage: 2, revealAt: 0.08 });
        grid.set(0, 0, 0, 'stone', { stage: 2, revealAt: 0.09 });
        continue;
      }

      if (isRiver) {
        grid.set(x, -1, z, 'sand', { stage: 4, revealAt: 0.43 + rand() * 0.06 });
        grid.set(x, 0, z, 'water', { stage: 4, revealAt: 0.46 + rand() * 0.08 });
      } else {
        const topType: BlockType = h >= 9 ? 'snow' : h >= 6 ? 'stone' : 'grass';
        grid.set(x, h, z, topType, {
          stage,
          revealAt,
          tint: 0.92 + rand() * 0.16,
        });
        grid.set(x, h - 1, z, h >= 6 ? 'stone' : 'dirt', {
          stage,
          revealAt: Math.max(0.08, revealAt - 0.02),
        });
        if (h > 1) {
          grid.set(x, h - 2, z, 'stone', {
            stage,
            revealAt: Math.max(0.08, revealAt - 0.03),
          });
        }
      }
    }
  }

  // Stage 3: Trees & Flowers on gentle grassy areas
  const treeSpots: [number, number, boolean][] = [
    [-5, 5, false],
    [-8, 1, false],
    [4, 6, false],
    [7, 3, false],
    [-10, -4, true],
    [10, -2, true],
    [-12, 8, false],
    [11, 9, false],
    [-14, 2, true],
    [14, 4, true],
    [-7, -11, true],
    [12, -10, true],
  ];
  for (const [tx, tz, isPine] of treeSpots) {
    const ty = surfaceY.get(`${tx},${tz}`);
    if (ty === undefined || ty <= 0 || ty >= 6) continue;
    const dist = Math.sqrt(tx * tx + tz * tz);
    const stage = dist > 11 ? 6 : 3;
    const revealAt = stage === 3 ? 0.28 + rand() * 0.12 : 0.76 + rand() * 0.1;
    if (isPine) {
      addPineTree(grid, tx, ty, tz, 5 + Math.floor(rand() * 2), false, { stage, revealAt });
    } else {
      addOakTree(grid, tx, ty, tz, 3 + Math.floor(rand() * 2), 'oakLeaves', { stage, revealAt });
    }
  }

  // Flowers scattered in Stage 3
  for (let i = 0; i < 36; i++) {
    const fx = Math.round((rand() - 0.5) * 20);
    const fz = Math.round((rand() - 0.5) * 20);
    const fy = surfaceY.get(`${fx},${fz}`);
    if (fy && fy > 0 && fy < 5 && !grid.has(fx, fy + 1, fz)) {
      grid.set(fx, fy + 1, fz, rand() > 0.45 ? 'flowerGold' : 'flowerCrimson', {
        stage: 3,
        revealAt: 0.34 + rand() * 0.08,
      });
    }
  }

  // Stage 5: Medieval Voxel Village + Stone Bridge over River
  // Stone Bridge across z = 2
  for (let bx = -6; bx <= 1; bx++) {
    const arch = bx >= -4 && bx <= -1 ? 2 : 1;
    grid.set(bx, arch, 2, 'cobble', { stage: 5, revealAt: 0.58 + (bx + 6) * 0.01 });
    grid.set(bx, arch, 1, 'cobble', { stage: 5, revealAt: 0.58 + (bx + 6) * 0.01 });
    if (bx === -4 || bx === -1) {
      grid.set(bx, arch + 1, 2, 'lantern', { stage: 5, revealAt: 0.64 });
    }
  }

  // Cottages
  const cottageA_Y = surfaceY.get('4,2') ?? 2;
  addVillageCottage(grid, 5, cottageA_Y, 1, { stage: 5, revealAt: 0.61 });

  const cottageB_Y = surfaceY.get('3,-5') ?? 2;
  addVillageCottage(grid, 3, cottageB_Y, -5, { stage: 5, revealAt: 0.65 });

  // Wheat farm patch
  for (let wx = -8; wx <= -5; wx++) {
    for (let wz = 6; wz <= 9; wz++) {
      const wy = surfaceY.get(`${wx},${wz}`) ?? 1;
      if (wy > 0) {
        grid.set(wx, wy, wz, 'dirt', { stage: 5, revealAt: 0.63 });
        grid.set(wx, wy + 1, wz, 'wheat', { stage: 5, revealAt: 0.67 + rand() * 0.04 });
      }
    }
  }

  // Stage 6: Distant Watchtower & Citadel Keep on high ground
  const towerY = surfaceY.get('-9,-8') ?? 3;
  addWatchtower(grid, -9, towerY, -8, 7, { stage: 6, revealAt: 0.78 });

  const keepY = surfaceY.get('10,-12') ?? 5;
  addWatchtower(grid, 10, keepY, -12, 9, { stage: 6, revealAt: 0.81 });

  // Stage 7: Floating Voxel Clouds high above
  const cloudCenters: [number, number, number][] = [
    [-11, 16, -6],
    [8, 18, 7],
    [-3, 17, 12],
    [13, 19, -9],
  ];
  for (const [cx, cy, cz] of cloudCenters) {
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        if (Math.abs(dx) + Math.abs(dz) <= 3) {
          grid.set(cx + dx, cy, cz + dz, 'cloud', { stage: 7, revealAt: 0.88 + rand() * 0.06 });
        }
      }
    }
  }

  return grid.toArray(true);
}

export type BiomeId = 'forest' | 'desert' | 'snow' | 'jungle' | 'mountain' | 'mushroom';

export function generateBiomeWorld(biome: BiomeId): VoxelBlockData[] {
  const grid = new VoxelGrid();
  const rand = createSeededRandom(
    biome === 'forest'
      ? 101
      : biome === 'desert'
      ? 202
      : biome === 'snow'
      ? 303
      : biome === 'jungle'
      ? 404
      : biome === 'mountain'
      ? 505
      : 606
  );
  const radius = 12;
  const heights = new Map<string, number>();

  for (let x = -radius; x <= radius; x++) {
    for (let z = -radius; z <= radius; z++) {
      if (Math.sqrt(x * x + z * z) > radius + 0.4) continue;
      let h = 1;
      let top: BlockType = 'grass';
      let sub: BlockType = 'dirt';

      if (biome === 'forest') {
        h = Math.round(1 + fbm2D(x * 0.1, z * 0.1, 11) * 2.8);
        const stream = Math.abs(x - Math.sin(z * 0.3) * 2.2) < 1.3;
        if (stream) {
          grid.set(x, 0, z, 'water');
          grid.set(x, -1, z, 'sand');
          heights.set(`${x},${z}`, 0);
          continue;
        }
      } else if (biome === 'desert') {
        h = Math.round(1 + Math.sin(x * 0.25 + z * 0.15) * 1.8 + fbm2D(x * 0.12, z * 0.12, 22) * 2.2);
        top = 'sand';
        sub = 'sandstone';
        const oasis = Math.hypot(x - 2, z - 2) < 3.4;
        if (oasis) {
          grid.set(x, 0, z, 'water');
          grid.set(x, -1, z, 'sand');
          heights.set(`${x},${z}`, 0);
          continue;
        }
      } else if (biome === 'snow') {
        h = Math.round(1 + ridgeNoise2D(x * 0.1, z * 0.1, 33) * 5.2);
        top = 'snow';
        sub = h > 3 ? 'ice' : 'stone';
        if (Math.hypot(x + 3, z - 3) < 3.2) {
          grid.set(x, 0, z, 'ice');
          grid.set(x, -1, z, 'stone');
          heights.set(`${x},${z}`, 0);
          continue;
        }
      } else if (biome === 'jungle') {
        h = Math.round(1 + fbm2D(x * 0.11, z * 0.11, 44) * 3.8);
        top = 'grass';
        sub = 'mossyStone';
        if (Math.abs(z + Math.cos(x * 0.28) * 2.5) < 1.4) {
          grid.set(x, 0, z, 'water');
          grid.set(x, -1, z, 'mossyStone');
          heights.set(`${x},${z}`, 0);
          continue;
        }
      } else if (biome === 'mountain') {
        const ridge = ridgeNoise2D(x * 0.09, z * 0.09, 55);
        h = Math.round(1 + ridge * 10);
        top = h >= 7 ? 'snow' : h >= 4 ? 'stone' : 'grass';
        sub = 'stone';
      } else if (biome === 'mushroom') {
        h = Math.round(1 + fbm2D(x * 0.12, z * 0.12, 66) * 3.0);
        top = 'mycelium';
        sub = 'dirt';
      }

      heights.set(`${x},${z}`, h);
      grid.set(x, h, z, top, { tint: 0.92 + rand() * 0.16 });
      grid.set(x, h - 1, z, sub);
      if (h > 1) grid.set(x, h - 2, z, 'stone');
    }
  }

  // Biome-specific vegetation & landmarks
  if (biome === 'forest') {
    const trees = [
      [-6, -4],
      [-3, 5],
      [4, -5],
      [6, 4],
      [-7, 3],
      [2, 7],
      [7, -1],
    ];
    for (const [tx, tz] of trees) {
      const ty = heights.get(`${tx},${tz}`);
      if (ty && ty > 0) addOakTree(grid, tx, ty, tz, 4, 'oakLeaves');
    }
    for (let i = 0; i < 18; i++) {
      const fx = Math.round((rand() - 0.5) * 18);
      const fz = Math.round((rand() - 0.5) * 18);
      const fy = heights.get(`${fx},${fz}`);
      if (fy && fy > 0 && !grid.has(fx, fy + 1, fz)) {
        grid.set(fx, fy + 1, fz, rand() > 0.5 ? 'flowerGold' : 'flowerCrimson');
      }
    }
  } else if (biome === 'desert') {
    const cacti = [
      [-6, -5],
      [-4, 6],
      [7, -4],
      [6, 5],
      [-8, 1],
    ];
    for (const [cx, cz] of cacti) {
      const cy = heights.get(`${cx},${cz}`);
      if (cy && cy > 0) {
        const ch = 3 + Math.floor(rand() * 2);
        for (let i = 1; i <= ch; i++) grid.set(cx, cy + i, cz, 'cactus');
        grid.set(cx + 1, cy + 2, cz, 'cactus');
        grid.set(cx + 1, cy + 3, cz, 'cactus');
      }
    }
    // Desert ruins pillar
    const ry = heights.get('-2,-5') ?? 2;
    for (let i = 1; i <= 5; i++) grid.set(-2, ry + i, -5, 'sandstone');
    for (let i = 1; i <= 4; i++) grid.set(1, ry + i, -5, 'sandstone');
    grid.fillBox(-2, ry + 5, -5, 1, ry + 5, -5, 'sandstone');
    grid.set(0, ry + 1, 5, 'lantern');
  } else if (biome === 'snow') {
    const pines = [
      [-5, -5],
      [4, -6],
      [6, 3],
      [-7, 2],
      [1, 6],
    ];
    for (const [px, pz] of pines) {
      const py = heights.get(`${px},${pz}`);
      if (py && py > 0) addPineTree(grid, px, py, pz, 6, true);
    }
    // Ice spires
    for (const [ix, iz] of [
      [-2, -2],
      [3, -1],
    ]) {
      const iy = heights.get(`${ix},${iz}`) ?? 2;
      for (let h = 1; h <= 6; h++) grid.set(ix, iy + h, iz, 'ice');
    }
  } else if (biome === 'jungle') {
    const giants = [
      [-5, -4],
      [4, -5],
      [5, 5],
      [-6, 4],
    ];
    for (const [jx, jz] of giants) {
      const jy = heights.get(`${jx},${jz}`);
      if (jy && jy > 0) {
        addOakTree(grid, jx, jy, jz, 7, 'jungleLeaves');
        // Hanging vines
        grid.set(jx + 2, jy + 5, jz, 'jungleLeaves');
        grid.set(jx + 2, jy + 4, jz, 'jungleLeaves');
        grid.set(jx - 2, jy + 4, jz + 1, 'jungleLeaves');
      }
    }
    // Mossy shrine
    const sy = heights.get('0,-1') ?? 2;
    grid.fillBox(-1, sy + 1, -2, 1, sy + 1, 0, 'mossyStone');
    grid.set(0, sy + 2, -1, 'lantern');
  } else if (biome === 'mountain') {
    // Waterfall down central peak
    for (let y = 1; y <= 8; y++) {
      grid.set(0, y, 2, 'water');
    }
    addPineTree(grid, -6, heights.get('-6,5') ?? 2, 5, 5, true);
    addPineTree(grid, 6, heights.get('6,4') ?? 2, 4, 5, true);
    grid.set(2, (heights.get('2,5') ?? 2) + 1, 5, 'lantern');
  } else if (biome === 'mushroom') {
    const shrooms = [
      [-4, -3, 5],
      [4, 2, 6],
      [-2, 5, 4],
      [5, -5, 5],
    ];
    for (const [mx, mz, mh] of shrooms) {
      const my = heights.get(`${mx},${mz}`);
      if (my === undefined) continue;
      for (let i = 1; i <= mh; i++) grid.set(mx, my + i, mz, 'mushroomStem');
      const capY = my + mh;
      for (let dx = -2; dx <= 2; dx++) {
        for (let dz = -2; dz <= 2; dz++) {
          if (Math.abs(dx) + Math.abs(dz) <= 3) {
            grid.set(mx + dx, capY + (Math.abs(dx) <= 1 && Math.abs(dz) <= 1 ? 1 : 0), mz + dz, 'mushroomCap');
          }
        }
      }
    }
    // Glowing crystal spores
    grid.set(0, (heights.get('0,0') ?? 1) + 1, 0, 'crystalAmethyst');
    grid.set(-2, (heights.get('-2,-1') ?? 1) + 1, -1, 'crystalCyan');
  }

  return grid.toArray(true);
}

export function generateKingdomWorld(): VoxelBlockData[] {
  const grid = new VoxelGrid();
  const rand = createSeededRandom(8888);
  const radius = 21;
  const heights = new Map<string, number>();

  for (let x = -radius; x <= radius; x++) {
    for (let z = -radius; z <= radius; z++) {
      if (Math.hypot(x, z) > radius + 0.4) continue;
      const riverZ = Math.sin(x * 0.2) * 2.5 + 7;
      const isRiver = Math.abs(z - riverZ) < 1.9;
      const flattenCastle = Math.abs(x) <= 7 && z >= -9 && z <= 3;

      let h = flattenCastle ? 2 : Math.round(1 + fbm2D(x * 0.08, z * 0.08, 912) * 3.2);
      if (isRiver) h = 0;
      heights.set(`${x},${z}`, h);

      if (isRiver) {
        grid.set(x, -1, z, 'sand');
        grid.set(x, 0, z, 'water');
      } else {
        grid.set(x, h, z, 'grass', { tint: 0.93 + rand() * 0.14 });
        grid.set(x, h - 1, z, 'dirt');
      }
    }
  }

  // Grand Stone Castle Keep (center: 0, 2, -3)
  const cy = 2;
  // Outer Curtain Wall
  for (let x = -6; x <= 6; x++) {
    for (let z = -8; z <= 2; z++) {
      const onWall = Math.abs(x) === 6 || z === -8 || z === 2;
      const gate = z === 2 && Math.abs(x) <= 1;
      if (onWall && !gate) {
        for (let y = 1; y <= 4; y++) {
          grid.set(x, cy + y, z, 'castleBrick');
        }
        if ((x + z) % 2 === 0) grid.set(x, cy + 5, z, 'cobble');
      }
    }
  }
  // 4 Corner Watchtowers
  for (const [tx, tz] of [
    [-6, -8],
    [6, -8],
    [-6, 2],
    [6, 2],
  ]) {
    addWatchtower(grid, tx, cy, tz, 7);
  }
  // Central Castle Keep
  grid.fillBox(-3, cy + 1, -6, 3, cy + 7, -1, 'castleBrick');
  grid.fillBox(-2, cy + 8, -5, 2, cy + 11, -2, 'cobble');
  // Pitched Keep Spire Roof + Gold Finial
  for (let s = 0; s <= 2; s++) {
    grid.fillBox(-2 + s, cy + 12 + s, -5 + s, 2 - s, cy + 12 + s, -2 - s, 'roofTile');
  }
  grid.set(0, cy + 15, -3, 'gold');
  grid.set(0, cy + 16, -3, 'gold');
  // Gatehouse Lanterns
  grid.set(-2, cy + 3, 3, 'lantern');
  grid.set(2, cy + 3, 3, 'lantern');

  // Arched Stone Bridge across river at x = -1..1
  for (let bz = 4; bz <= 10; bz++) {
    const arch = bz >= 6 && bz <= 8 ? 2 : 1;
    for (let bx = -1; bx <= 1; bx++) {
      grid.set(bx, arch, bz, 'cobble');
    }
    if (bz === 6 || bz === 8) {
      grid.set(-1, arch + 1, bz, 'lantern');
      grid.set(1, arch + 1, bz, 'lantern');
    }
  }

  // Medieval Village Cottages south of the river
  addVillageCottage(grid, -7, heights.get('-7,13') ?? 1, 13);
  addVillageCottage(grid, 7, heights.get('7,12') ?? 1, 12);
  addVillageCottage(grid, -13, heights.get('-13,0') ?? 2, 0);

  // Wheat Farms
  for (let fx = 9; fx <= 14; fx++) {
    for (let fz = 1; fz <= 5; fz++) {
      const fy = heights.get(`${fx},${fz}`) ?? 1;
      if (fy > 0) {
        grid.set(fx, fy, fz, 'dirt');
        grid.set(fx, fy + 1, fz, 'wheat');
      }
    }
  }

  // Perimeter Forest
  const forestSpots = [
    [-15, -10],
    [-12, -13],
    [13, -11],
    [15, -6],
    [-16, 6],
    [15, 10],
    [-14, 14],
    [12, 15],
    [0, -16],
    [-8, -15],
    [8, -15],
  ];
  for (const [fx, fz] of forestSpots) {
    const fy = heights.get(`${fx},${fz}`);
    if (fy && fy > 0) addPineTree(grid, fx, fy, fz, 5 + Math.floor(rand() * 3), false);
  }

  return grid.toArray(true);
}

export function generateUndergroundWorld(): VoxelBlockData[] {
  const grid = new VoxelGrid();
  const rand = createSeededRandom(5150);
  const radius = 15;

  for (let x = -radius; x <= radius; x++) {
    for (let z = -radius; z <= radius; z++) {
      if (Math.hypot(x, z) > radius + 0.4) continue;

      // Lava river on left side, Underground Lake on right side
      const isLava = Math.abs(x + 5 - Math.sin(z * 0.25) * 2) < 1.8;
      const isLake = Math.hypot(x - 6, z - 2) < 4.8;

      const floorY = isLava || isLake ? -1 : Math.round(fbm2D(x * 0.14, z * 0.14, 71) * 2.2);

      if (isLava) {
        grid.set(x, -1, z, 'lava');
        grid.set(x, -2, z, 'basalt');
      } else if (isLake) {
        grid.set(x, -1, z, 'water');
        grid.set(x, -2, z, 'stone');
      } else {
        grid.set(x, floorY, z, rand() > 0.4 ? 'basalt' : 'stone');
        grid.set(x, floorY - 1, z, 'basalt');
      }

      // Cavern ceiling arch along back & sides
      const dist = Math.hypot(x, z);
      if (dist > 10 || z < -6) {
        const wallHeight = Math.round(5 + ridgeNoise2D(x * 0.12, z * 0.12, 99) * 6);
        for (let y = floorY + 1; y <= wallHeight; y++) {
          if (y === wallHeight || dist > 13.2 || z < -11) {
            grid.set(x, y, z, y % 3 === 0 ? 'basalt' : 'cobble');
          }
        }
        // Stalactites hanging from upper rim
        if (z < -7 && rand() > 0.72) {
          grid.set(x, wallHeight - 1, z, 'stone');
          grid.set(x, wallHeight - 2, z, 'crystalCyan');
        }
      }
    }
  }

  // Glowing Crystal Formations
  const clusters: [number, number, BlockType, number][] = [
    [-2, -4, 'crystalCyan', 5],
    [3, -5, 'crystalAmethyst', 6],
    [-8, 4, 'crystalAmethyst', 4],
    [8, -3, 'crystalCyan', 5],
    [0, 6, 'crystalCyan', 4],
  ];
  for (const [cx, cz, cType, ch] of clusters) {
    for (let i = 1; i <= ch; i++) grid.set(cx, i, cz, cType);
    grid.set(cx + 1, 1, cz, cType);
    grid.set(cx + 1, 2, cz, cType);
    grid.set(cx, 1, cz + 1, cType);
  }

  // Ancient Subterranean Ruins & Shrine
  grid.fillBox(-1, 1, -1, 2, 1, 2, 'mossyStone');
  for (const [px, pz] of [
    [-1, -1],
    [2, -1],
    [-1, 2],
    [2, 2],
  ]) {
    for (let y = 2; y <= 5; y++) grid.set(px, y, pz, 'mossyStone');
  }
  grid.fillBox(-1, 6, -1, 2, 6, 2, 'cobble');
  grid.set(0, 2, 0, 'lantern');
  grid.set(1, 2, 1, 'gold');

  return grid.toArray(false);
}

export function generateExplodedStructure(): VoxelBlockData[] {
  const blocks: VoxelBlockData[] = [];
  const push = (
    x: number,
    y: number,
    z: number,
    type: BlockType,
    explodedOffset: [number, number, number],
    layerName: string
  ) => {
    blocks.push({ x, y, z, type, explodedOffset, layerName });
  };

  // 1. Surrounding Garden & Path Environment (moves outward & slightly down)
  for (let x = -5; x <= 5; x++) {
    for (let z = -5; z <= 5; z++) {
      if (Math.abs(x) <= 2 && Math.abs(z) <= 2) continue;
      if (Math.hypot(x, z) > 5.4) continue;
      const isPath = x === 0 && z > 2;
      push(x, 0, z, isPath ? 'cobble' : 'grass', [x * 0.65, -2.5, z * 0.65], 'environment');
    }
  }
  // Corner garden trees/flowers
  push(-4, 1, 3, 'flowerGold', [-2.8, -1.6, 2.2], 'environment');
  push(4, 1, 3, 'flowerCrimson', [2.8, -1.6, 2.2], 'environment');
  push(-4, 1, -3, 'wood', [-3.0, -1.2, -2.5], 'environment');
  push(-4, 2, -3, 'oakLeaves', [-3.0, -0.5, -2.5], 'environment');
  push(-3, 2, -3, 'oakLeaves', [-2.5, -0.5, -2.5], 'environment');
  push(-4, 3, -3, 'oakLeaves', [-3.0, 0.1, -2.5], 'environment');

  // 2. Foundation Plinth (drops straight down)
  for (let x = -2; x <= 2; x++) {
    for (let z = -2; z <= 2; z++) {
      push(x, 0, z, 'cobble', [0, -3.5, 0], 'foundation');
      push(x, 1, z, 'castleBrick', [0, -2.2, 0], 'foundation');
    }
  }

  // 3. Masonry & Timber Walls (expand radially outward)
  for (let y = 2; y <= 5; y++) {
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        const isWall = Math.abs(x) === 2 || Math.abs(z) === 2;
        if (!isWall) continue;
        const isCorner = Math.abs(x) === 2 && Math.abs(z) === 2;
        const isDoor = z === 2 && x === 0 && y <= 3;
        const isWindow =
          (Math.abs(x) === 2 && z === 0 && (y === 3 || y === 4)) ||
          (z === -2 && x === 0 && (y === 3 || y === 4));

        if (isDoor) continue;
        if (isWindow) {
          push(x, y, z, 'glass', [x * 1.9, (y - 2) * 0.4, z * 1.9], 'windows');
        } else {
          push(
            x,
            y,
            z,
            isCorner ? 'wood' : y === 5 ? 'planks' : 'castleBrick',
            [x * 1.15, (y - 2) * 0.25, z * 1.15],
            'walls'
          );
        }
      }
    }
  }

  // 4. Decorative Interior & Lanterns
  push(0, 2, 0, 'gold', [0, 0.8, 0], 'decor');
  push(-1, 2, 3, 'lantern', [-1.8, 0.5, 3.2], 'decor');
  push(1, 2, 3, 'lantern', [1.8, 0.5, 3.2], 'decor');
  push(0, 4, 2, 'gold', [0, 1.8, 2.8], 'decor');

  // 5. Pitched Roof Sections (lift skyward in tiered steps)
  for (let step = 0; step <= 2; step++) {
    const ry = 6 + step;
    const lift = 4.2 + step * 1.6;
    for (let x = -2 + step; x <= 2 - step; x++) {
      for (let z = -3; z <= 3; z++) {
        if (Math.abs(x) === 2 - step || step === 2) {
          push(x, ry, z, step === 2 ? 'gold' : 'roofTile', [x * 0.6, lift, z * 0.3], 'roof');
        }
      }
    }
  }

  return blocks;
}

export type ProjectSlug =
  | 'the-lost-kingdom'
  | 'sky-islands'
  | 'the-deep-forest'
  | 'frozen-empire'
  | 'the-nether-gate';

export function generateProjectWorld(slug: ProjectSlug): VoxelBlockData[] {
  if (slug === 'the-lost-kingdom') {
    return generateKingdomWorld();
  }

  const grid = new VoxelGrid();
  const rand = createSeededRandom(slug.length * 997);

  if (slug === 'sky-islands') {
    const islands: { cx: number; cy: number; cz: number; r: number; hasTower?: boolean; hasTree?: boolean }[] = [
      { cx: 0, cy: 4, cz: 0, r: 6, hasTower: true },
      { cx: -10, cy: 6, cz: -4, r: 4, hasTree: true },
      { cx: 10, cy: 2, cz: -3, r: 4.5, hasTree: true },
      { cx: 2, cy: 7, cz: -10, r: 3.5, hasTree: true },
    ];
    for (const isl of islands) {
      for (let x = -Math.ceil(isl.r); x <= Math.ceil(isl.r); x++) {
        for (let z = -Math.ceil(isl.r); z <= Math.ceil(isl.r); z++) {
          const d = Math.hypot(x, z);
          if (d > isl.r) continue;
          const depth = Math.max(1, Math.round((isl.r - d) * 1.15));
          grid.set(isl.cx + x, isl.cy, isl.cz + z, 'grass');
          for (let dy = 1; dy <= depth; dy++) {
            grid.set(isl.cx + x, isl.cy - dy, isl.cz + z, dy === 1 ? 'dirt' : 'stone');
          }
        }
      }
      if (isl.hasTower) {
        addWatchtower(grid, isl.cx, isl.cy, isl.cz, 6);
        grid.set(isl.cx + 3, isl.cy + 1, isl.cz + 2, 'crystalCyan');
      }
      if (isl.hasTree) {
        addOakTree(grid, isl.cx, isl.cy, isl.cz, 4, 'oakLeaves');
      }
    }
    // Suspended timber bridges connecting islands
    for (let i = -5; i <= 5; i++) {
      const sag = Math.round((i * i) * 0.04);
      grid.set(i - 4, 5 - sag, -2, 'planks');
      grid.set(i + 4, 3 - sag, -1, 'planks');
    }
    // Waterfall cascading off main island edge
    for (let y = -5; y <= 4; y++) {
      grid.set(0, y, 5, 'water');
    }
    return grid.toArray(true);
  }

  if (slug === 'the-deep-forest') {
    const r = 16;
    const heights = new Map<string, number>();
    for (let x = -r; x <= r; x++) {
      for (let z = -r; z <= r; z++) {
        if (Math.hypot(x, z) > r) continue;
        const river = Math.abs(x - Math.sin(z * 0.25) * 3) < 1.5;
        if (river) {
          grid.set(x, 0, z, 'water');
          grid.set(x, -1, z, 'mossyStone');
          heights.set(`${x},${z}`, 0);
        } else {
          const h = Math.round(1 + fbm2D(x * 0.1, z * 0.1, 412) * 3);
          heights.set(`${x},${z}`, h);
          grid.set(x, h, z, 'grass', { tint: 0.85 + rand() * 0.2 });
          grid.set(x, h - 1, z, 'dirt');
        }
      }
    }
    // Ancient giant trees + hidden moss ruin
    for (const [tx, tz] of [
      [-6, -6],
      [6, -7],
      [-8, 4],
      [7, 5],
      [-3, 8],
      [9, -1],
      [-10, -2],
    ]) {
      const ty = heights.get(`${tx},${tz}`);
      if (ty && ty > 0) addOakTree(grid, tx, ty, tz, 6, 'jungleLeaves');
    }
    // Hidden forest shrine
    const sy = heights.get('3,0') ?? 2;
    grid.fillBox(2, sy + 1, -1, 5, sy + 1, 2, 'mossyStone');
    for (const [px, pz] of [
      [2, -1],
      [5, -1],
      [2, 2],
      [5, 2],
    ]) {
      for (let y = 2; y <= 5; y++) grid.set(px, sy + y, pz, 'mossyStone');
    }
    grid.set(3, sy + 2, 0, 'lantern');
    grid.set(4, sy + 2, 1, 'crystalCyan');
    return grid.toArray(true);
  }

  if (slug === 'frozen-empire') {
    const r = 16;
    const heights = new Map<string, number>();
    for (let x = -r; x <= r; x++) {
      for (let z = -r; z <= r; z++) {
        if (Math.hypot(x, z) > r) continue;
        const flat = Math.hypot(x, z) < 6;
        const h = flat ? 2 : Math.round(2 + ridgeNoise2D(x * 0.1, z * 0.1, 809) * 7);
        heights.set(`${x},${z}`, h);
        grid.set(x, h, z, h > 5 ? 'ice' : 'snow');
        grid.set(x, h - 1, z, 'stone');
      }
    }
    // Ice Castle Citadel
    const cy = 2;
    for (let x = -4; x <= 4; x++) {
      for (let z = -4; z <= 4; z++) {
        if (Math.abs(x) === 4 || Math.abs(z) === 4) {
          if (z === 4 && Math.abs(x) <= 1) continue;
          for (let y = 1; y <= 5; y++) grid.set(x, cy + y, z, y % 2 === 0 ? 'ice' : 'snow');
        }
      }
    }
    for (const [tx, tz] of [
      [-4, -4],
      [4, -4],
      [-4, 4],
      [4, 4],
    ]) {
      for (let y = 1; y <= 9; y++) grid.set(tx, cy + y, tz, 'ice');
      grid.set(tx, cy + 10, tz, 'crystalCyan');
    }
    // Central Ice Spire
    grid.fillBox(-2, cy + 1, -2, 2, cy + 10, 2, 'ice');
    grid.fillBox(-1, cy + 11, -1, 1, cy + 13, 1, 'snow');
    grid.set(0, cy + 14, 0, 'crystalCyan');
    addPineTree(grid, -9, heights.get('-9,6') ?? 3, 6, 6, true);
    addPineTree(grid, 9, heights.get('9,5') ?? 3, 5, 6, true);
    return grid.toArray(true);
  }

  // Project 05: THE NETHER GATE
  const r = 15;
  for (let x = -r; x <= r; x++) {
    for (let z = -r; z <= r; z++) {
      if (Math.hypot(x, z) > r) continue;
      const isLava = Math.abs(x) < 3 && z > 1 || Math.hypot(x + 6, z - 4) < 3.2;
      if (isLava) {
        grid.set(x, 0, z, 'lava');
        grid.set(x, -1, z, 'basalt');
      } else {
        const h = Math.round(1 + ridgeNoise2D(x * 0.12, z * 0.12, 666) * 4);
        grid.set(x, h, z, h >= 4 ? 'obsidian' : 'basalt');
        grid.set(x, h - 1, z, 'basalt');
      }
    }
  }
  // Obsidian Portal Gate at z = -3
  const py = 2;
  for (let x = -4; x <= 4; x++) {
    grid.set(x, py, -3, 'obsidian');
    grid.set(x, py + 8, -3, 'obsidian');
  }
  for (let y = 1; y <= 7; y++) {
    grid.set(-4, py + y, -3, 'obsidian');
    grid.set(4, py + y, -3, 'obsidian');
  }
  // Glowing Portal Core
  for (let x = -3; x <= 3; x++) {
    for (let y = 1; y <= 7; y++) {
      grid.set(x, py + y, -3, 'crystalAmethyst');
    }
  }
  // Obsidian Bridge over lava river + Ember Braziers
  for (let bx = -3; bx <= 3; bx++) {
    grid.set(bx, 1, 4, 'obsidian');
    grid.set(bx, 1, 5, 'obsidian');
  }
  grid.set(-4, 2, 4, 'lava');
  grid.set(4, 2, 4, 'lava');
  grid.set(-5, 3, -2, 'gold');
  grid.set(5, 3, -2, 'gold');
  return grid.toArray(true);
}

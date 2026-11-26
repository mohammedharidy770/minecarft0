import * as THREE from 'three';
import { createSeededRandom } from './noise';

export type BlockType =
  | 'grass'
  | 'dirt'
  | 'stone'
  | 'cobble'
  | 'mossyStone'
  | 'sand'
  | 'sandstone'
  | 'snow'
  | 'ice'
  | 'wood'
  | 'planks'
  | 'darkPlanks'
  | 'oakLeaves'
  | 'pineLeaves'
  | 'jungleLeaves'
  | 'cactus'
  | 'water'
  | 'lava'
  | 'obsidian'
  | 'basalt'
  | 'crystalCyan'
  | 'crystalAmethyst'
  | 'mushroomStem'
  | 'mushroomCap'
  | 'mycelium'
  | 'lantern'
  | 'gold'
  | 'castleBrick'
  | 'roofTile'
  | 'glass'
  | 'wheat'
  | 'flowerGold'
  | 'flowerCrimson'
  | 'cloud';

export interface BlockMetadata {
  id: BlockType;
  label: string;
  swatch: string;
  transparent?: boolean;
  emissive?: boolean;
}

export const BLOCK_CATALOG: BlockMetadata[] = [
  { id: 'grass', label: 'Grass Turf', swatch: '#75A94C' },
  { id: 'dirt', label: 'Rich Earth', swatch: '#76523B' },
  { id: 'stone', label: 'Granite Stone', swatch: '#858585' },
  { id: 'castleBrick', label: 'Castle Masonry', swatch: '#6F7378' },
  { id: 'wood', label: 'Timber Log', swatch: '#62422B' },
  { id: 'planks', label: 'Oak Planks', swatch: '#A67A4B' },
  { id: 'oakLeaves', label: 'Canopy Leaves', swatch: '#315D37' },
  { id: 'roofTile', label: 'Terracotta Roof', swatch: '#9E4B37' },
  { id: 'glass', label: 'Leaded Glass', swatch: '#9AD4E8', transparent: true },
  { id: 'lantern', label: 'Warm Lantern', swatch: '#F5C451', emissive: true },
  { id: 'gold', label: 'Gilded Trim', swatch: '#D6B66E' },
  { id: 'crystalCyan', label: 'Prism Crystal', swatch: '#4FE3D2', emissive: true },
  { id: 'obsidian', label: 'Obsidian', swatch: '#22182D' },
  { id: 'snow', label: 'Alpine Snow', swatch: '#E9F2F7' },
];

type PaletteSpec = {
  base: string;
  highlights: string[];
  shadows: string[];
  pattern: 'noise' | 'bricks' | 'planks' | 'bark' | 'leaves' | 'crystal' | 'spots' | 'liquid' | 'glass' | 'grass';
  roughness: number;
  metalness: number;
  emissive?: string;
  emissiveIntensity?: number;
  opacity?: number;
  transparent?: boolean;
};

const PALETTE: Record<BlockType, PaletteSpec> = {
  grass: {
    base: '#689C42',
    highlights: ['#7AB450', '#89C25A'],
    shadows: ['#527E34', '#466B2B'],
    pattern: 'grass',
    roughness: 0.88,
    metalness: 0.02,
  },
  dirt: {
    base: '#76523B',
    highlights: ['#8A6247', '#966D50'],
    shadows: ['#5D3E2B', '#4B3222'],
    pattern: 'noise',
    roughness: 0.94,
    metalness: 0.02,
  },
  stone: {
    base: '#808487',
    highlights: ['#999E9E', '#ADB2B2'],
    shadows: ['#666A6E', '#54585B'],
    pattern: 'noise',
    roughness: 0.85,
    metalness: 0.06,
  },
  cobble: {
    base: '#707478',
    highlights: ['#8D9196', '#9CA0A5'],
    shadows: ['#52555A', '#414448'],
    pattern: 'bricks',
    roughness: 0.88,
    metalness: 0.05,
  },
  mossyStone: {
    base: '#677465',
    highlights: ['#618F47', '#869087'],
    shadows: ['#495848', '#3B483B'],
    pattern: 'bricks',
    roughness: 0.9,
    metalness: 0.04,
  },
  sand: {
    base: '#D9C18A',
    highlights: ['#E8D4A2', '#F2E1B6'],
    shadows: ['#C2A86F', '#AD9259'],
    pattern: 'noise',
    roughness: 0.92,
    metalness: 0.01,
  },
  sandstone: {
    base: '#C49A5B',
    highlights: ['#D7AF70', '#E3BF84'],
    shadows: ['#A77E43', '#8E6833'],
    pattern: 'bricks',
    roughness: 0.86,
    metalness: 0.03,
  },
  snow: {
    base: '#EAF1F5',
    highlights: ['#FFFFFF', '#F5FAFD'],
    shadows: ['#CADAE5', '#B2C8D8'],
    pattern: 'noise',
    roughness: 0.72,
    metalness: 0.04,
  },
  ice: {
    base: '#87CBE8',
    highlights: ['#BCE9FA', '#DCF5FF'],
    shadows: ['#5CA6CA', '#478DB3'],
    pattern: 'crystal',
    roughness: 0.16,
    metalness: 0.12,
    transparent: true,
    opacity: 0.82,
  },
  wood: {
    base: '#5C3D28',
    highlights: ['#744F35', '#825B3E'],
    shadows: ['#432B1B', '#321F12'],
    pattern: 'bark',
    roughness: 0.88,
    metalness: 0.02,
  },
  planks: {
    base: '#A77B4A',
    highlights: ['#BE905D', '#CCA06E'],
    shadows: ['#8B6237', '#734F29'],
    pattern: 'planks',
    roughness: 0.78,
    metalness: 0.03,
  },
  darkPlanks: {
    base: '#523826',
    highlights: ['#684832', '#77533A'],
    shadows: ['#3C2719', '#2C1C11'],
    pattern: 'planks',
    roughness: 0.8,
    metalness: 0.04,
  },
  oakLeaves: {
    base: '#315D37',
    highlights: ['#467E4B', '#5A965B'],
    shadows: ['#214226', '#17301B'],
    pattern: 'leaves',
    roughness: 0.9,
    metalness: 0.02,
  },
  pineLeaves: {
    base: '#214A3B',
    highlights: ['#316653', '#3E7A65'],
    shadows: ['#163529', '#0E241C'],
    pattern: 'leaves',
    roughness: 0.88,
    metalness: 0.02,
  },
  jungleLeaves: {
    base: '#2D7336',
    highlights: ['#449A48', '#5BB55A'],
    shadows: ['#1E5325', '#133C19'],
    pattern: 'leaves',
    roughness: 0.86,
    metalness: 0.02,
  },
  cactus: {
    base: '#3E783B',
    highlights: ['#55994E', '#7BB36A'],
    shadows: ['#2B5829', '#1E3F1C'],
    pattern: 'bark',
    roughness: 0.82,
    metalness: 0.02,
  },
  water: {
    base: '#28779E',
    highlights: ['#449EC7', '#6EC0E0'],
    shadows: ['#1D5A7B', '#144460'],
    pattern: 'liquid',
    roughness: 0.14,
    metalness: 0.18,
    transparent: true,
    opacity: 0.78,
  },
  lava: {
    base: '#E8531A',
    highlights: ['#FF9F2E', '#FFE066'],
    shadows: ['#B8290C', '#7D1705'],
    pattern: 'liquid',
    roughness: 0.35,
    metalness: 0.05,
    emissive: '#FF5A1F',
    emissiveIntensity: 1.65,
  },
  obsidian: {
    base: '#1F162B',
    highlights: ['#3B2952', '#51396E'],
    shadows: ['#120B1A', '#0A060F'],
    pattern: 'crystal',
    roughness: 0.28,
    metalness: 0.32,
  },
  basalt: {
    base: '#33363B',
    highlights: ['#464A52', '#575C66'],
    shadows: ['#212328', '#15171A'],
    pattern: 'bark',
    roughness: 0.82,
    metalness: 0.12,
  },
  crystalCyan: {
    base: '#3BD9CA',
    highlights: ['#8CF7ED', '#D1FFFA'],
    shadows: ['#1DA499', '#127870'],
    pattern: 'crystal',
    roughness: 0.16,
    metalness: 0.2,
    emissive: '#27C7B8',
    emissiveIntensity: 1.15,
    transparent: true,
    opacity: 0.9,
  },
  crystalAmethyst: {
    base: '#9B5DE5',
    highlights: ['#C79AF7', '#EAD6FF'],
    shadows: ['#6D34B5', '#4B1E85'],
    pattern: 'crystal',
    roughness: 0.18,
    metalness: 0.22,
    emissive: '#8E44EC',
    emissiveIntensity: 1.05,
    transparent: true,
    opacity: 0.9,
  },
  mushroomStem: {
    base: '#DED5C1',
    highlights: ['#EFE9DA', '#FAF7EE'],
    shadows: ['#C1B69E', '#A89C84'],
    pattern: 'bark',
    roughness: 0.85,
    metalness: 0.02,
  },
  mushroomCap: {
    base: '#B8372D',
    highlights: ['#F2EAD9', '#D65245'],
    shadows: ['#8E231B', '#6B1711'],
    pattern: 'spots',
    roughness: 0.72,
    metalness: 0.04,
  },
  mycelium: {
    base: '#6C5D73',
    highlights: ['#85748D', '#9B89A3'],
    shadows: ['#524659', '#3E3444'],
    pattern: 'noise',
    roughness: 0.9,
    metalness: 0.03,
  },
  lantern: {
    base: '#F2B84B',
    highlights: ['#FFE58F', '#FFF6CC'],
    shadows: ['#C98520', '#8B5412'],
    pattern: 'glass',
    roughness: 0.25,
    metalness: 0.1,
    emissive: '#FFBE42',
    emissiveIntensity: 1.8,
  },
  gold: {
    base: '#D6B66E',
    highlights: ['#F0D99B', '#FFF0C2'],
    shadows: ['#A98742', '#7E6129'],
    pattern: 'crystal',
    roughness: 0.26,
    metalness: 0.78,
  },
  castleBrick: {
    base: '#6D7175',
    highlights: ['#858A8F', '#9BA0A6'],
    shadows: ['#505459', '#3B3E42'],
    pattern: 'bricks',
    roughness: 0.84,
    metalness: 0.08,
  },
  roofTile: {
    base: '#9A4834',
    highlights: ['#B85B44', '#CC6D55'],
    shadows: ['#733223', '#542217'],
    pattern: 'planks',
    roughness: 0.74,
    metalness: 0.05,
  },
  glass: {
    base: '#9ED6EA',
    highlights: ['#DDF5FF', '#FFFFFF'],
    shadows: ['#66ABC7', '#4A89A3'],
    pattern: 'glass',
    roughness: 0.1,
    metalness: 0.18,
    transparent: true,
    opacity: 0.56,
  },
  wheat: {
    base: '#CFA644',
    highlights: ['#E8C564', '#F5DA82'],
    shadows: ['#A37C28', '#7C5D1B'],
    pattern: 'bark',
    roughness: 0.9,
    metalness: 0.02,
  },
  flowerGold: {
    base: '#E3B842',
    highlights: ['#FFE07D', '#FFF0B3'],
    shadows: ['#B88D23', '#497A31'],
    pattern: 'spots',
    roughness: 0.75,
    metalness: 0.02,
    emissive: '#D6B66E',
    emissiveIntensity: 0.15,
  },
  flowerCrimson: {
    base: '#D14B4B',
    highlights: ['#F07171', '#FF9999'],
    shadows: ['#962B2B', '#45702D'],
    pattern: 'spots',
    roughness: 0.75,
    metalness: 0.02,
  },
  cloud: {
    base: '#F2F4F0',
    highlights: ['#FFFFFF', '#FAFCF9'],
    shadows: ['#D6DCD4', '#BCC5B9'],
    pattern: 'noise',
    roughness: 0.95,
    metalness: 0.0,
    transparent: true,
    opacity: 0.92,
  },
};

function createVoxelCanvasTexture(type: BlockType, spec: PaletteSpec, seedIndex: number): THREE.CanvasTexture {
  const size = 16;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const rand = createSeededRandom(seedIndex * 7919 + 101);

  ctx.fillStyle = spec.base;
  ctx.fillRect(0, 0, size, size);

  const pick = (arr: string[]) => arr[Math.floor(rand() * arr.length)];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const r = rand();
      let color: string | null = null;

      switch (spec.pattern) {
        case 'grass': {
          if (r < 0.26) color = pick(spec.highlights);
          else if (r > 0.78) color = pick(spec.shadows);
          break;
        }
        case 'bricks': {
          const isMortar = y % 4 === 0 || (x + (Math.floor(y / 4) % 2) * 4) % 8 === 0;
          if (isMortar) color = spec.shadows[1] || spec.shadows[0];
          else if (r < 0.22) color = pick(spec.highlights);
          else if (r > 0.82) color = spec.shadows[0];
          break;
        }
        case 'planks': {
          const seam = y % 4 === 0 || ((x + Math.floor(y / 4) * 5) % 12 === 0);
          if (seam) color = spec.shadows[1] || spec.shadows[0];
          else if (r < 0.25) color = pick(spec.highlights);
          else if (r > 0.85) color = spec.shadows[0];
          break;
        }
        case 'bark': {
          if (x % 3 === 0 && r > 0.35) color = pick(spec.shadows);
          else if (x % 3 === 1 && r < 0.3) color = pick(spec.highlights);
          break;
        }
        case 'leaves': {
          if (r < 0.28) color = pick(spec.highlights);
          else if (r > 0.68) color = pick(spec.shadows);
          break;
        }
        case 'crystal': {
          if (Math.abs(x - y) <= 1 || x + y === 15) color = pick(spec.highlights);
          else if (r > 0.72) color = pick(spec.shadows);
          break;
        }
        case 'spots': {
          const dx = (x % 6) - 2.5;
          const dy = (y % 6) - 2.5;
          if (dx * dx + dy * dy < 2.2) color = spec.highlights[0];
          else if (r > 0.78) color = pick(spec.shadows);
          break;
        }
        case 'liquid': {
          if ((x + y * 2) % 7 === 0 || r < 0.18) color = pick(spec.highlights);
          else if (r > 0.8) color = pick(spec.shadows);
          break;
        }
        case 'glass': {
          const border = x === 0 || y === 0 || x === size - 1 || y === size - 1;
          if (border) color = spec.shadows[0];
          else if (x + y === 5 || x + y === 6) color = spec.highlights[0];
          break;
        }
        default: {
          if (r < 0.24) color = pick(spec.highlights);
          else if (r > 0.78) color = pick(spec.shadows);
        }
      }

      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  // Subtle edge framing for crisp voxel block silhouette
  if (type !== 'water' && type !== 'lava' && type !== 'cloud') {
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(0, 0, size, 1);
    ctx.fillRect(0, 0, 1, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

const materialCache = new Map<BlockType, THREE.MeshStandardMaterial>();
let sharedBoxGeometry: THREE.BoxGeometry | null = null;

export function getSharedVoxelGeometry(): THREE.BoxGeometry {
  if (!sharedBoxGeometry) {
    sharedBoxGeometry = new THREE.BoxGeometry(1, 1, 1);
  }
  return sharedBoxGeometry;
}

export function getVoxelMaterial(type: BlockType): THREE.MeshStandardMaterial {
  const existing = materialCache.get(type);
  if (existing) return existing;

  const spec = PALETTE[type] ?? PALETTE.stone;
  const seedIndex = Object.keys(PALETTE).indexOf(type) + 1;
  const texture = createVoxelCanvasTexture(type, spec, seedIndex);

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: spec.roughness,
    metalness: spec.metalness,
    transparent: Boolean(spec.transparent),
    opacity: spec.opacity ?? 1,
    emissive: spec.emissive ? new THREE.Color(spec.emissive) : new THREE.Color(0x000000),
    emissiveIntensity: spec.emissiveIntensity ?? 0,
    depthWrite: spec.transparent ? false : true,
  });

  materialCache.set(type, material);
  return material;
}

export function getBlockSwatch(type: BlockType): string {
  return PALETTE[type]?.base ?? '#858585';
}

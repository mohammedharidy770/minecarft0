import { BiomeId, ProjectSlug } from '../voxel/worldBuilder';

export interface BiomeDefinition {
  id: BiomeId;
  number: string;
  name: string;
  subtitle: string;
  description: string;
  climate: string;
  elevation: string;
  vegetation: string;
  skyColor: string;
  fogColor: string;
  keyLightColor: string;
  hemiSky: string;
  hemiGround: string;
  accentColor: string;
}

export const BIOMES_DATA: BiomeDefinition[] = [
  {
    id: 'forest',
    number: '01',
    name: 'Emerald Timberlands',
    subtitle: 'Forest Biome',
    description:
      'Sun-dappled oak canopies, mossy creek beds, and golden wildflower clearings built from layered organic voxel clusters.',
    climate: 'Temperate · 18°C',
    elevation: '64m – 112m',
    vegetation: 'Oak & Birch Canopy',
    skyColor: '#132418',
    fogColor: '#132418',
    keyLightColor: '#FFF1D0',
    hemiSky: '#8AC4A0',
    hemiGround: '#243B27',
    accentColor: '#75A94C',
  },
  {
    id: 'desert',
    number: '02',
    name: 'Sunstone Dunes',
    subtitle: 'Desert Biome',
    description:
      'Wind-carved sandstone ridges, desert oasis basins, and weathered obelisk ruins bathed in high-contrast desert light.',
    climate: 'Arid · 41°C',
    elevation: '42m – 96m',
    vegetation: 'Saguaro & Oasis Palms',
    skyColor: '#261B12',
    fogColor: '#261B12',
    keyLightColor: '#FFD99B',
    hemiSky: '#E6B87A',
    hemiGround: '#593D26',
    accentColor: '#D6B66E',
  },
  {
    id: 'snow',
    number: '03',
    name: 'Boreal Glacier',
    subtitle: 'Snow Biome',
    description:
      'Snow-laden boreal pines, translucent glacial spires, and frozen lakes shimmering beneath crisp sub-arctic skies.',
    climate: 'Alpine · -14°C',
    elevation: '110m – 210m',
    vegetation: 'Frosted Pine Taiga',
    skyColor: '#0E1C26',
    fogColor: '#0E1C26',
    keyLightColor: '#E3F4FF',
    hemiSky: '#98D4F5',
    hemiGround: '#233A4A',
    accentColor: '#87CBE8',
  },
  {
    id: 'jungle',
    number: '04',
    name: 'Verdant Canopy',
    subtitle: 'Jungle Biome',
    description:
      'Towering multi-story jungle trees draped in hanging vines, enclosing sunken mossy shrines along emerald rivers.',
    climate: 'Humid · 31°C',
    elevation: '58m – 148m',
    vegetation: 'Giant Canopy & Vines',
    skyColor: '#0D2116',
    fogColor: '#0D2116',
    keyLightColor: '#FFE8B0',
    hemiSky: '#6CD48B',
    hemiGround: '#193823',
    accentColor: '#449A48',
  },
  {
    id: 'mountain',
    number: '05',
    name: 'Highland Crags',
    subtitle: 'Mountain Biome',
    description:
      'Jagged granite ridgelines, plunging voxel waterfalls, and snow-crowned summits carved by ridge noise algorithms.',
    climate: 'Highland · 2°C',
    elevation: '160m – 320m',
    vegetation: 'Alpine Timberline',
    skyColor: '#141B24',
    fogColor: '#141B24',
    keyLightColor: '#FFF5E4',
    hemiSky: '#A6C4E0',
    hemiGround: '#2E3640',
    accentColor: '#999E9E',
  },
  {
    id: 'mushroom',
    number: '06',
    name: 'Mycelium Sanctuary',
    subtitle: 'Mushroom Biome',
    description:
      'Bioluminescent spore groves, towering scarlet-capped fungi, and violet mycelium plains glowing in eternal twilight.',
    climate: 'Mystic · 15°C',
    elevation: '48m – 88m',
    vegetation: 'Giant Fungi & Spores',
    skyColor: '#191224',
    fogColor: '#191224',
    keyLightColor: '#F3D2FF',
    hemiSky: '#B68CE8',
    hemiGround: '#322442',
    accentColor: '#B8372D',
  },
];

export interface ProjectLandmark {
  name: string;
  detail: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
}

export interface ProjectWorldDefinition {
  slug: ProjectSlug;
  number: string;
  name: string;
  tagline: string;
  description: string;
  story: string;
  biome: string;
  blockCountLabel: string;
  skyColor: string;
  fogColor: string;
  accentColor: string;
  terrainSummary: string;
  landmarks: ProjectLandmark[];
  paletteSwatches: { name: string; hex: string }[];
}

export const PROJECTS_DATA: ProjectWorldDefinition[] = [
  {
    slug: 'the-lost-kingdom',
    number: 'PROJECT 01',
    name: 'The Lost Kingdom',
    tagline: 'Bastion of Stone & Crown',
    description:
      'A massive medieval castle surrounded by pine forests, terraced wheat fields, and an arched stone river crossing.',
    story:
      'Perched above a glacial valley river, The Lost Kingdom unites concentric defensive battlements with a thriving riverside hamlet. Every watchtower, timber cottage, and cobblestone arch is assembled from modular voxel blueprints.',
    biome: 'Temperate Highlands · River Valley',
    blockCountLabel: '3,420 Voxels',
    skyColor: '#101A15',
    fogColor: '#101A15',
    accentColor: '#D6B66E',
    terrainSummary:
      'Layered FBM meadows flattened at the central citadel plateau, bisected by a curving 4-block river channel.',
    landmarks: [
      {
        name: 'Grand Citadel Keep',
        detail: '16-block central stone tower crowned with terracotta gables and gilded spire.',
        cameraPosition: [14, 15, 16],
        cameraTarget: [0, 7, -3],
      },
      {
        name: 'Arched River Bridge',
        detail: 'Lantern-lit cobblestone span linking the southern cottages to the castle gate.',
        cameraPosition: [10, 7, 15],
        cameraTarget: [0, 2, 7],
      },
      {
        name: 'Corner Watchtowers',
        detail: 'Four crenellated flanking bastions guarding the perimeter curtain walls.',
        cameraPosition: [-18, 12, 10],
        cameraTarget: [-6, 6, -3],
      },
      {
        name: 'Harvest Terraces',
        detail: 'Golden wheat terraces bordering the eastern pine groves.',
        cameraPosition: [18, 9, 12],
        cameraTarget: [11, 2, 3],
      },
    ],
    paletteSwatches: [
      { name: 'Castle Masonry', hex: '#6D7175' },
      { name: 'Terracotta Roof', hex: '#9A4834' },
      { name: 'Gilded Trim', hex: '#D6B66E' },
      { name: 'Forest Turf', hex: '#689C42' },
    ],
  },
  {
    slug: 'sky-islands',
    number: 'PROJECT 02',
    name: 'Sky Islands',
    tagline: 'Archipelago Above the Clouds',
    description:
      'Floating voxel islands suspended in open sky, linked by sagging timber rope bridges and cascading waterfalls.',
    story:
      'Four independent earth-and-granite landmasses hover at staggered altitudes. Players cross hand-laid plank catwalks suspended over the abyss while crystal beacons hum beside an ancient skyward watchtower.',
    biome: 'Aerial Archipelago · Cloud Sea',
    blockCountLabel: '1,840 Voxels',
    skyColor: '#101D26',
    fogColor: '#101D26',
    accentColor: '#4FE3D2',
    terrainSummary:
      'Inverted conical island undersides tapering into raw stone roots, topped with lush turf and waterfalls.',
    landmarks: [
      {
        name: 'Central Spire Island',
        detail: 'The primary floating landmass anchored by a stone lookout and prism crystal.',
        cameraPosition: [15, 13, 15],
        cameraTarget: [0, 6, 0],
      },
      {
        name: 'Suspended Plank Bridges',
        detail: 'Catenary timber walkways spanning open sky between neighboring islands.',
        cameraPosition: [-14, 11, 12],
        cameraTarget: [-4, 5, -2],
      },
      {
        name: 'Abyssal Waterfall',
        detail: 'Translucent water column spilling directly off the southern cliff rim.',
        cameraPosition: [9, 6, 16],
        cameraTarget: [0, 1, 5],
      },
    ],
    paletteSwatches: [
      { name: 'Turf Crown', hex: '#689C42' },
      { name: 'Cliff Granite', hex: '#808487' },
      { name: 'Sky Water', hex: '#28779E' },
      { name: 'Prism Crystal', hex: '#3BD9CA' },
    ],
  },
  {
    slug: 'the-deep-forest',
    number: 'PROJECT 03',
    name: 'The Deep Forest',
    tagline: 'Whispering Canopy & Sunken Shrine',
    description:
      'An enormous mysterious forest with winding moss-lined rivers, towering ancient trees, and hidden stone ruins.',
    story:
      'Beneath a dense cathedral of six-meter voxel trunks and overlapping emerald leaves, a forgotten moss-covered sanctuary rests beside a tranquil forest bend illuminated by warm lanterns.',
    biome: 'Ancient Woodland · Moss Basin',
    blockCountLabel: '2,290 Voxels',
    skyColor: '#09140E',
    fogColor: '#09140E',
    accentColor: '#75A94C',
    terrainSummary:
      'Soft undulating woodland floor carved by a winding moss-stone river channel and shrouded in emerald mist.',
    landmarks: [
      {
        name: 'Sunken Moss Sanctuary',
        detail: 'Four-pillared mossy stone temple housing an ancient lantern and cyan prism.',
        cameraPosition: [11, 7, 10],
        cameraTarget: [3.5, 3, 0.5],
      },
      {
        name: 'Elder Canopy Groves',
        detail: 'Tall layered oak and jungle foliage crowns casting deep dappled shadows.',
        cameraPosition: [-15, 13, 14],
        cameraTarget: [-4, 6, -2],
      },
      {
        name: 'Winding Forest Stream',
        detail: 'Clear teal water winding diagonally through moss-covered riverbanks.',
        cameraPosition: [4, 14, 18],
        cameraTarget: [0, 1, 2],
      },
    ],
    paletteSwatches: [
      { name: 'Deep Canopy', hex: '#2D7336' },
      { name: 'Mossy Ruin', hex: '#677465' },
      { name: 'Timber Bark', hex: '#5C3D28' },
      { name: 'Lantern Glow', hex: '#F2B84B' },
    ],
  },
  {
    slug: 'frozen-empire',
    number: 'PROJECT 04',
    name: 'Frozen Empire',
    tagline: 'Citadel of Glacial Ice',
    description:
      'A snowy kingdom crowned by translucent ice castles, needle-sharp glacial spires, and frozen alpine ridges.',
    story:
      'Carved directly from an alpine glacier, the Frozen Empire pairs high-roughness snowdrifts with translucent specular ice walls and cyan crystal finials that catch cool polar rim lighting.',
    biome: 'Sub-Arctic Glacier · Alpine Peaks',
    blockCountLabel: '2,510 Voxels',
    skyColor: '#0C1620',
    fogColor: '#0C1620',
    accentColor: '#87CBE8',
    terrainSummary:
      'Ridge-noise mountain amphitheater framing a flat snow-packed courtyard at the heart of the glacier.',
    landmarks: [
      {
        name: 'Glacial Keep Spire',
        detail: 'Translucent multi-tiered ice citadel rising 14 blocks above the snowfield.',
        cameraPosition: [14, 14, 14],
        cameraTarget: [0, 7, 0],
      },
      {
        name: 'Crystal Corner Bastions',
        detail: 'Four towering ice columns topped with glowing cyan prism crystals.',
        cameraPosition: [-14, 10, 12],
        cameraTarget: [-4, 7, -4],
      },
      {
        name: 'Snow-Capped Taiga',
        detail: 'Frosted boreal pines clinging to the outer mountain slopes.',
        cameraPosition: [17, 11, 12],
        cameraTarget: [9, 5, 5],
      },
    ],
    paletteSwatches: [
      { name: 'Glacial Ice', hex: '#87CBE8' },
      { name: 'Alpine Snow', hex: '#EAF1F5' },
      { name: 'Granite Peak', hex: '#808487' },
      { name: 'Cryo Crystal', hex: '#3BD9CA' },
    ],
  },
  {
    slug: 'the-nether-gate',
    number: 'PROJECT 05',
    name: 'The Nether Gate',
    tagline: 'Threshold of Obsidian & Ember',
    description:
      'A dark fantasy voxel realm featuring molten lava rivers, obsidian monolith architecture, and amethyst portal light.',
    story:
      'At the center of a volcanic basalt caldera stands an ancient obsidian archway pulsing with violet energy. Molten magma channels cut across the ash plain beneath gilded braziers.',
    biome: 'Volcanic Caldera · Obsidian Rift',
    blockCountLabel: '2,140 Voxels',
    skyColor: '#160B0E',
    fogColor: '#160B0E',
    accentColor: '#E8531A',
    terrainSummary:
      'Basalt ash flats fractured by glowing magma channels and jagged obsidian ridge outcrops.',
    landmarks: [
      {
        name: 'The Obsidian Portal',
        detail: 'Nine-block monolithic obsidian arch framing a shimmering amethyst energy field.',
        cameraPosition: [11, 10, 14],
        cameraTarget: [0, 5, -3],
      },
      {
        name: 'Magma Crossing',
        detail: 'Dark obsidian bridge spanning a glowing river of molten voxel lava.',
        cameraPosition: [10, 6, 13],
        cameraTarget: [0, 1, 4],
      },
      {
        name: 'Gilded Ember Pillars',
        detail: 'Ancient gold-capped basalt totems flanking the threshold approach.',
        cameraPosition: [-12, 8, 9],
        cameraTarget: [-5, 3, -2],
      },
    ],
    paletteSwatches: [
      { name: 'Obsidian', hex: '#1F162B' },
      { name: 'Molten Lava', hex: '#E8531A' },
      { name: 'Portal Amethyst', hex: '#9B5DE5' },
      { name: 'Volcanic Basalt', hex: '#33363B' },
    ],
  },
];

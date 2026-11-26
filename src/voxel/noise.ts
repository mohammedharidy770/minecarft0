export function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return function next(): number {
    state += 0x6d2b79f5;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash2D(ix: number, iz: number, seed: number): number {
  let n = ix * 374761393 + iz * 668265263 + seed * 1442695041;
  n = (n ^ (n >> 13)) * 1274126177;
  return ((n ^ (n >> 16)) >>> 0) / 4294967296;
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

export function valueNoise2D(x: number, z: number, seed = 1337): number {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = smoothstep(x - ix);
  const fz = smoothstep(z - iz);

  const v00 = hash2D(ix, iz, seed);
  const v10 = hash2D(ix + 1, iz, seed);
  const v01 = hash2D(ix, iz + 1, seed);
  const v11 = hash2D(ix + 1, iz + 1, seed);

  const a = v00 + (v10 - v00) * fx;
  const b = v01 + (v11 - v01) * fx;
  return (a + (b - a) * fz) * 2 - 1;
}

export function fbm2D(
  x: number,
  z: number,
  seed = 1337,
  octaves = 4,
  lacunarity = 2.05,
  gain = 0.5
): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxAmp = 0;

  for (let i = 0; i < octaves; i++) {
    value += valueNoise2D(x * frequency, z * frequency, seed + i * 97) * amplitude;
    maxAmp += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }
  return value / maxAmp;
}

export function ridgeNoise2D(x: number, z: number, seed = 4242, octaves = 3): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxAmp = 0;

  for (let i = 0; i < octaves; i++) {
    const n = 1 - Math.abs(valueNoise2D(x * frequency, z * frequency, seed + i * 131));
    value += n * n * amplitude;
    maxAmp += amplitude;
    amplitude *= 0.5;
    frequency *= 2.1;
  }
  return value / maxAmp;
}

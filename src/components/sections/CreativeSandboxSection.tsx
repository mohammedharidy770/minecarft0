import { useEffect, useMemo, useRef, useState } from 'react';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { RotateCcw, Hammer, Eraser, ZoomIn, ZoomOut, ChevronDown, ChevronUp } from 'lucide-react';
import {
  BLOCK_CATALOG,
  BlockType,
  getSharedVoxelGeometry,
  getVoxelMaterial,
} from '../../voxel/textures';
import { ViewportCanvas } from '../voxel/ViewportCanvas';

interface SandboxBlock {
  id: string;
  x: number;
  y: number;
  z: number;
  type: BlockType;
}

type CameraAngleKey = 'iso' | 'front' | 'top' | 'closeup';

const CAMERA_ANGLES: Record<
  CameraAngleKey,
  { label: string; pos: [number, number, number]; target: [number, number, number] }
> = {
  iso: { label: 'Isometric', pos: [12, 10, 12], target: [0, 1.5, 0] },
  front: { label: 'Front', pos: [0, 5.5, 15], target: [0, 2, 0] },
  top: { label: 'Aerial', pos: [0, 17, 3.5], target: [0, 1, 0] },
  closeup: { label: 'Close-Up', pos: [6.5, 4.5, 6.5], target: [0, 2, 0] },
};

function createStarterPreset(preset: 'island' | 'shrine' | 'tower'): SandboxBlock[] {
  const map = new Map<string, SandboxBlock>();
  const add = (x: number, y: number, z: number, type: BlockType) => {
    const id = `${x},${y},${z}`;
    map.set(id, { id, x, y, z, type });
  };

  // Base 9x9 grass & stone platform at y=0
  for (let x = -4; x <= 4; x++) {
    for (let z = -4; z <= 4; z++) {
      add(x, 0, z, Math.abs(x) === 4 || Math.abs(z) === 4 ? 'stone' : 'grass');
    }
  }

  if (preset === 'island') {
    // Small oak tree + stone bench + lantern
    for (let y = 1; y <= 3; y++) add(-2, y, -2, 'wood');
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        add(-2 + dx, 4, -2 + dz, 'oakLeaves');
      }
    }
    add(-2, 5, -2, 'oakLeaves');
    add(1, 1, 1, 'castleBrick');
    add(2, 1, 1, 'castleBrick');
    add(1, 2, 1, 'lantern');
  } else if (preset === 'shrine') {
    for (const [px, pz] of [
      [-2, -2],
      [2, -2],
      [-2, 2],
      [2, 2],
    ]) {
      for (let y = 1; y <= 3; y++) add(px, y, pz, 'castleBrick');
    }
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        add(x, 4, z, 'planks');
      }
    }
    add(0, 5, 0, 'gold');
    add(0, 1, 0, 'crystalCyan');
  } else {
    // Mini Watchtower
    for (let y = 1; y <= 5; y++) {
      for (let x = -1; x <= 1; x++) {
        for (let z = -1; z <= 1; z++) {
          if (Math.abs(x) === 1 || Math.abs(z) === 1) {
            add(x, y, z, y === 3 && x === 0 ? 'glass' : 'castleBrick');
          }
        }
      }
    }
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        add(x, 6, z, 'roofTile');
      }
    }
    add(0, 7, 0, 'lantern');
  }

  return Array.from(map.values());
}

const _camGoal = new THREE.Vector3();
const _targetGoal = new THREE.Vector3();

function SandboxScene({
  blocks,
  selectedType,
  mode,
  cameraAngle,
  zoomTick,
  onPlaceBlock,
  onRemoveBlock,
}: {
  blocks: SandboxBlock[];
  selectedType: BlockType;
  mode: 'build' | 'erase';
  cameraAngle: { key: CameraAngleKey; seq: number };
  zoomTick: { dir: number; seq: number };
  onPlaceBlock: (x: number, y: number, z: number, type: BlockType) => void;
  onRemoveBlock: (id: string) => void;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const transitioningRef = useRef(false);
  const [hoverGhost, setHoverGhost] = useState<[number, number, number] | null>(null);

  const geometry = getSharedVoxelGeometry();
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.03, 1.03, 1.03)), []);

  useEffect(() => {
    transitioningRef.current = true;
  }, [cameraAngle]);

  useEffect(() => {
    if (zoomTick.seq === 0 || !controlsRef.current) return;
    const dir = new THREE.Vector3().subVectors(camera.position, controlsRef.current.target);
    const len = dir.length();
    const nextLen = THREE.MathUtils.clamp(len + zoomTick.dir * 2.5, 6, 26);
    dir.normalize().multiplyScalar(nextLen);
    camera.position.copy(controlsRef.current.target).add(dir);
    controlsRef.current.update();
  }, [zoomTick, camera]);

  useFrame((_, delta) => {
    if (!transitioningRef.current || !controlsRef.current) return;
    const dt = Math.min(delta, 0.05);
    const preset = CAMERA_ANGLES[cameraAngle.key];
    _camGoal.set(...preset.pos);
    _targetGoal.set(...preset.target);

    camera.position.x = THREE.MathUtils.damp(camera.position.x, _camGoal.x, 6, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, _camGoal.y, 6, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, _camGoal.z, 6, dt);

    controlsRef.current.target.x = THREE.MathUtils.damp(controlsRef.current.target.x, _targetGoal.x, 6, dt);
    controlsRef.current.target.y = THREE.MathUtils.damp(controlsRef.current.target.y, _targetGoal.y, 6, dt);
    controlsRef.current.target.z = THREE.MathUtils.damp(controlsRef.current.target.z, _targetGoal.z, 6, dt);
    controlsRef.current.update();

    if (camera.position.distanceTo(_camGoal) < 0.12) {
      transitioningRef.current = false;
    }
  });

  const handlePointerMove = (e: ThreeEvent<PointerEvent>, block: SandboxBlock) => {
    e.stopPropagation();
    if (!e.face) return;
    if (mode === 'erase') {
      setHoverGhost(block.y > 0 ? [block.x, block.y, block.z] : null);
      return;
    }
    const nx = block.x + Math.round(e.face.normal.x);
    const ny = block.y + Math.round(e.face.normal.y);
    const nz = block.z + Math.round(e.face.normal.z);
    if (Math.abs(nx) <= 4 && Math.abs(nz) <= 4 && ny >= 0 && ny <= 9) {
      setHoverGhost([nx, ny, nz]);
    } else {
      setHoverGhost(null);
    }
  };

  const handleClick = (e: ThreeEvent<MouseEvent>, block: SandboxBlock) => {
    e.stopPropagation();
    if (e.delta > 6) return; // ignore orbit drag release
    if (mode === 'erase' || e.shiftKey) {
      if (block.y > 0) onRemoveBlock(block.id);
      return;
    }
    if (!e.face) return;
    const nx = block.x + Math.round(e.face.normal.x);
    const ny = block.y + Math.round(e.face.normal.y);
    const nz = block.z + Math.round(e.face.normal.z);
    if (Math.abs(nx) <= 4 && Math.abs(nz) <= 4 && ny >= 0 && ny <= 9) {
      onPlaceBlock(nx, ny, nz, selectedType);
    }
  };

  return (
    <>
      <color attach="background" args={['#0B120E']} />
      <fogExp2 attach="fog" args={['#0B120E', 0.015]} />
      <hemisphereLight args={['#B0DAC5', '#1F2C22', 0.78]} />
      <directionalLight
        position={[14, 22, 14]}
        intensity={2.1}
        color="#FFE9C7"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[-12, 10, -10]} intensity={0.6} color="#7CB8D6" />

      <group onPointerOut={() => setHoverGhost(null)}>
        {blocks.map((block) => (
          <mesh
            key={block.id}
            position={[block.x, block.y, block.z]}
            geometry={geometry}
            material={getVoxelMaterial(block.type)}
            castShadow
            receiveShadow
            onPointerMove={(e) => handlePointerMove(e, block)}
            onClick={(e) => handleClick(e, block)}
            onContextMenu={(e) => {
              e.stopPropagation();
              if (block.y > 0) onRemoveBlock(block.id);
            }}
          />
        ))}
      </group>

      {hoverGhost && (
        <lineSegments position={hoverGhost} geometry={edgeGeo}>
          <lineBasicMaterial color={mode === 'erase' ? '#EF4444' : '#D6B66E'} />
        </lineSegments>
      )}

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.08}
        minDistance={6}
        maxDistance={26}
        maxPolarAngle={Math.PI / 2.05}
        onStart={() => {
          transitioningRef.current = false;
        }}
      />
    </>
  );
}

export function CreativeSandboxSection() {
  const [blocks, setBlocks] = useState<SandboxBlock[]>(() => createStarterPreset('island'));
  const [selectedType, setSelectedType] = useState<BlockType>('castleBrick');
  const [mode, setMode] = useState<'build' | 'erase'>('build');
  const [cameraAngle, setCameraAngle] = useState<{ key: CameraAngleKey; seq: number }>({
    key: 'iso',
    seq: 0,
  });
  const [zoomTick, setZoomTick] = useState({ dir: 0, seq: 0 });
  const [dockOpen, setDockOpen] = useState(true);

  const handlePlaceBlock = (x: number, y: number, z: number, type: BlockType) => {
    const id = `${x},${y},${z}`;
    setBlocks((prev) => {
      if (prev.some((b) => b.id === id)) return prev;
      return [...prev, { id, x, y, z, type }];
    });
  };

  const handleRemoveBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <section
      id="creative"
      className="relative w-full bg-[#080D0A] border-t border-[#F4F4ED]/10 py-24"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D6B66E] mb-2">
              Creative Mode
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-[#F4F4ED]">
              Interactive Voxel Sandbox
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[#F4F4ED]/70">
            <span>Click face to place</span>
            <span aria-hidden="true">·</span>
            <span>Right-click or Erase to remove</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular text-[#D6B66E]">{blocks.length} Blocks</span>
          </div>
        </div>

        {/* Full-width 3D Sandbox Viewport with Collapsible Bottom Dock */}
        <div className="relative w-full h-[560px] md:h-[640px] border border-[#F4F4ED]/12 bg-[#0B120E] overflow-hidden">
          <ViewportCanvas
            cameraPosition={[12, 10, 12]}
            fov={44}
            backgroundColor="#0B120E"
            fallbackLabel="Creative Voxel Sandbox"
            rootMargin="350px 0px"
          >
            <SandboxScene
              blocks={blocks}
              selectedType={selectedType}
              mode={mode}
              cameraAngle={cameraAngle}
              zoomTick={zoomTick}
              onPlaceBlock={handlePlaceBlock}
              onRemoveBlock={handleRemoveBlock}
            />
          </ViewportCanvas>

          {/* Top-left quick starter presets */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-1.5 bg-[#080D0A]/92 border border-[#F4F4ED]/12 p-1">
            {(['island', 'shrine', 'tower'] as const).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setBlocks(createStarterPreset(preset))}
                className="px-3 py-1.5 text-xs font-medium text-[#F4F4ED]/80 hover:text-[#D6B66E] capitalize cursor-pointer"
              >
                {preset}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setBlocks(createStarterPreset('island'))}
              title="Reset island"
              className="px-2.5 py-1.5 text-xs font-medium text-[#F4F4ED]/70 hover:text-[#F4F4ED] border-l border-[#F4F4ED]/12 inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>

          {/* Collapsible Bottom Control Dock */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-[94%] max-w-[920px] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setDockOpen((prev) => !prev)}
              className="px-3.5 py-1 text-[11px] font-medium bg-[#080D0A]/94 border border-b-0 border-[#F4F4ED]/15 text-[#F4F4ED]/80 hover:text-[#D6B66E] inline-flex items-center gap-1.5 cursor-pointer"
            >
              {dockOpen ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
              <span>{dockOpen ? 'Hide Controls' : 'Show Controls'}</span>
            </button>

            {dockOpen && (
              <div className="w-full bg-[#080D0A]/94 border border-[#F4F4ED]/15 p-3 md:p-4 flex flex-col gap-3">
                {/* Row 1: Mode, Camera Angles, Zoom */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setMode('build')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                        mode === 'build'
                          ? 'bg-[#D6B66E] text-[#080D0A]'
                          : 'bg-[#16211A] text-[#F4F4ED]/75 hover:text-[#F4F4ED]'
                      }`}
                    >
                      <Hammer size={13} />
                      <span>Place Block</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('erase')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                        mode === 'erase'
                          ? 'bg-[#C44536] text-[#F4F4ED]'
                          : 'bg-[#16211A] text-[#F4F4ED]/75 hover:text-[#F4F4ED]'
                      }`}
                    >
                      <Eraser size={13} />
                      <span>Remove</span>
                    </button>
                  </div>

                  {/* Camera Angle Presets */}
                  <div className="flex flex-wrap items-center gap-1">
                    {(Object.keys(CAMERA_ANGLES) as CameraAngleKey[]).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setCameraAngle((prev) => ({ key, seq: prev.seq + 1 }))}
                        className={`px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                          cameraAngle.key === key
                            ? 'bg-[#1F2E24] text-[#D6B66E] border border-[#D6B66E]/50'
                            : 'bg-[#0F1712] text-[#F4F4ED]/70 border border-[#F4F4ED]/10 hover:text-[#F4F4ED]'
                        }`}
                      >
                        {CAMERA_ANGLES[key].label}
                      </button>
                    ))}
                  </div>

                  {/* Zoom Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Zoom in"
                      onClick={() => setZoomTick((prev) => ({ dir: -1, seq: prev.seq + 1 }))}
                      className="p-1.5 bg-[#0F1712] border border-[#F4F4ED]/12 text-[#F4F4ED]/80 hover:border-[#D6B66E] cursor-pointer"
                    >
                      <ZoomIn size={15} />
                    </button>
                    <button
                      type="button"
                      aria-label="Zoom out"
                      onClick={() => setZoomTick((prev) => ({ dir: 1, seq: prev.seq + 1 }))}
                      className="p-1.5 bg-[#0F1712] border border-[#F4F4ED]/12 text-[#F4F4ED]/80 hover:border-[#D6B66E] cursor-pointer"
                    >
                      <ZoomOut size={15} />
                    </button>
                  </div>
                </div>

                {/* Row 2: Block Palette */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {BLOCK_CATALOG.map((item) => {
                    const active = selectedType === item.id && mode === 'build';
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedType(item.id);
                          setMode('build');
                        }}
                        className={`inline-flex items-center gap-2 px-2.5 py-1.5 text-xs shrink-0 border transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#1A281F] border-[#D6B66E] text-[#F4F4ED]'
                            : 'bg-[#0F1712] border-[#F4F4ED]/10 text-[#F4F4ED]/70 hover:text-[#F4F4ED]'
                        }`}
                      >
                        <span
                          className="w-3 h-3 shrink-0 border border-black/30"
                          style={{ backgroundColor: item.swatch }}
                          aria-hidden="true"
                        />
                        <span className="whitespace-nowrap">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

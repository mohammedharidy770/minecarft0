import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { generateKingdomWorld } from '../../voxel/worldBuilder';
import { ViewportCanvas } from '../voxel/ViewportCanvas';
import { VoxelTerrain } from '../voxel/VoxelTerrain';
import { CameraKeyframe, ScrollCameraController } from '../voxel/ScrollCameraController';
import { prefersReducedMotion } from '../../voxel/glGuard';

gsap.registerPlugin(ScrollTrigger);

const KINGDOM_KEYFRAMES: CameraKeyframe[] = [
  { at: 0.0, position: [14, 7, 23], target: [0, 3, 6], fov: 44 },
  { at: 0.33, position: [-20, 12, 16], target: [0, 6, -2], fov: 44 },
  { at: 0.66, position: [-18, 17, -18], target: [0, 7, -3], fov: 42 },
  { at: 1.0, position: [22, 19, 14], target: [0, 6, -2], fov: 40 },
];

const KINGDOM_CHAPTERS = [
  {
    code: '01. River Crossing',
    title: 'The Lantern Bridge',
    body: 'Cobblestone arches span a winding glacial stream linking southern cottages and golden wheat terraces to the main gate.',
  },
  {
    code: '02. Outer Defense',
    title: 'Watchtowers & Curtain Walls',
    body: 'Four crenellated corner bastions anchor the perimeter wall, guarding the valley approach from the surrounding pine forest.',
  },
  {
    code: '03. Citadel Heart',
    title: 'The Grand Stone Keep',
    body: 'Rising sixteen blocks above the plateau, the terracotta-roofed keep commands the entire medieval settlement.',
  },
];

function KingdomSceneContent({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const blocks = useMemo(() => generateKingdomWorld(), []);

  return (
    <>
      <color attach="background" args={['#0B1410']} />
      <fogExp2 attach="fog" args={['#0B1410', 0.016]} />
      <hemisphereLight args={['#9AC7BA', '#1E2C22', 0.72]} />
      <directionalLight
        position={[24, 30, 18]}
        intensity={2.2}
        color="#FFE2B0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={24}
        shadow-camera-bottom={-24}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[-18, 12, -16]} intensity={0.6} color="#6BA4B8" />
      <pointLight position={[0, 6, 3]} intensity={6} distance={14} color="#FFBE42" />
      <ScrollCameraController keyframes={KINGDOM_KEYFRAMES} progressRef={progressRef} damping={5} />
      <VoxelTerrain blocks={blocks} />
    </>
  );
}

export function KingdomSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [chapterIdx, setChapterIdx] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      progressRef.current = 0.5;
      return;
    }

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        progressRef.current = self.progress;
        const idx = Math.min(
          KINGDOM_CHAPTERS.length - 1,
          Math.floor(self.progress * KINGDOM_CHAPTERS.length)
        );
        setChapterIdx(idx);
      },
    });

    return () => trigger.kill();
  }, []);

  const current = KINGDOM_CHAPTERS[chapterIdx];

  return (
    <section
      id="kingdom"
      ref={containerRef}
      className="relative w-full h-[260vh] bg-[#0B1410] border-t border-[#F4F4ED]/10"
      aria-label="The Medieval Voxel Kingdom"
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        <ViewportCanvas
          cameraPosition={[14, 7, 23]}
          fov={44}
          backgroundColor="#0B1410"
          fallbackLabel="The Medieval Kingdom"
          rootMargin="350px 0px"
        >
          <KingdomSceneContent progressRef={progressRef} />
        </ViewportCanvas>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-[#080D0A]/90 via-[#080D0A]/45 to-transparent"
        />

        <div className="pointer-events-none absolute top-24 left-6 md:left-12 z-10 max-w-md">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D6B66E] mb-2">
            The Kingdom
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-[#F4F4ED]">
            Citadel of the Valley
          </h2>
        </div>

        <div className="absolute bottom-8 left-6 md:left-12 right-6 md:right-auto z-10 max-w-lg">
          <div className="text-xs font-mono-tabular text-[#D6B66E] mb-2">{current.code}</div>
          <h3 className="font-display text-2xl font-semibold text-[#F4F4ED] mb-2">
            {current.title}
          </h3>
          <p className="text-sm md:text-base text-[#F4F4ED]/78 leading-relaxed">{current.body}</p>
        </div>

        <div className="hidden md:flex items-center gap-6 absolute bottom-10 right-12 z-10 text-xs font-mono-tabular text-[#F4F4ED]/70">
          <span>Castle Keep</span>
          <span aria-hidden="true">·</span>
          <span>4 Watchtowers</span>
          <span aria-hidden="true">·</span>
          <span>Village &amp; Farms</span>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { generateUndergroundWorld } from '../../voxel/worldBuilder';
import { ViewportCanvas } from '../voxel/ViewportCanvas';
import { VoxelTerrain } from '../voxel/VoxelTerrain';
import { CameraKeyframe, ScrollCameraController } from '../voxel/ScrollCameraController';
import { prefersReducedMotion } from '../../voxel/glGuard';

gsap.registerPlugin(ScrollTrigger);

const CAVE_KEYFRAMES: CameraKeyframe[] = [
  { at: 0.0, position: [0, 14, 21], target: [0, 2, 0], fov: 46 },
  { at: 0.38, position: [-11, 5.5, 13], target: [-2, 1.5, -2], fov: 48 },
  { at: 0.72, position: [10, 4.5, 11], target: [0, 2.5, -1], fov: 46 },
  { at: 1.0, position: [15, 9.5, 15], target: [0, 2, 0], fov: 44 },
];

const CAVE_NOTES = [
  {
    kicker: 'Subterranean Cavern',
    title: 'Descent Into Basalt Depths',
    text: 'Carved stone arches frame a hidden underground ecosystem lit by glowing prism clusters and molten magma.',
  },
  {
    kicker: 'Crystal & Magma',
    title: 'Lava Rivers & Underground Lakes',
    text: 'Glowing cyan and amethyst crystal spires illuminate a subterranean lake opposite a superheated lava channel.',
  },
  {
    kicker: 'Ancient Ruins',
    title: 'The Forgotten Cavern Shrine',
    text: 'Moss-covered stone pillars guard a gilded altar tucked deep beneath the cavern vault.',
  },
];

function UndergroundSceneContent({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const blocks = useMemo(() => generateUndergroundWorld(), []);

  return (
    <>
      <color attach="background" args={['#07080D']} />
      <fogExp2 attach="fog" args={['#07080D', 0.025]} />
      <hemisphereLight args={['#4D6E8F', '#1A0B0A', 0.55]} />
      <directionalLight position={[10, 20, 12]} intensity={0.75} color="#8AC4D0" />
      {/* Crystal cyan glow */}
      <pointLight position={[-2, 4, -4]} intensity={14} distance={18} color="#3BD9CA" />
      {/* Crystal amethyst glow */}
      <pointLight position={[3, 5, -5]} intensity={12} distance={18} color="#A65CEB" />
      {/* Lava river warm underglow */}
      <pointLight position={[-6, 2, 3]} intensity={16} distance={20} color="#FF5A1F" />
      {/* Shrine lantern */}
      <pointLight position={[0, 3, 0]} intensity={10} distance={14} color="#FFBE42" />

      <ScrollCameraController keyframes={CAVE_KEYFRAMES} progressRef={progressRef} damping={5} />
      <VoxelTerrain blocks={blocks} />
    </>
  );
}

export function UndergroundSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [step, setStep] = useState(0);

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
        setStep(Math.min(CAVE_NOTES.length - 1, Math.floor(self.progress * CAVE_NOTES.length)));
      },
    });
    return () => trigger.kill();
  }, []);

  const note = CAVE_NOTES[step];

  return (
    <section
      id="underground"
      ref={containerRef}
      className="relative w-full h-[240vh] bg-[#07080D] border-t border-[#F4F4ED]/10"
      aria-label="Underground Voxel Caverns"
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        <ViewportCanvas
          cameraPosition={[0, 14, 21]}
          fov={46}
          backgroundColor="#07080D"
          fallbackLabel="Underground Caverns"
          envIntensity={0.45}
          rootMargin="350px 0px"
        >
          <UndergroundSceneContent progressRef={progressRef} />
        </ViewportCanvas>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-[#07080D]/92 via-[#07080D]/45 to-transparent"
        />

        <div className="pointer-events-none absolute top-24 left-6 md:left-12 z-10 max-w-md">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#4FE3D2] mb-2">
            Underground World
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-[#F4F4ED]">
            Luminous Caverns
          </h2>
        </div>

        <div className="absolute bottom-8 left-6 md:left-12 right-6 md:right-auto z-10 max-w-lg">
          <div className="text-xs font-mono-tabular text-[#4FE3D2] mb-2">{note.kicker}</div>
          <h3 className="font-display text-2xl font-semibold text-[#F4F4ED] mb-2">{note.title}</h3>
          <p className="text-sm md:text-base text-[#F4F4ED]/78 leading-relaxed">{note.text}</p>
        </div>

        <div className="hidden md:flex items-center gap-6 absolute bottom-10 right-12 z-10 text-xs font-mono-tabular text-[#F4F4ED]/70">
          <span>Prism Crystals</span>
          <span aria-hidden="true">·</span>
          <span>Lava Channels</span>
          <span aria-hidden="true">·</span>
          <span>Ancient Ruins</span>
        </div>
      </div>
    </section>
  );
}

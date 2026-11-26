import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { OrbitControls } from '@react-three/drei';
import { generateExplodedStructure } from '../../voxel/worldBuilder';
import { ViewportCanvas } from '../voxel/ViewportCanvas';
import { VoxelTerrain } from '../voxel/VoxelTerrain';
import { prefersReducedMotion } from '../../voxel/glGuard';

gsap.registerPlugin(ScrollTrigger);

const LAYER_LABELS = [
  { name: 'Foundation', detail: 'Cobblestone & masonry plinth anchoring the structure.' },
  { name: 'Walls', detail: 'Timber corner posts and load-bearing stone masonry.' },
  { name: 'Windows', detail: 'Leaded glass panes framing interior lantern light.' },
  { name: 'Roof Sections', detail: 'Pitched terracotta tiles and gilded ridge finial.' },
  { name: 'Decor & Garden', detail: 'Lanterns, foliage, and surrounding cobblestone path.' },
];

export function ExplodedSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const explodeRef = useRef(0.85);
  const [explodePct, setExplodePct] = useState(85);
  const [manualOverride, setManualOverride] = useState(false);

  const blocks = useMemo(() => generateExplodedStructure(), []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || prefersReducedMotion()) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top center',
      end: 'bottom center',
      scrub: true,
      onUpdate: (self) => {
        if (manualOverride) return;
        // Start exploded (1.0) and smoothly assemble to 0.0 as user scrolls through!
        const val = Math.max(0, Math.min(1, 1 - self.progress * 1.1));
        explodeRef.current = val;
        setExplodePct(Math.round(val * 100));
      },
    });
    return () => trigger.kill();
  }, [manualOverride]);

  const handleSlider = (nextPct: number) => {
    setManualOverride(true);
    setExplodePct(nextPct);
    explodeRef.current = nextPct / 100;
  };

  return (
    <section
      id="exploded"
      ref={sectionRef}
      className="relative w-full min-h-screen bg-[#080D0A] border-t border-[#F4F4ED]/10 py-24"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D6B66E] mb-2">
              Architectural Anatomy
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-[#F4F4ED]">
              Exploded Voxel Assembly
            </h2>
          </div>
          <p className="text-sm md:text-base text-[#F4F4ED]/70 max-w-md">
            Scroll to watch every architectural layer lock seamlessly into its final structural position, or inspect the separation manually below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-8 h-[460px] md:h-[560px] border border-[#F4F4ED]/12 bg-[#0C1410] relative">
            <ViewportCanvas
              cameraPosition={[13, 10, 14]}
              fov={44}
              backgroundColor="#0C1410"
              fallbackLabel="Exploded Voxel Architecture"
              rootMargin="350px 0px"
            >
              <color attach="background" args={['#0C1410']} />
              <fogExp2 attach="fog" args={['#0C1410', 0.014]} />
              <hemisphereLight args={['#A6D1B8', '#1F2922', 0.78]} />
              <directionalLight
                position={[18, 25, 16]}
                intensity={2.2}
                color="#FFE8C2"
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-bias={-0.0005}
              />
              <directionalLight position={[-12, 8, -14]} intensity={0.65} color="#7EB8D4" />
              <VoxelTerrain blocks={blocks} explodeRef={explodeRef} position={[0, -2, 0]} />
              <OrbitControls
                enablePan={false}
                enableZoom={false}
                autoRotate
                autoRotateSpeed={0.5}
                minPolarAngle={0.35}
                maxPolarAngle={Math.PI / 2.1}
              />
            </ViewportCanvas>

            {/* Sleek bottom control bar inside viewport */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-[#080D0A]/92 border border-[#F4F4ED]/15 px-4 py-3 flex items-center gap-4">
              <span className="text-xs font-mono-tabular text-[#D6B66E] whitespace-nowrap shrink-0">
                Separation {explodePct}%
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={explodePct}
                aria-label="Exploded view separation percentage"
                onChange={(e) => handleSlider(Number(e.target.value))}
                className="w-full accent-[#D6B66E] cursor-pointer"
              />
              <button
                type="button"
                onClick={() => handleSlider(explodePct > 10 ? 0 : 100)}
                className="px-3 py-1 text-xs font-medium bg-[#16211A] border border-[#F4F4ED]/15 text-[#F4F4ED] hover:border-[#D6B66E] whitespace-nowrap shrink-0 cursor-pointer"
              >
                {explodePct > 10 ? 'Assemble' : 'Explode'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 bg-[#0F1712] border border-[#F4F4ED]/10 p-7 flex flex-col justify-between">
            <div>
              <h3 className="font-display text-xl font-semibold text-[#F4F4ED] mb-5">
                Structural Layers
              </h3>
              <ul className="space-y-4">
                {LAYER_LABELS.map((layer, i) => (
                  <li key={layer.name} className="border-b border-[#F4F4ED]/8 pb-3.5 last:border-none">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="font-display text-sm font-semibold text-[#F4F4ED]">
                        0{i + 1}. {layer.name}
                      </span>
                    </div>
                    <p className="text-xs text-[#F4F4ED]/65 leading-relaxed">{layer.detail}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-[#F4F4ED]/10 flex items-center justify-between text-xs text-[#F4F4ED]/55">
              <span>Interactive Orbit</span>
              <button
                type="button"
                onClick={() => setManualOverride(false)}
                className="text-[#D6B66E] hover:underline cursor-pointer"
              >
                Sync to Scroll
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

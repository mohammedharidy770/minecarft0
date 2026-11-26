import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BIOMES_DATA } from '../../data/worldsData';
import { ViewportCanvas } from '../voxel/ViewportCanvas';
import { BiomeScene } from '../voxel/BiomeScene';
import { prefersReducedMotion } from '../../voxel/glGuard';

gsap.registerPlugin(ScrollTrigger);

export function BiomesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || prefersReducedMotion()) return;

    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px)', () => {
      const ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: () => `+=${window.innerHeight * 3.2}`,
          pin: true,
          scrub: 0.6,
          onUpdate: (self) => {
            const p = self.progress;
            const idx = Math.min(
              BIOMES_DATA.length - 1,
              Math.floor(p * BIOMES_DATA.length)
            );
            setActiveIndex(idx);
            const maxShift = track.scrollWidth - track.clientWidth;
            if (maxShift > 0) {
              gsap.set(track, { x: -p * maxShift });
            }
          },
        });
      }, section);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  const activeBiome = BIOMES_DATA[activeIndex];

  return (
    <section
      id="biomes"
      ref={sectionRef}
      className="relative w-full min-h-screen bg-[#080D0A] border-t border-[#F4F4ED]/10 flex flex-col justify-between py-20 lg:py-24 overflow-hidden"
    >
      <div className="max-w-[1400px] w-full mx-auto px-6 md:px-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D6B66E] mb-2">
              World Exploration
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-[#F4F4ED]">
              Six Living Biomes
            </h2>
          </div>

          {/* Interactive Biome Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#0F1712] p-1 border border-[#F4F4ED]/10">
            {BIOMES_DATA.map((b, idx) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  idx === activeIndex
                    ? 'bg-[#D6B66E] text-[#080D0A]'
                    : 'text-[#F4F4ED]/70 hover:text-[#F4F4ED]'
                }`}
              >
                {b.number}. {b.subtitle.replace(' Biome', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Main 3D Biome Viewport + Details Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-8">
          <div className="lg:col-span-8 h-[420px] md:h-[500px] border border-[#F4F4ED]/12 bg-[#0F1712] relative">
            <ViewportCanvas
              cameraPosition={[17, 11, 17]}
              fov={43}
              backgroundColor={activeBiome.skyColor}
              fallbackLabel={activeBiome.name}
              rootMargin="350px 0px"
            >
              <BiomeScene biome={activeBiome} interactive />
            </ViewportCanvas>

            <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-mono-tabular text-[#F4F4ED]/75">
              <span>Drag to orbit {activeBiome.subtitle.toLowerCase()}</span>
              <span>
                {activeBiome.number} / 0{BIOMES_DATA.length}
              </span>
            </div>
          </div>

          {/* Biome Spec Panel */}
          <div className="lg:col-span-4 bg-[#0F1712] border border-[#F4F4ED]/10 p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono-tabular text-[#D6B66E] mb-3">
                <span>{activeBiome.number}</span>
                <span aria-hidden="true">·</span>
                <span>{activeBiome.subtitle}</span>
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-[#F4F4ED] mb-4">
                {activeBiome.name}
              </h3>
              <p className="text-sm md:text-base text-[#F4F4ED]/75 leading-relaxed mb-8">
                {activeBiome.description}
              </p>

              <dl className="space-y-4 border-t border-[#F4F4ED]/10 pt-5 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[#F4F4ED]/55">Climate</dt>
                  <dd className="font-mono-tabular text-[#F4F4ED]">{activeBiome.climate}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[#F4F4ED]/55">Elevation</dt>
                  <dd className="font-mono-tabular text-[#F4F4ED]">{activeBiome.elevation}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[#F4F4ED]/55">Flora</dt>
                  <dd className="text-[#F4F4ED]">{activeBiome.vegetation}</dd>
                </div>
              </dl>
            </div>

            <div className="flex items-center justify-between pt-6 mt-6 border-t border-[#F4F4ED]/10">
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((prev) => (prev - 1 + BIOMES_DATA.length) % BIOMES_DATA.length)
                }
                aria-label="Previous biome"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-[#F4F4ED]/15 text-[#F4F4ED] hover:border-[#D6B66E] transition-colors cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveIndex((prev) => (prev + 1) % BIOMES_DATA.length)}
                aria-label="Next biome"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-[#F4F4ED]/15 text-[#F4F4ED] hover:border-[#D6B66E] transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Scroll Track of all 6 Biomes */}
        <div className="overflow-x-auto lg:overflow-hidden pb-2">
          <div ref={trackRef} className="flex gap-4 w-max lg:w-auto">
            {BIOMES_DATA.map((b, idx) => {
              const selected = idx === activeIndex;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`w-64 shrink-0 text-left p-4 border transition-colors cursor-pointer ${
                    selected
                      ? 'bg-[#16211A] border-[#D6B66E]'
                      : 'bg-[#0F1712] border-[#F4F4ED]/10 hover:border-[#F4F4ED]/30'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono-tabular mb-1.5">
                    <span className={selected ? 'text-[#D6B66E]' : 'text-[#F4F4ED]/50'}>
                      {b.number}
                    </span>
                    <span
                      className="w-3 h-3 block"
                      style={{ backgroundColor: b.accentColor }}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="font-display text-base font-semibold text-[#F4F4ED]">
                    {b.subtitle}
                  </div>
                  <div className="text-xs text-[#F4F4ED]/60 mt-1 truncate">{b.vegetation}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

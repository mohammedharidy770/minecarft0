import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown } from 'lucide-react';
import { ViewportCanvas } from '../voxel/ViewportCanvas';
import { WorldScene } from '../voxel/WorldScene';
import { prefersReducedMotion } from '../../voxel/glGuard';

gsap.registerPlugin(ScrollTrigger);

interface HeroSceneChapter {
  number: string;
  title: string;
  description: string;
  threshold: number;
}

const HERO_SCENES: HeroSceneChapter[] = [
  {
    number: 'Scene 01',
    title: 'A Single Floating Block',
    description: 'Every universe begins with one grass voxel suspended in quiet darkness.',
    threshold: 0.0,
  },
  {
    number: 'Scene 02',
    title: 'Foundations Take Shape',
    description: 'Surrounding earth and granite blocks lock together to form living ground.',
    threshold: 0.12,
  },
  {
    number: 'Scene 03',
    title: 'Canopy & Bloom',
    description: 'Oak groves, rolling hills, and golden wildflowers emerge across the clearing.',
    threshold: 0.28,
  },
  {
    number: 'Scene 04',
    title: 'Peaks & Glacial River',
    description: 'Snow-capped stone ridges rise while a clear river carves through the valley.',
    threshold: 0.44,
  },
  {
    number: 'Scene 05',
    title: 'A Village Awakens',
    description: 'Lantern-lit stone bridges, timber cottages, and wheat fields settle by the bank.',
    threshold: 0.6,
  },
  {
    number: 'Scene 06',
    title: 'Expanding Horizons',
    description: 'Watchtowers, outer pine forests, and high cliffs stretch toward the skyline.',
    threshold: 0.76,
  },
  {
    number: 'Scene 07',
    title: 'Aerial Panorama',
    description: 'Drifting voxel clouds crown a complete procedural world seen from above.',
    threshold: 0.9,
  },
];

export function HeroWorldSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [activeScene, setActiveScene] = useState(0);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      progressRef.current = 1;
      setActiveScene(6);
      setScrollPct(100);
      return;
    }

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        progressRef.current = p;
        setScrollPct(Math.round(p * 100));

        let idx = 0;
        for (let i = HERO_SCENES.length - 1; i >= 0; i--) {
          if (p >= HERO_SCENES[i].threshold - 0.03) {
            idx = i;
            break;
          }
        }
        setActiveScene(idx);
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  const jumpToScene = (idx: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const sectionTop = window.scrollY + rect.top;
    const scrollable = el.offsetHeight - window.innerHeight;
    const targetY = sectionTop + scrollable * Math.min(0.99, HERO_SCENES[idx].threshold + 0.02);
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  const chapter = HERO_SCENES[activeScene];

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative w-full h-[400vh] bg-[#080D0A]"
      aria-label="Hero 3D World Construction"
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        <ViewportCanvas
          alwaysMounted
          cameraPosition={[3.2, 3.6, 4.2]}
          fov={42}
          backgroundColor="#080D0A"
          fallbackLabel="Voxel World Genesis"
        >
          <WorldScene progressRef={progressRef} />
        </ViewportCanvas>

        {/* Bottom contrast scrim */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-[#080D0A]/90 via-[#080D0A]/40 to-transparent"
        />

        {/* Top-left editorial identity */}
        <div className="pointer-events-none absolute top-24 left-6 md:left-12 z-10 max-w-xl">
          <p className="text-xs font-medium tracking-[0.22em] uppercase text-[#D6B66E] mb-2">
            Beyond The Blocks
          </p>
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F4F4ED] leading-[1.06]">
            Build an Entire Voxel Universe
          </h1>
        </div>

        {/* Bottom-left current scene story readout */}
        <div className="absolute bottom-8 left-6 md:left-12 right-6 md:right-auto z-10 max-w-lg pointer-events-auto">
          <div className="flex items-center gap-3 text-xs font-mono-tabular text-[#D6B66E] mb-2">
            <span>{chapter.number}</span>
            <span aria-hidden="true">·</span>
            <span>{scrollPct}% Constructed</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-[#F4F4ED] mb-2">
            {chapter.title}
          </h2>
          <p className="text-sm md:text-base text-[#F4F4ED]/78 leading-relaxed">
            {chapter.description}
          </p>

          {activeScene === 0 && (
            <button
              type="button"
              onClick={() => jumpToScene(1)}
              className="mt-5 inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-[#D6B66E] hover:text-[#F4F4ED] transition-colors cursor-pointer"
            >
              <span>Scroll to construct world</span>
              <ArrowDown size={14} />
            </button>
          )}
        </div>

        {/* Right-edge chapter selector */}
        <div
          className="hidden md:flex flex-col items-end gap-2.5 absolute right-10 top-1/2 -translate-y-1/2 z-10"
          aria-label="World Construction Chapters"
        >
          {HERO_SCENES.map((s, idx) => {
            const isActive = idx === activeScene;
            return (
              <button
                key={s.number}
                type="button"
                onClick={() => jumpToScene(idx)}
                className="group flex items-center gap-3 py-1 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D6B66E]"
              >
                <span
                  className={`text-xs font-mono-tabular transition-colors ${
                    isActive
                      ? 'text-[#D6B66E] font-medium'
                      : 'text-[#F4F4ED]/40 group-hover:text-[#F4F4ED]/80'
                  }`}
                >
                  {s.number}
                </span>
                <span
                  className={`block h-[2px] transition-all duration-200 ${
                    isActive ? 'w-8 bg-[#D6B66E]' : 'w-4 bg-[#F4F4ED]/25 group-hover:w-6'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

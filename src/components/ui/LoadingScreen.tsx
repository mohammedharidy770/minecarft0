import { useEffect, useState } from 'react';
import { BlockType, getVoxelMaterial } from '../../voxel/textures';

const PREWARM_TYPES: BlockType[] = [
  'grass',
  'dirt',
  'stone',
  'cobble',
  'wood',
  'planks',
  'oakLeaves',
  'pineLeaves',
  'water',
  'sand',
  'snow',
  'ice',
  'castleBrick',
  'roofTile',
  'gold',
  'lantern',
  'crystalCyan',
  'lava',
  'obsidian',
];

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [percent, setPercent] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    let idx = 0;
    let rafId = 0;
    let timerId = 0;

    const step = () => {
      if (idx < PREWARM_TYPES.length) {
        getVoxelMaterial(PREWARM_TYPES[idx]);
        idx++;
        const nextPct = Math.round((idx / PREWARM_TYPES.length) * 100);
        setPercent(nextPct);
        rafId = requestAnimationFrame(step);
      } else {
        setFading(true);
        timerId = window.setTimeout(onComplete, 380);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(timerId);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#080D0A] transition-opacity duration-300 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-live="polite"
    >
      <div className="w-72 max-w-[82vw] flex flex-col gap-5">
        <div className="flex items-baseline justify-between">
          <span className="font-display text-lg font-semibold tracking-tight text-[#F4F4ED]">
            VOXEL WORLD
          </span>
          <span className="font-mono-tabular text-sm text-[#D6B66E]">{percent}%</span>
        </div>

        <div className="w-full h-[2px] bg-[#F4F4ED]/12 overflow-hidden">
          <div
            className="h-full bg-[#D6B66E] transition-transform duration-150 origin-left"
            style={{ transform: `scaleX(${percent / 100})` }}
          />
        </div>

        <p className="text-xs text-[#F4F4ED]/55 tracking-wide">
          Generating procedural terrain &amp; voxel textures
        </p>
      </div>
    </div>
  );
}

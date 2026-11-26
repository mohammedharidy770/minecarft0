import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../../voxel/glGuard';

export function CustomCursor() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const isFine = window.matchMedia?.('(pointer: fine)').matches;
    if (!isFine) return;
    setEnabled(true);

    let targetX = -100;
    let targetY = -100;
    let curX = -100;
    let curY = -100;
    let rafId = 0;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (innerRef.current) {
        innerRef.current.style.transform = `translate3d(${targetX - 2}px, ${targetY - 2}px, 0)`;
      }
      const el = e.target as HTMLElement | null;
      const interactive = Boolean(el?.closest('a, button, [role="button"], input, select'));
      setHovering(interactive);
    };

    const tick = () => {
      curX += (targetX - curX) * 0.18;
      curY += (targetY - curY) * 0.18;
      if (outerRef.current) {
        outerRef.current.style.transform = `translate3d(${curX - 12}px, ${curY - 12}px, 0) scale(${
          hovering ? 1.45 : 1
        })`;
      }
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, [hovering]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={outerRef}
        aria-hidden="true"
        className={`fixed top-0 left-0 z-[90] w-6 h-6 pointer-events-none border transition-colors duration-150 ${
          hovering ? 'border-[#D6B66E] bg-[#D6B66E]/10' : 'border-[#F4F4ED]/45'
        }`}
        style={{ willChange: 'transform' }}
      />
      <div
        ref={innerRef}
        aria-hidden="true"
        className="fixed top-0 left-0 z-[91] w-1 h-1 pointer-events-none bg-[#D6B66E]"
        style={{ willChange: 'transform' }}
      />
    </>
  );
}

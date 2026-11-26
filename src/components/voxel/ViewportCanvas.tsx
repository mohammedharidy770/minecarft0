import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { detectSoftwareGl, StudioEnvironment } from '../../voxel/glGuard';

interface ViewportCanvasProps {
  children: ReactNode;
  cameraPosition?: [number, number, number];
  fov?: number;
  className?: string;
  backgroundColor?: string;
  fallbackLabel?: string;
  envIntensity?: number;
  alwaysMounted?: boolean;
  rootMargin?: string;
}

export function ViewportCanvas({
  children,
  cameraPosition = [18, 14, 18],
  fov = 44,
  className = 'w-full h-full',
  backgroundColor = '#080D0A',
  fallbackLabel = 'Voxel Environment',
  envIntensity = 0.65,
  alwaysMounted = false,
  rootMargin = '250px 0px',
}: ViewportCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(alwaysMounted);
  const [contextLost, setContextLost] = useState(false);
  const isSoftwareGl = useMemo(() => detectSoftwareGl(), []);

  useEffect(() => {
    if (alwaysMounted) {
      setInView(true);
      return;
    }
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setInView(entry.isIntersecting);
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [alwaysMounted, rootMargin]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundColor }}
    >
      {inView && !contextLost ? (
        <Canvas
          dpr={isSoftwareGl ? 1 : [1, 1.75]}
          shadows={!isSoftwareGl}
          camera={{ position: cameraPosition, fov, near: 0.2, far: 250 }}
          gl={{
            antialias: !isSoftwareGl,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.08,
          }}
          onCreated={({ gl }) => {
            const canvas = gl.domElement;
            const handleLost = (e: Event) => {
              e.preventDefault();
              setContextLost(true);
            };
            const handleRestored = () => {
              setContextLost(false);
            };
            canvas.addEventListener('webglcontextlost', handleLost, false);
            canvas.addEventListener('webglcontextrestored', handleRestored, false);
          }}
        >
          <StudioEnvironment intensity={envIntensity} />
          {children}
        </Canvas>
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            background: `radial-gradient(circle at 50% 45%, rgba(49, 93, 55, 0.22), ${backgroundColor} 72%)`,
          }}
        >
          <span className="text-xs tracking-[0.2em] uppercase text-[#F4F4ED]/45 font-mono-tabular">
            {contextLost ? 'Restoring 3D Viewport...' : fallbackLabel}
          </span>
        </div>
      )}
    </div>
  );
}

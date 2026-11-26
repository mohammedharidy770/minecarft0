import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Compass, Pause, Play, RotateCcw } from 'lucide-react';
import { PROJECTS_DATA, ProjectWorldDefinition } from '../data/worldsData';
import { ViewportCanvas } from '../components/voxel/ViewportCanvas';
import { LightingPreset, ProjectViewer } from '../components/voxel/ProjectViewer';

const LIGHTING_OPTIONS: { id: LightingPreset; label: string }[] = [
  { id: 'dawn', label: 'Golden Dawn' },
  { id: 'noon', label: 'High Noon' },
  { id: 'twilight', label: 'Twilight' },
  { id: 'night', label: 'Starlit Night' },
];

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const projectIndex = PROJECTS_DATA.findIndex((p) => p.slug === slug);
  const project: ProjectWorldDefinition =
    projectIndex >= 0 ? PROJECTS_DATA[projectIndex] : PROJECTS_DATA[0];

  const [lighting, setLighting] = useState<LightingPreset>(
    project.slug === 'the-nether-gate' ? 'twilight' : 'dawn'
  );
  const [autoRotate, setAutoRotate] = useState(true);
  const [activeLandmark, setActiveLandmark] = useState(0);
  const [cameraGoal, setCameraGoal] = useState<{
    pos: [number, number, number];
    target: [number, number, number];
  } | null>(null);
  const [dockOpen, setDockOpen] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    setLighting(project.slug === 'the-nether-gate' ? 'twilight' : 'dawn');
    setActiveLandmark(0);
    setCameraGoal({
      pos: [24, 17, 24],
      target: [0, 3, 0],
    });
  }, [project.slug]);

  const prevProject =
    PROJECTS_DATA[(projectIndex - 1 + PROJECTS_DATA.length) % PROJECTS_DATA.length];
  const nextProject = PROJECTS_DATA[(projectIndex + 1) % PROJECTS_DATA.length];

  const focusLandmark = (idx: number) => {
    const lm = project.landmarks[idx];
    if (!lm) return;
    setActiveLandmark(idx);
    setAutoRotate(false);
    setCameraGoal({ pos: lm.cameraPosition, target: lm.cameraTarget });
  };

  return (
    <main className="min-h-screen bg-[#080D0A] pt-16">
      {/* Cinematic 3D Hero Viewer */}
      <section className="relative w-full h-[82vh] min-h-[540px] border-b border-[#F4F4ED]/10 overflow-hidden">
        <ViewportCanvas
          alwaysMounted
          cameraPosition={[24, 17, 24]}
          fov={42}
          backgroundColor={project.skyColor}
          fallbackLabel={project.name}
        >
          <ProjectViewer
            slug={project.slug}
            skyColor={project.skyColor}
            lightingPreset={lighting}
            cameraPresetPos={cameraGoal?.pos ?? null}
            cameraPresetTarget={cameraGoal?.target ?? null}
            autoRotate={autoRotate}
            enableZoom
            onCameraPresetSettled={() => setCameraGoal(null)}
          />
        </ViewportCanvas>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#080D0A]/90 via-[#080D0A]/35 to-transparent"
        />

        {/* Top-left Breadcrumb & Title */}
        <div className="pointer-events-none absolute top-6 left-6 md:left-12 z-10 max-w-2xl">
          <Link
            to="/#projects"
            className="pointer-events-auto inline-flex items-center gap-2 text-xs font-medium text-[#F4F4ED]/75 hover:text-[#D6B66E] mb-4 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to All Worlds</span>
          </Link>

          <div className="flex items-center gap-3 text-xs font-mono-tabular text-[#D6B66E] mb-2">
            <span>{project.number}</span>
            <span aria-hidden="true">·</span>
            <span>{project.biome}</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold text-[#F4F4ED]">
            {project.name}
          </h1>
          <p className="text-sm md:text-base text-[#F4F4ED]/75 mt-2">{project.tagline}</p>
        </div>

        {/* Collapsible Bottom Control Dock */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 w-[94%] max-w-[820px] flex flex-col items-center">
          <button
            type="button"
            onClick={() => setDockOpen((prev) => !prev)}
            className="px-3.5 py-1 text-[11px] font-medium bg-[#080D0A]/94 border border-b-0 border-[#F4F4ED]/15 text-[#F4F4ED]/80 hover:text-[#D6B66E] inline-flex items-center gap-1.5 cursor-pointer"
          >
            {dockOpen ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
            <span>{dockOpen ? 'Hide Controls' : 'Show Controls'}</span>
          </button>

          {dockOpen && (
            <div className="w-full bg-[#080D0A]/94 border border-[#F4F4ED]/15 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              {/* Lighting Presets */}
              <div className="flex flex-wrap items-center gap-1">
                {LIGHTING_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setLighting(opt.id)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      lighting === opt.id
                        ? 'bg-[#D6B66E] text-[#080D0A]'
                        : 'bg-[#0F1712] text-[#F4F4ED]/75 hover:text-[#F4F4ED]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Camera Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAutoRotate((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#0F1712] border border-[#F4F4ED]/15 text-[#F4F4ED]/85 hover:border-[#D6B66E] cursor-pointer whitespace-nowrap"
                >
                  {autoRotate ? <Pause size={13} /> : <Play size={13} />}
                  <span>{autoRotate ? 'Pause Orbit' : 'Auto Orbit'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAutoRotate(true);
                    setCameraGoal({ pos: [24, 17, 24], target: [0, 3, 0] });
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#0F1712] border border-[#F4F4ED]/15 text-[#F4F4ED]/85 hover:border-[#D6B66E] cursor-pointer whitespace-nowrap"
                >
                  <RotateCcw size={13} />
                  <span>Reset View</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Environmental Storytelling & Interactive Landmarks */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Narrative & Terrain */}
          <div className="lg:col-span-6 space-y-8">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D6B66E] mb-2">
                Environmental Storytelling
              </p>
              <h2 className="font-display text-2xl md:text-4xl font-bold text-[#F4F4ED] mb-4">
                World Lore &amp; Topography
              </h2>
              <p className="text-base text-[#F4F4ED]/80 leading-relaxed">{project.story}</p>
            </div>

            <div className="border-t border-[#F4F4ED]/10 pt-6">
              <h3 className="font-display text-lg font-semibold text-[#F4F4ED] mb-2">
                Terrain Generation
              </h3>
              <p className="text-sm text-[#F4F4ED]/70 leading-relaxed">{project.terrainSummary}</p>
            </div>

            <div className="border-t border-[#F4F4ED]/10 pt-6">
              <h3 className="font-display text-lg font-semibold text-[#F4F4ED] mb-4">
                Material Palette
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {project.paletteSwatches.map((sw) => (
                  <div key={sw.name} className="bg-[#0F1712] border border-[#F4F4ED]/10 p-3">
                    <div
                      className="w-full h-8 mb-2 border border-white/10"
                      style={{ backgroundColor: sw.hex }}
                    />
                    <div className="text-xs font-medium text-[#F4F4ED]">{sw.name}</div>
                    <div className="text-[11px] font-mono-tabular text-[#F4F4ED]/50 mt-0.5">
                      {sw.hex}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Architectural Landmarks */}
          <div className="lg:col-span-6">
            <div className="bg-[#0F1712] border border-[#F4F4ED]/12 p-7 md:p-9">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs font-medium tracking-[0.18em] uppercase text-[#D6B66E] mb-1">
                    Camera Guided Tour
                  </p>
                  <h2 className="font-display text-2xl font-bold text-[#F4F4ED]">
                    Main Architectural Landmarks
                  </h2>
                </div>
                <Compass size={20} className="text-[#D6B66E] shrink-0" />
              </div>

              <div className="space-y-3">
                {project.landmarks.map((lm, idx) => {
                  const selected = idx === activeLandmark;
                  return (
                    <button
                      key={lm.name}
                      type="button"
                      onClick={() => focusLandmark(idx)}
                      className={`w-full text-left p-4 border transition-colors cursor-pointer ${
                        selected
                          ? 'bg-[#16211A] border-[#D6B66E]'
                          : 'bg-[#080D0A]/50 border-[#F4F4ED]/10 hover:border-[#F4F4ED]/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <span className="font-display text-base font-semibold text-[#F4F4ED]">
                          0{idx + 1}. {lm.name}
                        </span>
                        <span className="text-xs font-mono-tabular text-[#D6B66E]">
                          Focus Camera
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-[#F4F4ED]/70 leading-relaxed">
                        {lm.detail}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Next / Previous World Navigation */}
        <div className="mt-20 pt-10 border-t border-[#F4F4ED]/10 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link
            to={`/projects/${prevProject.slug}`}
            className="group p-6 bg-[#0F1712] border border-[#F4F4ED]/10 hover:border-[#D6B66E] transition-colors flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-mono-tabular text-[#F4F4ED]/50 mb-1">
                Previous World
              </div>
              <div className="font-display text-xl font-semibold text-[#F4F4ED] group-hover:text-[#D6B66E] transition-colors">
                {prevProject.name}
              </div>
            </div>
            <ArrowLeft size={18} className="text-[#F4F4ED]/60 group-hover:text-[#D6B66E]" />
          </Link>

          <Link
            to={`/projects/${nextProject.slug}`}
            className="group p-6 bg-[#0F1712] border border-[#F4F4ED]/10 hover:border-[#D6B66E] transition-colors flex items-center justify-between text-right sm:text-left"
          >
            <div>
              <div className="text-xs font-mono-tabular text-[#F4F4ED]/50 mb-1">Next World</div>
              <div className="font-display text-xl font-semibold text-[#F4F4ED] group-hover:text-[#D6B66E] transition-colors">
                {nextProject.name}
              </div>
            </div>
            <ArrowRight size={18} className="text-[#F4F4ED]/60 group-hover:text-[#D6B66E]" />
          </Link>
        </div>
      </section>
    </main>
  );
}

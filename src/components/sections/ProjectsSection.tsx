import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { PROJECTS_DATA } from '../../data/worldsData';
import { ViewportCanvas } from '../voxel/ViewportCanvas';
import { ProjectViewer } from '../voxel/ProjectViewer';

export function ProjectsSection() {
  return (
    <section
      id="projects"
      className="relative w-full bg-[#080D0A] border-t border-[#F4F4ED]/10 py-24"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D6B66E] mb-2">
              Curated Realms
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-[#F4F4ED]">
              Five Voxel Worlds
            </h2>
          </div>
          <p className="text-sm md:text-base text-[#F4F4ED]/70 max-w-md">
            Inspect each procedural realm directly in 3D, or enter its dedicated showcase page for full landmark tours and lighting controls.
          </p>
        </div>

        <div className="space-y-12">
          {PROJECTS_DATA.map((project, idx) => {
            const isEven = idx % 2 === 1;
            return (
              <article
                key={project.slug}
                className="grid grid-cols-1 lg:grid-cols-12 border border-[#F4F4ED]/12 bg-[#0F1712] overflow-hidden"
              >
                {/* 3D Preview Stage */}
                <div
                  className={`lg:col-span-7 h-[360px] md:h-[440px] relative ${
                    isEven ? 'lg:order-2' : ''
                  }`}
                >
                  <ViewportCanvas
                    cameraPosition={[22, 16, 22]}
                    fov={42}
                    backgroundColor={project.skyColor}
                    fallbackLabel={project.name}
                    rootMargin="180px 0px"
                  >
                    <ProjectViewer
                      slug={project.slug}
                      skyColor={project.skyColor}
                      lightingPreset={project.slug === 'the-nether-gate' ? 'twilight' : 'dawn'}
                      enableZoom={false}
                      autoRotate
                    />
                  </ViewportCanvas>

                  <div className="pointer-events-none absolute bottom-4 left-4 text-xs font-mono-tabular text-[#F4F4ED]/70">
                    Drag to orbit · Live 3D Scene
                  </div>
                </div>

                {/* Editorial Project Details */}
                <div
                  className={`lg:col-span-5 p-8 md:p-10 flex flex-col justify-between ${
                    isEven ? 'lg:order-1 border-b lg:border-b-0 lg:border-r border-[#F4F4ED]/10' : 'border-t lg:border-t-0 lg:border-l border-[#F4F4ED]/10'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-3 text-xs font-mono-tabular text-[#D6B66E] mb-3">
                      <span>{project.number}</span>
                      <span aria-hidden="true">·</span>
                      <span>{project.blockCountLabel}</span>
                    </div>

                    <h3 className="font-display text-2xl md:text-4xl font-bold text-[#F4F4ED] mb-3">
                      {project.name}
                    </h3>

                    <p className="text-sm text-[#F4F4ED]/55 mb-5">{project.biome}</p>

                    <p className="text-sm md:text-base text-[#F4F4ED]/80 leading-relaxed mb-6">
                      {project.description}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-[#F4F4ED]/10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5" aria-label="Material palette">
                      {project.paletteSwatches.map((sw) => (
                        <span
                          key={sw.name}
                          title={sw.name}
                          className="w-4 h-4 border border-white/15"
                          style={{ backgroundColor: sw.hex }}
                        />
                      ))}
                    </div>

                    <Link
                      to={`/projects/${project.slug}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold tracking-wide bg-[#D6B66E] text-[#080D0A] hover:bg-[#E6C987] transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>Explore World</span>
                      <ArrowUpRight size={15} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

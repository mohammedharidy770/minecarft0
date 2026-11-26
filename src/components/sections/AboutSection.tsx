export function AboutSection() {
  return (
    <section
      id="about"
      className="relative w-full bg-[#080D0A] border-t border-[#F4F4ED]/10 py-24"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D6B66E] mb-3">
              Engine &amp; Craft
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-[#F4F4ED] leading-tight">
              Procedural Voxel Architecture
            </h2>
          </div>

          <div className="lg:col-span-7 space-y-6 text-base text-[#F4F4ED]/78 leading-relaxed">
            <p>
              Voxel World is built as a real-time procedural universe. Every hillside, mountain ridge, river bend, timber cottage, and subterranean crystal spire is generated mathematically in the browser using seeded noise fields and rendered through GPU-instanced Three.js meshes.
            </p>
            <p>
              Procedural 16-bit surface textures, physically calibrated roughness and metalness values, studio environment reflections, and scroll-choreographed camera trajectories unite to turn simple geometric cubes into atmospheric worlds.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-[#F4F4ED]/10">
              <div>
                <div className="font-mono-tabular text-2xl font-semibold text-[#D6B66E]">
                  6 Biomes
                </div>
                <div className="text-xs text-[#F4F4ED]/60 mt-1">
                  Distinct climate, flora &amp; lighting
                </div>
              </div>
              <div>
                <div className="font-mono-tabular text-2xl font-semibold text-[#D6B66E]">
                  5 Worlds
                </div>
                <div className="text-xs text-[#F4F4ED]/60 mt-1">
                  Interactive landmark expeditions
                </div>
              </div>
              <div>
                <div className="font-mono-tabular text-2xl font-semibold text-[#D6B66E]">
                  30+ Blocks
                </div>
                <div className="text-xs text-[#F4F4ED]/60 mt-1">
                  Procedural pixel PBR materials
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

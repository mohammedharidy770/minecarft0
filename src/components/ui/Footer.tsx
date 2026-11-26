import { Link } from 'react-router-dom';
import { PROJECTS_DATA } from '../../data/worldsData';

export function Footer() {
  return (
    <footer className="bg-[#080D0A] border-t border-[#F4F4ED]/10 py-14">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <div className="font-display text-lg font-bold tracking-[0.06em] text-[#F4F4ED]">
            VOXEL WORLD
          </div>
          <p className="text-xs text-[#F4F4ED]/55 mt-1.5">
            Original procedural 3D voxel showcase · Beyond The Blocks
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#F4F4ED]/70">
          {PROJECTS_DATA.map((p) => (
            <Link
              key={p.slug}
              to={`/projects/${p.slug}`}
              className="hover:text-[#D6B66E] transition-colors whitespace-nowrap"
            >
              {p.name}
            </Link>
          ))}
        </nav>

        <div className="text-xs text-[#F4F4ED]/45 font-mono-tabular">
          © {new Date().getFullYear()} Voxel World
        </div>
      </div>
    </footer>
  );
}

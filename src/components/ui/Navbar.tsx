import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home', target: 'home' },
  { label: 'Worlds', target: 'kingdom' },
  { label: 'Biomes', target: 'biomes' },
  { label: 'Creative', target: 'creative' },
  { label: 'Projects', target: 'projects' },
  { label: 'About', target: 'about' },
];

export function Navbar() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const updateScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      if (total <= 0) {
        setScrollProgress(0);
        return;
      }
      setScrollProgress(Math.min(1, Math.max(0, window.scrollY / total)));
    };
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
    };
  }, [location.pathname]);

  const handleNavClick = (sectionId: string) => {
    setMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      window.setTimeout(() => {
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
      return;
    }
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(sectionId);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#080D0A]/92 border-b border-[#F4F4ED]/10">
      {/* Top hairline scroll progress bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] bg-[#D6B66E] origin-left pointer-events-none"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      <div className="max-w-[1400px] mx-auto px-5 md:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          className="font-display text-base md:text-lg font-bold tracking-[0.06em] text-[#F4F4ED] whitespace-nowrap shrink-0 cursor-pointer hover:text-[#D6B66E] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D6B66E]"
        >
          VOXEL WORLD
        </button>

        {/* Zone 2: Clean single-line text links */}
        <nav className="hidden lg:flex items-center gap-7" aria-label="Primary Navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.target}
              type="button"
              onClick={() => handleNavClick(item.target)}
              className="text-sm font-medium text-[#F4F4ED]/75 hover:text-[#F4F4ED] transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 border-b border-transparent hover:border-[#D6B66E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D6B66E]"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary CTA + Mobile Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleNavClick('projects')}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold tracking-wide text-[#080D0A] bg-[#D6B66E] hover:bg-[#E4C886] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F4F4ED]"
          >
            Explore Worlds
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 text-[#F4F4ED] border border-[#F4F4ED]/15 hover:border-[#D6B66E] transition-colors cursor-pointer"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Animated Mobile Navigation Drawer */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-200 bg-[#080D0A] border-b border-[#F4F4ED]/10 ${
          menuOpen ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-6 py-5 flex flex-col gap-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.target}
              type="button"
              onClick={() => handleNavClick(item.target)}
              className="text-left py-2.5 text-base font-medium text-[#F4F4ED]/85 hover:text-[#D6B66E] border-b border-[#F4F4ED]/8 cursor-pointer"
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleNavClick('projects')}
            className="mt-3 w-full py-3 text-sm font-semibold text-[#080D0A] bg-[#D6B66E] hover:bg-[#E4C886] cursor-pointer"
          >
            Explore Worlds
          </button>
        </div>
      </div>
    </header>
  );
}

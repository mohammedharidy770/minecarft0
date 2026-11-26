import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HeroWorldSection } from '../components/sections/HeroWorldSection';
import { BiomesSection } from '../components/sections/BiomesSection';
import { KingdomSection } from '../components/sections/KingdomSection';
import { UndergroundSection } from '../components/sections/UndergroundSection';
import { ExplodedSection } from '../components/sections/ExplodedSection';
import { CreativeSandboxSection } from '../components/sections/CreativeSandboxSection';
import { ProjectsSection } from '../components/sections/ProjectsSection';
import { AboutSection } from '../components/sections/AboutSection';

export function HomePage() {
  const { hash } = useLocation();

  useEffect(() => {
    const id = window.setTimeout(() => {
      ScrollTrigger.refresh();
      if (hash) {
        const target = document.getElementById(hash.replace('#', ''));
        target?.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
    return () => window.clearTimeout(id);
  }, [hash]);

  return (
    <main>
      <HeroWorldSection />
      <BiomesSection />
      <KingdomSection />
      <UndergroundSection />
      <ExplodedSection />
      <CreativeSandboxSection />
      <ProjectsSection />
      <AboutSection />
    </main>
  );
}

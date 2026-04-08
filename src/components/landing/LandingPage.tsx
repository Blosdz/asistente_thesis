import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { ChevronRight, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import projectIcon from '../../../iconProyect.png';

import Hero from './Hero';
import HowItWorks from './HowItWorks';
import PricingStory from './PricingStory';
import Plans from './Plans';
import AIShowcase from './AIShowcase';
import TrustSection from './TrustSection';
import FinalCTA from './FinalCTA';
import GlassCard from '../ui/GlassCard';
import ScrollProgress from '../ui/ScrollProgress';

const navItems = [
  { label: 'Como funciona', id: 'how-it-works' },
  { label: 'Cotizacion', id: 'pricing-story' },
  { label: 'Planes', id: 'plans' },
  { label: 'Asistente', id: 'ai-showcase' },
];

export default function LandingPage() {
  const lenisRef = useRef(null);

  useEffect(() => {
    document.body.classList.add('landing-page');

    const lenis = new Lenis({
      smoothWheel: true,
      lerp: 0.14,
      wheelMultiplier: 1,
      touchMultiplier: 1,
      syncTouch: false,
    });

    lenisRef.current = lenis;

    let frameId = 0;

    const raf = (time) => {
      lenis.raf(time);
      frameId = window.requestAnimationFrame(raf);
    };

    frameId = window.requestAnimationFrame(raf);

    return () => {
      document.body.classList.remove('landing-page');
      window.cancelAnimationFrame(frameId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollToSection = (id) => {
    const target = document.getElementById(id);
    if (!target) {
      return;
    }

    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { offset: -24, duration: 1.05 });
      return;
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="landing-shell relative isolate overflow-hidden text-slate-900">
      <ScrollProgress />

      <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f8fbff] via-[#eef5fb] to-[#edf4fb]" />
        <div className="absolute left-[-10%] top-[-8%] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.96),rgba(59,130,246,0.14)_38%,transparent_72%)] blur-2xl" />
        <div className="absolute right-[-6%] top-[22%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.12),rgba(255,255,255,0.78)_36%,transparent_72%)] blur-2xl" />
        <div className="absolute bottom-[-10%] left-[18%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.1),rgba(255,255,255,0.78)_36%,transparent_72%)] blur-2xl" />
        <div className="landing-mesh absolute inset-0 opacity-40" />
      </div>

      <header className="fixed inset-x-0 top-4 z-50 mx-auto w-[min(1120px,calc(100%-1.25rem))]">
        <GlassCard className="rounded-full px-4 py-3 sm:px-5">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => scrollToSection('hero')}
              className="flex items-center gap-3 text-left"
            >
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-[0_14px_34px_rgba(15,23,42,0.12)]">
                <img src={projectIcon} alt="AppThesis" className="h-8 w-8 object-contain" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">AppThesis</p>
                <p className="text-xs text-slate-500">
                  Organizacion, cotizacion y acompanamiento
                </p>
              </div>
            </button>

            <nav className="hidden items-center gap-2 lg:flex">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors duration-300 hover:bg-white/75 hover:text-slate-900"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-300 hover:bg-white/82"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Ingresar</span>
              </Link>
              <button
                type="button"
                onClick={() => scrollToSection('plans')}
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-900"
              >
                Ver planes
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </GlassCard>
      </header>

      <main className="relative">
        <Hero onNavigate={scrollToSection} />
        <HowItWorks />
        <PricingStory />
        <Plans />
        <AIShowcase />
        <TrustSection />
        <FinalCTA onNavigate={scrollToSection} />
      </main>
    </div>
  );
}

import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { ChevronRight, LogIn } from 'lucide-react';

import Hero from './Hero';
import GlassCard from '../ui/GlassCard';
import ScrollProgress from '../ui/ScrollProgress';

const AssessmentFunnel = lazy(() => import('./AssessmentFunnel'));
const Plans = lazy(() => import('./Plans'));
const TrustSection = lazy(() => import('./TrustSection'));
const FinalCTA = lazy(() => import('./FinalCTA'));

const navItems = [
  { label: 'Inicio', id: 'hero' },
  { label: 'Evaluación', id: 'assessment-funnel' },
  { label: 'Planes', id: 'plans' },
  { label: 'Valor', id: 'trust' },
];

function SectionSkeleton({ className = 'min-h-[360px]' }) {
  return (
    <div
      className={`mx-auto flex w-full max-w-6xl flex-col gap-6 rounded-[36px] border border-white/70 bg-white/55 p-8 shadow-[0_24px_80px_rgba(148,163,184,0.12)] backdrop-blur-xl ${className}`}
    >
      <div className="h-4 w-28 animate-pulse rounded-full bg-slate-200/80" />
      <div className="h-10 w-full max-w-md animate-pulse rounded-full bg-slate-200/80" />
      <div className="h-4 w-4/5 max-w-2xl animate-pulse rounded-full bg-slate-200/70" />

      <div className="grid flex-1 gap-4 md:grid-cols-3">
        <div className="h-40 animate-pulse rounded-[28px] bg-white/80 md:col-span-2" />
        <div className="h-40 animate-pulse rounded-[28px] bg-slate-200/75" />
        <div className="h-32 animate-pulse rounded-[28px] bg-slate-200/75" />
        <div className="h-32 animate-pulse rounded-[28px] bg-slate-200/75" />
        <div className="h-32 animate-pulse rounded-[28px] bg-slate-200/75" />
      </div>
    </div>
  );
}

function DeferredSection({
  children,
  rootMargin = '260px 0px',
  placeholderClassName,
}) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) return;

    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  return (
    <div ref={sectionRef}>
      {isVisible ? (
        <Suspense fallback={<SectionSkeleton className={placeholderClassName} />}>
          {children}
        </Suspense>
      ) : (
        <SectionSkeleton className={placeholderClassName} />
      )}
    </div>
  );
}

export default function LandingPage() {
  const lastScrollYRef = useRef(0);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    document.body.classList.add('landing-page');

    let ticking = false;
    let lastScrolled = -1;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollYRef.current;
      const scrollDelta = Math.abs(currentScrollY - lastScrollYRef.current);

      // Only update if significant scroll change
      if (Math.abs(currentScrollY - lastScrolled) >= 10 || currentScrollY <= 24 || currentScrollY > lastScrollYRef.current + 50) {
        setIsScrolled(currentScrollY > 24);

        if (currentScrollY <= 24) {
          setIsNavVisible(true);
        } else if (scrollDelta > 10) {
          setIsNavVisible(!scrollingDown);
        }

        lastScrolled = currentScrollY;
      }

      lastScrollYRef.current = currentScrollY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(handleScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();

    return () => {
      document.body.classList.remove('landing-page');
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const scrollToSection = (id) => {
    const target = document.getElementById(id);
    if (!target) {
      return;
    }

    const top = target.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
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

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-transform duration-300 ${
          isNavVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <GlassCard
          className={`rounded-none border-x-0 border-t-0 px-4 py-3 sm:px-6 ${
            isScrolled
              ? 'bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.12)]'
              : 'bg-white/72'
          }`}
        >
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => scrollToSection('hero')}
              className="flex items-center gap-3 text-left"
            >
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-sky-200/90 bg-blue-300 shadow-[0_14px_34px_rgba(15,23,42,0.12)]">
                <img
                  src="/favicon.svg"
                  alt="AppThesis"
                  className="h-8 w-8 object-contain"
                  width="32"
                  height="32"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">AppThesis</p>
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
              <a
                href="#/login"
                className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-300 hover:bg-white/82"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Ingresar</span>
              </a>
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
        <DeferredSection placeholderClassName="min-h-[720px]">
          <AssessmentFunnel onNavigate={scrollToSection} />
        </DeferredSection>
        <DeferredSection placeholderClassName="min-h-[560px]">
          <Plans />
        </DeferredSection>
        <DeferredSection placeholderClassName="min-h-[520px]">
          <TrustSection />
        </DeferredSection>
        <DeferredSection placeholderClassName="min-h-[420px]">
          <FinalCTA onNavigate={scrollToSection} />
        </DeferredSection>
      </main>
    </div>
  );
}

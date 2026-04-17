import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { ChevronRight, LogIn } from 'lucide-react';

import Hero from './Hero';
import GlassCard from '../ui/GlassCard';
import ScrollProgress from '../ui/ScrollProgress';
import appIcon from '../../../page-icon.png';

const AssessmentFunnel = lazy(() => import('./AssessmentFunnel'));
const Plans = lazy(() => import('./Plans'));
const TrustSection = lazy(() => import('./TrustSection'));

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
        className={`fixed inset-x-0 top-0 z-50 transition-transform duration-300 ${isNavVisible ? 'translate-y-0' : '-translate-y-full'
          }`}
      >
        <GlassCard
          className={`rounded-none border-x-0 border-t-0 px-6 py-4 sm:px-8 lg:px-10 ${isScrolled
            ? 'bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.12)]'
            : 'bg-white/72'
            }`}
        >
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6">
            <button
              type="button"
              onClick={() => scrollToSection('hero')}
              className="flex items-center gap-3 text-left"
            >
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-sky-200/90 bg-blue-300 shadow-[0_14px_34px_rgba(15,23,42,0.12)]">
                {/* ICON MAS GRANDE !  */}
                <img
                  src={appIcon}
                  alt="AppThesis"
                  className="h-25 w-25 object-contain"
                  width="50"
                  height="50"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">AppThesis</p>
              </div>
            </button>

            <nav className="hidden items-center gap-4 lg:flex">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="rounded-full px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors duration-300 hover:bg-white/75 hover:text-slate-900"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <a
                href="#/login"
                className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-300 hover:bg-white/82"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Ingresar</span>
              </a>
              <button
                type="button"
                onClick={() => scrollToSection('plans')}
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-900"
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
        {/* FOOTER */}
        <footer className="relative border-t border-white/30 bg-gradient-to-b from-white/10 to-slate-50/20 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-16">
              {/* Logo & Description */}
              <div className="flex flex-col gap-4">
                <div className="text-2xl font-bold text-slate-950">AppThesis</div>
                <p className="text-sm leading-6 text-slate-600">
                  Empodera a estudiantes para completar sus tesis con claridad, orden y método estadístico. Asesoría experta en cada paso.
                </p>
                <div className="flex gap-4 pt-2">
                  <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors">
                    <span className="sr-only">Twitter</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-7.793 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors">
                    <span className="sr-only">Instagram</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 3.46c2.337 0 2.613.01 3.535.052.854.04 1.317.187 1.626.31.409.159.701.349.909.557.208.208.398.5.557.908.123.31.27.773.31 1.627.042.922.052 1.198.052 3.535s-.01 2.613-.052 3.535c-.04.854-.187 1.317-.31 1.626-.159.409-.349.701-.557.909-.208.208-.5.398-.909.557-.309.123-.772.27-1.626.31-.922.042-1.198.052-3.535.052s-2.613-.01-3.535-.052c-.854-.04-1.317-.187-1.626-.31-.409-.159-.701-.349-.909-.557-.208-.208-.398-.5-.557-.909-.123-.309-.27-.772-.31-1.626-.042-.922-.052-1.198-.052-3.535s.01-2.613.052-3.535c.04-.854.187-1.317.31-1.626.159-.409.349-.701.557-.909.208-.208.5-.398.909-.557.309-.123.772-.27 1.626-.31.922-.042 1.198-.052 3.535-.052z" />
                    </svg>
                  </a>
                  <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors">
                    <span className="sr-only">LinkedIn</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Product Column */}
              <div className="flex flex-col gap-4">
                <h3 className="font-semibold text-slate-950">Producto</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-sm text-slate-600 hover:text-slate-950 transition-colors">Características</a></li>
                  <li><a href="#" className="text-sm text-slate-600 hover:text-slate-950 transition-colors">Planes</a></li>
                  <li><a href="#" className="text-sm text-slate-600 hover:text-slate-950 transition-colors">Integraciones</a></li>
                  <li><a href="#" className="text-sm text-slate-600 hover:text-slate-950 transition-colors">Changelog</a></li>
                </ul>
              </div>

              {/* Resources Column */}
              <div className="flex flex-col gap-4">
                <h3 className="font-semibold text-slate-950">Recursos</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-sm text-slate-600 hover:text-slate-950 transition-colors">Documentación</a></li>
                  <li><a href="#" className="text-sm text-slate-600 hover:text-slate-950 transition-colors">Tutoriales</a></li>
                  <li><a href="#" className="text-sm text-slate-600 hover:text-slate-950 transition-colors">Blog</a></li>
                  <li><a href="#" className="text-sm text-slate-600 hover:text-slate-950 transition-colors">Soporte</a></li>
                </ul>
              </div>

              {/* Company Column */}
              <div className="flex flex-col gap-4">
                <h3 className="font-semibold text-slate-950">Empresa</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-sm text-slate-600 hover:text-slate-950 transition-colors">Acerca de</a></li>
                  <li><a href="#" className="text-sm text-slate-600 hover:text-slate-950 transition-colors">Carreras</a></li>
                  <li><a href="#" className="text-sm text-slate-600 hover:text-slate-950 transition-colors">Contacto</a></li>
                  <li><a href="#" className="text-sm text-slate-600 hover:text-slate-950 transition-colors">Partners</a></li>
                </ul>
              </div>
            </div>

            {/* Footer Bottom */}
            <div className="mt-12 border-t border-white/30 pt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">© 2025 AppThesis. Todos los derechos reservados.</p>
              <div className="flex gap-6">
                <a href="#" className="text-sm text-slate-600 hover:text-slate-950 transition-colors">Política de Privacidad</a>
                <a href="#" className="text-sm text-slate-600 hover:text-slate-950 transition-colors">Términos de Servicio</a>
                <a href="#" className="text-sm text-slate-600 hover:text-slate-950 transition-colors">Configuración de Cookies</a>
              </div>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}

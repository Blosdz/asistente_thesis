import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';

import appIcon from '../../../page-icon.png';
import { cn } from '../../lib/cn';
import { navItems } from './landingData';
import { useStoryScroll } from './SmoothScrollProvider';

export default function LandingNavbar() {
  const { activeSection, scrollToSection } = useStoryScroll();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollYRef.current;

      if (menuOpen) {
        setIsHidden(false);
        lastScrollYRef.current = currentScrollY;
        return;
      }

      if (currentScrollY <= 24) {
        setIsHidden(false);
      } else if (delta > 8) {
        setIsHidden(true);
      } else if (delta < -8) {
        setIsHidden(false);
      }

      lastScrollYRef.current = currentScrollY;
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [menuOpen]);

  const handleNavigate = (id: string) => {
    scrollToSection(id);
    setMenuOpen(false);
  };

  return (
    <header
      className={cn(
        'pointer-events-none fixed inset-x-0 top-4 z-[70] px-4 will-change-transform transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:top-6 sm:px-6',
        isHidden ? '-translate-y-10 opacity-0' : 'translate-y-0 opacity-100',
      )}
    >
      <div className="mx-auto max-w-7xl">
        <div className="pointer-events-auto relative mx-auto max-w-5xl overflow-hidden rounded-full border border-slate bg-slate px-4 py-3 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-lg sm:px-6">
          <div className="relative z-10 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => handleNavigate('hero')}
              className="flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white bg-white/70 shadow-[0_10px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                <img src={appIcon} alt="AppThesis" className="h-9 w-9 object-contain" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-950">AppThesis</p>
                <p className="text-[11px] uppercase tracking-[0.26em] text-slate-500">
                  Thesis Command Center
                </p>
              </div>
            </button>

            <nav className="hidden items-center gap-2 lg:flex">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigate(item.id)}
                    className={cn(
                      'rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-xl transition-all duration-300 hover:border-blue-200 hover:bg-blue-50/80 hover:text-slate-950',
                      isActive
                        ? 'border-white bg-white/80 text-slate-950 shadow-[0_10px_24px_rgba(15,23,42,0.05)]'
                        : 'border-transparent bg-white/20 text-slate-600',
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              <a
                href="#/login"
                className="rounded-full border border-white bg-white/45 px-4 py-2 text-sm font-semibold text-slate-700 backdrop-blur-xl transition hover:border-blue-200 hover:bg-white/80 hover:text-slate-950"
              >
                Ingresar
              </a>
              <a
                href="#/signup"
                className="rounded-full border border-white bg-white/75 px-5 py-2 text-sm font-semibold text-slate-950 shadow-[0_10px_28px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:border-blue-200 hover:bg-white"
              >
                Empezar
              </a>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white bg-white/50 text-slate-700 backdrop-blur-xl transition hover:border-blue-200 hover:bg-white/80 hover:text-slate-950 lg:hidden"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="pointer-events-auto relative mx-auto mt-3 max-w-5xl overflow-hidden rounded-[28px] border border-white bg-white/45 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl lg:hidden">
            <div className="relative z-10">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigate(item.id)}
                    className="rounded-2xl border border-white bg-white/55 px-4 py-3 text-left text-sm font-medium text-slate-700 backdrop-blur-xl transition hover:border-blue-200 hover:bg-white/80 hover:text-slate-950"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <a
                  href="#/login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-2xl border border-white bg-white/55 px-4 py-3 text-center text-sm font-semibold text-slate-700 backdrop-blur-xl transition hover:border-blue-200 hover:bg-white/80 hover:text-slate-950"
                >
                  Ingresar
                </a>
                <a
                  href="#/signup"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-2xl border border-white bg-white/80 px-4 py-3 text-center text-sm font-semibold text-slate-950 backdrop-blur-xl transition hover:border-blue-200 hover:bg-white"
                >
                  Empezar
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

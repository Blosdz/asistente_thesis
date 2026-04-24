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
        <div
          className={cn(
            'pointer-events-auto relative mx-auto max-w-5xl overflow-hidden rounded-full',
            'border border-white/55 bg-white/[0.42] px-4 py-3 backdrop-blur-2xl backdrop-saturate-150 sm:px-6',
            'shadow-[0_24px_80px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.75),inset_0_-1px_0_rgba(255,255,255,0.24)]',
            'before:pointer-events-none before:absolute before:inset-0 before:rounded-full',
            'before:bg-[linear-gradient(135deg,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.18)_36%,rgba(125,181,255,0.18)_62%,rgba(255,255,255,0.34)_100%)]',
            'before:opacity-70',
            'after:pointer-events-none after:absolute after:inset-x-8 after:top-0 after:h-px',
            'after:bg-gradient-to-r after:from-transparent after:via-white/80 after:to-transparent',
          )}
        >
          <div className="pointer-events-none absolute -left-20 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-blue-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-cyan-200/25 blur-3xl" />

          <div className="relative z-10 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => handleNavigate('hero')}
              className="group flex items-center gap-3"
            >
              <div
                className={cn(
                  'relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl',
                  'border border-white/70 bg-white/65 backdrop-blur-xl',
                  'shadow-[0_12px_30px_rgba(15,23,42,0.10),inset_0_1px_0_rgba(255,255,255,0.85)]',
                  'transition duration-300 group-hover:scale-[1.04] group-hover:bg-white/85',
                )}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/70 via-white/20 to-blue-100/40" />
                <img
                  src={appIcon}
                  alt="AppThesis"
                  className="relative z-10 h-9 w-9 object-contain"
                />
              </div>

              <div className="text-left">
                <p className="text-sm font-semibold tracking-[-0.01em] text-slate-950">
                  AppThesis
                </p>
                <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">
                  Thesis Command Center
                </p>
              </div>
            </button>

            <nav className="hidden items-center gap-1.5 rounded-full border border-white/45 bg-white/25 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl lg:flex">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigate(item.id)}
                    className={cn(
                      'relative rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300',
                      'hover:-translate-y-0.5 hover:border-white/70 hover:bg-white/55 hover:text-slate-950',
                      isActive
                        ? [
                            'border-white/80 bg-white/80 text-slate-950',
                            'shadow-[0_10px_28px_rgba(15,23,42,0.10),inset_0_1px_0_rgba(255,255,255,0.85)]',
                          ]
                        : 'border-transparent bg-transparent text-slate-600',
                    )}
                  >
                    {isActive ? (
                      <span className="pointer-events-none absolute inset-x-4 -bottom-1 h-px bg-gradient-to-r from-transparent via-blue-500/70 to-transparent" />
                    ) : null}

                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              <a
                href="#/login"
                className={cn(
                  'rounded-full border border-white/55 bg-white/35 px-4 py-2 text-sm font-semibold text-slate-700',
                  'backdrop-blur-xl transition duration-300',
                  'hover:-translate-y-0.5 hover:border-white/80 hover:bg-white/70 hover:text-slate-950',
                  'shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]',
                )}
              >
                Ingresar
              </a>

              <a
                href="#/signup"
                className={cn(
                  'relative overflow-hidden rounded-full border border-white/80 bg-blue-400 px-5 py-2 text-sm font-semibold text-white',
                  'shadow-[0_14px_34px_rgba(15,23,42,0.22),inset_0_1px_0_rgba(255,255,255,0.22)]',
                  'transition duration-300 hover:-translate-y-0.5 hover:bg-slate-900',
                  'before:pointer-events-none before:absolute before:inset-0',
                  'before:bg-[linear-gradient(135deg,rgba(255,255,255,0.28)_0%,transparent_42%,rgba(125,181,255,0.24)_100%)]',
                )}
              >
                <span className="relative z-10">Crear Cuenta</span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className={cn(
                'inline-flex h-11 w-11 items-center justify-center rounded-full',
                'border border-white/65 bg-white/50 text-slate-700 backdrop-blur-xl',
                'shadow-[0_10px_26px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.7)]',
                'transition duration-300 hover:border-white/90 hover:bg-white/80 hover:text-slate-950 lg:hidden',
              )}
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div
            className={cn(
              'pointer-events-auto relative mx-auto mt-3 max-w-5xl overflow-hidden rounded-[30px]',
              'border border-white/55 bg-white/[0.46] p-4 backdrop-blur-2xl backdrop-saturate-150 lg:hidden',
              'shadow-[0_24px_80px_rgba(15,23,42,0.14),inset_0_1px_0_rgba(255,255,255,0.75)]',
              'before:pointer-events-none before:absolute before:inset-0',
              'before:bg-[linear-gradient(135deg,rgba(255,255,255,0.7)_0%,rgba(255,255,255,0.2)_45%,rgba(125,181,255,0.14)_100%)]',
            )}
          >
            <div className="pointer-events-none absolute -left-20 top-0 h-40 w-40 rounded-full bg-blue-300/20 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 bottom-0 h-40 w-40 rounded-full bg-cyan-200/25 blur-3xl" />

            <div className="relative z-10">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const isActive = activeSection === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavigate(item.id)}
                      className={cn(
                        'rounded-2xl border px-4 py-3 text-left text-sm font-medium backdrop-blur-xl transition duration-300',
                        'hover:border-white/80 hover:bg-white/75 hover:text-slate-950',
                        isActive
                          ? 'border-white/80 bg-white/80 text-slate-950 shadow-[0_10px_26px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.75)]'
                          : 'border-white/45 bg-white/42 text-slate-700',
                      )}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <a
                  href="#/login"
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'rounded-2xl border border-white/60 bg-white/45 px-4 py-3 text-center text-sm font-semibold text-slate-700',
                    'backdrop-blur-xl transition duration-300 hover:border-white/85 hover:bg-white/80 hover:text-slate-950',
                  )}
                >
                  Ingresar
                </a>

                <a
                  href="#/signup"
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'relative overflow-hidden rounded-2xl border border-white/80 bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white',
                    'shadow-[0_14px_34px_rgba(15,23,42,0.22),inset_0_1px_0_rgba(255,255,255,0.22)]',
                    'transition duration-300 hover:bg-slate-900',
                    'before:pointer-events-none before:absolute before:inset-0',
                    'before:bg-[linear-gradient(135deg,rgba(255,255,255,0.25)_0%,transparent_45%,rgba(125,181,255,0.25)_100%)]',
                  )}
                >
                  <span className="relative z-10">Empezar</span>
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

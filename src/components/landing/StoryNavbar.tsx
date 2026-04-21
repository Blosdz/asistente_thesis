import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, ChevronRight, LogIn, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import projectIcon from '../../../iconProyect.png';

import { cn } from '../../lib/cn';
import type { StorySectionConfig } from './storySections';
import { useStoryScroll } from './SmoothScrollProvider';

type StoryNavbarProps = {
  sections: StorySectionConfig[];
  onOpenStory: () => void;
};

export default function StoryNavbar({ sections, onOpenStory }: StoryNavbarProps) {
  const reducedMotion = useReducedMotion();
  const { activeSection, lockScroll, scrollToSection, unlockScroll } = useStoryScroll();
  const [menuOpen, setMenuOpen] = useState(false);

  const navSections = useMemo(
    () => sections.filter((section) => section.id !== 'hero' && section.id !== 'final-cta'),
    [sections],
  );

  useEffect(() => {
    if (!menuOpen) {
      unlockScroll('story-drawer');
      return;
    }

    lockScroll('story-drawer');

    return () => {
      unlockScroll('story-drawer');
    };
  }, [lockScroll, menuOpen, unlockScroll]);

  const handleNavigate = (id: string) => {
    scrollToSection(id);
    setMenuOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-4 z-[120] mx-auto w-[min(1140px,calc(100%-1.25rem))]">
      <div className="story-nav-shell relative overflow-hidden rounded-[28px] border border-white/20 bg-white/10 px-4 py-3 shadow-[0_20px_60px_rgba(2,6,23,0.28)] backdrop-blur-md sm:px-5">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />

        <div className="relative z-10 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => handleNavigate('hero')}
            className="flex items-center gap-3 text-left"
          >
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-[0_14px_34px_rgba(15,23,42,0.18)] backdrop-blur-md">
              <img src={projectIcon} alt="AppThesis" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">AppThesis</p>
              <p className="text-xs text-white/65">Ordena. Decide. Avanza.</p>
            </div>
          </button>

          <nav className="hidden items-center gap-1 lg:flex">
            {navSections.map((section) => {
              const isActive = activeSection === section.id;

              return (
                <motion.button
                  key={section.id}
                  type="button"
                  onClick={() => handleNavigate(section.id)}
                  whileHover={reducedMotion ? undefined : { y: -1 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                  className={cn(
                    'relative rounded-full border px-4 py-2 text-sm font-semibold backdrop-blur-md transition-all duration-200 hover:border-white/40 hover:text-white',
                    isActive
                      ? 'border-white/40 bg-white/14 text-white'
                      : 'border-transparent bg-white/5 text-white/70',
                  )}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="story-active-pill"
                      className="absolute inset-0 rounded-full border border-white/30 bg-white/8 shadow-[0_10px_30px_rgba(15,23,42,0.18)]"
                    />
                  ) : null}
                  <span className="relative z-10">{section.label}</span>
                </motion.button>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <button
              type="button"
              onClick={onOpenStory}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white/80 backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:text-white"
            >
              Demo
              <ArrowUpRight className="h-4 w-4" />
            </button>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white/80 backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:text-white"
            >
              <LogIn className="h-4 w-4" />
              Entrar
            </Link>
            <button
              type="button"
              onClick={() => handleNavigate('plans')}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:text-white"
            >
              Planes
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={onOpenStory}
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white/80 backdrop-blur-md transition hover:border-white/40 hover:text-white"
            >
              Demo
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 backdrop-blur-md transition hover:border-white/40 hover:text-white"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Cerrar menu' : 'Abrir menu'}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <div className="lg:hidden">
            <motion.div
              className="fixed inset-0 z-[125] bg-slate-950/24 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0.18 : 0.24 }}
              onClick={() => setMenuOpen(false)}
            />

            <motion.aside
              className="fixed inset-y-4 right-4 z-[130] w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-[32px] border border-white/20 bg-white/10 p-5 shadow-[0_30px_90px_rgba(15,23,42,0.28)] backdrop-blur-md"
              initial={{ x: reducedMotion ? 0 : 32, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: reducedMotion ? 0 : 32, opacity: 0 }}
              transition={{ duration: reducedMotion ? 0.2 : 0.32, ease: [0.22, 1, 0.36, 1] }}
              drag={reducedMotion ? false : 'x'}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.08}
              onDragEnd={(_, info) => {
                if (info.offset.x > 96) {
                  setMenuOpen(false);
                }
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />

              <div className="relative z-10">
                <div className="flex items-center justify-between gap-3 border-b border-white/15 pb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">
                      Menu
                    </p>
                    <p className="mt-2 text-xl font-semibold text-white">Ve al punto.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 backdrop-blur-md transition hover:border-white/40 hover:text-white"
                    aria-label="Cerrar menu"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-5 space-y-2">
                  {navSections.map((section) => {
                    const isActive = activeSection === section.id;

                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => handleNavigate(section.id)}
                        className={cn(
                          'flex w-full items-center justify-between rounded-[22px] border px-4 py-4 text-left text-base font-semibold backdrop-blur-md transition-all duration-200 hover:border-white/40 hover:text-white',
                          isActive
                            ? 'border-white/40 bg-white/14 text-white'
                            : 'border-white/20 bg-white/10 text-white/75',
                        )}
                      >
                        {section.label}
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 grid gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenStory();
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-[22px] border border-white/20 bg-white/10 px-4 py-4 text-sm font-semibold text-white/80 backdrop-blur-md transition hover:border-white/40 hover:text-white"
                  >
                    Ver demo
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 rounded-[22px] border border-white/20 bg-white/12 px-4 py-4 text-sm font-semibold text-white backdrop-blur-md transition hover:border-white/40 hover:text-white"
                  >
                    <LogIn className="h-4 w-4" />
                    Entrar
                  </Link>
                </div>
              </div>
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

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
      <div className="story-nav-shell rounded-[28px] px-4 py-3 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => handleNavigate('hero')}
            className="flex items-center gap-3 text-left"
          >
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/75 bg-white/82 shadow-[0_14px_34px_rgba(15,23,42,0.12)]">
              <img src={projectIcon} alt="AppThesis" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">AppThesis</p>
              <p className="text-xs text-slate-500">Ordena. Decide. Avanza.</p>
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
                    'relative rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200',
                    isActive ? 'text-slate-950' : 'text-slate-600 hover:text-slate-950',
                  )}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="story-active-pill"
                      className="absolute inset-0 rounded-full border border-white/75 bg-white/80 shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
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
              className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/72 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-300 hover:bg-white"
            >
              Demo
              <ArrowUpRight className="h-4 w-4" />
            </button>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/72 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-300 hover:bg-white"
            >
              <LogIn className="h-4 w-4" />
              Entrar
            </Link>
            <button
              type="button"
              onClick={() => handleNavigate('plans')}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-900"
            >
              Planes
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={onOpenStory}
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/70 bg-white/72 px-4 text-sm font-semibold text-slate-700"
            >
              Demo
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/72 text-slate-700"
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
              className="fixed inset-y-4 right-4 z-[130] w-[min(22rem,calc(100vw-2rem))] rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(239,246,255,0.88))] p-5 shadow-[0_30px_90px_rgba(15,23,42,0.22)] backdrop-blur-2xl"
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
              <div className="flex items-center justify-between gap-3 border-b border-white/70 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Menu
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">Ve al punto.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/75 bg-white/82 text-slate-600"
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
                        'flex w-full items-center justify-between rounded-[22px] border px-4 py-4 text-left text-base font-semibold transition-all duration-200',
                        isActive
                          ? 'border-slate-950 bg-slate-950 text-white'
                          : 'border-white/75 bg-white/78 text-slate-700',
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
                  className="inline-flex items-center justify-center gap-2 rounded-[22px] border border-white/75 bg-white/82 px-4 py-4 text-sm font-semibold text-slate-700"
                >
                  Ver demo
                  <ArrowUpRight className="h-4 w-4" />
                </button>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-[22px] bg-slate-950 px-4 py-4 text-sm font-semibold text-white"
                >
                  <LogIn className="h-4 w-4" />
                  Entrar
                </Link>
              </div>
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

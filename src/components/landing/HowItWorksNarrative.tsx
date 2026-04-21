import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronRight, Plus } from 'lucide-react';

import { cn } from '../../lib/cn';
import { MediaOverlay } from '../ui/cardPrimitives';
import { narrativeSteps } from './landingData';

function NarrativeVisual({ activeIndex }: { activeIndex: number }) {
  const step = narrativeSteps[activeIndex];

  const checklist = step.checklist ?? [];
  const metrics = step.metrics ?? [];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step.number}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -18, scale: 0.98 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="landing-panel relative overflow-hidden rounded-[34px] border border-white/20 bg-white/10 p-6 text-white/70 backdrop-blur-md sm:p-7"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_34%)]" />

        <div className="relative">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.26em] text-cyan-200">
                Paso {step.number}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                {step.title}
              </h3>
            </div>

            <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur-md">
              {step.status ?? 'En progreso'}
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[28px] border border-white/20 bg-white/10 p-5 backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Panel principal
                  </p>
                  <p className="mt-1 text-xs text-white/60">
                    {step.detail}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-cyan-200 backdrop-blur-md">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {checklist.map((item, index) => (
                  <div
                    key={item}
                    className={cn(
                      'rounded-2xl border px-4 py-3 text-sm',
                      index === 0
                        ? 'border-white/20 bg-white/14 text-white/85'
                        : 'border-white/15 bg-white/8 text-white/65',
                    )}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              {metrics.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[24px] border border-white/20 bg-white/10 px-4 py-4 backdrop-blur-md"
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">
                    {item.label}
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              ['IA académica', 'Estructura sugerida según etapa'],
              ['Documentos', 'Borradores y observaciones vinculadas'],
              ['Asesor', 'Retroalimentación contextual y agenda'],
            ].map(([title, description]) => (
              <div
                key={title}
                className="rounded-[24px] border border-white/20 bg-white/10 px-4 py-4 backdrop-blur-md"
              >
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function HowItWorksNarrative() {
  const prefersReducedMotion = useReducedMotion();

  const sectionRef = useRef<HTMLElement | null>(null);
  const desktopStageRef = useRef<HTMLDivElement | null>(null);
  const currentIndexRef = useRef(0);
  const targetIndexRef = useRef(0);
  const lastTickAtRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const tickingRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState(0);

  const totalSteps = narrativeSteps.length;
  const sectionHeight = `${Math.max(totalSteps, 4) * 100}vh`;
  const TICK_INTERVAL = 650;

  const setStep = (index: number) => {
    if (index < 0 || index >= totalSteps) return;
    if (index === currentIndexRef.current) return;

    currentIndexRef.current = index;
    lastTickAtRef.current = performance.now();
    setActiveIndex(index);
  };

  const runStepQueue = () => {
    if (currentIndexRef.current === targetIndexRef.current) {
      rafRef.current = null;
      return;
    }

    const now = performance.now();
    const elapsed = now - lastTickAtRef.current;

    if (elapsed >= TICK_INTERVAL) {
      const direction =
        targetIndexRef.current > currentIndexRef.current ? 1 : -1;

      setStep(currentIndexRef.current + direction);
    }

    rafRef.current = requestAnimationFrame(runStepQueue);
  };

  const ensureQueue = () => {
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(runStepQueue);
    }
  };

  useEffect(() => {
    if (prefersReducedMotion) {
      setActiveIndex(0);
      currentIndexRef.current = 0;
      targetIndexRef.current = 0;
      return;
    }

    const updateTargetFromScroll = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const scrollableDistance = section.offsetHeight - viewportHeight;

      if (scrollableDistance <= 0) return;

      const stageOffset = Math.max(
        0,
        Math.min(scrollableDistance, -rect.top),
      );

      if (desktopStageRef.current) {
        desktopStageRef.current.style.transform = `translate3d(0, ${stageOffset}px, 0)`;
      }

      const rawProgress = -rect.top / scrollableDistance;
      const progress = Math.max(0, Math.min(0.9999, rawProgress));

      const nextTarget = Math.min(
        totalSteps - 1,
        Math.floor(progress * totalSteps),
      );

      targetIndexRef.current = nextTarget;
      ensureQueue();
    };

    const onScroll = () => {
      if (tickingRef.current) return;

      tickingRef.current = true;

      requestAnimationFrame(() => {
        updateTargetFromScroll();
        tickingRef.current = false;
      });
    };

    updateTargetFromScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateTargetFromScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateTargetFromScroll);

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [prefersReducedMotion, totalSteps]);

  const activeStep = narrativeSteps[activeIndex];
  const activeQuestions = activeStep.questions ?? [];

  const goToStep = (index: number) => {
    const section = sectionRef.current;
    if (!section) return;

    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const scrollableDistance = section.offsetHeight - window.innerHeight;

    const sliceCenter = (index + 0.5) / totalSteps;
    const targetY = sectionTop + scrollableDistance * sliceCenter;

    targetIndexRef.current = index;
    currentIndexRef.current = index;
    setActiveIndex(index);

    window.scrollTo({
      top: targetY,
      behavior: 'smooth',
    });
  };

  return (
    <section
      id="como-funciona"
      ref={sectionRef}
      className="relative bg-white"
    >
      <div className="relative hidden lg:block" style={{ height: sectionHeight }}>
        <div
          ref={desktopStageRef}
          className="absolute inset-x-0 top-0 h-screen overflow-hidden will-change-transform"
        >
          {/* Full-width video background */}
          <AnimatePresence mode="wait">
            {activeStep.videoUrl && (
              <motion.video
                key={activeStep.number}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 h-full w-full object-cover"
              >
                <source src={activeStep.videoUrl} type="video/mp4" />
              </motion.video>
            )}
          </AnimatePresence>

          {/* Dark overlay for text readability */}
          <MediaOverlay className="bg-[linear-gradient(180deg,rgba(15,23,42,0.22)_0%,rgba(15,23,42,0.34)_42%,rgba(15,23,42,0.74)_100%)]" />

          {/* Content grid overlay */}
          <div className="relative mx-auto grid h-full w-full grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)_minmax(0,0.55fr)] gap-10 px-6 py-24 sm:px-8 lg:px-12">
            <div className="relative flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep.number}
                  initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -22, filter: 'blur(6px)' }}
                  transition={{
                    duration: 0.75,
                    ease: [0.22, 0.61, 0.36, 1],
                  }}
                  className="max-w-md"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-400">
                    Paso {activeStep.number}
                  </p>

                  <h3 className="mt-5 font-display text-4xl leading-tight text-white">
                    {activeStep.title}
                  </h3>

                  <p className="mt-5 text-base leading-8 text-gray-200">
                    {activeStep.description}
                  </p>

                  <p className="mt-5 text-sm leading-7 text-gray-300">
                    {activeStep.detail}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-center">
              {/* Center column intentionally empty - video fills background */}
            </div>

            <div className="flex items-center justify-end">
              <div className="space-y-3">
                {narrativeSteps.map((step, index) => {
                  const isActive = index === activeIndex;

                  return (
                    <button
                      key={step.number}
                      type="button"
                      onClick={() => goToStep(index)}
                      className={cn(
                        'relative flex w-full items-center justify-between gap-6 rounded-[24px] border px-4 py-4 pl-6 text-left transition-all duration-300',
                        isActive
                          ? 'border-blue-300 bg-blue-50 text-slate-900 shadow-[0_4px_15px_rgba(59,130,246,0.15)]'
                          : 'border-white/20 bg-white/10 text-white/70 backdrop-blur-md hover:border-white/40 hover:text-white',
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="how-it-works-active-line"
                          className="absolute left-0 top-1/2 h-6 w-px -translate-y-1/2 bg-blue-600"
                        />
                      )}

                      <span
                        className={cn(
                          'max-w-[10rem] overflow-hidden text-sm font-medium leading-6 transition-all',
                          isActive ? 'opacity-100' : 'opacity-55',
                        )}
                      >
                        {step.navLabel}
                      </span>

                      <span className="text-sm font-semibold">
                        {step.number}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-24 lg:hidden">
        <div className="flex gap-3 overflow-x-auto pb-4">
          {narrativeSteps.map((step, index) => (
            <button
              key={step.number}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                'shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition',
                index === activeIndex
                  ? 'border-white/40 bg-white/14 text-white'
                  : 'border-white/20 bg-white/10 text-white/70 backdrop-blur-md',
              )}
            >
              {step.number}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
              Paso {activeStep.number}
            </p>

            <h3 className="mt-4 text-3xl font-semibold text-slate-900">
              {activeStep.title}
            </h3>

            <p className="mt-4 text-base leading-8 text-slate-600">
              {activeStep.description}
            </p>
          </div>

          <NarrativeVisual activeIndex={activeIndex} />

          {activeQuestions.length > 0 && (
            <div className="space-y-3">
              {activeQuestions.map((question) => (
                <div
                  key={question}
                  className="landing-panel flex items-center justify-between rounded-[24px] border border-white/20 bg-white/10 px-5 py-4 text-white/70 backdrop-blur-md"
                >
                  <span className="text-sm text-white/75">{question}</span>
                  <Plus className="h-4 w-4 text-white/45" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronRight, Plus, Sparkles } from 'lucide-react';

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
        className="relative overflow-hidden rounded-[34px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(244,248,252,0.72)_100%)] p-6 text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_24px_55px_rgba(148,163,184,0.16)] backdrop-blur-2xl sm:p-7"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(191,219,254,0.42),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(251,207,232,0.18),transparent_34%)]" />

        <div className="relative">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.26em] text-sky-600">
                Paso {step.number}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">
                {step.title}
              </h3>
            </div>

            <div className="rounded-full border border-white/75 bg-white/68 px-3 py-1 text-xs font-semibold text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-xl">
              {step.status ?? 'En progreso'}
            </div>
          </div>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/76 px-4 py-2 shadow-[0_14px_32px_rgba(59,130,246,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-slate-800">
              IA Estructural para Tesis
            </span>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[28px] border border-white/75 bg-white/68 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.84)] backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Panel principal
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {step.detail}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(219,234,254,0.74)_100%)] text-sky-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-xl">
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
                        ? 'border-white/75 bg-white/74 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.88)]'
                        : 'border-white/65 bg-white/56 text-slate-500',
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
                  className="rounded-[24px] border border-white/75 bg-white/66 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.84)] backdrop-blur-xl"
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-sky-600">
                    {item.label}
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">
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
                className="rounded-[24px] border border-white/75 bg-white/66 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.84)] backdrop-blur-xl"
              >
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
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
  const [loadedVideos, setLoadedVideos] = useState<Record<string, boolean>>({});

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
  const activeVideoReady = activeStep.videoUrl
    ? loadedVideos[activeStep.videoUrl]
    : false;

  const markVideoReady = (videoUrl: string) => {
    setLoadedVideos((current) => {
      if (current[videoUrl]) return current;

      return {
        ...current,
        [videoUrl]: true,
      };
    });
  };

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
          className="absolute inset-x-0 top-0 h-screen overflow-hidden bg-slate-950 will-change-transform"
        >
          <div
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute inset-0 transition-opacity duration-700',
              activeVideoReady ? 'opacity-0' : 'opacity-100',
            )}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(96,165,250,0.28),transparent_34%),radial-gradient(circle_at_82%_24%,rgba(14,165,233,0.2),transparent_32%),linear-gradient(135deg,#020617_0%,#0f172a_48%,#111827_100%)]" />
            <motion.div
              className="absolute inset-y-0 left-[-35%] w-1/2 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)] blur-xl"
              animate={
                prefersReducedMotion
                  ? { x: '0%' }
                  : { x: ['0%', '270%'] }
              }
              transition={{
                duration: 2.6,
                ease: 'easeInOut',
                repeat: Infinity,
              }}
            />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(180deg,transparent,rgba(2,6,23,0.82))]" />
            <div className="absolute bottom-10 left-10 h-1 w-28 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full w-1/2 rounded-full bg-white/55"
                animate={
                  prefersReducedMotion
                    ? { x: '0%' }
                    : { x: ['-100%', '220%'] }
                }
                transition={{
                  duration: 1.7,
                  ease: 'easeInOut',
                  repeat: Infinity,
                }}
              />
            </div>
          </div>

          {/* Full-width video background */}
          <AnimatePresence mode="wait">
            {activeStep.videoUrl && (
              <motion.video
                key={activeStep.videoUrl}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                onLoadedData={() => markVideoReady(activeStep.videoUrl)}
                onCanPlay={() => markVideoReady(activeStep.videoUrl)}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="absolute inset-0 h-full w-full bg-slate-950 object-cover"
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
                  className="relative max-w-md overflow-hidden rounded-[34px] border border-white/20 bg-[linear-gradient(145deg,rgba(15,23,42,0.72)_0%,rgba(15,23,42,0.44)_48%,rgba(15,23,42,0.68)_100%)] p-7 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_28px_90px_rgba(2,6,23,0.42)] backdrop-blur-2xl"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.22),transparent_38%)]" />
                  <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/55 to-transparent" />

                  <div className="relative">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="inline-flex items-center gap-3 rounded-full border border-white/18 bg-white/12 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-xl">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/16 text-[11px] text-white">
                          {activeStep.number}
                        </span>
                        Paso activo
                      </div>

                      <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/88 px-4 py-2 shadow-[0_18px_42px_rgba(59,130,246,0.22),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl">
                        <Sparkles className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-semibold text-slate-800">
                          IA Estructural para Tesis
                        </span>
                      </div>
                    </div>

                    <h3 className="mt-6 font-display text-4xl leading-tight text-white drop-shadow-[0_2px_22px_rgba(2,6,23,0.42)]">
                      {activeStep.title}
                    </h3>

                    <p className="mt-5 text-base leading-8 text-white/84">
                      {activeStep.description}
                    </p>

                    <div className="mt-6 rounded-[24px] border border-white/14 bg-white/[0.09] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl">
                      <p className="text-sm leading-7 text-white/72">
                        {activeStep.detail}
                      </p>
                    </div>
                  </div>
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
                  ? 'border-white/80 bg-white/86 text-slate-900 shadow-[0_10px_28px_rgba(148,163,184,0.12)]'
                  : 'border-white/70 bg-white/62 text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] backdrop-blur-xl',
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
                  className="flex items-center justify-between rounded-[24px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.86)_0%,rgba(244,248,252,0.7)_100%)] px-5 py-4 text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_18px_40px_rgba(148,163,184,0.12)] backdrop-blur-2xl"
                >
                  <span className="text-sm text-slate-700">{question}</span>
                  <Plus className="h-4 w-4 text-slate-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

import { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import {
  ArrowRight,
  Bot,
  Calculator,
  CheckCircle2,
  LayoutDashboard,
  Play,
  Sparkles,
} from 'lucide-react';
import projectIcon from '../../../iconProyect.png';

import GlassCard from '../ui/GlassCard';
import StorySection from './StorySection';
import { useStoryScroll } from './SmoothScrollProvider';

const floatingChips = [
  {
    label: 'AppThesis',
    className: 'left-[3%] top-40 hidden lg:flex',
  },
  {
    label: 'Precio claro',
    className: 'right-[5%] top-32 hidden md:flex',
  },
  {
    label: 'Feedback limpio',
    className: 'left-[8%] bottom-32 hidden lg:flex',
  },
  {
    label: 'Apoyo real',
    className: 'right-[8%] bottom-24 hidden md:flex',
  },
  {
    label: 'Ruta visible',
    className: 'right-[18%] top-[54%] hidden xl:flex',
  },
];

const heroStats = ['Precio claro', 'Ruta visible', 'Apoyo real'];

const timeline = [
  { label: 'Caso', value: 'Definido' },
  { label: 'Precio', value: 'En segundos' },
  { label: 'Ruta', value: 'Visible' },
];

type HeroProps = {
  onOpenStory: () => void;
};

export default function Hero({ onOpenStory }: HeroProps) {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollToSection } = useStoryScroll();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.22,
  });
  const textY = useTransform(smoothProgress, [0, 1], [0, reducedMotion ? 0 : 32]);
  const mockupY = useTransform(smoothProgress, [0, 1], [0, reducedMotion ? 0 : -30]);
  const chatY = useTransform(smoothProgress, [0, 1], [0, reducedMotion ? 0 : -12]);
  const pricingY = useTransform(smoothProgress, [0, 1], [0, reducedMotion ? 0 : -22]);
  const progressY = useTransform(smoothProgress, [0, 1], [0, reducedMotion ? 0 : 10]);
  const glowY = useTransform(smoothProgress, [0, 1], [0, reducedMotion ? 0 : -48]);

  const chipTransforms = [
    useTransform(smoothProgress, [0, 1], [0, reducedMotion ? 0 : -10]),
    useTransform(smoothProgress, [0, 1], [0, reducedMotion ? 0 : 12]),
    useTransform(smoothProgress, [0, 1], [0, reducedMotion ? 0 : -18]),
    useTransform(smoothProgress, [0, 1], [0, reducedMotion ? 0 : 14]),
    useTransform(smoothProgress, [0, 1], [0, reducedMotion ? 0 : -9]),
  ];

  return (
    <StorySection id="hero" ref={sectionRef} className="relative px-4 pb-14 pt-24 sm:px-6 lg:px-8">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-12 -z-10 mx-auto h-[36rem] max-w-5xl rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.94),rgba(59,130,246,0.16)_34%,rgba(2,132,199,0.12)_62%,transparent_74%)] blur-3xl"
        style={{ y: glowY }}
      />

      {floatingChips.map((chip, index) => (
        <motion.div
          key={chip.label}
          className={`pointer-events-none absolute ${chip.className}`}
          style={{ y: chipTransforms[index] }}
        >
          <div className="glass-tag">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>{chip.label}</span>
          </div>
        </motion.div>
      ))}

      <motion.div
        className="mx-auto max-w-4xl text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: [0.21, 1, 0.25, 1] }}
        style={{ y: textY }}
      >
        <div className="inline-flex items-center gap-3 rounded-full border border-white/75 bg-white/70 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-[0_16px_44px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <img src={projectIcon} alt="AppThesis" className="h-4 w-4 object-contain" />
          Plan. Precio. Ruta.
        </div>

        <h1 className="mt-7 font-display text-5xl leading-[0.92] tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-[5.4rem]">
          Ordena tu tesis.
          <span className="mt-2 block bg-gradient-to-r from-slate-950 via-sky-700 to-blue-600 bg-clip-text text-transparent">
            Avanza con criterio.
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
          Cotiza, organiza y sigue cada entrega en un solo flujo.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => scrollToSection('plans')}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-7 py-4 text-sm font-semibold text-white shadow-[0_18px_34px_rgba(15,23,42,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-900"
          >
            Ver planes
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onOpenStory}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/70 bg-white/70 px-7 py-4 text-sm font-semibold text-slate-700 shadow-[0_16px_30px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/80"
          >
            Ver demo
            <Play className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {heroStats.map((item) => (
            <div
              key={item}
              className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/50 px-4 py-2 text-sm text-slate-600 backdrop-blur-xl"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              {item}
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="relative mx-auto mt-12 max-w-6xl"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.16, ease: [0.21, 1, 0.25, 1] }}
        style={{ y: mockupY }}
      >
        <GlassCard className="rounded-[40px] p-4 sm:p-5 lg:p-7">
          <div className="relative overflow-hidden rounded-[30px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(238,244,255,0.62))] p-4 sm:p-6 lg:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(2,132,199,0.08),transparent_38%)]" />
            <div className="relative flex items-center justify-between gap-4 border-b border-white/60 pb-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                  AppThesis Platform
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  Precio claro. Ruta clara.
                </p>
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-2 text-sm font-medium text-blue-700 sm:flex">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Listo para leer tu caso
              </div>
            </div>

            <div className="relative mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <motion.div style={{ y: chatY }}>
                <GlassCard className="h-full rounded-[28px] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 to-blue-700 text-white">
                        <img src={projectIcon} alt="AppThesis" className="h-6 w-6 object-contain" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">AppThesis Assistant</p>
                        <p className="text-sm text-slate-500">Orden, precio y foco</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <Bot className="h-4 w-4 text-blue-600" />
                      Listo
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="max-w-[78%] rounded-[24px] rounded-bl-md bg-slate-950 px-5 py-4 text-sm leading-6 text-white shadow-[0_18px_36px_rgba(15,23,42,0.18)]">
                      Necesito ordenar mi tesis y ver el plan correcto.
                    </div>
                    <div className="ml-auto max-w-[86%] rounded-[24px] rounded-tr-md border border-white/70 bg-white/80 px-5 py-4 text-sm leading-6 text-slate-600">
                      AppThesis te da precio, ruta y apoyo sin romper el flujo.
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[22px] border border-white/70 bg-white/65 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Precio
                      </p>
                      <p className="mt-2 text-base font-semibold text-slate-900">Segun tu caso</p>
                    </div>
                    <div className="rounded-[22px] border border-white/70 bg-white/65 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Progreso
                      </p>
                      <p className="mt-2 text-base font-semibold text-slate-900">Todo visible</p>
                    </div>
                    <div className="rounded-[22px] border border-white/70 bg-white/65 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Apoyo
                      </p>
                      <p className="mt-2 text-base font-semibold text-slate-900">
                        Siguiente paso
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              <div className="grid gap-5">
                <motion.div style={{ y: pricingY }}>
                  <GlassCard className="rounded-[28px] p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Precio real</p>
                        <p className="mt-1 text-sm text-slate-500">Claro desde el inicio</p>
                      </div>
                      <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        Sin humo
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      {[
                        ['Caso', 'Tema y nivel'],
                        ['Alcance', 'Carga real'],
                        ['Apoyo', 'Plan sugerido'],
                        ['Salida', 'Precio claro'],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="flex items-center justify-between rounded-[20px] border border-white/70 bg-white/70 px-4 py-3"
                        >
                          <span className="text-sm text-slate-500">{label}</span>
                          <span className="text-sm font-semibold text-slate-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>

                <motion.div style={{ y: progressY }}>
                  <GlassCard className="rounded-[28px] p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <LayoutDashboard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Ruta activa</p>
                        <p className="text-sm text-slate-500">Tareas, entregas y foco</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {timeline.map((item, index) => (
                        <div key={item.label}>
                          <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="text-slate-500">{item.label}</span>
                            <span className="font-semibold text-slate-900">{item.value}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200/80">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600"
                              style={{ width: `${72 + index * 10}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {['Feedback', 'Sesiones', 'Cierre'].map((item) => (
                        <div
                          key={item}
                          className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-600"
                        >
                          <Calculator className="h-3.5 w-3.5 text-blue-600" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </StorySection>
  );
}

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
  Sparkles,
} from 'lucide-react';
import projectIcon from '../../../iconProyect.png';

import GlassCard from '../ui/GlassCard';

const floatingChips = [
  {
    label: 'AppThesis',
    className: 'left-[3%] top-40 hidden lg:flex',
  },
  {
    label: 'Cotizacion automatica',
    className: 'right-[5%] top-32 hidden md:flex',
  },
  {
    label: 'Observaciones ordenadas',
    className: 'left-[8%] bottom-32 hidden lg:flex',
  },
  {
    label: 'Planes de acompanamiento',
    className: 'right-[8%] bottom-24 hidden md:flex',
  },
  {
    label: 'Progreso visible',
    className: 'right-[18%] top-[54%] hidden xl:flex',
  },
];

const heroStats = [
  'Cotizacion generada segun tu tesis',
  'Seguimiento de avances y observaciones',
  'Acompanamiento metodologico mas claro',
];

const timeline = [
  { label: 'Tema y modalidad', value: 'Definidos' },
  { label: 'Precio estimado', value: 'En segundos' },
  { label: 'Ruta de trabajo', value: 'Visible' },
];

export default function Hero({ onNavigate }) {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef(null);
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
    <section
      id="hero"
      ref={sectionRef}
      className="relative px-4 pb-20 pt-32 sm:px-6 lg:px-8"
    >
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
          AppThesis para organizacion, cotizacion y avance academico
        </div>

        <h1 className="mt-8 font-display text-5xl leading-[0.92] tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-[5.9rem]">
          Haz de tu tesis un proceso
          <span className="mt-2 block text-transparent bg-gradient-to-r from-slate-950 via-sky-700 to-blue-600 bg-clip-text">
            mas claro, estrategico
          </span>
          <span className="mt-2 block text-slate-950">e inteligente.</span>
        </h1>

        <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
          AppThesis organiza tu trabajo de tesis, genera una cotizacion segun las
          caracteristicas de tu investigacion y te ayuda a avanzar con estructura,
          observaciones claras y acompanamiento academico.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => onNavigate('plans')}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/70 bg-white/70 px-7 py-4 text-sm font-semibold text-slate-700 shadow-[0_16px_30px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/80"
          >
            Ver planes y modalidades
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
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
        className="relative mx-auto mt-16 max-w-6xl"
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
                  Cotizacion automatica, seguimiento y acompanamiento
                </p>
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-2 text-sm font-medium text-blue-700 sm:flex">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Listo para generar cotizacion
              </div>
            </div>

            <div className="relative mt-6 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <motion.div style={{ y: chatY }}>
                <GlassCard className="h-full rounded-[28px] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 to-blue-700 text-white">
                        <img src={projectIcon} alt="AppThesis" className="h-6 w-6 object-contain" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          AppThesis Assistant
                        </p>
                        <p className="text-sm text-slate-500">
                          Orientacion, avances y observaciones
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <Bot className="h-4 w-4 text-blue-600" />
                      Asistencia activa
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="max-w-[78%] rounded-[24px] rounded-bl-md bg-slate-950 px-5 py-4 text-sm leading-7 text-white shadow-[0_18px_36px_rgba(15,23,42,0.18)]">
                      Necesito organizar mi tesis, entender mi avance y obtener una
                      cotizacion segun mi tema de investigacion.
                    </div>
                    <div className="ml-auto max-w-[86%] rounded-[24px] rounded-tr-md border border-white/70 bg-white/80 px-5 py-4 text-sm leading-7 text-slate-600">
                      AppThesis genera tu cotizacion segun las caracteristicas de tu
                      tesis y te ayuda a mantener avances, observaciones y soporte en
                      un mismo flujo.
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[22px] border border-white/70 bg-white/65 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Cotizacion
                      </p>
                      <p className="mt-2 text-base font-semibold text-slate-900">
                        Segun tu tesis
                      </p>
                    </div>
                    <div className="rounded-[22px] border border-white/70 bg-white/65 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Seguimiento
                      </p>
                      <p className="mt-2 text-base font-semibold text-slate-900">
                        Avances visibles
                      </p>
                    </div>
                    <div className="rounded-[22px] border border-white/70 bg-white/65 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Orden
                      </p>
                      <p className="mt-2 text-base font-semibold text-slate-900">
                        Observaciones
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
                        <p className="text-sm font-semibold text-slate-900">
                          Cotizacion inteligente
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Generada segun tu investigacion
                        </p>
                      </div>
                      <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        Explicacion clara
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      {[
                        ['Investigacion', 'Segun tu modalidad'],
                        ['Nivel academico', 'Segun complejidad'],
                        ['Alcance', 'Variables y requisitos'],
                        ['Resultado', 'Cotizacion automatica'],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="flex items-center justify-between rounded-[20px] border border-white/70 bg-white/70 px-4 py-3"
                        >
                          <span className="text-sm text-slate-500">{label}</span>
                          <span className="text-sm font-semibold text-slate-900">
                            {value}
                          </span>
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
                        <p className="text-sm font-semibold text-slate-900">
                          Panel de progreso
                        </p>
                        <p className="text-sm text-slate-500">
                          Avances, entregables y observaciones
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-4">
                      {timeline.map((item, index) => (
                        <div key={item.label}>
                          <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="text-slate-500">{item.label}</span>
                            <span className="font-semibold text-slate-900">
                              {item.value}
                            </span>
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

                    <div className="mt-5 flex flex-wrap gap-2">
                      {['Observaciones', 'Asesorias', 'Revision final'].map((item) => (
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
    </section>
  );
}

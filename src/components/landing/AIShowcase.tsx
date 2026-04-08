import { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import {
  Bot,
  BrainCircuit,
  ChevronRight,
  MessageSquareText,
  Sparkles,
} from 'lucide-react';

import GlassCard from '../ui/GlassCard';
import SectionHeading from '../ui/SectionHeading';

const quickChips = [
  'Entender el flujo',
  'Ver plan recomendado',
  'Revisar avances',
  'Organizar observaciones',
];

export default function AIShowcase() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 115,
    damping: 27,
    mass: 0.22,
  });
  const shellY = useTransform(smoothProgress, [0, 1], [0, reducedMotion ? 0 : -18]);
  const glowY = useTransform(smoothProgress, [0, 1], [0, reducedMotion ? 0 : -12]);
  const chipY = useTransform(smoothProgress, [0, 1], [0, reducedMotion ? 0 : -8]);

  return (
    <section
      id="ai-showcase"
      ref={sectionRef}
      className="px-4 py-28 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Asistente"
          title="Un apoyo academico dentro del flujo de AppThesis"
          description="El asistente ayuda a resolver dudas, orientar el siguiente paso y mantener claridad metodologica mientras organizas tu proceso de tesis."
          align="center"
        />

        <motion.div className="relative mt-14" style={{ y: shellY }}>
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-16 top-10 -z-10 h-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.16),rgba(14,165,233,0.1)_48%,transparent_72%)] blur-3xl"
            style={{ y: glowY }}
          />

          <motion.div
            className="pointer-events-none absolute -left-2 top-16 hidden lg:block"
            style={{ y: chipY }}
          >
            <div className="glass-tag">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              Revisar avances
            </div>
          </motion.div>

          <motion.div
            className="pointer-events-none absolute -right-2 bottom-16 hidden lg:block"
            style={{ y: chipY }}
          >
            <div className="glass-tag">
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              Organizar observaciones
            </div>
          </motion.div>

          <GlassCard className="p-5 sm:p-6 lg:p-8">
            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[28px] border border-white/70 bg-white/72 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4 border-b border-white/60 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 to-blue-700 text-white">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        AppThesis Assistant
                      </p>
                      <p className="text-sm text-slate-500">
                        Guianza metodologica contextual
                      </p>
                    </div>
                  </div>
                  <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    En linea
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
                    className="ml-auto max-w-[80%] rounded-[24px] rounded-br-md bg-slate-950 px-5 py-4 text-sm leading-7 text-white"
                  >
                    Necesito ordenar mi tesis y revisar mis observaciones pendientes.
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.28 }}
                    transition={{ duration: 0.58, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-[86%] rounded-[24px] rounded-tl-md border border-white/70 bg-white/80 px-5 py-4 text-sm leading-7 text-slate-700"
                  >
                    Puedo ayudarte a organizar el flujo, priorizar pendientes y
                    sugerirte el plan que mejor encaja con el nivel de acompanamiento
                    que buscas.
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.52, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-3 text-sm font-medium text-slate-600"
                  >
                    <span className="landing-typing-dot" />
                    <span className="landing-typing-dot delay-200" />
                    <span className="landing-typing-dot delay-400" />
                    Generando sugerencias de plan y extras
                  </motion.div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {quickChips.map((chip, index) => (
                    <motion.div
                      key={chip}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.18 }}
                      transition={{
                        duration: 0.5,
                        delay: 0.16 + index * 0.05,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-gradient-to-r from-white/80 to-blue-50/70 px-4 py-2.5 text-sm font-medium text-slate-700"
                    >
                      <MessageSquareText className="h-4 w-4 text-blue-600" />
                      {chip}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="grid gap-5">
                <GlassCard className="rounded-[28px] p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/15 to-blue-600/15 text-blue-700">
                      <BrainCircuit className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Acciones sugeridas
                      </p>
                      <p className="mt-1 text-sm leading-7 text-slate-600">
                        Recomendaciones de siguiente paso segun el estado del
                        proyecto y el nivel de acompanamiento.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {[
                      'Revisar el avance actual',
                      'Entender el siguiente paso',
                      'Recomendar el plan adecuado',
                      'Preparar observaciones pendientes',
                    ].map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="flex w-full items-center justify-between rounded-[20px] border border-white/70 bg-white/72 px-4 py-4 text-left text-sm font-medium text-slate-700 transition-all duration-300 hover:bg-white/86"
                      >
                        {item}
                        <ChevronRight className="h-4 w-4 text-blue-600" />
                      </button>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="rounded-[28px] p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Apoyo claro
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    Una ayuda que orienta el proceso.
                  </p>
                  <p className="mt-4 text-base leading-8 text-slate-600">
                    El asistente conecta dudas, observaciones y organizacion real del
                    trabajo para que siempre tengas mas claridad sobre como seguir.
                  </p>
                </GlassCard>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}

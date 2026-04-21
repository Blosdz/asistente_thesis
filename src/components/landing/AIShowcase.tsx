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
} from 'lucide-react';

import GlassCard from '../ui/GlassCard';
import SectionHeading from '../ui/SectionHeading';

const quickChips = [
  'Entender el siguiente paso',
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

  return (
    <section
      id="ai-showcase"
      ref={sectionRef}
      className="px-4 py-28 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Asistente"
          title="Un apoyo académico que acompaña tu tesis"
          description="El asistente ayuda a resolver dudas, orientar el siguiente paso y mantener claridad metodológica mientras organizas tu avance."
          align="center"
        />

        <motion.div className="relative mt-14" style={{ y: shellY }}>
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-16 top-10 -z-10 h-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.16),rgba(14,165,233,0.1)_48%,transparent_72%)] blur-3xl"
            style={{ y: glowY }}
          />

          <GlassCard className="p-5 sm:p-6 lg:p-8">
            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[28px] border border-white/20 bg-white/10 p-5 backdrop-blur-md sm:p-6">
                <div className="flex items-center justify-between gap-4 border-b border-white/15 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-cyan-200 backdrop-blur-md">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        AppThesis Assistant
                      </p>
                      <p className="text-sm text-white/58">
                        Guía metodológica contextual
                      </p>
                    </div>
                  </div>
                  <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-200 backdrop-blur-md">
                    En linea
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="ml-auto max-w-[80%] rounded-[24px] rounded-br-md bg-slate-950 px-5 py-4 text-sm leading-7 text-white"
                  >
                    Necesito ordenar mi tesis y revisar mis observaciones pendientes.
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.28 }}
                    transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
                    className="max-w-[86%] rounded-[24px] rounded-tl-md border border-white/20 bg-white/10 px-5 py-4 text-sm leading-7 text-white/78 backdrop-blur-md"
                  >
                    Puedo ayudarte a ordenar tu avance, priorizar pendientes y
                    sugerirte el plan que mejor encaja con el nivel de acompañamiento
                    que buscas.
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.35, delay: 0.16, ease: 'easeOut' }}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium text-white/72 backdrop-blur-md"
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
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white/78 backdrop-blur-md"
                    >
                      <MessageSquareText className="h-4 w-4 text-cyan-200" />
                      {chip}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="grid gap-5">
                <GlassCard className="rounded-[28px] p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-cyan-200 backdrop-blur-md">
                      <BrainCircuit className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Acciones sugeridas
                      </p>
                      <p className="mt-1 text-sm leading-7 text-white/68">
                        Recomendaciones de siguiente paso según el estado del
                        proyecto y el nivel de acompañamiento.
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
                        className="flex w-full items-center justify-between rounded-[20px] border border-white/20 bg-white/10 px-4 py-4 text-left text-sm font-medium text-white/78 backdrop-blur-md transition-all duration-300 hover:border-white/35 hover:text-white"
                      >
                        {item}
                        <ChevronRight className="h-4 w-4 text-cyan-200" />
                      </button>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="rounded-[28px] p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                    Apoyo claro
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    Una ayuda que orienta el proceso.
                  </p>
                  <p className="mt-4 text-base leading-8 text-white/72">
                    El asistente conecta dudas, observaciones y organización real del
                    trabajo para que siempre tengas más claridad sobre cómo seguir.
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

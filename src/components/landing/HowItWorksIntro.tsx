import { motion } from 'motion/react';
import { CheckCircle2, FileText, MessageSquareText, Sparkles } from 'lucide-react';

import { MediaOverlay } from '../ui/cardPrimitives';
import { narrativeSteps } from './landingData';

const stepVisuals = [
  {
    bg: 'from-blue-950 via-blue-800 to-blue-500',
    icon: FileText,
    label: 'Tema confirmado',
    meta: 'Revisión inicial',
  },
  {
    bg: 'from-cyan-950 via-blue-850 to-blue-500',
    icon: Sparkles,
    label: 'Ruta académica',
    meta: 'IA + estructura',
  },
  {
    bg: 'from-slate-900 via-blue-950 to-blue-700',
    icon: CheckCircle2,
    label: 'Borrador revisado',
    meta: 'Observaciones claras',
  },
  {
    bg: 'from-orange-400 via-blue-500 to-blue-900',
    icon: MessageSquareText,
    label: 'Sustentación lista',
    meta: 'Preparación final',
  },
];

const fallbackSteps = [
  {
    title: 'Revisión de la viabilidad',
    description: 'Revisamos tus variables, referencias y fuentes de tu tema.',
  },
  {
    title: 'Proyecto de tesis',
    description: 'Enfoca tu tema inicial para que sea más claro y defendible.',
  },
  {
    title: 'Borrador de tesis y estadistica',
    description: 'Sube tus avances para recibir sugerencias de nuestros especialistas.',
  },
  {
    title: 'Sustentacion y defensa',
    description: 'Practica tu defensa, realiza tu sustentación con confianza',
  },
];

export default function HowItWorksIntro() {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24 lg:py-28">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_45%,#ffffff_100%)]" />
      <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="mb-14 text-center sm:mb-16">
          <h2 className="font-display text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">
            Cómo funciona
          </h2>
          <p className="mt-4 text-base text-slate-500 sm:text-lg">
            Empieza en 4 pasos simples para avanzar tu tesis con claridad.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {narrativeSteps.slice(0, 4).map((step, index) => {
            const visual = stepVisuals[index] ?? stepVisuals[0];
            const Icon = visual.icon;
            const fallback = fallbackSteps[index] ?? fallbackSteps[0];
            return (
              <motion.article
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.55,
                  ease: 'easeOut',
                  delay: index * 0.08,
                }}
                viewport={{ once: true, margin: '-80px' }}
                className="group"
              >
                <div className="relative h-[230px] overflow-hidden rounded-[28px] bg-slate-100 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.28)] sm:h-[250px] lg:h-[270px]">
                  <div className={`absolute inset-0 bg-gradient-to-br ${visual.bg}`} />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.34),transparent_30%)]" />
                  <MediaOverlay />

                  <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-[20px] border border-white/20 bg-white/12 text-sm font-semibold text-white backdrop-blur-xl">
                    {index + 1}
                  </div>

                  <div className="absolute inset-x-6 top-1/2 -translate-y-1/2">
                    <div className="mx-auto max-w-[15rem] rounded-[24px] border border-white/20 bg-white/12 p-5 text-white shadow-[0_18px_60px_rgba(15,23,42,0.22)] backdrop-blur-xl transition duration-500 group-hover:-translate-y-1">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-[20px] bg-white/18">
                          <Icon className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="text-sm font-semibold leading-tight">
                            {visual.label}
                          </p>
                          <p className="mt-1 text-xs text-white/65">
                            {visual.meta}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-5 left-5 right-5 h-1 rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-white/80"
                      style={{ width: `${25 * (index + 1)}%` }}
                    />
                  </div>
                </div>
                <div className="pt-7">
                  <h3 className="text-2xl tracking-[-0.04em] text-slate-950">
                    {step.title ?? fallback.title}
                  </h3>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

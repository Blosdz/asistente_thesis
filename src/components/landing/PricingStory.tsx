import { motion } from 'motion/react';
import { Calculator, FileText, LayoutDashboard, ShieldCheck } from 'lucide-react';

import GlassCard from '../ui/GlassCard';
import SectionHeading from '../ui/SectionHeading';

const quoteCards = [
  {
    title: 'Tu tesis define la cotizacion',
    description:
      'AppThesis analiza el tipo de investigacion, el nivel academico, el alcance y las necesidades del trabajo para generar una cotizacion coherente con tu proyecto.',
    icon: Calculator,
  },
  {
    title: 'Explicacion clara del resultado',
    description:
      'La plataforma no solo muestra un monto estimado: tambien organiza la informacion para que entiendas por que tu tesis requiere ese alcance.',
    icon: FileText,
  },
  {
    title: 'Todo queda dentro del mismo flujo',
    description:
      'Despues de la cotizacion puedes continuar con organizacion, seguimiento de avances y control de observaciones sin salir de AppThesis.',
    icon: LayoutDashboard,
  },
  {
    title: 'Mas claridad desde el inicio',
    description:
      'La idea es reducir incertidumbre desde el primer paso para que tomes decisiones con mejor criterio y una ruta de trabajo mas clara.',
    icon: ShieldCheck,
  },
];

export default function PricingStory() {
  return (
    <section id="pricing-story" className="px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Cotizacion"
          title="AppThesis genera tu cotizacion de acuerdo con tu tesis."
          description="Quitamos la complejidad visual y dejamos lo importante: la plataforma estima tu cotizacion segun las caracteristicas de tu investigacion y te permite seguir con orden dentro del mismo entorno."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {quoteCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20, scale: 0.992 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{
                  duration: 0.75,
                  delay: index * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <GlassCard hover className="h-full p-7 md:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-gradient-to-br from-sky-500/15 to-blue-600/15 text-blue-700">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                      AppThesis
                    </div>
                  </div>

                  <h3 className="mt-6 text-3xl font-semibold text-slate-950">
                    {card.title}
                  </h3>
                  <p className="mt-4 text-base leading-8 text-slate-600">
                    {card.description}
                  </p>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

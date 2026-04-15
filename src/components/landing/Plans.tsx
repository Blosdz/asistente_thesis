import { motion } from 'motion/react';
import { Crown, Layers3, NotebookPen } from 'lucide-react';

import GlassCard from '../ui/GlassCard';
import SectionHeading from '../ui/SectionHeading';
import { cn } from '../../lib/cn';

export const planCatalog = [
  {
    title: 'Esencial',
    bullets: [
      '2 asesorías personalizadas.',
      'Carga de documentos y reglamentos académicos.',
      'No incluye acompañamiento continuo.',
      'Las asesorías adicionales se cobran dentro del sistema.',
      'El avance depende del estudiante.',
      'El precio depende del tipo de investigación y del nivel académico.',
    ],
    idealFor:
      'Quien necesita una base ordenada, resolver dudas clave y avanzar principalmente por cuenta propia.',
    icon: Layers3,
  },
  {
    title: 'Guiado',
    bullets: [
      '6 asesorías personalizadas.',
      'Acompañamiento metodológico cercano.',
      'Carga de documentos y reglamentos académicos.',
      'Revision estrategica del trabajo.',
      'Las asesorías adicionales se cobran dentro del sistema.',
      'El avance depende del estudiante.',
      'El precio depende del tipo de investigación y del nivel académico.',
      'Las asesorías están distribuidas durante el proceso.',
      'No incluye asesoría ilimitada.',
    ],
    idealFor:
      'Quien busca seguimiento más constante y orientación metodológica sin requerir soporte ilimitado.',
    icon: NotebookPen,
    featured: true,
    badge: 'Más elegido',
  },
  {
    title: 'Integral',
    bullets: [
      '12 asesorías que cubren tu proceso.',
      'Revision progresiva de borradores',
      'Apoyo desde anteproyecto hasta pre sustentación.',
      'Cobertura más sólida para una investigación exigente.',
      'Acompañamiento metodológico cercano.',
      'Carga de documentos y reglamentos académicos.',
      'Revision estrategica del trabajo.',
      'Las asesorías adicionales se cobran dentro del sistema.',
      'Las asesorías están distribuidas durante el proceso.',
    ],
    idealFor:
      'Quien necesita un acompañamiento más amplio, con mayor continuidad y respaldo durante casi todo el recorrido.',
    icon: Crown,
  },
];

export default function Plans() {
  return (
    <section id="plans" className="px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Planes"
          title="Tres formas de avanzar con AppThesis."
          description="Cada plan responde a una necesidad distinta: empezar con orden, avanzar con guía distribuida o cubrir todo el proceso con más profundidad."
          align="center"
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {planCatalog.map((plan, index) => {
            const Icon = plan.icon;

            return (
              <motion.div
                key={plan.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.05,
                  ease: 'easeOut',
                }}
              >
                <GlassCard
                  hover
                  className={cn(
                    'h-full p-7 md:p-8',
                    plan.featured &&
                    'border-blue-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(239,246,255,0.78))] shadow-[0_26px_72px_rgba(37,99,235,0.14)]',
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-gradient-to-br from-sky-500/15 to-blue-600/15 text-blue-700">
                      <Icon className="h-6 w-6" />
                    </div>
                    {plan.badge ? (
                      <div className="rounded-full bg-gradient-to-r from-slate-950 to-blue-700 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                        {plan.badge}
                      </div>
                    ) : null}
                  </div>

                  <h3 className="mt-6 text-3xl font-semibold text-slate-950">
                    {plan.title}
                  </h3>
                  <div className="mt-5 space-y-2">
                    {plan.bullets.map((bullet) => (
                      <div
                        key={bullet}
                        className={cn(
                          'rounded-[22px] border border-white/70 bg-white/70 px-4 py-2 text-sm leading-6 text-slate-700',
                          plan.featured && 'bg-gradient-to-r from-slate-50 to-blue-50/80',
                        )}
                      >
                        {bullet}
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 rounded-[24px] border border-white/70 bg-slate-950 px-5 py-4 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
                      Ideal para
                    </p>
                    <p className="mt-2 text-sm leading-7 text-white/85">
                      {plan.idealFor}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

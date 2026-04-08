import { motion } from 'motion/react';
import { Crown, Layers3, NotebookPen } from 'lucide-react';

import GlassCard from '../ui/GlassCard';
import SectionHeading from '../ui/SectionHeading';
import { cn } from '../../lib/cn';

const plans = [
  {
    title: 'Esencial',
    description:
      'Organizacion total de tu tesis, control de avances y observaciones para trabajar con autonomia y orden profesional.',
    bullets: [
      'Organizacion total de tu tesis',
      'Control de avances y observaciones',
      'Trabajo autonomo con estructura profesional',
    ],
    icon: Layers3,
  },
  {
    title: 'Guiado',
    description: 'Acompanamiento metodologico cercano para mantener claridad durante el proceso.',
    bullets: [
      'Acompanamiento metodologico cercano',
      'Revision estrategica y mejora del trabajo',
      'Mayor claridad en tu tesis',
    ],
    icon: NotebookPen,
    featured: true,
    badge: 'Mas elegido',
  },
  {
    title: 'Integral',
    description: 'Un recorrido de mayor profundidad para sostener la tesis de inicio a fin.',
    bullets: [
      'Acompanamiento completo',
      'Desarrollo solido de inicio a fin',
      'Preparacion real para sustentacion',
    ],
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
          description="Cada plan responde a una manera distinta de trabajar tu tesis, desde la autonomia con estructura hasta un acompanamiento mas completo."
          align="center"
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const Icon = plan.icon;

            return (
              <motion.div
                key={plan.title}
                initial={{ opacity: 0, y: 20, scale: 0.992 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.08,
                  ease: [0.16, 1, 0.3, 1],
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
                  <p className="mt-4 text-base leading-8 text-slate-600">
                    {plan.description}
                  </p>

                  <div className="mt-8 space-y-3">
                    {plan.bullets.map((bullet) => (
                      <div
                        key={bullet}
                        className={cn(
                          'rounded-[22px] border border-white/70 bg-white/70 px-4 py-4 text-sm leading-7 text-slate-700',
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
                      {plan.title === 'Esencial' &&
                        'Quien quiere estructura, orden y control claro de entregables.'}
                      {plan.title === 'Guiado' &&
                        'Quien necesita acompanamiento frecuente sin perder autonomia.'}
                      {plan.title === 'Integral' &&
                        'Quien busca soporte mas profundo y preparacion real para sustentar.'}
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

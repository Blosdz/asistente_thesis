import { motion } from 'motion/react';
import { Crown, Layers3, NotebookPen } from 'lucide-react';

import GlassCard from '../ui/GlassCard';
import SectionHeading from '../ui/SectionHeading';
import { cn } from '../../lib/cn';
import StorySection from './StorySection';

const plans = [
  {
    title: 'Esencial',
    description: 'Orden total para avanzar con autonomia.',
    bullets: ['Ruta clara', 'Avances visibles', 'Feedback limpio'],
    icon: Layers3,
  },
  {
    title: 'Guiado',
    description: 'Mas acompanamiento. Misma claridad.',
    bullets: ['Revision cercana', 'Siguiente paso claro', 'Menos bloqueo'],
    icon: NotebookPen,
    featured: true,
    badge: 'Top',
  },
  {
    title: 'Integral',
    description: 'Soporte fuerte para cerrar de punta a punta.',
    bullets: ['Ruta completa', 'Cierre solido', 'Mejor defensa'],
    icon: Crown,
  },
];

export default function Plans() {
  return (
    <StorySection id="plans" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Planes"
          title="Tres ritmos. Una misma ruta."
          description="Elige cuanto apoyo necesitas sin perder el hilo del proceso."
          align="center"
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
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
                    'h-full p-6 md:p-7',
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

                  <h3 className="mt-6 text-3xl font-semibold text-slate-950">{plan.title}</h3>
                  <p className="mt-3 text-base leading-7 text-slate-600">{plan.description}</p>

                  <div className="mt-6 space-y-3">
                    {plan.bullets.map((bullet) => (
                      <div
                        key={bullet}
                        className={cn(
                          'rounded-[22px] border border-white/70 bg-white/70 px-4 py-3.5 text-sm leading-6 text-slate-700',
                          plan.featured && 'bg-gradient-to-r from-slate-50 to-blue-50/80',
                        )}
                      >
                        {bullet}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-[24px] border border-white/70 bg-slate-950 px-5 py-4 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
                      Ideal para
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/85">
                      {plan.title === 'Esencial' && 'Quien quiere foco, orden y autonomia.'}
                      {plan.title === 'Guiado' &&
                        'Quien necesita criterio cerca sin perder autonomia.'}
                      {plan.title === 'Integral' &&
                        'Quien busca soporte profundo hasta el cierre.'}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </StorySection>
  );
}

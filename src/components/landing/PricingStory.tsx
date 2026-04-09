import { motion } from 'motion/react';
import { Calculator, FileText, LayoutDashboard, ShieldCheck } from 'lucide-react';

import GlassCard from '../ui/GlassCard';
import SectionHeading from '../ui/SectionHeading';
import StorySection from './StorySection';

const quoteCards = [
  {
    title: 'Precio real',
    description: 'La tesis define el valor. No una tabla plana.',
    icon: Calculator,
  },
  {
    title: 'Sin humo',
    description: 'Ves por que cuesta eso y que lo mueve.',
    icon: FileText,
  },
  {
    title: 'Todo unido',
    description: 'Despues del precio, sigues en el mismo flujo.',
    icon: LayoutDashboard,
  },
  {
    title: 'Criterio primero',
    description: 'La decision se siente mas clara desde el inicio.',
    icon: ShieldCheck,
  },
];

export default function PricingStory() {
  return (
    <StorySection id="pricing-story" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Precio"
          title="Tu caso define el precio."
          description="Menos friccion visual. Mas senal para decidir rapido y bien."
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
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
                <GlassCard hover className="h-full p-6 md:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-gradient-to-br from-sky-500/15 to-blue-600/15 text-blue-700">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                      AppThesis
                    </div>
                  </div>

                  <h3 className="mt-5 text-3xl font-semibold text-slate-950">{card.title}</h3>
                  <p className="mt-3 text-base leading-7 text-slate-600">{card.description}</p>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </StorySection>
  );
}

import { motion } from 'motion/react';
import {
  ChartNoAxesCombined,
  CheckCircle2,
  ClipboardCheck,
  ShieldCheck,
} from 'lucide-react';

import GlassCard from '../ui/GlassCard';
import SectionHeading from '../ui/SectionHeading';
import StorySection from './StorySection';

const trustCards = [
  {
    value: '01',
    title: 'Mas criterio',
    description: 'Cada decision se apoya en contexto real.',
    icon: ChartNoAxesCombined,
  },
  {
    value: '02',
    title: 'Menos ruido',
    description: 'Entregas y feedback viven en un solo flujo.',
    icon: ClipboardCheck,
  },
  {
    value: '03',
    title: 'Mas visibilidad',
    description: 'El avance deja de sentirse abstracto.',
    icon: CheckCircle2,
  },
  {
    value: '04',
    title: 'Mejor cierre',
    description: 'Llegas al final con mas control y mejor apoyo.',
    icon: ShieldCheck,
  },
];

export default function TrustSection() {
  return (
    <StorySection id="trust" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Valor"
          title="Menos ruido. Mas control."
          description="Cada bloque empuja claridad, visibilidad y mejores decisiones."
          align="center"
        />

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {trustCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 18, scale: 0.992 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{
                  duration: 0.72,
                  delay: index * 0.07,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <GlassCard hover className="h-full p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-4xl font-display text-slate-950">{card.value}</div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/15 to-blue-600/15 text-blue-700">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="mt-5 text-xl font-semibold text-slate-950">{card.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </StorySection>
  );
}

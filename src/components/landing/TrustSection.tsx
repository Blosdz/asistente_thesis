import { motion } from 'motion/react';
import {
  ChartNoAxesCombined,
  CheckCircle2,
  ClipboardCheck,
  ShieldCheck,
} from 'lucide-react';

import GlassCard from '../ui/GlassCard';
import SectionHeading from '../ui/SectionHeading';

const trustCards = [
  {
    value: '01',
    title: 'Más claridad metodológica',
    description:
      'La plataforma organiza la información de tu tesis para que cada decisión tenga más criterio.',
    icon: ChartNoAxesCombined,
  },
  {
    value: '02',
    title: 'Mejor organización del proceso',
    description:
      'Entregables, observaciones y tareas quedan mejor organizados y menos dispersos.',
    icon: ClipboardCheck,
  },
  {
    value: '03',
    title: 'Seguimiento más visible',
    description:
      'El avance deja de sentirse abstracto porque cada paso se convierte en decisiones y estado concreto.',
    icon: CheckCircle2,
  },
  {
    value: '04',
    title: 'Preparación más real para la sustentación',
    description:
      'El cierre se apoya con extras y acompañamiento para llegar mejor preparado al momento final.',
    icon: ShieldCheck,
  },
];

export default function TrustSection() {
  return (
    <section id="trust" className="px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Valor"
          title="Una experiencia pensada para reducir ruido y aumentar criterio."
          description="Cada bloque del producto busca que la tesis se sienta más entendible: menos incertidumbre, más visibilidad y mejor preparación para decisiones importantes."
          align="center"
        />

        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {trustCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.04,
                  ease: 'easeOut',
                }}
              >
                <GlassCard hover className="h-full p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-4xl font-display text-slate-950">
                      {card.value}
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/15 to-blue-600/15 text-blue-700">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="mt-6 text-xl font-semibold text-slate-950">
                    {card.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
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

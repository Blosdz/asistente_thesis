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
    title: 'Revisión de la viabilidad',
    description:
      'Evaluamos el tema, enfoque y metodología de tu propuesta para asegurar que es viable y tiene bases sólidas.',
    icon: ChartNoAxesCombined,
  },
  {
    value: '02',
    title: 'Proyecto de tesis',
    description:
      'Desarrollamos un proyecto estructurado con objetivos claros, cronograma realista y definición de alcances.',
    icon: ClipboardCheck,
  },
  {
    value: '03',
    title: 'Borrador de tesis',
    description:
      'Acompañamos la redacción de tu tesis con revisión de contenido, estructura académica y coherencia metodológica.',
    icon: CheckCircle2,
  },
  {
    value: '04',
    title: 'Sustentación y defensa',
    description:
      'Preparamos tu presentación y argumentación para que llegues a la defensa con confianza y criterio.',
    icon: ShieldCheck,
  },
];

export default function TrustSection() {
  return (
    <section id="trust" className="px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Proceso"
          title="Cuatro etapas estructuradas hacia tu tesis exitosa."
          description="Desde la viabilidad del tema hasta la sustentación, cada etapa está diseñada para aumentar tu criterio y confianza en el proceso."
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
                    <div className="text-4xl font-display text-white">
                      {card.value}
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-cyan-200 backdrop-blur-md">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="mt-6 text-xl font-semibold text-white">
                    {card.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-white/72">
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

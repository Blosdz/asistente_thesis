import { motion } from 'motion/react';
import {
  Calculator,
  ChartNoAxesCombined,
  FileText,
  ShieldCheck,
} from 'lucide-react';

import GlassCard from '../ui/GlassCard';
import SectionHeading from '../ui/SectionHeading';

const pricingSpecs = [
  {
    title: 'Tipo de investigación',
    details: 'Descriptivo, correlacional, comparativo, predictivo, explicativo.',
  },
  {
    title: 'Nivel académico',
    details: 'Pregrado sin recargo. Maestría +15%. Doctorado +20%.',
  },
  {
    title: 'Variables',
    details: 'Variable principal adicional +S/ 1000. Análisis técnico se evalúa.',
  },
  {
    title: 'Estadística',
    details: 'Defensa con método estadístico se evalúa según caso.',
  },
  {
    title: 'Especiales',
    details: 'Arquitectura y diseño requieren evaluación personalizada.',
  },
  {
    title: 'Servicios',
    details: 'Pre sustentación desde S/ 200. Asesorías extras recomprables.',
  },
];

const pricingBenefits = [
  {
    title: 'Claridad',
    description: 'Entiendes qué factores impactan el precio.',
    icon: Calculator,
  },
  {
    title: 'Realismo',
    description: 'Tu cotización coherente desde el inicio.',
    icon: FileText,
  },
  {
    title: 'Criterio',
    description: 'Sabes qué cambia el precio y por qué.',
    icon: ShieldCheck,
  },
];

export default function PricingStory() {
  return (
    <section id="pricing-story" className="px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Cotización"
          title="Cómo calculamos tu precio."
          description="Reglas claras: entiendes qué impacta el precio y cómo se evalúa tu tesis."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.18 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <GlassCard className="h-full p-7 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-[22px] border border-white/20 bg-white/10 text-cyan-200 backdrop-blur-md">
                  <ChartNoAxesCombined className="h-6 w-6" />
                </div>
                <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/85 backdrop-blur-md">
                  Cómo se calcula
                </div>
              </div>

              <h3 className="mt-6 text-3xl font-semibold text-white">
                Especificaciones de la cotización
              </h3>
              <p className="mt-4 text-base leading-8 text-white/72">
                La cotización se orienta por el tipo de estudio, el nivel académico,
                las variables, la estadística requerida y los servicios adicionales.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {pricingSpecs.map((spec) => (
                  <div
                    key={spec.title}
                    className="rounded-[22px] border border-white/20 bg-white/10 px-4 py-4 backdrop-blur-md"
                  >
                    <p className="text-sm font-semibold text-white">{spec.title}</p>
                    <p className="mt-2 text-sm leading-7 text-white/65">
                      {spec.details}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          <div className="grid gap-6">
            {pricingBenefits.map((benefit, index) => {
              const Icon = benefit.icon;

              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.18 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.04,
                    ease: 'easeOut',
                  }}
                >
                  <GlassCard hover className="h-full p-7">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[22px] border border-white/20 bg-white/10 text-cyan-200 backdrop-blur-md">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-6 text-2xl font-semibold text-white">
                      {benefit.title}
                    </h3>
                    <p className="mt-4 text-base leading-8 text-white/72">
                      {benefit.description}
                    </p>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

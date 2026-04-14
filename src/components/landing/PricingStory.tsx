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
    details:
      'Descriptivo, correlacional, comparativo, predictivo, explicativo, pre experimental, cuasi experimental y exploratorio.',
  },
  {
    title: 'Nivel académico',
    details:
      'Pregrado sin recargo. Maestría o especialidad +15%. Doctorado +20%.',
  },
  {
    title: 'Variables',
    details:
      'Variable principal adicional + S/ 1000. Variables descriptivas simples sin recargo. Variables con análisis técnico se evalúan.',
  },
  {
    title: 'Estadística',
    details:
      'Si no se requiere análisis estadístico, puede aplicarse un descuento de S/ 500 según el caso.',
  },
  {
    title: 'Casos especiales',
    details:
      'Arquitectura y diseño se evalúan de forma particular por sus componentes visuales y técnicos.',
  },
  {
    title: 'Servicios adicionales',
    details:
      'Pre sustentación desde S/ 200, corrección adicional desde S/ 150 y asesorías extra como recomprables.',
  },
];

const pricingBenefits = [
  {
    title: 'Claridad del cálculo',
    description:
      'Entiendes qué factores impactan el precio antes de elegir un plan o una asesoría.',
    icon: Calculator,
  },
  {
    title: 'Expectativa realista',
    description:
      'El alcance de tu tesis se traduce en una cotización más coherente desde el inicio.',
    icon: FileText,
  },
  {
    title: 'Menos dudas',
    description:
      'Tomas decisiones con mejor criterio porque sabes qué cambia el precio y por qué.',
    icon: ShieldCheck,
  },
];

export default function PricingStory() {
  return (
    <section id="pricing-story" className="px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Cotización"
          title="AppThesis explica cómo se calcula tu cotización."
          description="Mostramos reglas claras para que entiendas qué impacta el precio, qué casos requieren evaluación y qué beneficios obtienes desde el primer paso."
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
                <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-gradient-to-br from-sky-500/15 to-blue-600/15 text-blue-700">
                  <ChartNoAxesCombined className="h-6 w-6" />
                </div>
                <div className="rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                  Cómo se calcula
                </div>
              </div>

              <h3 className="mt-6 text-3xl font-semibold text-slate-950">
                Especificaciones de la cotización
              </h3>
              <p className="mt-4 text-base leading-8 text-slate-600">
                La cotización se orienta por el tipo de estudio, el nivel académico,
                las variables, la estadística requerida y los servicios adicionales.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {pricingSpecs.map((spec) => (
                  <div
                    key={spec.title}
                    className="rounded-[22px] border border-white/70 bg-white/72 px-4 py-4"
                  >
                    <p className="text-sm font-semibold text-slate-900">{spec.title}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
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
                    <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-gradient-to-br from-sky-500/15 to-blue-600/15 text-blue-700">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-6 text-2xl font-semibold text-slate-950">
                      {benefit.title}
                    </h3>
                    <p className="mt-4 text-base leading-8 text-slate-600">
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

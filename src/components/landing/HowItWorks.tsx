import { motion } from 'motion/react';
import {
  Calculator,
  ClipboardList,
  GitBranchPlus,
  ScrollText,
} from 'lucide-react';

import GlassCard from '../ui/GlassCard';
import SectionHeading from '../ui/SectionHeading';
import { cn } from '../../lib/cn';

const steps = [
  {
    title: 'Describe tu investigacion',
    description:
      'Empieza con tu tema, enfoque y nivel academico para que el sistema entienda desde donde parte tu tesis.',
    bullets: ['Tema y objetivo', 'Nivel academico', 'Necesidades metodologicas'],
    icon: ScrollText,
  },
  {
    title: 'Calcula modalidad y alcance',
    description:
      'La plataforma traduce tu caso en reglas de cotizacion y te explica donde aparecen recargos, descuentos o evaluaciones particulares.',
    bullets: ['Tipo de investigacion', 'Variables y estadistica', 'Casos especiales'],
    icon: Calculator,
  },
  {
    title: 'Organiza avances y observaciones',
    description:
      'Centraliza entregables, feedback y tareas pendientes para que el progreso deje de sentirse difuso.',
    bullets: ['Seguimiento visible', 'Historial de observaciones', 'Pendientes priorizados'],
    icon: ClipboardList,
  },
  {
    title: 'Escala con acompanamiento y servicios extra',
    description:
      'Cuando la tesis exige mas soporte, puedes activar asesorias, correcciones o preparacion para sustentacion sin perder continuidad.',
    bullets: ['Planes segun complejidad', 'Extras recomprables', 'Ruta de cierre'],
    icon: GitBranchPlus,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Como funciona"
          title="Un flujo academico claro, explicado paso a paso."
          description="La experiencia esta pensada como una secuencia natural: entender tu caso, estimar la modalidad adecuada, ordenar el trabajo y escalar el soporte cuando el proyecto lo necesita."
          align="center"
        />

        <div className="relative mt-16">
          <div className="absolute left-1/2 top-12 hidden h-[calc(100%-6rem)] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-blue-200 to-transparent md:block" />

          <div className="space-y-8 md:space-y-12">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div key={step.title} className="relative">
                  <div
                    className={cn(
                      'md:w-[calc(50%-1.75rem)]',
                      index % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto',
                    )}
                    >
                    <motion.div
                      initial={{ opacity: 0, y: 22, scale: 0.99 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, amount: 0.18 }}
                      transition={{
                        duration: 0.78,
                        delay: index * 0.08,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <GlassCard hover className="p-7 md:p-8">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-gradient-to-br from-sky-500/15 to-blue-600/15 text-blue-700">
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                            Paso 0{index + 1}
                          </div>
                        </div>

                        <h3 className="mt-6 text-2xl font-semibold text-slate-950">
                          {step.title}
                        </h3>
                        <p className="mt-4 text-base leading-8 text-slate-600">
                          {step.description}
                        </p>

                        <div className="mt-6 flex flex-wrap gap-2">
                          {step.bullets.map((bullet) => (
                            <div
                              key={bullet}
                              className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-medium text-slate-600"
                            >
                              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600" />
                              {bullet}
                            </div>
                          ))}
                        </div>
                      </GlassCard>
                    </motion.div>
                  </div>

                  <div className="absolute left-1/2 top-10 hidden h-4 w-4 -translate-x-1/2 rounded-full border border-white/80 bg-gradient-to-r from-sky-500 to-blue-600 shadow-[0_10px_30px_rgba(37,99,235,0.18)] md:block" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

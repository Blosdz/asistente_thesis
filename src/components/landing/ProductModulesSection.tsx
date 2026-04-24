import { motion } from 'motion/react';
import {
  BookOpenCheck,
  GitBranch,
  MessagesSquare,
  Presentation,
  Sparkles,
} from 'lucide-react';

import SectionHeading from '../ui/SectionHeading';
import { cn } from '../../lib/cn';

const modules = [
  {
    audience: 'Para asesores',
    title: 'Bitácora de Thesis',
    description:
      'Registro claro de avances, acuerdos, observaciones y siguientes acciones para acompañar cada tesis con contexto.',
    icon: BookOpenCheck,
    badge: 'Seguimiento experto',
    accent: 'from-blue-500 to-sky-400',
  },
  {
    audience: 'Para estudiantes',
    title: 'Control de versiones',
    description:
      'Ordena entregas, revisiones y cambios del documento para saber qué se corrigió, cuándo y por qué.',
    icon: GitBranch,
    badge: 'Historial académico',
    accent: 'from-cyan-500 to-blue-500',
  },
  {
    audience: 'Beneficio web',
    title: 'Asesorías',
    description:
      'Agenda acompañamiento especializado según tu etapa: tema, metodología, borrador, análisis o cierre.',
    icon: MessagesSquare,
    badge: 'Guía personalizada',
    accent: 'from-violet-500 to-blue-500',
  },
  {
    audience: 'Beneficio web',
    title: 'Pre-sustentaciones',
    description:
      'Practica tu exposición, anticipa preguntas y llega a la defensa con una ruta de respuesta más segura.',
    icon: Presentation,
    badge: 'Defensa preparada',
    accent: 'from-amber-400 to-blue-500',
  },
];

export default function ProductModulesSection() {
  return (
    <section className="relative overflow-hidden bg-white px-4 py-24 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_42%,#ffffff_100%)]" />
      <div className="absolute left-1/2 top-16 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-blue-100/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Módulos"
            title="Un sistema que ordena cada avance"
            description="AppThesis combina módulos para asesores, estudiantes y beneficios de acompañamiento para que el proceso no dependa de mensajes sueltos."
          />

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-white/82 px-4 py-2 shadow-[0_16px_38px_rgba(59,130,246,0.12),inset_0_1px_0_rgba(255,255,255,0.86)] backdrop-blur-xl">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-slate-800">
              IA Estructural para Tesis
            </span>
          </div>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {modules.map((module, index) => {
            const Icon = module.icon;

            return (
              <motion.article
                key={module.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.22 }}
                transition={{
                  duration: 0.5,
                  ease: 'easeOut',
                  delay: index * 0.06,
                }}
                className="group relative min-h-[300px] overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/78 p-6 shadow-[0_22px_60px_-38px_rgba(15,23,42,0.22)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-[0_28px_70px_-36px_rgba(37,99,235,0.28)]"
              >
                <div
                  className={cn(
                    'absolute inset-x-0 top-0 h-1 bg-gradient-to-r',
                    module.accent,
                  )}
                />
                <div className="absolute right-[-4rem] top-[-4rem] h-40 w-40 rounded-full bg-blue-100/60 blur-3xl transition duration-300 group-hover:bg-blue-200/70" />

                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                      {module.audience}
                    </div>

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] border border-blue-100 bg-blue-50 text-blue-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-8">
                    <p className="inline-flex rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1.5 text-xs font-semibold text-blue-700">
                      {module.badge}
                    </p>

                    <h3 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                      {module.title}
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      {module.description}
                    </p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

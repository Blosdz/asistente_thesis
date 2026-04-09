import { motion } from 'motion/react';
import {
  Bot,
  CheckCircle2,
  Compass,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';

const container = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.06,
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.36,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const steps = [
  {
    title: 'Diagnostica',
    description: 'Tema, nivel y alcance en minutos.',
    icon: Compass,
  },
  {
    title: 'Ordena',
    description: 'Avances, tareas y feedback en un flujo.',
    icon: LayoutDashboard,
  },
  {
    title: 'Decide',
    description: 'Plan claro. Siguiente paso claro.',
    icon: Bot,
  },
];

const highlights = ['Precio claro', 'Ruta visible', 'Apoyo real'];

export default function StoryPopupContent() {
  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={item} className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-white/70 bg-white/78 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
            <Sparkles className="h-3.5 w-3.5" />
            Demo
          </div>
          <p className="mt-5 max-w-xl text-2xl font-semibold text-slate-950 sm:text-3xl">
            Un recorrido corto. Una decision clara.
          </p>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
            AppThesis conecta precio, progreso y apoyo en una sola experiencia.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {highlights.map((highlight) => (
              <div
                key={highlight}
                className="inline-flex items-center gap-2 rounded-full border border-white/75 bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
              >
                <CheckCircle2 className="h-4 w-4 text-sky-400" />
                {highlight}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(30,41,59,0.94))] p-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.2)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">
            Senal
          </p>
          <p className="mt-4 text-4xl font-display">3 bloques</p>
          <p className="mt-3 text-sm leading-7 text-white/72">
            Entiende el caso, ordena el proceso y elige apoyo sin salir del flujo.
          </p>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 md:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon;

          return (
            <div
              key={step.title}
              className="rounded-[26px] border border-white/70 bg-white/76 p-5 shadow-[0_18px_44px_rgba(15,23,42,0.06)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/15 to-blue-600/15 text-blue-700">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-5 text-xl font-semibold text-slate-950">{step.title}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
            </div>
          );
        })}
      </motion.div>

      <motion.div
        variants={item}
        className="rounded-[28px] border border-white/70 bg-white/76 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Microcopy
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {['Accion primero', 'Ruido fuera', 'Criterio visible'].map((line) => (
            <div
              key={line}
              className="rounded-[22px] border border-white/70 bg-gradient-to-r from-white/90 to-sky-50/80 px-4 py-4 text-sm font-semibold text-slate-700"
            >
              {line}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

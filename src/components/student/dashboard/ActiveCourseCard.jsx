import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, BookOpenCheck, Layers } from 'lucide-react';

import { Card } from '../../ui/card';

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ActiveCourseCard({ course, onContinue }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.section variants={reducedMotion ? undefined : itemVariants}>
      <Card className="relative overflow-hidden rounded-[32px] border border-white/80 bg-white/80 p-6 shadow-[0_25px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
        <div className="absolute -right-20 -top-24 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Curso activo
            </p>
            <h3 className="mt-3 text-2xl font-bold text-slate-900">
              {course?.title || 'Explora tu proximo curso'}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {course?.summary ||
                'Retoma tu aprendizaje con sesiones y contenidos hechos para tu avance.'}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-600">
                <Layers className="h-4 w-4 text-emerald-500" />
                {course?.modules || '12 modulos activos'}
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-600">
                <BookOpenCheck className="h-4 w-4 text-blue-500" />
                {course?.progressLabel || 'Progreso reciente'}
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Progreso
                <span className="text-slate-600 normal-case">
                  {course?.progress || 0}%
                </span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400"
                  style={{ width: `${course?.progress || 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex h-full flex-col justify-between rounded-[26px] border border-white/70 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-900 p-5 text-white shadow-[0_22px_60px_rgba(15,23,42,0.25)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                Ultimo modulo
              </p>
              <p className="mt-2 text-lg font-semibold">
                {course?.lastLesson || 'Fundamentos del plan de tesis'}
              </p>
            </div>
            <button
              type="button"
              onClick={onContinue}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-900"
            >
              Continuar
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>
    </motion.section>
  );
}

import { motion, useReducedMotion } from 'motion/react';
import { CheckCircle2, Circle, FileText, Sparkles } from 'lucide-react';

import { Card } from '../../ui/card';

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function ThesisProgressCard({
  thesis,
  progress,
  timeline,
  onOpenThesis,
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.section variants={reducedMotion ? undefined : itemVariants}>
      <Card className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Tesis
            </p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">
              {thesis?.titulo || 'Tu thesis workspace'}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {thesis?.descripcion ||
                'Organiza entregas, revisiones y la ruta completa de tu tesis.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenThesis}
            className="ios-accent-button inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold"
          >
            Abrir workspace
          </button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-white/70 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-900 p-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
              Ultima actividad
            </p>
            <p className="mt-3 text-lg font-semibold">
              {thesis?.updatedLabel || 'Sin modificaciones recientes'}
            </p>
            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-2 text-xs text-slate-200">
              <FileText className="h-4 w-4" />
              {thesis?.estado || 'En progreso'}
            </div>
          </div>
        </div>
      </Card>
    </motion.section>
  );
}

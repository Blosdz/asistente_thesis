import { motion, useReducedMotion } from 'motion/react';
import { MessageCircle } from 'lucide-react';

import { Card } from '../../ui/card';

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function AdvisorSuggestions({ suggestions, onOpenSuggestions }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.section variants={reducedMotion ? undefined : itemVariants}>
      <Card className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Sugerencias del asesor
            </p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">
              Activity feed
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Revisa observaciones, prioridades y comentarios recientes.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenSuggestions}
            className="ios-secondary-button inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold"
          >
            Ver sugerencias
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {suggestions.length > 0 ? (
            suggestions.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)]"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">
                    {item.title}
                  </p>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold ${item.badgeTone}`}
                  >
                    {item.priority}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500">{item.description}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>{item.date}</span>
                  <span>{item.read ? 'Leido' : 'Sin leer'}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm text-slate-500">
              Aun no hay sugerencias registradas. Cuando el asesor deje
              comentarios, apareceran aqui.
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
          <MessageCircle className="h-4 w-4 text-blue-600" />
          Responde desde tu workspace para mantener el historial organizado.
        </div>
      </Card>
    </motion.section>
  );
}

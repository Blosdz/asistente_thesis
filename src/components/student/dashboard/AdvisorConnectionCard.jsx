import { UserPlus, ArrowRight } from 'lucide-react';

import { Card } from '../../ui/card';

export default function AdvisorConnectionCard({ advisor, onOpenAdvisors }) {
  return (
    <Card className="rounded-[32px] border border-white/70 bg-gradient-to-br from-white via-white to-emerald-50/60 p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Conexion con asesor
          </p>
          <h3 className="mt-2 text-xl font-bold text-slate-900">
            Vincula tu asesor
          </h3>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/80 text-emerald-600">
          <UserPlus className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/70 bg-white/80 p-4">
        <p className="text-sm font-semibold text-slate-900">
          {advisor?.name || 'Aun no tienes asesor conectado'}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {advisor?.career || 'Ingresa un codigo para vincularte.'}
        </p>
      </div>

      <div className="mt-4">
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Codigo del asesor
        </label>
        <input
          type="text"
          placeholder="Ej: AEIA-2024"
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:outline-none"
        />
      </div>

      <button
        type="button"
        onClick={onOpenAdvisors}
        className="ios-accent-button mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold"
      >
        Conectar asesor
        <ArrowRight className="h-4 w-4" />
      </button>
    </Card>
  );
}

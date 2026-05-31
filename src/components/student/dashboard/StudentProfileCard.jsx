import { Sparkles } from 'lucide-react';

import { Card } from '../../ui/card';

const cleanText = (value, fallback = '') => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }

  return fallback;
};

export default function StudentProfileCard({ perfil, perfilNombre, onOpenProfile }) {
  return (
    <Card className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)] backdrop-blur">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
        <Sparkles className="h-4 w-4 text-blue-600" />
        Perfil del estudiante
      </p>

      <div className="mt-4 space-y-3">
        <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
          <p className="text-sm font-semibold text-slate-900">{perfilNombre}</p>
          <p className="mt-1 text-xs text-slate-500">
            {cleanText(perfil?.carrera || perfil?.r_carrera, 'Carrera no registrada')}
          </p>
        </div>

        <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
          <p className="text-sm font-semibold text-slate-900">Universidad</p>
          <p className="mt-1 text-xs text-slate-500">
            {cleanText(
              perfil?.universidad_nombre ||
                perfil?.universidad ||
                perfil?.r_universidad_id,
              'Pendiente de completar',
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
          <p className="text-sm font-semibold text-slate-900">Contacto</p>
          <p className="mt-1 text-xs text-slate-500">
            {cleanText(perfil?.telefono || perfil?.r_telefono, 'Sin telefono registrado')}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenProfile}
        className="ios-secondary-button mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold"
      >
        Actualizar perfil
      </button>
    </Card>
  );
}

import { CheckCircle2 } from 'lucide-react';

import { getRelationStatusMeta } from './advisors.utils';

export default function MyAdvisorCard({
  advisor,
  isSelected,
  onSelect,
}) {
  const statusMeta = getRelationStatusMeta(advisor.estado);

  return (
    <article
      className={`flex h-full flex-col rounded-[28px] border bg-white p-5 transition-all ${
        isSelected
          ? 'border-blue-200 shadow-[0_24px_60px_-42px_rgba(37,99,235,0.35)]'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-[0_20px_50px_-42px_rgba(15,23,42,0.35)]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={advisor.avatar}
            alt={advisor.name}
            className="h-14 w-14 rounded-2xl object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-slate-950">
              {advisor.name}
            </p>
            <p className="mt-1 text-sm text-slate-600">{advisor.career}</p>
            <p className="mt-1 truncate text-xs text-slate-400">
              {advisor.university}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {isSelected ? (
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
              Seleccionado
            </span>
          ) : null}
          <span
            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusMeta.className}`}
          >
            {statusMeta.label}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="advisor-inner-blue rounded-2xl bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Tesis vinculada
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {advisor.thesisTitle || 'Aún no tienes una tesis vinculada con este asesor.'}
          </p>
        </div>
        <div className="advisor-inner-blue rounded-2xl bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Código
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {advisor.publicCode || 'Sin código público'}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {advisor.tags.map((tag) => (
          <span
            key={tag}
            className="advisor-inner-blue rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-5">
        <button
          type="button"
          onClick={() => onSelect(advisor.id)}
          className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${
            isSelected
              ? 'advisor-inner-blue advisor-inner-blue-active border-blue-200 bg-blue-50 text-blue-700'
              : 'advisor-inner-blue border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          {isSelected ? 'Perfil activo' : 'Seleccionar'}
        </button>
      </div>
    </article>
  );
}

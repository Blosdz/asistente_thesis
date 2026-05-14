import { CheckCircle2, Link2Off, UserPlus } from 'lucide-react';

import { getRelationStatusMeta } from './advisors.utils';

export default function AdvisorCatalogCard({
  advisor,
  relation,
  isSelected,
  linking,
  onSelect,
  onContact,
}) {
  const relationMeta = relation ? getRelationStatusMeta(relation.estado) : null;
  const hasPublicAccess = Boolean(advisor.slug);

  return (
    <article
      className={`grid gap-4 border-b border-slate-200 px-4 py-4 transition-colors md:grid-cols-[minmax(0,2.2fr)_minmax(180px,0.9fr)_minmax(220px,1fr)_auto] md:items-center ${
        isSelected ? 'bg-blue-50/50' : 'bg-white hover:bg-slate-50/70'
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <img
          src={advisor.avatar}
          alt={advisor.name}
          className="h-12 w-12 rounded-2xl object-cover"
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-slate-950">
              {advisor.name}
            </p>
            {isSelected ? (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                Seleccionado
              </span>
            ) : null}
          </div>
          <p className="mt-1 truncate text-sm text-slate-600">
            {advisor.career}
          </p>
          <p className="mt-1 truncate text-xs text-slate-400">
            {advisor.university}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 md:justify-start">
        <span
          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
            relationMeta
              ? relationMeta.className
              : 'border-slate-200 bg-slate-50 text-slate-600'
          }`}
        >
          {relationMeta ? relationMeta.label : 'Disponible'}
        </span>
        {advisor.publicCode ? (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
            {advisor.publicCode}
          </span>
        ) : null}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm text-slate-600">{advisor.bio}</p>
        {advisor.tags.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {advisor.tags.map((tag) => (
              <span
                key={tag}
                className="advisor-inner-blue rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        {relation ? (
          <button
            type="button"
            onClick={() => onSelect(advisor.id)}
            className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold ${
              isSelected
                ? 'advisor-inner-blue advisor-inner-blue-active border-blue-200 bg-blue-50 text-blue-700'
                : 'advisor-inner-blue border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isSelected ? 'Activo' : 'Seleccionar'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onContact(advisor)}
            disabled={linking || !hasPublicAccess}
            className="ios-accent-button inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
          >
            {hasPublicAccess ? (
              <UserPlus className="h-4 w-4" />
            ) : (
              <Link2Off className="h-4 w-4" />
            )}
            {linking
              ? 'Enviando...'
              : hasPublicAccess
                ? 'Contactar asesor'
                : 'Sin acceso'}
          </button>
        )}
      </div>
    </article>
  );
}

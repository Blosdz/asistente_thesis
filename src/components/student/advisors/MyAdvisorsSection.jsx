import { Search, Users } from 'lucide-react';

import { canScheduleRelation } from './advisors.utils';
import AdvisorsEmptyState from './AdvisorsEmptyState';
import MyAdvisorCard from './MyAdvisorCard';

export default function MyAdvisorsSection({
  loading,
  advisors,
  selectedAdvisorId,
  onSelectAdvisor,
  onOpenCourses,
  onOpenBrowse,
}) {
  const readyCount = advisors.filter((advisor) =>
    canScheduleRelation(advisor.estado),
  ).length;

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Mis asesores
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Tus vínculos académicos activos
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
            Esta es tu vía principal para continuar el proceso: revisa el estado
            de cada relación y pasa a la agenda cuando un asesor esté listo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {readyCount} listo(s) para reunión
          </span>
          <button
            type="button"
            onClick={onOpenBrowse}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Search className="h-4 w-4" />
            Buscar asesores
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={`my-advisor-skeleton-${index}`}
              className="h-[240px] animate-pulse rounded-[28px] border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : advisors.length === 0 ? (
        <AdvisorsEmptyState
          icon={Users}
          title="Aún no tienes asesores vinculados"
          description="Explora el catálogo, contacta a un asesor y vuelve aquí para continuar con la agenda."
          actionLabel="Buscar asesores"
          onAction={onOpenBrowse}
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {advisors.map((advisor) => (
            <MyAdvisorCard
              key={advisor.relacionId || advisor.id}
              advisor={advisor}
              isSelected={selectedAdvisorId === advisor.id}
              onSelect={onSelectAdvisor}
              onOpenCourses={onOpenCourses}
            />
          ))}
        </div>
      )}
    </section>
  );
}

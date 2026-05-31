import { Search, Users } from 'lucide-react';

import AdvisorsEmptyState from './AdvisorsEmptyState';
import AdvisorCatalogCard from './AdvisorCatalogCard';

export default function AdvisorCatalogSection({
  loading,
  advisors,
  selectedAdvisorId,
  currentPage,
  totalPages,
  linkedCount,
  linkingAdvisorId,
  relationsByAdvisorId,
  expandedCoursesAdvisorId,
  advisorCoursesById = {},
  buyingCourseId,
  onSelectAdvisor,
  onContactAdvisor,
  onToggleCourses,
  onBuyCourse,
  onOpenCourse,
  onRetryCourses,
  onOpenMyAdvisors,
  onPrevPage,
  onNextPage,
  hasActiveFilters,
  onClearFilters,
}) {
  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Buscar asesores
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Encuentra un perfil compatible con tu tesis
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
            Explora el catálogo, compara perfiles y contacta al asesor adecuado
            antes de pasar a la agenda.
          </p>
        </div>

        {linkedCount > 0 ? (
          <button
            type="button"
            onClick={onOpenMyAdvisors}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Users className="h-4 w-4" />
            Ver mis asesores
          </button>
        ) : null}
      </div>

      {loading ? (
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`advisor-skeleton-${index}`}
              className="h-[92px] animate-pulse border-b border-slate-200 bg-white last:border-b-0"
            />
          ))}
        </div>
      ) : advisors.length === 0 ? (
        <AdvisorsEmptyState
          icon={Search}
          title="No encontramos asesores con esos filtros"
          description="Prueba con otra búsqueda o limpia los filtros para ver más perfiles disponibles."
          actionLabel={hasActiveFilters ? 'Limpiar filtros' : undefined}
          onAction={hasActiveFilters ? onClearFilters : undefined}
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
            <div className="hidden border-b border-slate-200 bg-slate-50/80 px-4 py-3 md:grid md:grid-cols-[minmax(0,2.2fr)_minmax(180px,0.9fr)_minmax(220px,1fr)_auto] md:items-center md:gap-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Asesor
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Estado
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Perfil
              </span>
              <span className="text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Acciones
              </span>
            </div>
            {advisors.map((advisor) => (
              <AdvisorCatalogCard
                key={advisor.id}
                advisor={advisor}
                relation={relationsByAdvisorId.get(advisor.id) || null}
                isSelected={selectedAdvisorId === advisor.id}
                linking={linkingAdvisorId === advisor.id}
                isCoursesOpen={expandedCoursesAdvisorId === advisor.id}
                coursesState={advisorCoursesById[advisor.id]}
                buyingCourseId={buyingCourseId}
                onSelect={onSelectAdvisor}
                onContact={onContactAdvisor}
                onToggleCourses={onToggleCourses}
                onBuyCourse={onBuyCourse}
                onOpenCourse={onOpenCourse}
                onRetryCourses={onRetryCourses}
              />
            ))}
          </div>

          <div className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Página {currentPage} de {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onPrevPage}
                disabled={currentPage === 1}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={onNextPage}
                disabled={currentPage === totalPages}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

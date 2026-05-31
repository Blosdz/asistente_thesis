import { BookOpen, Folder, Loader2, RefreshCw, ShoppingBag } from 'lucide-react';

import { formatCourseCurrency } from '../../../services/cursosService';

export default function AdvisorCoursesExplorer({
  advisor,
  coursesState,
  buyingCourseId,
  canBuyCourses,
  onBuyCourse,
  onOpenCourse,
  onRetry,
}) {
  const courses = coursesState?.items || [];
  const loading = Boolean(coursesState?.loading);
  const error = coursesState?.error || null;

  return (
    <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-5">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Cursos disponibles
            </p>
            <h3 className="mt-1 text-base font-semibold text-slate-950">
              {advisor?.name || 'Asesor'}
            </h3>
          </div>
          {loading ? (
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Cargando
            </span>
          ) : null}
        </div>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`course-folder-skeleton-${advisor?.id}-${index}`}
                className="h-[170px] animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-rose-100 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-rose-700">{error}</p>
            <button
              type="button"
              onClick={() => onRetry?.(advisor)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </button>
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-7 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-3 text-sm font-semibold text-slate-700">
              Este asesor aún no publicó cursos.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => {
              const hasActiveAccess = course.estado_compra === 'activo';
              const hasPendingPayment = ['pendiente', 'voucher_subido'].includes(
                course.estado_pago,
              );
              const buying = buyingCourseId === course.id;
              const disabled =
                buying || hasPendingPayment || (!hasActiveAccess && !canBuyCourses);

              return (
                <article
                  key={course.id}
                  className="group relative min-h-[190px] rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_42px_-38px_rgba(15,23,42,0.45)] transition hover:border-slate-300"
                >
                  <div className="absolute left-5 top-0 h-3 w-20 -translate-y-1/2 rounded-t-xl border border-b-0 border-amber-200 bg-amber-100" />
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-14 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                      <Folder className="h-7 w-7 fill-amber-200/80" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="line-clamp-2 text-sm font-bold leading-5 text-slate-950">
                        {course.titulo}
                      </h4>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {course.total_materiales} material(es)
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
                    {course.descripcion || 'Sin descripción registrada.'}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Precio
                      </p>
                      <p className="mt-1 text-sm font-extrabold text-slate-950">
                        {formatCourseCurrency(course.precio, course.moneda)}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                      {hasActiveAccess
                        ? 'Comprado'
                        : hasPendingPayment
                          ? 'En revisión'
                          : 'Disponible'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      hasActiveAccess
                        ? onOpenCourse?.(course)
                        : onBuyCourse?.(course, advisor?.id)
                    }
                    disabled={disabled}
                    className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {buying ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShoppingBag className="h-4 w-4" />
                    )}
                    {hasActiveAccess
                      ? 'Abrir curso'
                      : hasPendingPayment
                        ? 'Pago en revisión'
                        : canBuyCourses
                          ? 'Comprar'
                          : 'Solicita vínculo'}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

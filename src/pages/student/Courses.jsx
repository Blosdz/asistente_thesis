import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { BookOpen, CheckCircle2, Clock3, Link as LinkIcon, LockKeyhole } from 'lucide-react';
import {
  formatCourseCurrency,
  listarMisCursosEstudiante,
  obtenerDetalleCursoEstudiante,
} from '../../services/cursosService';

const statusMeta = {
  activo: {
    label: 'Activo',
    icon: CheckCircle2,
    className: 'bg-emerald-100 text-emerald-700',
  },
  pendiente_pago: {
    label: 'Pendiente de validación',
    icon: Clock3,
    className: 'bg-amber-100 text-amber-700',
  },
  cancelado: {
    label: 'Cancelado',
    icon: LockKeyhole,
    className: 'bg-slate-200 text-slate-700',
  },
};

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) || null,
    [courses, selectedCourseId],
  );

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const data = await listarMisCursosEstudiante();
        setCourses(data || []);
        if (data?.[0]?.id) {
          setSelectedCourseId(data[0].id);
        }
      } catch (error) {
        console.error(error);
        toast.error(error.message || 'No se pudieron cargar tus cursos');
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  useEffect(() => {
    const loadDetail = async () => {
      if (!selectedCourseId) {
        setDetail(null);
        return;
      }

      try {
        setDetailLoading(true);
        const data = await obtenerDetalleCursoEstudiante(selectedCourseId);
        setDetail(data || null);
      } catch (error) {
        console.error(error);
        toast.error(error.message || 'No se pudo cargar el detalle del curso');
        setDetail(null);
      } finally {
        setDetailLoading(false);
      }
    };

    loadDetail();
  }, [selectedCourseId]);

  return (
    <div className="w-full px-4 py-10 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-[1440px] gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Cursos
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
            Tus cursos comprados
          </h1>

          <div className="mt-6 space-y-3">
            {loading ? (
              <div className="rounded-[24px] border border-slate-200 bg-white p-6 text-sm text-slate-500">
                Cargando cursos...
              </div>
            ) : courses.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-white/75 p-8 text-center">
                <BookOpen className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  Aún no tienes cursos comprados.
                </p>
              </div>
            ) : (
              courses.map((course) => {
                const meta = statusMeta[course.estado_compra] || statusMeta.pendiente_pago;
                const Icon = meta.icon;

                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => setSelectedCourseId(course.id)}
                    className={`block w-full rounded-[24px] border bg-white p-4 text-left transition ${
                      selectedCourseId === course.id
                        ? 'border-blue-200 shadow-[0_20px_55px_-44px_rgba(37,99,235,0.45)]'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-sm font-bold text-slate-950">
                          {course.titulo}
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                          {course.asesor_nombre || 'Asesor'}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.className}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-3 text-xs font-semibold text-slate-500">
                      {formatCourseCurrency(course.precio_pagado || course.precio, course.moneda)}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-[30px] border border-slate-200 bg-white p-6">
          {!selectedCourse ? (
            <div className="flex min-h-[360px] items-center justify-center text-sm text-slate-500">
              Selecciona un curso para ver el detalle.
            </div>
          ) : (
            <div>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    {selectedCourse.asesor_nombre || 'Asesor'}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950">
                    {selectedCourse.titulo}
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                    {selectedCourse.descripcion || 'Sin descripción registrada.'}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {selectedCourse.total_materiales} material(es)
                </span>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-bold text-slate-900">Materiales</h3>
                {detailLoading ? (
                  <p className="mt-4 text-sm text-slate-500">Cargando materiales...</p>
                ) : detail?.estado_compra !== 'activo' ? (
                  <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-700">
                    El acceso completo se habilitará cuando el administrador valide tu pago.
                  </div>
                ) : !detail?.materiales?.length ? (
                  <p className="mt-4 text-sm text-slate-500">
                    Este curso aún no tiene materiales publicados.
                  </p>
                ) : (
                  <div className="mt-4 divide-y divide-slate-100">
                    {detail.materiales.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between gap-3 py-4"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {material.titulo}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {material.tipo}
                          </p>
                        </div>
                        {(material.url_externa || material.url_storage || material.url_drive) && (
                          <a
                            href={material.url_externa || material.url_storage || material.url_drive}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700"
                          >
                            <LinkIcon className="h-3.5 w-3.5" />
                            Abrir
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

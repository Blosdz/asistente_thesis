import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpenCheck,
  Clock3,
  Eye,
  Wallet,
  Search,
  ChevronRight,
  Copy,
  RefreshCw,
  KeyRound,
  MessageSquareQuote,
  CalendarClock,
  BookOpen,
  ArrowUpRight,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { obtenerDashboardAsesor } from '../../services/advisorDashboardService';
import { generarCodigoAsesor } from '../../services/advisorService';
import { formatCourseCurrency } from '../../services/cursosService';

const ESTADO_TESIS_META = {
  completado: { label: 'Aprobada', className: 'bg-emerald-100 text-emerald-700' },
  revision: { label: 'En revisión', className: 'bg-amber-100 text-amber-700' },
  en_progreso: { label: 'En progreso', className: 'bg-blue-100 text-blue-700' },
  pendiente_pago: { label: 'Pendiente pago', className: 'bg-slate-100 text-slate-600' },
  borrador: { label: 'Borrador', className: 'bg-slate-100 text-slate-600' },
  cancelado: { label: 'Cancelada', className: 'bg-rose-100 text-rose-700' },
};

const ESTADO_RELACION_META = {
  activo: { label: 'Activo', className: 'bg-emerald-100 text-emerald-700' },
  pendiente: { label: 'Solicitud', className: 'bg-amber-100 text-amber-700' },
  completado: { label: 'Completado', className: 'bg-blue-100 text-blue-700' },
  cancelado: { label: 'Cancelado', className: 'bg-rose-100 text-rose-700' },
};

const ESTADO_REVISION_META = {
  pendiente: { label: 'Pendiente', className: 'bg-amber-100 text-amber-700' },
  marcado_por_estudiante: {
    label: 'Por validar',
    className: 'bg-sky-100 text-sky-700',
  },
  verificado: { label: 'Verificada', className: 'bg-emerald-100 text-emerald-700' },
  rechazado: { label: 'Rechazada', className: 'bg-rose-100 text-rose-700' },
};

const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatDateTime = (value) => {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const relativeFromNow = (value) => {
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return '';
  const diffMs = Date.now() - time;
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'hace un momento';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  return `hace ${days} d`;
};

const initials = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'E';

function StatCard({ icon: Icon, label, value, hint, accent }) {
  return (
    <div className="glass-card !rounded-3xl !p-5">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
          {label}
        </p>
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full ${accent}`}
        >
          <Icon size={16} />
        </span>
      </div>
      <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-1 text-xs font-medium text-slate-500">{hint}</p>
    </div>
  );
}

function getCodigoTexto(codigo) {
  return codigo?.codigo_publico || codigo?.r_codigo_publico || '';
}

export default function AdvisorDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [codigo, setCodigo] = useState(null);
  const [codigoLoading, setCodigoLoading] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const data = await obtenerDashboardAsesor();
      setDashboard(data);
      setCodigo(data.codigo_publico);
    } catch (error) {
      console.error('Error al cargar el panel del asesor:', error);
      toast.error('No se pudo cargar el panel del asesor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const resumen = dashboard?.resumen;
  const codigoTexto = getCodigoTexto(codigo);

  const estudiantesFiltrados = useMemo(() => {
    const rows = dashboard?.estudiantes || [];
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => {
      const haystack = [
        row.r_nombres,
        row.r_apellidos,
        row.r_carrera,
        row.r_tesis_titulo,
        row.r_estado_relacion,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [dashboard?.estudiantes, search]);

  const handleCopyCodigo = async () => {
    if (!codigoTexto) return;
    try {
      await navigator.clipboard.writeText(codigoTexto);
      toast.success('Código copiado.');
    } catch (error) {
      console.error(error);
      toast.error('No se pudo copiar el código.');
    }
  };

  const handleGenerarCodigo = async () => {
    if (codigoLoading) return;
    if (
      codigoTexto &&
      !window.confirm(
        'Ya tienes un código activo. Si generas otro, el anterior se desactivará. ¿Continuar?',
      )
    ) {
      return;
    }
    try {
      setCodigoLoading(true);
      const nuevo = await generarCodigoAsesor();
      setCodigo(nuevo);
      toast.success('Código público actualizado.');
    } catch (error) {
      console.error(error);
      toast.error('No se pudo generar el código.');
    } finally {
      setCodigoLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl animate-pulse px-1 py-10">
        <div className="h-9 w-64 rounded-full bg-slate-200" />
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-32 rounded-3xl bg-slate-200/70" />
          ))}
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <div className="h-96 rounded-3xl bg-slate-200/70 lg:col-span-8" />
          <div className="h-96 rounded-3xl bg-slate-200/70 lg:col-span-4" />
        </div>
      </div>
    );
  }

  const revisiones = dashboard?.revisiones || [];
  const ultimaRevision = dashboard?.ultima_revision;
  const proximaReunion = dashboard?.proxima_reunion;
  const cursos = dashboard?.cursos || [];

  return (
    <div className="mx-auto w-full max-w-7xl px-1 py-10 text-slate-900">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            Panel del Asesor
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Supervisa el avance de tus tesistas, tus revisiones y los cursos a tu
            cargo en un solo lugar.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {resumen?.estudiantes_activos ?? 0} tutorías activas
          </span>
          <button
            type="button"
            onClick={cargar}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
          >
            <RefreshCw size={14} />
            Actualizar
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          icon={Users}
          label="Total estudiantes"
          value={resumen?.total_estudiantes ?? 0}
          hint={`${resumen?.solicitudes_pendientes ?? 0} solicitud(es) por revisar`}
          accent="bg-slate-900/5 text-slate-700"
        />
        <StatCard
          icon={BookOpenCheck}
          label="Tesis aprobadas"
          value={resumen?.tesis_aprobadas ?? 0}
          hint={`de ${resumen?.tesis_total ?? 0} tesis asignadas`}
          accent="bg-emerald-100 text-emerald-700"
        />
        <StatCard
          icon={Clock3}
          label="En progreso"
          value={resumen?.tesis_en_progreso ?? 0}
          hint="Tesis en desarrollo"
          accent="bg-blue-100 text-blue-700"
        />
        <StatCard
          icon={Eye}
          label="En revisión"
          value={resumen?.tesis_en_revision ?? 0}
          hint={`${resumen?.revisiones_pendientes ?? 0} sugerencia(s) pendientes`}
          accent="bg-amber-100 text-amber-700"
        />
        <StatCard
          icon={Wallet}
          label="Honorarios"
          value={formatCourseCurrency(
            resumen?.honorarios_total ?? 0,
            resumen?.honorarios_moneda || 'PEN',
          )}
          hint="Reuniones confirmadas y completadas"
          accent="bg-violet-100 text-violet-700"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        {/* Columna principal: estudiantes */}
        <section className="glass-card !rounded-3xl !p-0 lg:col-span-8">
          <div className="flex flex-col gap-4 border-b border-white/50 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900">
                Estudiantes tutorados
              </h2>
              <p className="text-xs font-medium text-slate-500">
                Seguimiento individual de tesistas y entregables
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/advisor/students')}
              className="inline-flex items-center gap-1 self-start rounded-full bg-ios-blue/10 px-3 py-1.5 text-xs font-bold text-ios-blue transition hover:bg-ios-blue/20 sm:self-auto"
            >
              Ver todos
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="px-6 pt-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por estudiante, carrera o tesis…"
                className="w-full rounded-2xl border border-white/60 bg-white/70 py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-ios-blue/40"
              />
            </div>
          </div>

          <div className="overflow-x-auto px-2 pb-4 pt-2">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr className="text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  <th className="px-4 py-3">Estudiante</th>
                  <th className="px-4 py-3">Carrera</th>
                  <th className="px-4 py-3">Tema de tesis</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Última reunión</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {estudiantesFiltrados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-sm text-slate-500"
                    >
                      {dashboard?.estudiantes?.length
                        ? 'Ningún estudiante coincide con la búsqueda.'
                        : 'Todavía no tienes estudiantes vinculados. Comparte tu código público para que se unan.'}
                    </td>
                  </tr>
                ) : (
                  estudiantesFiltrados.slice(0, 6).map((row) => {
                    const nombre =
                      `${row.r_nombres || ''} ${row.r_apellidos || ''}`.trim() ||
                      'Estudiante';
                    const estadoTesis =
                      ESTADO_TESIS_META[
                        String(row.r_tesis_estado || '').toLowerCase()
                      ];
                    const estadoRelacion =
                      ESTADO_RELACION_META[
                        String(row.r_estado_relacion || '').toLowerCase()
                      ];
                    const badge = estadoTesis ||
                      estadoRelacion || {
                        label: row.r_tesis_estado || row.r_estado_relacion || '—',
                        className: 'bg-slate-100 text-slate-600',
                      };
                    return (
                      <tr
                        key={row.r_estudiante_id || row.relacion_id}
                        className="cursor-pointer border-t border-white/50 text-sm transition hover:bg-white/50"
                        onClick={() =>
                          navigate(`/advisor/students/${row.r_estudiante_id}`)
                        }
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ios-blue/10 text-xs font-bold text-ios-blue">
                              {initials(nombre)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-bold text-slate-900">
                                {nombre}
                              </p>
                              <p className="truncate text-xs text-slate-500">
                                {row.r_email || 'Sin correo'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {row.r_carrera || '—'}
                        </td>
                        <td className="max-w-[220px] px-4 py-3 text-slate-600">
                          <span className="line-clamp-2">
                            {row.r_tesis_titulo || 'Sin tesis registrada'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {row.r_reunion_inicio
                            ? formatDate(row.r_reunion_inicio)
                            : 'Sin reuniones'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <ChevronRight
                            size={16}
                            className="inline text-slate-400"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Columna lateral */}
        <aside className="flex flex-col gap-6 lg:col-span-4">
          {/* Código público */}
          <div className="glass-card !rounded-3xl !p-6">
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                Código público
              </p>
              <KeyRound size={16} className="text-ios-blue" />
            </div>
            <p className="mt-3 text-2xl font-black tracking-[0.2em] text-slate-900">
              {codigoTexto || 'Sin código'}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Compártelo con tus tesistas para que se vinculen automáticamente a
              tu panel.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleCopyCodigo}
                disabled={!codigoTexto}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/70 bg-white/75 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Copy size={14} />
                Copiar
              </button>
              <button
                type="button"
                onClick={handleGenerarCodigo}
                disabled={codigoLoading}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-ios-blue px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <RefreshCw
                  size={14}
                  className={codigoLoading ? 'animate-spin' : ''}
                />
                {codigoTexto ? 'Regenerar' : 'Generar'}
              </button>
            </div>
          </div>

          {/* Mis revisiones / última sugerencia */}
          <div className="glass-card !rounded-3xl !p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-black tracking-tight text-slate-900">
                  Mis revisiones
                </h3>
                <p className="text-xs font-medium text-slate-500">
                  {resumen?.revisiones_pendientes ?? 0} pendiente(s) ·{' '}
                  {revisiones.length} en total
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/advisor/thesis')}
                className="inline-flex items-center gap-1 rounded-full bg-ios-blue/10 px-2.5 py-1 text-[11px] font-bold text-ios-blue transition hover:bg-ios-blue/20"
              >
                Ir a revisión
                <ArrowUpRight size={13} />
              </button>
            </div>

            {ultimaRevision ? (
              <div className="mt-4 rounded-2xl border border-white/60 bg-white/60 p-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ios-blue">
                    <MessageSquareQuote size={13} />
                    Última sugerencia enviada
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {relativeFromNow(ultimaRevision.creado_en)}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold leading-snug text-slate-800">
                  &ldquo;{ultimaRevision.detalle}&rdquo;
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <span className="font-bold text-slate-700">
                    {ultimaRevision.estudiante}
                  </span>
                  <span>·</span>
                  <span className="truncate">{ultimaRevision.tesis_titulo}</span>
                </div>
                <div className="mt-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      ESTADO_REVISION_META[ultimaRevision.estado_validacion]
                        ?.className || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {ESTADO_REVISION_META[ultimaRevision.estado_validacion]
                      ?.label || ultimaRevision.estado_validacion}
                  </span>
                </div>
              </div>
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white/40 p-4 text-center text-xs text-slate-500">
                Todavía no has enviado sugerencias. Entra a “Revisión de tesis”
                para dejar tu primera observación.
              </p>
            )}

            {revisiones.length > 1 && (
              <ul className="mt-4 space-y-3">
                {revisiones.slice(1, 4).map((rev) => (
                  <li
                    key={rev.id}
                    className="flex items-start gap-3 border-t border-white/50 pt-3"
                  >
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-ios-blue/50" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-700">
                        {rev.detalle}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {rev.estudiante} · {formatDate(rev.creado_en)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Próxima reunión */}
          {proximaReunion && (
            <div className="glass-card !rounded-3xl !p-6">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                <CalendarClock size={15} className="text-ios-blue" />
                Próxima reunión
              </div>
              <p className="mt-2 text-sm font-bold text-slate-900">
                {`${proximaReunion.nombres || ''} ${
                  proximaReunion.apellidos || ''
                }`.trim() || 'Estudiante'}
              </p>
              <p className="text-xs text-slate-500">
                {formatDateTime(proximaReunion.inicio)}
              </p>
              <button
                type="button"
                onClick={() => navigate('/advisor/calendar')}
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-ios-blue hover:underline"
              >
                Ver calendario
                <ChevronRight size={13} />
              </button>
            </div>
          )}

          {/* Cursos a cargo */}
          <div className="glass-card !rounded-3xl !p-6">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-black tracking-tight text-slate-900">
                Cursos a cargo
              </h3>
              <span className="rounded-full bg-slate-900/5 px-2 py-1 text-[10px] font-bold text-slate-600">
                {cursos.length} curso(s)
              </span>
            </div>
            {cursos.length === 0 ? (
              <p className="mt-3 text-xs text-slate-500">
                No tienes cursos publicados todavía.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {cursos.slice(0, 3).map((curso) => (
                  <li
                    key={curso.id}
                    className="flex items-center justify-between gap-3 border-t border-white/50 pt-3 first:border-none first:pt-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-800">
                        {curso.titulo}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {curso.total_materiales} material(es) ·{' '}
                        {formatCourseCurrency(curso.precio, curso.moneda)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        curso.estado === 'publicado'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {curso.estado}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={() => navigate('/advisor/cursos')}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/70 bg-white/70 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-white"
            >
              <BookOpen size={14} />
              Gestionar cursos
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

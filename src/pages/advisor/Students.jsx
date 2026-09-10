import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Download,
  UserPlus,
  Copy,
  MoreVertical,
  Video,
  Loader2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Modal from '../../components/ui/modal';
import {
  cambiarEstadoRelacion as cambiarEstadoRelacionAPI,
  obtenerEstudiantesAsesor,
  obtenerMiCodigoPublicoAsesor,
} from '../../services/advisorService';

const PAGE_SIZE = 8;

const TABS = [
  { value: 'todos', label: 'Todos', match: () => true },
  {
    value: 'activos',
    label: 'Activos',
    match: (r) => ['activo', 'completado'].includes(estadoRel(r)),
  },
  {
    value: 'pendientes',
    label: 'Pendientes',
    match: (r) => estadoRel(r) === 'pendiente',
  },
];

const SORTS = [
  { value: 'recientes', label: 'Más recientes' },
  { value: 'nombre', label: 'Nombre' },
  { value: 'avance', label: 'Mayor avance' },
];

function estadoRel(row) {
  return String(row?.r_estado_relacion || row?.estado || '').toLowerCase();
}

function fullName(row) {
  return `${row?.r_nombres || ''} ${row?.r_apellidos || ''}`.trim();
}

function initials(name) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || 'ES'
  );
}

const AVATAR_COLORS = [
  'bg-rose-100 text-rose-600',
  'bg-blue-100 text-blue-600',
  'bg-violet-100 text-violet-600',
  'bg-emerald-100 text-emerald-600',
  'bg-amber-100 text-amber-600',
  'bg-cyan-100 text-cyan-600',
];
function avatarColor(seed = '') {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = seed.charCodeAt(i) + (h << 5) - h;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

const fechaCorta = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});
const horaCorta = new Intl.DateTimeFormat('es-PE', {
  hour: '2-digit',
  minute: '2-digit',
});

function estadoEstudiante(row) {
  const rel = estadoRel(row);
  if (rel === 'pendiente') {
    return {
      label: 'Pendiente aceptación',
      cls: 'border border-rose-200 bg-rose-50 text-rose-600',
      dot: null,
    };
  }
  if (rel === 'cancelado') {
    return { label: 'Vínculo cancelado', cls: 'bg-slate-100 text-slate-500' };
  }

  const t = String(row.r_tesis_estado || '').toLowerCase();
  const av = row.r_avance_pct;

  if (rel === 'completado' || t === 'completado' || av === 100) {
    return { label: 'Listo para sustentar', cls: 'bg-emerald-100 text-emerald-700' };
  }
  if (t === 'revision') {
    return { label: 'En revisión', cls: 'bg-indigo-50 text-indigo-600', dot: 'bg-indigo-400' };
  }
  if (t === 'en_progreso') {
    return { label: 'En progreso', cls: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500' };
  }
  if (!row.r_tesis_id) {
    return { label: 'Sin tesis vinculada', cls: 'bg-slate-100 text-slate-500' };
  }
  return { label: 'Planificación', cls: 'bg-slate-100 text-slate-600' };
}

function AvanceBar({ pct, fuente }) {
  if (pct === null || pct === undefined) {
    return <span className="text-xs text-slate-400">Sin registro</span>;
  }
  const value = Math.max(0, Math.min(100, Number(pct)));
  const color =
    value >= 100 ? 'bg-emerald-500' : value >= 60 ? 'bg-blue-500' : value >= 25 ? 'bg-blue-400' : 'bg-rose-400';
  const fuenteLabel =
    fuente === 'modulos'
      ? 'según fases marcadas por el asesor'
      : fuente === 'contenido'
        ? 'estimado por secciones redactadas'
        : '';
  return (
    <div className="w-28" title={fuenteLabel}>
      <span
        className={`text-xs font-bold ${value >= 100 ? 'text-emerald-600' : 'text-slate-700'}`}
      >
        {value}%
      </span>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function SesionCell({ row }) {
  const prox = row.r_prox_reunion_inicio ? new Date(row.r_prox_reunion_inicio) : null;
  const ultima = row.r_reunion_inicio ? new Date(row.r_reunion_inicio) : null;

  if (prox && !Number.isNaN(prox.getTime())) {
    const hoy = new Date();
    const esHoy =
      prox.getFullYear() === hoy.getFullYear() &&
      prox.getMonth() === hoy.getMonth() &&
      prox.getDate() === hoy.getDate();
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600">
        <Video className="h-3.5 w-3.5" />
        {esHoy ? `Hoy, ${horaCorta.format(prox)}` : fechaCorta.format(prox)}
      </span>
    );
  }
  if (ultima && !Number.isNaN(ultima.getTime())) {
    return (
      <span className="text-xs text-slate-500">{fechaCorta.format(ultima)}</span>
    );
  }
  if (estadoRel(row) === 'pendiente') {
    return <span className="text-xs text-slate-400">Solicitud enviada</span>;
  }
  return <span className="text-xs text-slate-400">Sin reuniones</span>;
}

export default function AdvisorStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [codigo, setCodigo] = useState('');

  const [tab, setTab] = useState('todos');
  const [search, setSearch] = useState('');
  const [carrera, setCarrera] = useState('todas');
  const [sort, setSort] = useState('recientes');
  const [page, setPage] = useState(0);
  const [menuOpen, setMenuOpen] = useState(null);

  const [modal, setModal] = useState({ open: false, student: null });
  const [acting, setActing] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const [data, code] = await Promise.all([
        obtenerEstudiantesAsesor(),
        obtenerMiCodigoPublicoAsesor().catch(() => null),
      ]);
      setStudents(data || []);
      setCodigo(code?.codigo_publico || code?.r_codigo_publico || '');
    } catch (error) {
      console.error(error);
      toast.error('No se pudieron cargar los estudiantes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const carreras = useMemo(
    () =>
      [...new Set(students.map((s) => s.r_carrera).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [students],
  );

  const tabCounts = useMemo(() => {
    const c = {};
    TABS.forEach((t) => {
      c[t.value] = students.filter((s) => t.match(s)).length;
    });
    return c;
  }, [students]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const activeTab = TABS.find((t) => t.value === tab) || TABS[0];
    const rows = students
      .filter((s) => activeTab.match(s))
      .filter((s) => carrera === 'todas' || s.r_carrera === carrera)
      .filter((s) => {
        if (!term) return true;
        return [fullName(s), s.r_email, s.r_carrera, s.r_tesis_titulo]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(term));
      });

    const sorted = [...rows];
    if (sort === 'nombre') {
      sorted.sort((a, b) => fullName(a).localeCompare(fullName(b)));
    } else if (sort === 'avance') {
      sorted.sort((a, b) => (b.r_avance_pct ?? -1) - (a.r_avance_pct ?? -1));
    } else {
      sorted.sort(
        (a, b) =>
          new Date(b.r_creado_en || 0).getTime() -
          new Date(a.r_creado_en || 0).getTime(),
      );
    }
    return sorted;
  }, [students, tab, search, carrera, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const handleExport = () => {
    if (filtered.length === 0) return;
    const header = ['Estudiante', 'Correo', 'Carrera', 'Tema de tesis', 'Estado', 'Avance %'];
    const rows = filtered.map((s) =>
      [
        fullName(s),
        s.r_email,
        s.r_carrera,
        s.r_tesis_titulo,
        estadoEstudiante(s).label,
        s.r_avance_pct ?? '',
      ]
        .map((v) => `"${String(v ?? '').replaceAll('"', '""')}"`)
        .join(','),
    );
    const blob = new Blob([[header.join(','), ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mis-estudiantes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copiarCodigo = async () => {
    if (!codigo) return;
    try {
      await navigator.clipboard.writeText(codigo);
      toast.success('Código copiado.');
    } catch {
      toast.error('No se pudo copiar.');
    }
  };

  const responderSolicitud = async (nuevoEstado) => {
    const relId =
      modal.student?.r_relacion_id || modal.student?.relacion_id || modal.student?.id;
    if (!relId) {
      toast.error('No se encontró la relación.');
      return;
    }
    try {
      setActing(true);
      await cambiarEstadoRelacionAPI(relId, nuevoEstado);
      toast.success(
        nuevoEstado === 'activo'
          ? 'Estudiante aceptado y vinculado.'
          : 'Solicitud rechazada.',
      );
      setModal({ open: false, student: null });
      await cargar();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'No se pudo procesar la solicitud.');
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1500px] px-1 py-8 text-slate-900">
      {/* encabezado */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
            Gestión de cátedra
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 lg:text-3xl">
            Mis Estudiantes
          </h1>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            Supervisa el avance académico, entregables y solicitudes de
            vinculación de tus tesistas.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Exportar listado
          </button>
          <button
            type="button"
            onClick={() => setShowCodeModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-500/30 transition hover:bg-blue-700"
          >
            <UserPlus className="h-4 w-4" />
            Vincular estudiante
          </button>
        </div>
      </div>

      {/* card principal */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {/* toolbar */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1">
            {TABS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => {
                  setTab(t.value);
                  setPage(0);
                }}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  tab === t.value
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.label}
                <span className="ml-1 text-slate-400">{tabCounts[t.value]}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                placeholder="Buscar por nombre, correo o tema…"
                className="w-full rounded-full border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <select
              value={carrera}
              onChange={(e) => {
                setCarrera(e.target.value);
                setPage(0);
              }}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none"
            >
              <option value="todas">Carrera: Todas</option>
              {carreras.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* tabla */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-3 py-3">Estudiante / carrera</th>
                <th className="px-3 py-3">Tema de tesis</th>
                <th className="px-3 py-3">Estado</th>
                <th className="px-3 py-3">Avance</th>
                <th className="px-3 py-3">Última / próx. sesión</th>
                <th className="px-3 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-3 py-14 text-center text-sm text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cargando estudiantes…
                    </span>
                  </td>
                </tr>
              )}

              {!loading && pageRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-14 text-center text-sm text-slate-500">
                    {students.length === 0 ? (
                      <>
                        Todavía no tienes estudiantes vinculados.
                        {codigo && (
                          <>
                            {' '}
                            Comparte tu código{' '}
                            <button
                              type="button"
                              onClick={copiarCodigo}
                              className="font-bold text-blue-600 hover:underline"
                            >
                              {codigo}
                            </button>{' '}
                            para que se unan.
                          </>
                        )}
                      </>
                    ) : (
                      'Ningún estudiante coincide con los filtros.'
                    )}
                  </td>
                </tr>
              )}

              {!loading &&
                pageRows.map((row) => {
                  const nombre = fullName(row) || 'Estudiante';
                  const est = estadoEstudiante(row);
                  const pendiente = estadoRel(row) === 'pendiente';
                  const rowId = row.r_relacion_id || row.id;
                  return (
                    <tr
                      key={rowId}
                      className="border-b border-slate-50 text-sm transition hover:bg-slate-50/60"
                    >
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarColor(
                              nombre,
                            )}`}
                          >
                            {initials(nombre)}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900">{nombre}</p>
                            <p className="truncate text-xs text-slate-500">
                              {row.r_email || 'Sin correo'}
                              {row.r_carrera ? ` · ${row.r_carrera}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[220px] px-3 py-4 text-slate-600">
                        <span className="line-clamp-2">
                          {row.r_tesis_titulo || 'Sin tesis registrada'}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${est.cls}`}
                        >
                          {est.dot && (
                            <span className={`h-1.5 w-1.5 rounded-full ${est.dot}`} />
                          )}
                          {est.label}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <AvanceBar pct={row.r_avance_pct} fuente={row.r_avance_fuente} />
                      </td>
                      <td className="px-3 py-4">
                        <SesionCell row={row} />
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {pendiente ? (
                            <button
                              type="button"
                              onClick={() => setModal({ open: true, student: row })}
                              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
                            >
                              Evaluar solicitud
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/advisor/students/${row.r_estudiante_id}`)
                              }
                              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              Ver avance
                            </button>
                          )}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setMenuOpen(menuOpen === rowId ? null : rowId)
                              }
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                              aria-label="Más acciones"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            {menuOpen === rowId && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setMenuOpen(null)}
                                />
                                <div className="absolute right-0 top-9 z-20 w-44 rounded-xl border border-slate-200 bg-white py-1 text-xs shadow-lg">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMenuOpen(null);
                                      navigate(
                                        `/advisor/students/${row.r_estudiante_id}`,
                                      );
                                    }}
                                    className="block w-full px-3 py-2 text-left font-medium text-slate-700 hover:bg-slate-50"
                                  >
                                    Ver ficha completa
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMenuOpen(null);
                                      navigate('/advisor/thesis');
                                    }}
                                    className="block w-full px-3 py-2 text-left font-medium text-slate-700 hover:bg-slate-50"
                                  >
                                    Ir a revisión de tesis
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMenuOpen(null);
                                      navigate('/advisor/calendar');
                                    }}
                                    className="block w-full px-3 py-2 text-left font-medium text-slate-700 hover:bg-slate-50"
                                  >
                                    Agendar sesión
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* paginación */}
        {!loading && filtered.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>
              Mostrando{' '}
              <span className="font-semibold text-slate-800">
                {safePage * PAGE_SIZE + 1}-
                {Math.min((safePage + 1) * PAGE_SIZE, filtered.length)}
              </span>{' '}
              de <span className="font-semibold text-slate-800">{filtered.length}</span>{' '}
              estudiante(s)
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={safePage === 0}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={safePage >= totalPages - 1}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* modal: evaluar solicitud */}
      <Modal
        open={modal.open}
        onClose={() => !acting && setModal({ open: false, student: null })}
        showDefaultHeader={false}
        primaryAction={{
          label: acting ? 'Procesando…' : 'Aceptar estudiante',
          onClick: () => responderSolicitud('activo'),
          disabled: acting,
        }}
        secondaryAction={{
          label: 'Rechazar',
          onClick: () => responderSolicitud('cancelado'),
          disabled: acting,
        }}
      >
        {modal.student && (
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Solicitud pendiente
            </span>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${avatarColor(
                  fullName(modal.student),
                )}`}
              >
                {initials(fullName(modal.student) || 'ES')}
              </span>
              <div className="min-w-0">
                <p className="font-bold text-slate-900">
                  {fullName(modal.student) || 'Estudiante'}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {[
                    modal.student.r_carrera,
                    modal.student.r_universidad_nombre,
                  ]
                    .filter(Boolean)
                    .join(' · ') || modal.student.r_email || 'Sin datos de perfil'}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Tema de tesis
              </p>
              <p className="mt-1 font-bold text-slate-900">
                {modal.student.r_tesis_titulo || 'Aún sin tesis registrada'}
              </p>
              {modal.student.r_tesis_descripcion && (
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  {modal.student.r_tesis_descripcion}
                </p>
              )}
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                {modal.student.r_email || 'Sin correo'}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* modal: vincular estudiante (código público) */}
      <Modal
        open={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        title="Vincular estudiante"
        subtitle="Los estudiantes se vinculan ingresando tu código público en su panel. Compártelo con ellos."
        primaryAction={{ label: 'Entendido', onClick: () => setShowCodeModal(false) }}
      >
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Tu código público
          </p>
          <p className="mt-2 text-3xl font-black tracking-[0.25em] text-slate-900">
            {codigo || 'Sin código'}
          </p>
          <button
            type="button"
            onClick={copiarCodigo}
            disabled={!codigo}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            <Copy className="h-3.5 w-3.5" />
            Copiar código
          </button>
          <p className="mt-3 text-xs text-slate-500">
            Puedes regenerarlo desde el menú de tu perfil. Las solicitudes
            entrantes aparecen aquí como “Pendiente aceptación”.
          </p>
        </div>
      </Modal>
    </div>
  );
}

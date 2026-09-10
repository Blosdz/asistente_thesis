import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  CheckCircle2,
  Download,
  Loader2,
  MapPin,
  Search,
  Video,
  XCircle,
} from 'lucide-react';
import { crearGoogleMeetAdmin } from '../../services/googleMeetService';
import { responderReservaCita } from '../../services/advisorService';

/* ---------- paleta de estados de reserva (compartida con el calendario) ---------- */
export const RESERVA_UI = {
  pending: {
    dot: 'bg-amber-500',
    chip: 'bg-amber-50 border-amber-200 text-amber-800',
    badge: 'bg-amber-100 text-amber-800',
    label: 'Pendiente',
  },
  approved: {
    dot: 'bg-blue-500',
    chip: 'bg-blue-50 border-blue-200 text-blue-800',
    badge: 'bg-blue-100 text-blue-800',
    label: 'Aprobada',
  },
  payment_pending: {
    dot: 'bg-blue-500',
    chip: 'bg-blue-50 border-blue-200 text-blue-800',
    badge: 'bg-blue-100 text-blue-800',
    label: 'Pago pendiente',
  },
  confirmed: {
    dot: 'bg-emerald-500',
    chip: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    badge: 'bg-emerald-100 text-emerald-800',
    label: 'Confirmada',
  },
  paid: {
    dot: 'bg-violet-500',
    chip: 'bg-violet-50 border-violet-200 text-violet-800',
    badge: 'bg-violet-100 text-violet-800',
    label: 'Pagada',
  },
  rejected: {
    dot: 'bg-rose-400',
    chip: 'bg-rose-50 border-rose-200 text-rose-700',
    badge: 'bg-rose-100 text-rose-700',
    label: 'Rechazada',
  },
  cancelled: {
    dot: 'bg-slate-400',
    chip: 'bg-slate-100 border-slate-200 text-slate-600',
    badge: 'bg-slate-200 text-slate-700',
    label: 'Cancelada',
  },
};

export const reservaUi = (status) =>
  RESERVA_UI[status] || {
    dot: 'bg-slate-400',
    chip: 'bg-slate-50 border-slate-200 text-slate-700',
    badge: 'bg-slate-100 text-slate-700',
    label: status ? status.replaceAll('_', ' ') : '—',
  };

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
];

export const initialsFrom = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'E';

export const avatarColor = (seed = '') => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = seed.charCodeAt(i) + (hash << 5) - hash;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const dateFormatter = new Intl.DateTimeFormat('es-PE', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});
const timeFormatter = new Intl.DateTimeFormat('es-PE', {
  hour: '2-digit',
  minute: '2-digit',
});

const formatFecha = (value) => (value ? dateFormatter.format(new Date(value)) : 'Sin fecha');
const formatRango = (item) => {
  if (!item.start_at) return 'Sin horario';
  const inicio = timeFormatter.format(new Date(item.start_at));
  const fin = item.end_at ? timeFormatter.format(new Date(item.end_at)) : null;
  const dur = item.duration_minutes ? ` (${item.duration_minutes} min)` : '';
  return fin ? `${inicio} - ${fin}${dur}` : `${inicio}${dur}`;
};

const inferServiceType = (item) =>
  item?.tipo_servicio ||
  (String(item?.motivo || '').toLowerCase().includes('pre-sustent')
    ? 'presustentacion'
    : 'asesoria');

export const serviceTypeLabel = (item) =>
  inferServiceType(item) === 'presustentacion' ? 'Pre-sustentación' : 'Asesoría';

const shouldCreateMeetForReservation = (item, result) =>
  result?.accion === 'aceptada_por_plan' &&
  item?.modalidad === 'virtual' &&
  Boolean(result?.reunion_id) &&
  !item?.enlace_reunion;

const buildMeetPayload = (item, result) => ({
  reunion_id: result?.reunion_id,
  validation_cita_id: item?.validation_cita_id,
  advisor_id: item?.advisor_id || null,
  student_id: item?.estudiante_id || null,
  student_name: item?.estudiante_nombre || null,
  thesis_id: item?.tesis_id || null,
  thesis_title: item?.tesis_titulo || null,
  start_at: item?.start_at || null,
  end_at: item?.end_at || null,
  motivo: item?.motivo || null,
  notas: item?.notas || null,
  modalidad: item?.modalidad || 'virtual',
  location: item?.lugar || null,
  description:
    result?.mensaje ||
    'Reunión creada automáticamente para una cita aprobada con el plan del estudiante.',
});

const getActionSuccessMessage = (result, accion) => {
  if (result?.mensaje) return result.mensaje;
  if (accion !== 'aceptar') return 'Solicitud rechazada correctamente';

  if (result?.accion === 'aceptada_por_plan') {
    if (typeof result?.asesorias_restantes === 'number') {
      return `Solicitud aceptada con el plan del estudiante. Quedan ${result.asesorias_restantes} asesoría(s) disponibles.`;
    }
    if (typeof result?.presustentaciones_restantes === 'number') {
      return `Solicitud aceptada con el plan del estudiante. Quedan ${result.presustentaciones_restantes} pre-sustentación(es) disponibles.`;
    }
    return 'Solicitud aceptada con el plan del estudiante, sin pago adicional.';
  }
  if (result?.accion === 'pendiente_pago') {
    return 'Solicitud aceptada. El estudiante debe completar el pago para confirmar la cita.';
  }
  return 'Solicitud aceptada correctamente';
};

export function ReservaStatusBadge({ status }) {
  const ui = reservaUi(status);
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${ui.badge}`}
    >
      {ui.label}
    </span>
  );
}

/**
 * Botones aceptar / rechazar una reserva pendiente. Compartido por la tabla y
 * por el panel del día del calendario. Devuelve null si la reserva no está
 * pendiente.
 */
export function ReservaActions({ item, onChanged, className = '' }) {
  const [acting, setActing] = useState(false);
  if (item.status !== 'pending') return null;

  const run = async (accion) => {
    try {
      setActing(true);
      const result = await responderReservaCita(item.validation_cita_id, accion);
      let message = getActionSuccessMessage(result, accion);
      if (shouldCreateMeetForReservation(item, result)) {
        const meetResult = await crearGoogleMeetAdmin(buildMeetPayload(item, result));
        message = meetResult?.enlace_reunion
          ? 'Solicitud aceptada con el plan y Google Meet creado correctamente.'
          : message;
      }
      toast.success(message);
      await onChanged?.();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'No se pudo procesar la solicitud');
    } finally {
      setActing(false);
    }
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <button
        type="button"
        disabled={acting}
        onClick={() => run('aceptar')}
        className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        Aceptar
      </button>
      <button
        type="button"
        disabled={acting}
        onClick={() => run('rechazar')}
        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
      >
        <XCircle className="h-3.5 w-3.5" />
        Rechazar
      </button>
    </div>
  );
}

function ModalidadCell({ item }) {
  const virtual = (item.modalidad || 'virtual') === 'virtual';
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
      {virtual ? (
        <>
          <Video className="h-3 w-3 text-blue-500" />
          Google Meet
        </>
      ) : (
        <>
          <MapPin className="h-3 w-3 text-emerald-600" />
          Presencial{item.lugar ? ` (${item.lugar})` : ''}
        </>
      )}
    </span>
  );
}

const TABS = [
  { value: 'all', label: 'Todas', match: () => true },
  { value: 'pending', label: 'Pendientes', match: (s) => s === 'pending' },
  {
    value: 'approved',
    label: 'Aprobadas',
    match: (s) => s === 'approved' || s === 'payment_pending',
  },
  {
    value: 'finalizadas',
    label: 'Finalizadas',
    match: (s) => s === 'confirmed' || s === 'paid',
  },
  {
    value: 'rejected',
    label: 'Rechazadas',
    match: (s) => s === 'rejected' || s === 'cancelled',
  },
];

const SORTS = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'date', label: 'Fecha de cita' },
  { value: 'student', label: 'Estudiante' },
];

const PAGE_SIZE = 8;

const csvEscape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;

const exportCsv = (rows) => {
  const header = [
    'Estudiante',
    'Tesis',
    'Fecha',
    'Inicio',
    'Fin',
    'Duracion_min',
    'Motivo',
    'Modalidad',
    'Estado',
  ];
  const body = rows.map((item) =>
    [
      item.estudiante_nombre,
      item.tesis_titulo,
      item.start_at ? new Date(item.start_at).toLocaleDateString('es-PE') : '',
      item.start_at ? new Date(item.start_at).toLocaleTimeString('es-PE') : '',
      item.end_at ? new Date(item.end_at).toLocaleTimeString('es-PE') : '',
      item.duration_minutes,
      item.motivo,
      item.modalidad,
      reservaUi(item.status).label,
    ]
      .map(csvEscape)
      .join(','),
  );
  const blob = new Blob([[header.join(','), ...body].join('\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reservas-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export default function ReservationsPanel({
  reservas = [],
  loading = false,
  onChanged,
}) {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(0);

  const tabCounts = useMemo(() => {
    const counts = {};
    TABS.forEach((t) => {
      counts[t.value] = reservas.filter((item) => t.match(item.status)).length;
    });
    return counts;
  }, [reservas]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const activeTab = TABS.find((t) => t.value === tab) || TABS[0];
    const rows = reservas
      .filter((item) => activeTab.match(item.status))
      .filter((item) =>
        !query
          ? true
          : [item.estudiante_nombre, item.tesis_titulo, item.motivo, item.status]
              .filter(Boolean)
              .some((value) => value.toLowerCase().includes(query)),
      );

    const sorted = [...rows];
    if (sort === 'date') {
      sorted.sort(
        (a, b) => new Date(b.start_at || 0).getTime() - new Date(a.start_at || 0).getTime(),
      );
    } else if (sort === 'student') {
      sorted.sort((a, b) =>
        (a.estudiante_nombre || '').localeCompare(b.estudiante_nombre || ''),
      );
    } else {
      sorted.sort(
        (a, b) =>
          new Date(b.created_at || b.start_at || 0).getTime() -
          new Date(a.created_at || a.start_at || 0).getTime(),
      );
    }
    return sorted;
  }, [reservas, tab, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  return (
    <section className="space-y-4">
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              Registro integral
            </span>
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
              Solicitudes y citas de tus estudiantes
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 p-1">
            {TABS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => {
                  setTab(t.value);
                  setPage(0);
                }}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                  tab === t.value
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
                {t.value !== 'all' && tabCounts[t.value] > 0 && (
                  <span
                    className={`ml-1 ${
                      tab === t.value ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    ({tabCounts[t.value]})
                  </span>
                )}
                {t.value === 'all' && ` (${tabCounts.all})`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 border-t border-slate-100 pt-3 sm:flex-row">
          <div className="relative w-full flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              placeholder="Buscar por estudiante, tesis o motivo de cita…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none"
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  Ordenar por: {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => exportCsv(filtered)}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Estudiante &amp; tesis</th>
                <th className="px-5 py-3.5">Fecha &amp; horario</th>
                <th className="px-5 py-3.5">Tema de asesoría</th>
                <th className="px-5 py-3.5">Modalidad</th>
                <th className="px-5 py-3.5">Estado</th>
                <th className="px-5 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading && (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cargando reservas…
                    </span>
                  </td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-slate-500">
                    {reservas.length === 0
                      ? 'Todavía no tienes reservas. Aparecerán aquí cuando un estudiante reserve una cita en tus espacios de disponibilidad.'
                      : 'No hay reservas para este filtro.'}
                  </td>
                </tr>
              )}

              {!loading &&
                pageRows.map((item) => (
                  <tr
                    key={item.validation_cita_id}
                    className={`transition-colors hover:bg-slate-50/80 ${
                      item.status === 'pending' ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${avatarColor(
                            item.estudiante_nombre || item.validation_cita_id,
                          )}`}
                        >
                          {initialsFrom(item.estudiante_nombre)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900">
                            {item.estudiante_nombre || 'Estudiante'}
                          </div>
                          <div className="truncate text-[11px] text-slate-400">
                            {item.tesis_titulo || 'Sin tesis asociada'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-bold text-slate-800">
                        {formatFecha(item.start_at)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {formatRango(item)}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-semibold text-slate-800">
                        {item.motivo || serviceTypeLabel(item)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {serviceTypeLabel(item)}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <ModalidadCell item={item} />
                    </td>
                    <td className="px-5 py-3">
                      <ReservaStatusBadge status={item.status} />
                      {item.status === 'approved' && !item.payment_id && (
                        <p className="mt-1 text-[11px] font-semibold text-cyan-700">
                          Cubierta por plan
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status === 'pending' ? (
                          <ReservaActions item={item} onChanged={onChanged} />
                        ) : item.enlace_reunion ? (
                          <a
                            href={item.enlace_reunion}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800 transition hover:bg-slate-200"
                          >
                            Unirse
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-4 text-xs text-slate-500">
            <div>
              Mostrando{' '}
              <span className="font-semibold text-slate-800">
                {safePage * PAGE_SIZE + 1}-
                {Math.min((safePage + 1) * PAGE_SIZE, filtered.length)}
              </span>{' '}
              de <span className="font-semibold text-slate-800">{filtered.length}</span>{' '}
              cita(s)
            </div>
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
    </section>
  );
}

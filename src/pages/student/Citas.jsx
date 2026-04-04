import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  ExternalLink,
  MapPin,
  Video,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card } from '../../components/ui/card';
import Modal from '../../components/ui/modal';
import { obtenerHistorialValidacionesCitaEstudiante } from '../../services/dashboardService';

const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const formatterMes = new Intl.DateTimeFormat('es-PE', {
  month: 'long',
  year: 'numeric',
});

const formatterDiaNumero = new Intl.DateTimeFormat('es-PE', {
  day: 'numeric',
});

const formatterDiaLargo = new Intl.DateTimeFormat('es-PE', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
});

const formatterFechaHora = new Intl.DateTimeFormat('es-PE', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  hour: 'numeric',
  minute: '2-digit',
});

const formatterHora = new Intl.DateTimeFormat('es-PE', {
  hour: 'numeric',
  minute: '2-digit',
});

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date, months) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function startOfWeekMonday(date) {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(date, diff);
}

function endOfWeekSunday(date) {
  return addDays(startOfWeekMonday(date), 6);
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function toKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function estadoBadgeClass(estado) {
  switch (estado) {
    case 'confirmed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'approved':
      return 'bg-cyan-50 text-cyan-700 border-cyan-100';
    case 'payment_pending':
      return 'bg-blue-50 text-blue-700 border-blue-100';
    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-100';
    case 'rejected':
      return 'bg-rose-50 text-rose-700 border-rose-100';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

function estadoTexto(estado) {
  return (estado || 'sin_estado').replaceAll('_', ' ');
}

export default function Citas() {
  const navigate = useNavigate();
  const [viewDate, setViewDate] = useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCitaId, setSelectedCitaId] = useState(null);

  useEffect(() => {
    const cargarCitas = async () => {
      try {
        setLoading(true);
        const data = await obtenerHistorialValidacionesCitaEstudiante();
        setCitas(data ?? []);

        if (!isSameMonth(selectedDate, viewDate)) {
          setSelectedDate(startOfMonth(viewDate));
        }
      } catch (error) {
        console.error('Error cargando citas:', error);
        toast.error('No se pudieron cargar tus solicitudes de cita.');
      } finally {
        setLoading(false);
      }
    };

    cargarCitas();
  }, [viewDate]);

  const selectedCita = useMemo(
    () =>
      citas.find((cita) => cita.validation_cita_id === selectedCitaId) || null,
    [citas, selectedCitaId],
  );

  const calendarDays = useMemo(() => {
    const first = startOfWeekMonday(startOfMonth(viewDate));
    const last = endOfWeekSunday(endOfMonth(viewDate));
    const days = [];
    let cursor = new Date(first);

    while (cursor <= last) {
      days.push(new Date(cursor));
      cursor = addDays(cursor, 1);
    }

    return days;
  }, [viewDate]);

  const citasPorDia = useMemo(() => {
    return citas.reduce((acc, cita) => {
      const key = toKey(new Date(cita.start_at));
      if (!acc[key]) acc[key] = [];
      acc[key].push(cita);
      return acc;
    }, {});
  }, [citas]);

  const citasDelDia = useMemo(() => {
    return citasPorDia[toKey(selectedDate)] ?? [];
  }, [citasPorDia, selectedDate]);

  const proximaCita = useMemo(() => {
    const now = Date.now();
    return (
      citas.find((cita) => {
        const inicio = new Date(cita.start_at).getTime();
        return (
          inicio >= now &&
          ['pending', 'approved', 'payment_pending', 'confirmed'].includes(
            cita.status,
          )
        );
      }) ?? null
    );
  }, [citas]);

  return (
    <div className="w-full flex-1 px-4 py-12 text-slate-900 sm:px-6 lg:px-10">
      <main className="mx-auto w-full max-w-7xl">
        <div className="mb-8 flex flex-col gap-4">
          <button
            type="button"
            onClick={() => navigate('/student/dashboard')}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al dashboard
          </button>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
              Citas
            </p>
            <h1 className="font-['Ubuntu'] text-4xl font-bold tracking-tight text-slate-900">
              Calendario de solicitudes y citas
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-500">
              Aquí verás tus solicitudes pendientes, pagos por completar y citas
              ya confirmadas.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <Card className="lg:col-span-8 rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold capitalize text-slate-900">
                  {formatterMes.format(viewDate)}
                </h2>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setViewDate((current) => addMonths(current, -1))}
                    className="rounded-full border border-slate-200 p-2 transition-colors hover:bg-slate-50"
                    aria-label="Mes anterior"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewDate((current) => addMonths(current, 1))}
                    className="rounded-full border border-slate-200 p-2 transition-colors hover:bg-slate-50"
                    aria-label="Mes siguiente"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <Link
                to="/student/asesorias"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
              >
                <CalendarDays size={16} />
                Nueva solicitud
              </Link>
            </div>

            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              {diasSemana.map((day) => (
                <div
                  key={day}
                  className="bg-white py-4 text-center text-xs font-bold uppercase tracking-[0.15em] text-slate-500"
                >
                  {day}
                </div>
              ))}

              {calendarDays.map((day) => {
                const key = toKey(day);
                const items = citasPorDia[key] ?? [];
                const isCurrentMonth = isSameMonth(day, viewDate);
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDate(day)}
                    className={[
                      'min-h-[118px] bg-white p-3 text-left transition',
                      isCurrentMonth
                        ? 'text-slate-800 hover:bg-slate-50'
                        : 'text-slate-300',
                      isSelected ? 'ring-2 ring-blue-500 ring-inset' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className={[
                          'inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                          isToday ? 'bg-blue-600 text-white' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {formatterDiaNumero.format(day)}
                      </span>
                      {items.length > 0 && (
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
                          {items.length}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 space-y-2">
                      {items.slice(0, 2).map((item) => (
                        <div
                          key={item.validation_cita_id}
                          className={`rounded-xl border px-2 py-1.5 text-[11px] font-semibold ${estadoBadgeClass(
                            item.status,
                          )}`}
                        >
                          {formatterHora.format(new Date(item.start_at))}
                        </div>
                      ))}
                      {items.length > 2 && (
                        <p className="text-[11px] font-semibold text-slate-500">
                          +{items.length - 2} más
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <aside className="space-y-6 lg:col-span-4">
            <Card className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                Día seleccionado
              </p>
              <h3 className="mt-2 text-2xl font-bold capitalize text-slate-900">
                {formatterDiaLargo.format(selectedDate)}
              </h3>

              <div className="mt-6 space-y-3">
                {loading ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                    Cargando solicitudes...
                  </div>
                ) : citasDelDia.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                    No hay citas o solicitudes para este día.
                  </div>
                ) : (
                  citasDelDia.map((cita) => (
                    <button
                      key={cita.validation_cita_id}
                      type="button"
                      onClick={() => setSelectedCitaId(cita.validation_cita_id)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-left transition hover:bg-slate-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {cita.advisor_nombre || 'Asesor asignado'}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatterHora.format(new Date(cita.start_at))} -{' '}
                            {formatterHora.format(new Date(cita.end_at))}
                          </p>
                        </div>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${estadoBadgeClass(
                            cita.status,
                          )}`}
                        >
                          {estadoTexto(cita.status)}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </Card>

            <Card className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                Próximo estado activo
              </p>

              {proximaCita ? (
                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-lg font-bold text-slate-900">
                      {proximaCita.advisor_nombre || 'Asesor asignado'}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatterFechaHora.format(new Date(proximaCita.start_at))}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock3 className="h-4 w-4" />
                    {formatterHora.format(new Date(proximaCita.start_at))} -{' '}
                    {formatterHora.format(new Date(proximaCita.end_at))}
                  </div>

                  <span
                    className={`inline-flex w-fit rounded-full border px-3 py-1 text-[10px] font-bold uppercase ${estadoBadgeClass(
                      proximaCita.status,
                    )}`}
                  >
                    {estadoTexto(proximaCita.status)}
                  </span>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  No se encontraron citas próximas en este rango.
                </p>
              )}
            </Card>
          </aside>
        </div>
      </main>

      <Modal
        open={Boolean(selectedCitaId)}
        onClose={() => setSelectedCitaId(null)}
        title={selectedCita?.advisor_nombre || 'Detalle de la solicitud'}
        subtitle="Información de la cita"
        primaryAction={{
          label: 'Cerrar',
          onClick: () => setSelectedCitaId(null),
        }}
      >
        <div className="space-y-4 text-left">
          {selectedCita ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Fecha
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {formatterFechaHora.format(new Date(selectedCita.start_at))}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Estado
                  </p>
                  <p className="mt-2 text-sm font-semibold capitalize text-slate-900">
                    {estadoTexto(selectedCita.status)}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
                  <Clock3 className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                      Horario
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      {formatterHora.format(new Date(selectedCita.start_at))} -{' '}
                      {formatterHora.format(new Date(selectedCita.end_at))}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
                  {selectedCita.modalidad === 'virtual' ? (
                    <Video className="h-4 w-4 text-slate-400" />
                  ) : (
                    <MapPin className="h-4 w-4 text-slate-400" />
                  )}
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                      Modalidad
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      {selectedCita.modalidad || 'No especificada'}
                    </p>
                  </div>
                </div>
              </div>

              {selectedCita.motivo && (
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    Motivo
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    {selectedCita.motivo}
                  </p>
                </div>
              )}

              {selectedCita.notas && (
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    Notas
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    {selectedCita.notas}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                {selectedCita.status === 'payment_pending' && (
                  <Link
                    to="/student/payments"
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    <CreditCard className="h-4 w-4" />
                    Ir a pagos
                  </Link>
                )}

                {selectedCita.status === 'confirmed' &&
                  selectedCita.enlace_reunion && (
                    <a
                      href={selectedCita.enlace_reunion}
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Abrir reunión
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}

                {selectedCita.status === 'approved' && (
                  <div className="flex-1 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-center text-sm font-semibold text-cyan-800">
                    Tu solicitud fue aprobada y está en proceso de confirmación final.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
              No se encontró información para esta cita.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

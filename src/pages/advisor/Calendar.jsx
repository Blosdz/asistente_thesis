import { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  PlusCircle,
  Repeat,
  Trash2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import Modal from '../../components/ui/modal';
import {
  crearEspacioLibreAsesor,
  desactivarEspacioLibreAsesor,
  obtenerMisEspaciosLibresAsesor,
} from '../../services/advisorService';

const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const formatterMes = new Intl.DateTimeFormat('es-PE', {
  month: 'long',
  year: 'numeric',
});

const formatterHora = new Intl.DateTimeFormat('es-PE', {
  hour: 'numeric',
  minute: '2-digit',
});

const formatterFecha = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: 'short',
});

const formatterDiaLargo = new Intl.DateTimeFormat('es-PE', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
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

function toDayKey(date) {
  return date.toISOString().slice(0, 10);
}

function toDateTimeLocalInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getDefaultStart() {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + 1);
  return now;
}

function getDefaultEnd() {
  const end = getDefaultStart();
  end.setMinutes(end.getMinutes() + 30);
  return end;
}

const initialForm = () => ({
  inicio: toDateTimeLocalInputValue(getDefaultStart()),
  fin: toDateTimeLocalInputValue(getDefaultEnd()),
  usaBloques: true,
  duracionBloqueMinutos: 30,
  recurrente: false,
  diaSemana: '',
  fechaInicio: '',
  fechaFin: '',
});

function sincronizarFinConBloque(inicioValue, duracionBloqueMinutos) {
  if (!inicioValue) return '';

  const inicio = new Date(inicioValue);
  if (Number.isNaN(inicio.getTime())) return '';

  const minutos = Math.max(Number(duracionBloqueMinutos) || 0, 1);
  const fin = new Date(inicio.getTime() + minutos * 60 * 1000);
  return toDateTimeLocalInputValue(fin);
}

function EstadoBadge({ activo }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
        activo === false
          ? 'bg-rose-50 text-rose-700'
          : 'bg-emerald-50 text-emerald-700'
      }`}
    >
      {activo === false ? 'Inactivo' : 'Activo'}
    </span>
  );
}

export default function AdvisorCalendar() {
  const [viewDate, setViewDate] = useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [espacios, setEspacios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [desactivandoId, setDesactivandoId] = useState(null);
  const [form, setForm] = useState(initialForm);

  const cargarEspacios = async () => {
    try {
      setLoading(true);
      const data = await obtenerMisEspaciosLibresAsesor();
      setEspacios(data ?? []);
    } catch (error) {
      console.error('Error cargando espacios libres:', error);
      toast.error('No se pudieron cargar tus espacios libres.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEspacios();
  }, []);

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

  const espaciosPorDia = useMemo(() => {
    return espacios.reduce((acc, espacio) => {
      const key = toDayKey(new Date(espacio.inicio));
      if (!acc[key]) acc[key] = [];
      acc[key].push(espacio);
      return acc;
    }, {});
  }, [espacios]);

  const espaciosDelDia = useMemo(
    () => espaciosPorDia[toDayKey(selectedDate)] ?? [],
    [espaciosPorDia, selectedDate],
  );

  const espaciosActivos = useMemo(
    () => espacios.filter((espacio) => espacio.activo !== false),
    [espacios],
  );

  const proximosEspacios = useMemo(() => {
    const now = Date.now();
    return espaciosActivos
      .filter((espacio) => new Date(espacio.fin).getTime() >= now)
      .slice(0, 5);
  }, [espaciosActivos]);

  const horasDisponibles = useMemo(() => {
    const totalMs = espaciosActivos.reduce((total, espacio) => {
      const inicio = new Date(espacio.inicio).getTime();
      const fin = new Date(espacio.fin).getTime();
      return total + Math.max(fin - inicio, 0);
    }, 0);

    return `${(totalMs / (1000 * 60 * 60)).toFixed(1)} h`;
  }, [espaciosActivos]);

  const previewConfig = useMemo(() => {
    if (!form.inicio || !form.fin) {
      return {
        valido: false,
        mensaje: 'Completa la hora de inicio y fin para ver la vista previa.',
        bloques: [],
      };
    }

    const inicio = new Date(form.inicio);
    const fin = new Date(form.fin);

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
      return {
        valido: false,
        mensaje: 'El rango horario no es válido.',
        bloques: [],
      };
    }

    if (fin <= inicio) {
      return {
        valido: false,
        mensaje: 'La hora final debe ser mayor que la inicial.',
        bloques: [],
      };
    }

    const duracionMinutos = Math.round((fin - inicio) / (1000 * 60));
    const bloques = [];

    if (form.usaBloques) {
      const bloqueMin = Math.max(Number(form.duracionBloqueMinutos) || 0, 1);
      let cursor = new Date(inicio);

      while (cursor < fin && bloques.length < 8) {
        const bloqueFin = new Date(
          cursor.getTime() + bloqueMin * 60 * 1000,
        );

        if (bloqueFin > fin) break;

        bloques.push(
          `${formatterHora.format(cursor)} - ${formatterHora.format(bloqueFin)}`,
        );
        cursor = bloqueFin;
      }
    }

    return {
      valido: true,
      duracionMinutos,
      mensaje: form.usaBloques
        ? `Se publicará una franja de ${duracionMinutos} minutos dividida en bloques de ${form.duracionBloqueMinutos} minutos.`
        : `Se publicará una sola franja continua de ${duracionMinutos} minutos.`,
      bloques,
    };
  }, [form]);

  const handleCreateSpace = async () => {
    if (!form.inicio || !form.fin) {
      toast.error('Completa la fecha y hora de inicio y fin.');
      return;
    }

    try {
      setCreating(true);
      await crearEspacioLibreAsesor({
        p_inicio: new Date(form.inicio).toISOString(),
        p_fin: new Date(form.fin).toISOString(),
        p_usa_bloques: form.usaBloques,
        p_duracion_bloque_minutos: Number(form.duracionBloqueMinutos),
        p_recurrente: form.recurrente,
        p_dia_semana:
          form.recurrente && form.diaSemana !== ''
            ? Number(form.diaSemana)
            : null,
        p_fecha_inicio:
          form.recurrente && form.fechaInicio ? form.fechaInicio : null,
        p_fecha_fin: form.recurrente && form.fechaFin ? form.fechaFin : null,
      });

      toast.success('Espacio libre creado correctamente.');
      setShowCreateModal(false);
      setForm(initialForm());
      await cargarEspacios();
    } catch (error) {
      console.error('Error creando espacio libre:', error);
      toast.error(error.message || 'No se pudo crear el espacio libre.');
    } finally {
      setCreating(false);
    }
  };

  const handleDesactivar = async (disponibilidadId) => {
    try {
      setDesactivandoId(disponibilidadId);
      await desactivarEspacioLibreAsesor(disponibilidadId);
      toast.success('Espacio libre desactivado.');
      await cargarEspacios();
    } catch (error) {
      console.error('Error desactivando espacio libre:', error);
      toast.error(error.message || 'No se pudo desactivar el espacio.');
    } finally {
      setDesactivandoId(null);
    }
  };

  const handleInicioChange = (value) => {
    setForm((prev) => ({
      ...prev,
      inicio: value,
      fin: prev.usaBloques
        ? sincronizarFinConBloque(value, prev.duracionBloqueMinutos)
        : prev.fin,
    }));
  };

  const handleDuracionChange = (value) => {
    setForm((prev) => ({
      ...prev,
      duracionBloqueMinutos: value,
      fin: prev.usaBloques
        ? sincronizarFinConBloque(prev.inicio, value)
        : prev.fin,
    }));
  };

  const handleUsaBloquesChange = (checked) => {
    setForm((prev) => ({
      ...prev,
      usaBloques: checked,
      fin: checked
        ? sincronizarFinConBloque(prev.inicio, prev.duracionBloqueMinutos)
        : prev.fin,
    }));
  };

  return (
    <div className="relative flex w-full flex-1 flex-col items-center overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-blue-100 blur-3xl" />
        <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-indigo-100 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-slate-100 blur-3xl" />
      </div>
      <div className="relative z-10 flex w-full max-w-[1480px] flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
                Calendario
              </p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Disponibilidad del asesor
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Crea espacios libres, revisa tu carga de disponibilidad y mantén
                una agenda clara para que los estudiantes reserven sin fricción.
              </p>
            </div>

            <Button
              className="group inline-flex w-full items-center justify-between rounded-2xl bg-blue-600 px-5 py-4 transition-colors hover:bg-blue-700 sm:w-auto sm:min-w-[220px]"
              onClick={() => setShowCreateModal(true)}
            >
              <span className="text-base font-bold text-white">
                Nuevo espacio
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 transition-colors group-hover:bg-white/30">
                <PlusCircle className="h-5 w-5 text-white" />
              </div>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <Card className="glass-panel lg:col-span-8 rounded-[32px] border border-white/60 bg-white/20 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)] sm:p-8">
            <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500/90">
                  Vista mensual
                </p>
                <h3 className="mt-2 text-2xl font-bold capitalize text-slate-900">
                  {formatterMes.format(viewDate)}
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Selecciona un día para revisar sus bloques y administrar tu
                  disponibilidad.
                </p>
              </div>
              <div className="flex gap-2 self-start sm:self-auto">
                <Button
                  variant="ghost"
                  className="rounded-full p-2 text-slate-600"
                  onClick={() => setViewDate((current) => addMonths(current, -1))}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  className="rounded-full p-2 text-slate-600"
                  onClick={() => setViewDate((current) => addMonths(current, 1))}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/50 bg-white/30 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Espacios activos
                </p>
                <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                  {espaciosActivos.length}
                </p>
              </div>
              <div className="rounded-2xl border border-white/50 bg-white/30 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Horas disponibles
                </p>
                <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                  {horasDisponibles}
                </p>
              </div>
              <div className="rounded-2xl border border-white/50 bg-white/30 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Día seleccionado
                </p>
                <p className="mt-2 text-sm font-bold capitalize text-slate-900">
                  {formatterDiaLargo.format(selectedDate)}
                </p>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-7 gap-2">
              {diasSemana.map((day) => (
                <div
                  key={day}
                  className="rounded-xl border border-white/30 bg-white/30 py-3 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 xl:gap-3">
              {calendarDays.map((day) => {
                const key = toDayKey(day);
                const items = espaciosPorDia[key] ?? [];
                const isCurrentMonth = isSameMonth(day, viewDate);
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDate(day)}
                    className={[
                      'relative min-h-[110px] rounded-[22px] border p-3 text-left transition-all lg:min-h-[130px]',
                      isSelected
                        ? 'border-blue-400 bg-blue-50/80 shadow-[0_10px_30px_rgba(37,99,235,0.10)]'
                        : 'border-white/40 bg-white/25 hover:border-white/60 hover:bg-white/35',
                      isCurrentMonth ? 'text-slate-700' : 'text-slate-300',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={[
                          'inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                          isToday ? 'bg-blue-600 text-white' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {day.getDate()}
                      </span>
                      {items.length > 0 && (
                        <span className="rounded-full bg-white/70 px-2 py-1 text-[10px] font-bold text-slate-500">
                          {items.length}
                        </span>
                      )}
                    </div>

                    {items.length > 0 && (
                      <div className="absolute bottom-3 left-3 right-3 space-y-1.5">
                        {items.slice(0, 2).map((item) => (
                          <div
                            key={item.disponibilidad_id}
                            className="truncate rounded-full bg-blue-100/90 px-2.5 py-1 text-[10px] font-bold text-blue-700"
                          >
                            {formatterHora.format(new Date(item.inicio))}
                          </div>
                        ))}
                        {items.length > 2 && (
                          <p className="text-[10px] font-bold text-slate-500">
                            +{items.length - 2} más
                          </p>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          <aside className="space-y-6 lg:col-span-4">
            <Card className="glass-panel rounded-[32px] border border-white/60 bg-white/20 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <div className="mb-4">
                <h4 className="text-xl font-bold text-slate-900">
                  Próximos espacios
                </h4>
                <p className="text-sm text-slate-500">
                  Tus siguientes ventanas activas de disponibilidad.
                </p>
              </div>

              <div className="space-y-4">
                {proximosEspacios.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/50 bg-white/20 p-4 text-sm text-slate-500">
                    Aún no tienes espacios futuros registrados.
                  </div>
                ) : (
                  proximosEspacios.map((espacio) => (
                    <div
                      key={espacio.disponibilidad_id}
                      className="rounded-2xl border border-white/50 bg-white/35 p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {formatterFecha.format(new Date(espacio.inicio))}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatterHora.format(new Date(espacio.inicio))} -{' '}
                            {formatterHora.format(new Date(espacio.fin))}
                          </p>
                        </div>
                        <EstadoBadge activo={espacio.activo} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="glass-panel rounded-[32px] border border-white/60 bg-white/20 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Espacios del día
                  </p>
                  <h4 className="mt-2 text-xl font-bold capitalize text-slate-900">
                    {formatterDiaLargo.format(selectedDate)}
                  </h4>
                </div>
                <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                  {espaciosDelDia.length}
                </div>
              </div>

              <div className="space-y-3">
                {loading ? (
                  <p className="text-sm text-slate-500">Cargando espacios...</p>
                ) : espaciosDelDia.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/50 bg-white/20 p-5 text-sm text-slate-500">
                    No tienes espacios registrados para este día. Crea una
                    franja libre para empezar a recibir reservas.
                  </div>
                ) : (
                  espaciosDelDia.map((espacio) => (
                    <div
                      key={espacio.disponibilidad_id}
                      className="rounded-2xl border border-white/50 bg-white/35 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
                            <Clock3 className="h-4 w-4 text-blue-600" />
                            {formatterHora.format(new Date(espacio.inicio))} -{' '}
                            {formatterHora.format(new Date(espacio.fin))}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {espacio.duracion_bloque_minutos} min por bloque
                          </p>
                        </div>
                        <EstadoBadge activo={espacio.activo} />
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="text-[11px] text-slate-500">
                          {espacio.recurrente ? (
                            <span className="inline-flex items-center gap-1">
                              <Repeat className="h-3.5 w-3.5" />
                              Recurrente
                            </span>
                          ) : (
                            'Única vez'
                          )}
                        </div>
                        {espacio.activo !== false && (
                          <button
                            type="button"
                            onClick={() =>
                              handleDesactivar(espacio.disponibilidad_id)
                            }
                            disabled={desactivandoId === espacio.disponibilidad_id}
                            className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 transition hover:text-rose-700 disabled:opacity-60"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {desactivandoId === espacio.disponibilidad_id
                              ? 'Desactivando...'
                              : 'Desactivar'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </aside>
        </div>
      </div>

      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear espacio libre"
        subtitle="Define la ventana de disponibilidad que verán tus estudiantes."
        primaryAction={{
          label: creating ? 'Guardando...' : 'Guardar espacio',
          onClick: handleCreateSpace,
        }}
        secondaryAction={{
          label: 'Cancelar',
          onClick: () => setShowCreateModal(false),
        }}
      >
        <div className="space-y-5 text-left">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
            <p className="text-sm font-semibold text-blue-900">
              Así verán tu disponibilidad los estudiantes
            </p>
            <p className="mt-2 text-sm leading-6 text-blue-800">
              Primero defines una franja, por ejemplo de 2:00 PM a 4:00 PM. Si
              activas bloques de 30 minutos, esa franja se convierte en citas
              como 2:00-2:30, 2:30-3:00, 3:00-3:30 y 3:30-4:00.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Inicio del espacio
            </label>
            <input
              type="datetime-local"
              value={form.inicio}
              onChange={(e) => handleInicioChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Fin del espacio
            </label>
            <input
              type="datetime-local"
              value={form.fin}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, fin: e.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Duración por bloque
            </label>
            <input
              type="number"
              min="5"
              step="5"
              value={form.duracionBloqueMinutos}
              onChange={(e) => handleDuracionChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
            <p className="mt-2 text-xs text-slate-500">
              Ejemplo: `30` crea bloques como 4:00-4:30, 4:30-5:00.
            </p>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={form.usaBloques}
                onChange={(e) => handleUsaBloquesChange(e.target.checked)}
              />
              Usar bloques
            </label>
          </div>
          </div>

          <div className="sm:col-span-2">
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={form.recurrente}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    recurrente: e.target.checked,
                  }))
                }
              />
              Repetir este espacio
            </label>
          </div>

          {form.recurrente && (
            <>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Día de semana
                </label>
                <select
                  value={form.diaSemana}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, diaSemana: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">Selecciona un día</option>
                  <option value="1">Lunes</option>
                  <option value="2">Martes</option>
                  <option value="3">Miércoles</option>
                  <option value="4">Jueves</option>
                  <option value="5">Viernes</option>
                  <option value="6">Sábado</option>
                  <option value="0">Domingo</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Fecha inicio recurrencia
                </label>
                <input
                  type="date"
                  value={form.fechaInicio}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, fechaInicio: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Fecha fin recurrencia
                </label>
                <input
                  type="date"
                  value={form.fechaFin}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, fechaFin: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </>
          )}

          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-sm font-semibold text-slate-900">
              Vista previa
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {previewConfig.mensaje}
            </p>

            {previewConfig.valido && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-white p-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Rango elegido
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {formatterHora.format(new Date(form.inicio))} -{' '}
                    {formatterHora.format(new Date(form.fin))}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Resultado
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {form.usaBloques
                      ? `${previewConfig.bloques.length || 0} bloque(s) visibles`
                      : '1 franja continua'}
                  </p>
                </div>
              </div>
            )}

            {form.usaBloques && previewConfig.bloques.length > 0 && (
              <div className="mt-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Ejemplo de bloques generados
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {previewConfig.bloques.map((bloque) => (
                    <span
                      key={bloque}
                      className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700"
                    >
                      {bloque}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

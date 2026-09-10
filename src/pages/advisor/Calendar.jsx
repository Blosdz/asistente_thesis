import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Info,
  List,
  Plus,
  Trash2,
  Video,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import './Calendar.css';
import {
  crearEspacioLibreAsesor,
  desactivarEspacioLibreAsesor,
  obtenerHistorialValidacionesCitaAsesor,
  obtenerMisEspaciosLibresAsesor,
} from '../../services/advisorService';
import ReservationsPanel, {
  avatarColor,
  initialsFrom,
  ReservaActions,
  reservaUi,
} from '../../components/advisor/ReservationsPanel';

const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DEFAULT_BLOCK_DURATION_MINUTES = 45;
const diasSemanaLargos = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

const formatterMes = new Intl.DateTimeFormat('es-PE', {
  month: 'long',
  year: 'numeric',
});
const formatterHora = new Intl.DateTimeFormat('es-PE', {
  hour: 'numeric',
  minute: '2-digit',
});
const formatterDiaLargo = new Intl.DateTimeFormat('es-PE', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
});
const formatterFechaCompleta = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone || 'GMT-5';

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
function localDayKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}
function getIsoDay(date) {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}
function combineDateAndTime(baseDate, timeSource) {
  const time = new Date(timeSource);
  const combined = new Date(baseDate);
  combined.setHours(
    time.getHours(),
    time.getMinutes(),
    time.getSeconds(),
    time.getMilliseconds(),
  );
  return combined;
}

function expandSpaceToOccurrences(space, rangeStart, rangeEnd) {
  if (!space) return [];

  const duracion =
    Number(space.duracion_bloque_minutos) || DEFAULT_BLOCK_DURATION_MINUTES;
  const usaBloques = space.usa_bloques !== false;
  const inicioBase = new Date(space.inicio);
  const finBase = new Date(space.fin);

  if (Number.isNaN(inicioBase.getTime()) || Number.isNaN(finBase.getTime())) {
    return [];
  }

  if (!space.recurrente) {
    return [
      {
        ...space,
        inicio_real: inicioBase,
        fin_real: finBase,
        duracion_bloque_minutos: duracion,
        usa_bloques: usaBloques,
      },
    ];
  }

  const fechaInicio = space.fecha_inicio ? new Date(space.fecha_inicio) : null;
  const fechaFin = space.fecha_fin ? new Date(space.fecha_fin) : null;
  const diaSemana = Number(space.dia_semana);

  if (!fechaInicio || !fechaFin || Number.isNaN(diaSemana)) {
    return [];
  }

  const start = new Date(
    Math.max(
      new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), fechaInicio.getDate()).getTime(),
      new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate()).getTime(),
    ),
  );
  const end = new Date(
    Math.min(
      new Date(fechaFin.getFullYear(), fechaFin.getMonth(), fechaFin.getDate()).getTime(),
      new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), rangeEnd.getDate()).getTime(),
    ),
  );

  const occurrences = [];
  let cursor = new Date(start);

  while (cursor <= end) {
    if (getIsoDay(cursor) === diaSemana) {
      const inicioReal = combineDateAndTime(cursor, inicioBase);
      let finReal = combineDateAndTime(cursor, finBase);

      if (finReal <= inicioReal) {
        finReal = addDays(finReal, 1);
      }

      occurrences.push({
        ...space,
        inicio_real: inicioReal,
        fin_real: finReal,
        duracion_bloque_minutos: duracion,
        usa_bloques: usaBloques,
      });
    }

    cursor = addDays(cursor, 1);
  }

  return occurrences;
}

function buildBlocksForOccurrence(occurrence) {
  const inicio = new Date(occurrence.inicio_real);
  const fin = new Date(occurrence.fin_real);

  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime()) || fin <= inicio) {
    return [];
  }

  if (!occurrence.usa_bloques) {
    return [{ inicio, fin }];
  }

  const duration = Math.max(Number(occurrence.duracion_bloque_minutos) || 0, 1);
  const blocks = [];
  let cursor = new Date(inicio);

  while (cursor < fin && blocks.length < 48) {
    const blockEnd = new Date(cursor.getTime() + duration * 60 * 1000);
    if (blockEnd > fin) break;
    blocks.push({ inicio: new Date(cursor), fin: blockEnd });
    cursor = blockEnd;
  }

  return blocks;
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
  end.setMinutes(end.getMinutes() + DEFAULT_BLOCK_DURATION_MINUTES);
  return end;
}

const initialForm = () => ({
  inicio: toDateTimeLocalInputValue(getDefaultStart()),
  fin: toDateTimeLocalInputValue(getDefaultEnd()),
  usaBloques: true,
  duracionBloqueMinutos: DEFAULT_BLOCK_DURATION_MINUTES,
  recurrente: false,
  diasSemana: [],
  fechaInicio: '',
  fechaFin: '',
});

const shortName = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Estudiante';
  return parts[1] ? `${parts[0]} ${parts[1][0]}.` : parts[0];
};

function Legend({ dot, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
      <span>{label}</span>
    </div>
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
  const [reservas, setReservas] = useState([]);
  const [loadingReservas, setLoadingReservas] = useState(true);
  const [view, setView] = useState('calendar'); // 'calendar' | 'list'

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

  const cargarReservas = async () => {
    try {
      setLoadingReservas(true);
      const data = await obtenerHistorialValidacionesCitaAsesor(null);
      setReservas(data ?? []);
    } catch (error) {
      console.error('Error cargando reservas:', error);
      toast.error('No se pudieron cargar tus reservas.');
    } finally {
      setLoadingReservas(false);
    }
  };

  useEffect(() => {
    cargarEspacios();
    cargarReservas();
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

  const visibleRangeStart = calendarDays[0] ?? startOfMonth(viewDate);
  const visibleRangeEnd = calendarDays[calendarDays.length - 1] ?? endOfMonth(viewDate);

  const espaciosExpandidos = useMemo(() => {
    return espacios.flatMap((space) =>
      expandSpaceToOccurrences(space, visibleRangeStart, visibleRangeEnd),
    );
  }, [espacios, visibleRangeStart, visibleRangeEnd]);

  const espaciosPorDia = useMemo(() => {
    return espaciosExpandidos.reduce((acc, espacio) => {
      const key = toDayKey(new Date(espacio.inicio_real));
      (acc[key] = acc[key] || []).push(espacio);
      return acc;
    }, {});
  }, [espaciosExpandidos]);

  const espaciosDelDia = useMemo(
    () => espaciosPorDia[toDayKey(selectedDate)] ?? [],
    [espaciosPorDia, selectedDate],
  );

  const bloquesPorDia = useMemo(() => {
    return Object.entries(espaciosPorDia).reduce((acc, [key, daySpaces]) => {
      const blocks = daySpaces.flatMap((space) =>
        buildBlocksForOccurrence(space).map((block) => ({
          ...block,
          disponibilidad_id: space.disponibilidad_id,
        })),
      );
      acc[key] = blocks.sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
      return acc;
    }, {});
  }, [espaciosPorDia]);

  const reservasPorDia = useMemo(() => {
    return reservas.reduce((acc, reserva) => {
      if (!reserva.start_at) return acc;
      const fecha = new Date(reserva.start_at);
      if (Number.isNaN(fecha.getTime())) return acc;
      const key = localDayKey(fecha);
      (acc[key] = acc[key] || []).push(reserva);
      return acc;
    }, {});
  }, [reservas]);

  const reservasDelDia = useMemo(() => {
    const list = reservasPorDia[localDayKey(selectedDate)] ?? [];
    return [...list].sort(
      (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime(),
    );
  }, [reservasPorDia, selectedDate]);

  const reservasPendientes = useMemo(
    () => reservas.filter((reserva) => reserva.status === 'pending').length,
    [reservas],
  );

  const citasEnMes = useMemo(() => {
    return reservas.filter((reserva) => {
      if (!reserva.start_at) return false;
      const d = new Date(reserva.start_at);
      return (
        d.getFullYear() === viewDate.getFullYear() &&
        d.getMonth() === viewDate.getMonth()
      );
    }).length;
  }, [reservas, viewDate]);

  const previewConfig = useMemo(() => {
    if (!form.inicio || !form.fin) {
      return {
        valido: false,
        mensaje: 'Completa el horario para ver la vista previa.',
        bloques: [],
        cantidadBloques: 0,
        minutosSobrantes: 0,
        encajaExacto: false,
        sugerenciasDuracion: [],
      };
    }

    const inicio = new Date(form.inicio);
    const fin = new Date(form.fin);

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
      return {
        valido: false,
        mensaje: 'El rango horario no es válido.',
        bloques: [],
        cantidadBloques: 0,
        minutosSobrantes: 0,
        encajaExacto: false,
        sugerenciasDuracion: [],
      };
    }

    if (fin <= inicio) {
      return {
        valido: false,
        mensaje: 'La hora final debe ser mayor que la inicial.',
        bloques: [],
        cantidadBloques: 0,
        minutosSobrantes: 0,
        encajaExacto: false,
        sugerenciasDuracion: [],
      };
    }

    const duracionMinutos = Math.round((fin - inicio) / (1000 * 60));
    const bloques = [];
    let cantidadBloques = 1;
    let minutosSobrantes = 0;
    let encajaExacto = true;
    let sugerenciasDuracion = [];

    if (form.usaBloques) {
      const bloqueMin = Math.max(Number(form.duracionBloqueMinutos) || 0, 1);
      cantidadBloques = Math.floor(duracionMinutos / bloqueMin);
      minutosSobrantes = duracionMinutos % bloqueMin;
      encajaExacto = minutosSobrantes === 0;
      sugerenciasDuracion = Array.from({ length: duracionMinutos }, (_, index) => index + 1)
        .filter((min) => min >= 5 && min <= duracionMinutos && duracionMinutos % min === 0)
        .filter((min) => min % 5 === 0)
        .filter((min) => min <= 95)
        .sort((a, b) => Math.abs(a - bloqueMin) - Math.abs(b - bloqueMin))
        .slice(0, 4);
      let cursor = new Date(inicio);

      while (cursor < fin && bloques.length < 24) {
        const bloqueFin = new Date(cursor.getTime() + bloqueMin * 60 * 1000);
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
      cantidadBloques,
      minutosSobrantes,
      encajaExacto,
      sugerenciasDuracion,
      mensaje: form.usaBloques
        ? encajaExacto
          ? `${cantidadBloques} bloque(s) de ${form.duracionBloqueMinutos} min`
          : `${cantidadBloques} bloque(s) completos y ${minutosSobrantes} min libres`
        : `${duracionMinutos} min continuos`,
      bloques,
    };
  }, [form]);

  const modalWarnings = useMemo(() => {
    const warnings = [];

    if (!form.inicio || !form.fin) {
      warnings.push('Completa la fecha y hora de inicio y fin.');
    } else {
      const inicio = new Date(form.inicio);
      const fin = new Date(form.fin);

      if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
        warnings.push('El rango horario no es válido.');
      } else if (fin <= inicio) {
        warnings.push('La hora final debe ser mayor que la inicial.');
      }
    }

    if (
      form.usaBloques &&
      Number(form.duracionBloqueMinutos) < DEFAULT_BLOCK_DURATION_MINUTES
    ) {
      warnings.push(
        `La duración del bloque debe ser de ${DEFAULT_BLOCK_DURATION_MINUTES} minutos o más.`,
      );
    }

    if (form.recurrente) {
      if (form.diasSemana.length === 0) {
        warnings.push('Selecciona al menos un día para la recurrencia.');
      }

      if (!form.fechaInicio || !form.fechaFin) {
        warnings.push('Completa las fechas de inicio y fin de la recurrencia.');
      } else if (new Date(form.fechaFin) < new Date(form.fechaInicio)) {
        warnings.push('La fecha final no puede ser menor que la fecha inicial.');
      }
    }

    return warnings;
  }, [
    form.inicio,
    form.fin,
    form.usaBloques,
    form.duracionBloqueMinutos,
    form.recurrente,
    form.diasSemana,
    form.fechaInicio,
    form.fechaFin,
  ]);

  const handleCreateSpace = async () => {
    if (modalWarnings.length > 0) return;

    try {
      setCreating(true);
      await crearEspacioLibreAsesor({
        p_inicio: new Date(form.inicio).toISOString(),
        p_fin: new Date(form.fin).toISOString(),
        p_usa_bloques: form.usaBloques,
        p_duracion_bloque_minutos: Number(form.duracionBloqueMinutos),
        p_recurrente: form.recurrente,
        p_dias_semana: form.recurrente ? form.diasSemana : null,
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
    setForm((prev) => ({ ...prev, inicio: value }));
  };
  const handleDuracionChange = (value) => {
    setForm((prev) => ({ ...prev, duracionBloqueMinutos: value }));
  };
  const handleUsaBloquesChange = (checked) => {
    setForm((prev) => ({ ...prev, usaBloques: checked }));
  };
  const setModoCreacion = (modo) => {
    setForm((prev) => ({
      ...prev,
      recurrente: modo === 'recurrente',
      diasSemana: modo === 'recurrente' ? prev.diasSemana : [],
    }));
  };

  const textoModo = form.recurrente
    ? 'Este horario se repetirá semanalmente dentro del rango de fechas que definas.'
    : 'Este horario se publicará solo para una fecha específica.';

  const resumenRecurrencia = useMemo(() => {
    if (!form.recurrente || form.diasSemana.length === 0) return '';

    const dias = [...form.diasSemana]
      .map((day) => diasSemanaLargos[Number(day)] || '')
      .filter(Boolean)
      .join(', ');
    const desde = form.fechaInicio
      ? formatterFechaCompleta.format(new Date(form.fechaInicio))
      : 'la fecha que indiques';
    const hasta = form.fechaFin
      ? formatterFechaCompleta.format(new Date(form.fechaFin))
      : 'sin fecha final';

    return `${dias} · desde ${desde} hasta ${hasta}`;
  }, [form.recurrente, form.diasSemana, form.fechaInicio, form.fechaFin]);

  const toggleDiaRecurrencia = (day) => {
    setForm((prev) => {
      const exists = prev.diasSemana.includes(day);
      return {
        ...prev,
        diasSemana: exists
          ? prev.diasSemana.filter((item) => item !== day)
          : [...prev.diasSemana, day].sort((a, b) => a - b),
      };
    });
  };

  const goToday = () => {
    const now = new Date();
    setViewDate(startOfMonth(now));
    setSelectedDate(now);
  };

  const monthLabel = formatterMes.format(viewDate);
  const switcherBtn = (active) =>
    `flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs transition-all ${
      active
        ? 'bg-white font-semibold text-slate-900 shadow-sm'
        : 'font-medium text-slate-600 hover:bg-white/50 hover:text-slate-900'
    }`;

  return (
    <div className="advisor-calendar-v2">
      {/* ---------- encabezado ---------- */}
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="inline-block rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-600">
            Módulo de asesorías
          </span>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 lg:text-3xl">
            Calendario y reservas
          </h1>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            Gestiona tus espacios de asesoría disponibles y revisa las citas
            programadas de tus tesistas en tiempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl border border-slate-300/60 bg-slate-200/80 p-1 shadow-inner">
            <button
              type="button"
              onClick={() => setView('calendar')}
              className={switcherBtn(view === 'calendar')}
            >
              <CalendarDays className="h-4 w-4" />
              Vista calendario
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={switcherBtn(view === 'list')}
            >
              <List className="h-4 w-4" />
              Lista y solicitudes
              {reservasPendientes > 0 && (
                <span className="ml-0.5 rounded-full bg-amber-100 px-1.5 text-[10px] font-bold text-amber-800">
                  {reservasPendientes}
                </span>
              )}
            </button>
          </div>

          {!showCreateModal && (
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(true);
                setView('calendar');
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-500/30 transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Nuevo espacio
            </button>
          )}
        </div>
      </header>

      {view === 'calendar' ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* ---------- calendario ---------- */}
          <section className="flex flex-col rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm lg:col-span-8">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Vista mensual
                </span>
                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-extrabold capitalize text-slate-900">
                    {monthLabel}
                  </h2>
                  {citasEnMes > 0 && (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      {citasEnMes} cita(s) en el mes
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goToday}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
                >
                  Hoy
                </button>
                <div className="flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <button
                    type="button"
                    onClick={() => setViewDate((c) => addMonths(c, -1))}
                    aria-label="Mes anterior"
                    className="p-1.5 text-slate-600 transition hover:bg-slate-100"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="h-4 w-px bg-slate-200" />
                  <button
                    type="button"
                    onClick={() => setViewDate((c) => addMonths(c, 1))}
                    aria-label="Mes siguiente"
                    className="p-1.5 text-slate-600 transition hover:bg-slate-100"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 pb-2 pt-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
              {diasSemana.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            <div className="grid flex-1 grid-cols-7 gap-2 pt-1">
              {calendarDays.map((day) => {
                const rKey = localDayKey(day);
                const bKey = toDayKey(day);
                const dayReservas = reservasPorDia[rKey] ?? [];
                const dayBlocks = bloquesPorDia[bKey] ?? [];
                const outside = !isSameMonth(day, viewDate);
                const selected = isSameDay(day, selectedDate);
                const today = isSameDay(day, new Date());

                if (outside) {
                  return (
                    <div
                      key={bKey}
                      className="min-h-[82px] rounded-xl border border-slate-100 bg-slate-50/60 p-1.5 text-slate-300"
                    >
                      <span className="text-xs font-semibold">{day.getDate()}</span>
                    </div>
                  );
                }

                return (
                  <button
                    key={bKey}
                    type="button"
                    onClick={() => setSelectedDate(day)}
                    className={`flex min-h-[82px] flex-col gap-1 rounded-xl border p-1.5 text-left transition ${
                      selected
                        ? 'border-2 border-blue-500 bg-blue-50/80 ring-2 ring-blue-100'
                        : 'border-slate-100 bg-slate-50/70 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold ${
                          selected
                            ? 'text-blue-700'
                            : today
                              ? 'text-blue-600'
                              : 'text-slate-700'
                        }`}
                      >
                        {day.getDate()}
                      </span>
                      {dayReservas.length > 0 && (
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            reservaUi(dayReservas[0].status).dot
                          }`}
                        />
                      )}
                    </div>

                    {dayReservas.length > 0 ? (
                      <div className="space-y-1">
                        {dayReservas.slice(0, 2).map((r) => (
                          <div
                            key={r.validation_cita_id}
                            className={`truncate rounded border px-1 py-0.5 text-[10px] font-medium ${
                              reservaUi(r.status).chip
                            }`}
                          >
                            {formatterHora.format(new Date(r.start_at))}{' '}
                            {shortName(r.estudiante_nombre)}
                          </div>
                        ))}
                        {dayReservas.length > 2 && (
                          <div className="text-[9px] font-bold text-slate-400">
                            +{dayReservas.length - 2} más
                          </div>
                        )}
                      </div>
                    ) : dayBlocks.length > 0 ? (
                      <div className="mt-auto text-center text-[9px] font-medium text-slate-400">
                        {dayBlocks.length} bloque(s) libres
                      </div>
                    ) : (
                      <div className="mt-auto text-center text-[9px] font-medium text-slate-300">
                        —
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
              <div className="flex flex-wrap items-center gap-4">
                <Legend dot="bg-blue-600" label="Día seleccionado" />
                <Legend dot="bg-emerald-500" label="Cita confirmada" />
                <Legend dot="bg-amber-500" label="Solicitud pendiente" />
              </div>
              <div className="text-[11px] text-slate-400">Zona horaria: {TZ}</div>
            </div>
          </section>

          {/* ---------- columna lateral ---------- */}
          <aside className="space-y-5 lg:col-span-4">
            {showCreateModal ? (
              <div className="acv-panel acv-form">
                <div className="acv-panel-head">
                  <div>
                    <p className="acv-eyebrow acv-eyebrow-sm">Nuevo espacio</p>
                    <h2 className="acv-month">Configurar disponibilidad</h2>
                  </div>
                  <button
                    type="button"
                    className="acv-icon-btn"
                    onClick={() => setShowCreateModal(false)}
                    aria-label="Cerrar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="acv-modes">
                  <button
                    type="button"
                    onClick={() => setModoCreacion('unico')}
                    className={`acv-mode ${!form.recurrente ? 'is-active' : ''}`}
                  >
                    <strong>Horario único</strong>
                    <span>Publica una disponibilidad para una fecha concreta.</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModoCreacion('recurrente')}
                    className={`acv-mode ${form.recurrente ? 'is-active' : ''}`}
                  >
                    <strong>Horario recurrente</strong>
                    <span>Repite el mismo horario cada semana dentro de un rango.</span>
                  </button>
                </div>

                <div className="acv-note">
                  <Info className="h-4 w-4" />
                  <div>
                    <p>{textoModo}</p>
                    {resumenRecurrencia && (
                      <p className="acv-muted">{resumenRecurrencia}</p>
                    )}
                  </div>
                </div>

                {modalWarnings.length > 0 && (
                  <div className="acv-warn">
                    <p>Revisa estos datos</p>
                    {modalWarnings.map((w) => (
                      <span key={w}>{w}</span>
                    ))}
                  </div>
                )}

                <div className="acv-fields">
                  <label className="acv-field">
                    <span>Inicio del espacio</span>
                    <input
                      type="datetime-local"
                      value={form.inicio}
                      onChange={(e) => handleInicioChange(e.target.value)}
                    />
                  </label>
                  <label className="acv-field">
                    <span>Fin del espacio</span>
                    <input
                      type="datetime-local"
                      value={form.fin}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, fin: e.target.value }))
                      }
                    />
                  </label>
                  <label className="acv-field">
                    <span>Duración por bloque (min)</span>
                    <input
                      type="number"
                      min={DEFAULT_BLOCK_DURATION_MINUTES}
                      step="15"
                      value={form.duracionBloqueMinutos}
                      onChange={(e) => handleDuracionChange(e.target.value)}
                    />
                  </label>
                  <label className="acv-check">
                    <input
                      type="checkbox"
                      checked={form.usaBloques}
                      onChange={(e) => handleUsaBloquesChange(e.target.checked)}
                    />
                    Dividir en bloques reservables
                  </label>

                  {form.recurrente && (
                    <>
                      <div className="acv-field">
                        <span>Días de la semana</span>
                        <div className="acv-dow">
                          {[
                            { key: 1, label: 'L' },
                            { key: 2, label: 'M' },
                            { key: 3, label: 'X' },
                            { key: 4, label: 'J' },
                            { key: 5, label: 'V' },
                            { key: 6, label: 'S' },
                            { key: 0, label: 'D' },
                          ].map((d) => (
                            <button
                              key={d.key}
                              type="button"
                              onClick={() => toggleDiaRecurrencia(d.key)}
                              className={
                                form.diasSemana.includes(d.key) ? 'is-active' : ''
                              }
                            >
                              {d.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <label className="acv-field">
                        <span>Fecha inicio recurrencia</span>
                        <input
                          type="date"
                          value={form.fechaInicio}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              fechaInicio: e.target.value,
                            }))
                          }
                        />
                      </label>
                      <label className="acv-field">
                        <span>Fecha fin recurrencia</span>
                        <input
                          type="date"
                          value={form.fechaFin}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              fechaFin: e.target.value,
                            }))
                          }
                        />
                      </label>
                    </>
                  )}
                </div>

                <div className="acv-preview">
                  <p className="acv-eyebrow acv-eyebrow-sm">Vista previa</p>
                  <p>{previewConfig.mensaje}</p>
                  {form.usaBloques && previewConfig.bloques.length > 0 && (
                    <div className="acv-preview-chips">
                      {previewConfig.bloques.map((b) => (
                        <span key={b}>{b}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="acv-form-actions">
                  <button
                    type="button"
                    className="acv-btn acv-btn-ghost"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="acv-btn acv-btn-primary"
                    onClick={handleCreateSpace}
                    disabled={creating || modalWarnings.length > 0}
                  >
                    {creating ? 'Guardando…' : 'Guardar disponibilidad'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Detalle del día seleccionado */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Detalle seleccionado
                      </span>
                      <h3 className="text-base font-extrabold capitalize text-slate-900">
                        {formatterDiaLargo.format(selectedDate)}
                      </h3>
                    </div>
                    <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
                      {reservasDelDia.length} evento(s)
                    </span>
                  </div>

                  {loadingReservas ? (
                    <p className="mt-4 text-xs text-slate-500">Cargando reservas…</p>
                  ) : reservasDelDia.length === 0 ? (
                    <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4 text-center text-xs text-slate-500">
                      No hay citas para este día. Cuando un estudiante reserve en
                      tus franjas, aparecerá aquí.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {reservasDelDia.map((item) => {
                        const ui = reservaUi(item.status);
                        return (
                          <div
                            key={item.validation_cita_id}
                            className={`rounded-xl border p-3.5 ${
                              item.status === 'pending'
                                ? 'border-amber-200/70 bg-amber-50/30'
                                : 'border-slate-100 bg-slate-50/50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${avatarColor(
                                    item.estudiante_nombre || item.validation_cita_id,
                                  )}`}
                                >
                                  {initialsFrom(item.estudiante_nombre)}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold leading-tight text-slate-900">
                                    {item.estudiante_nombre || 'Estudiante'}
                                  </h4>
                                  <p className="max-w-[160px] truncate text-[11px] text-slate-500">
                                    {item.tesis_titulo || 'Sin tesis asociada'}
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${ui.badge}`}
                              >
                                {ui.label}
                              </span>
                            </div>
                            <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-slate-200/60 pt-2.5 text-xs text-slate-600">
                              <span className="inline-flex items-center gap-1 font-medium">
                                <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                                {formatterHora.format(new Date(item.start_at))}
                                {item.end_at
                                  ? ` - ${formatterHora.format(new Date(item.end_at))}`
                                  : ''}
                              </span>
                              {item.status === 'pending' ? (
                                <ReservaActions
                                  item={item}
                                  onChanged={cargarReservas}
                                />
                              ) : item.enlace_reunion ? (
                                <a
                                  href={item.enlace_reunion}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                                >
                                  <Video className="h-3.5 w-3.5" />
                                  Meet
                                </a>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Franjas de disponibilidad del día */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Configuración
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-900">
                        Franjas de disponibilidad
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(true)}
                      className="text-xs font-semibold text-blue-600 transition hover:text-blue-700"
                    >
                      + Añadir franja
                    </button>
                  </div>

                  {loading ? (
                    <p className="text-xs text-slate-500">Cargando espacios…</p>
                  ) : espaciosDelDia.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-3 text-center text-xs text-slate-500">
                      Sin franjas registradas para este día.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {espaciosDelDia.map((espacio) => (
                        <div
                          key={`${espacio.disponibilidad_id}-${espacio.inicio_real}`}
                          className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50 p-2.5 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                espacio.activo === false
                                  ? 'bg-slate-400'
                                  : 'bg-emerald-500'
                              }`}
                            />
                            <span className="font-semibold text-slate-800">
                              {formatterHora.format(new Date(espacio.inicio_real))} -{' '}
                              {formatterHora.format(new Date(espacio.fin_real))}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              ({espacio.duracion_bloque_minutos} min)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
                              {espacio.recurrente ? 'Recurrente' : 'Única'}
                            </span>
                            {espacio.activo !== false && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDesactivar(espacio.disponibilidad_id)
                                }
                                disabled={
                                  desactivandoId === espacio.disponibilidad_id
                                }
                                className="text-slate-400 transition hover:text-rose-600 disabled:opacity-50"
                                title="Desactivar franja"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Banner: cambiar a lista */}
                <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white shadow-sm">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-100">
                    Vista alternativa
                  </div>
                  <h4 className="mt-0.5 text-sm font-bold">
                    ¿Prefieres verlo todo en lista?
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-blue-100">
                    Revisa y procesa las solicitudes de tus tesistas en una tabla
                    interactiva.
                  </p>
                  <button
                    type="button"
                    onClick={() => setView('list')}
                    className="mt-3 w-full rounded-xl bg-white px-3 py-2 text-center text-xs font-bold text-blue-600 transition hover:bg-blue-50"
                  >
                    Cambiar a lista y solicitudes
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      ) : (
        <ReservationsPanel
          reservas={reservas}
          loading={loadingReservas}
          onChanged={cargarReservas}
        />
      )}
    </div>
  );
}

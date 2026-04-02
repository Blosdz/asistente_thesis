import { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Info,
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

const formatterFecha = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: 'short',
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

  const duracion = Number(space.duracion_bloque_minutos) || 30;
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
    return [
      {
        inicio,
        fin,
      },
    ];
  }

  const duration = Math.max(Number(occurrence.duracion_bloque_minutos) || 0, 1);
  const blocks = [];
  let cursor = new Date(inicio);

  while (cursor < fin && blocks.length < 48) {
    const blockEnd = new Date(cursor.getTime() + duration * 60 * 1000);
    if (blockEnd > fin) break;
    blocks.push({
      inicio: new Date(cursor),
      fin: blockEnd,
    });
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
  end.setMinutes(end.getMinutes() + 30);
  return end;
}

const initialForm = () => ({
  inicio: toDateTimeLocalInputValue(getDefaultStart()),
  fin: toDateTimeLocalInputValue(getDefaultEnd()),
  usaBloques: true,
  duracionBloqueMinutos: 30,
  recurrente: false,
  diasSemana: [],
  fechaInicio: '',
  fechaFin: '',
});

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
      if (!acc[key]) acc[key] = [];
      acc[key].push(espacio);
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

      acc[key] = blocks.sort(
        (a, b) => a.inicio.getTime() - b.inicio.getTime(),
      );
      return acc;
    }, {});
  }, [espaciosPorDia]);

  const espaciosActivos = useMemo(
    () => espacios.filter((espacio) => espacio.activo !== false),
    [espacios],
  );

  const proximosEspacios = useMemo(() => {
    const now = Date.now();
    return espaciosExpandidos
      .filter((espacio) => new Date(espacio.fin_real).getTime() >= now)
      .sort(
        (a, b) =>
          new Date(a.inicio_real).getTime() - new Date(b.inicio_real).getTime(),
      )
      .slice(0, 5);
  }, [espaciosExpandidos]);

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

  const handleCreateSpace = async () => {
    if (modalWarnings.length > 0) {
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
    setForm((prev) => ({
      ...prev,
      inicio: value,
    }));
  };

  const handleDuracionChange = (value) => {
    setForm((prev) => ({
      ...prev,
      duracionBloqueMinutos: value,
    }));
  };

  const handleUsaBloquesChange = (checked) => {
    setForm((prev) => ({
      ...prev,
      usaBloques: checked,
    }));
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

    if (Number(form.duracionBloqueMinutos) <= 0) {
      warnings.push('La duración del bloque debe ser mayor que cero.');
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
    form.duracionBloqueMinutos,
    form.recurrente,
    form.diasSemana,
    form.fechaInicio,
    form.fechaFin,
  ]);

  const bloquesHelper = useMemo(() => {
    if (!form.inicio || !form.fin) {
      return 'El sistema usará este rango para generar los horarios reservables.';
    }

    const inicio = new Date(form.inicio);
    const fin = new Date(form.fin);

    if (
      Number.isNaN(inicio.getTime()) ||
      Number.isNaN(fin.getTime()) ||
      fin <= inicio
    ) {
      return 'Ajusta el rango para ver cómo se separará tu tiempo disponible.';
    }

    if (!form.usaBloques) {
      return `Se publicará una sola franja de ${formatterHora.format(inicio)} a ${formatterHora.format(fin)}.`;
    }

    if (previewConfig.encajaExacto) {
      return `De ${formatterHora.format(inicio)} a ${formatterHora.format(fin)} se crearán ${previewConfig.cantidadBloques || 0} bloque(s) exactos de ${form.duracionBloqueMinutos} min.`;
    }

    if (previewConfig.sugerenciasDuracion.length > 0) {
      return `La duración de ${form.duracionBloqueMinutos} min no encaja exacta en este rango. Sobran ${previewConfig.minutosSobrantes} min. Puedes usar: ${previewConfig.sugerenciasDuracion.join(', ')} min.`;
    }

    return `La duración de ${form.duracionBloqueMinutos} min no encaja exacta en este rango. Sobran ${previewConfig.minutosSobrantes} min.`;
  }, [
    form.inicio,
    form.fin,
    form.usaBloques,
    form.duracionBloqueMinutos,
    previewConfig.cantidadBloques,
    previewConfig.encajaExacto,
    previewConfig.minutosSobrantes,
    previewConfig.sugerenciasDuracion,
  ]);

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
                const blocks = bloquesPorDia[key] ?? [];
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
                      {blocks.length > 0 && (
                        <span className="rounded-full bg-white/70 px-2 py-1 text-[10px] font-bold text-slate-500">
                          {blocks.length}
                        </span>
                      )}
                    </div>

                    {blocks.length > 0 && (
                      <div className="absolute bottom-3 left-3 right-3 space-y-1.5">
                        {blocks.slice(0, 3).map((block, index) => (
                          <div
                            key={`${block.disponibilidad_id}-${block.inicio.toISOString()}-${index}`}
                            className="truncate rounded-full bg-blue-100/90 px-2.5 py-1 text-[10px] font-bold text-blue-700"
                          >
                            {formatterHora.format(block.inicio)}
                          </div>
                        ))}
                        {blocks.length > 3 && (
                          <p className="text-[10px] font-bold text-slate-500">
                            +{blocks.length - 3} más
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
                      key={`${espacio.disponibilidad_id}-${espacio.inicio_real}`}
                      className="rounded-2xl border border-white/50 bg-white/35 p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {formatterFecha.format(new Date(espacio.inicio_real))}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatterHora.format(new Date(espacio.inicio_real))} -{' '}
                            {formatterHora.format(new Date(espacio.fin_real))}
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
                  espaciosDelDia.map((espacio) => {
                    const blocks = buildBlocksForOccurrence(espacio);

                    return (
                      <div
                        key={`${espacio.disponibilidad_id}-${espacio.inicio_real}`}
                        className="rounded-2xl border border-white/50 bg-white/35 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
                              <Clock3 className="h-4 w-4 text-blue-600" />
                              {formatterHora.format(new Date(espacio.inicio_real))} -{' '}
                              {formatterHora.format(new Date(espacio.fin_real))}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {espacio.duracion_bloque_minutos} min por bloque
                            </p>
                          </div>
                          <EstadoBadge activo={espacio.activo} />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {blocks.slice(0, 8).map((block) => (
                            <span
                              key={`${espacio.disponibilidad_id}-${block.inicio.toISOString()}`}
                              className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-semibold text-blue-700"
                            >
                              {formatterHora.format(block.inicio)} - {formatterHora.format(block.fin)}
                            </span>
                          ))}
                          {blocks.length > 8 && (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                              +{blocks.length - 8} bloques
                            </span>
                          )}
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
                    );
                  })
                )}
              </div>
            </Card>
          </aside>
        </div>
      </div>

      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Configurar disponibilidad"
        modalWidth="xl"
        subtitle="Publica un horario único o recurrente."
        primaryAction={{
          label: creating ? 'Guardando...' : 'Guardar disponibilidad',
          onClick: handleCreateSpace,
        }}
        secondaryAction={{
          label: 'Cancelar',
          onClick: () => setShowCreateModal(false),
        }}
      >
        <div className="space-y-5 text-left">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setModoCreacion('unico')}
              className={`rounded-2xl border p-4 text-left transition ${
                !form.recurrente
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <p className="text-sm font-bold text-slate-900">Horario único</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Publica una disponibilidad para una fecha concreta.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setModoCreacion('recurrente')}
              className={`rounded-2xl border p-4 text-left transition ${
                form.recurrente
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <p className="text-sm font-bold text-slate-900">
                Horario recurrente
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Repite el mismo horario cada semana dentro de un rango.
              </p>
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-slate-200 p-2 text-slate-700">
                <Info className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{textoModo}</p>
                {resumenRecurrencia && (
                  <p className="mt-1 text-sm text-slate-600">
                    {resumenRecurrencia}
                  </p>
                )}
              </div>
            </div>
          </div>

          {modalWarnings.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">
                Revisa estos datos
              </p>
              <div className="mt-2 space-y-1">
                {modalWarnings.map((warning) => (
                  <p key={warning} className="text-sm text-amber-800">
                    {warning}
                  </p>
                ))}
              </div>
            </div>
          )}

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
              {bloquesHelper}
            </p>
          </div>

          <div className="flex items-end">
            <div className="w-full">
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.usaBloques}
                  onChange={(e) => handleUsaBloquesChange(e.target.checked)}
                />
                Dividir en bloques reservables
              </label>
              <p className="mt-2 text-xs text-slate-500">{bloquesHelper}</p>
            </div>
          </div>
          </div>

          {form.recurrente && (
            <>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Días de la semana
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {[
                    { key: 1, label: 'L' },
                    { key: 2, label: 'M' },
                    { key: 3, label: 'X' },
                    { key: 4, label: 'J' },
                    { key: 5, label: 'V' },
                    { key: 6, label: 'S' },
                    { key: 0, label: 'D' },
                  ].map((day) => {
                    const isActive = form.diasSemana.includes(day.key);
                    return (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => toggleDiaRecurrencia(day.key)}
                        className={`rounded-xl border px-0 py-3 text-sm font-bold transition ${
                          isActive
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Puedes elegir varios días. Se creará una recurrencia por cada día seleccionado.
                </p>
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

              {resumenRecurrencia && (
                <div className="sm:col-span-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                  {resumenRecurrencia}
                </div>
              )}
            </>
          )}

          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-sm font-semibold text-slate-900">
              Vista previa de tu disponibilidad
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {previewConfig.mensaje}
            </p>

            {previewConfig.valido && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-white p-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Franja base
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {formatterHora.format(new Date(form.inicio))} -{' '}
                    {formatterHora.format(new Date(form.fin))}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Resultado visible
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {form.usaBloques
                      ? `${previewConfig.cantidadBloques || 0} bloque(s)`
                      : '1 franja continua'}
                  </p>
                  {form.usaBloques && !previewConfig.encajaExacto && (
                    <p className="mt-2 text-xs text-amber-700">
                      Sobran {previewConfig.minutosSobrantes} min fuera de bloque.
                    </p>
                  )}
                </div>
                {form.recurrente && form.fechaInicio && form.fechaFin && (
                  <div className="rounded-xl bg-white p-3 sm:col-span-2">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Vigencia
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      Del {formatterFechaCompleta.format(new Date(form.fechaInicio))} al{' '}
                      {formatterFechaCompleta.format(new Date(form.fechaFin))}
                    </p>
                  </div>
                )}
                {form.usaBloques &&
                  !previewConfig.encajaExacto &&
                  previewConfig.sugerenciasDuracion.length > 0 && (
                    <div className="rounded-xl bg-white p-3 sm:col-span-2">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        Duraciones que sí encajan
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {previewConfig.sugerenciasDuracion.join(', ')} min
                      </p>
                    </div>
                  )}
              </div>
            )}

            {form.usaBloques && previewConfig.bloques.length > 0 && (
              <div className="mt-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Bloques reservables
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

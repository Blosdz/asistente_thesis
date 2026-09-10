import { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Info,
  Plus,
  Repeat,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import './Calendar.css';
import {
  crearEspacioLibreAsesor,
  desactivarEspacioLibreAsesor,
  obtenerMisEspaciosLibresAsesor,
} from '../../services/advisorService';

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

function EstadoBadge({ activo }) {
  return (
    <span className={`acv-badge ${activo === false ? 'is-off' : 'is-on'}`}>
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

    if (Number(form.duracionBloqueMinutos) < DEFAULT_BLOCK_DURATION_MINUTES) {
      return `Cada bloque debe durar al menos ${DEFAULT_BLOCK_DURATION_MINUTES} minutos.`;
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

  const monthLabel = formatterMes.format(viewDate);

  return (
    <div className="advisor-calendar-v2">
      <header className="acv-head">
        <div>
          <p className="acv-eyebrow">Calendario</p>
          <h1 className="acv-title">Disponibilidad del asesor</h1>
          <p className="acv-lead">
            Crea espacios libres, revisa tu carga de disponibilidad y mantén una
            agenda clara para que los estudiantes reserven sin fricción.
          </p>
        </div>
        {!showCreateModal && (
          <button
            type="button"
            className="acv-btn acv-btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4" />
            Nuevo espacio
          </button>
        )}
      </header>

      <div className={`acv-grid ${showCreateModal ? 'is-creating' : ''}`}>
        {/* ---------- calendario ---------- */}
        <section className="acv-panel">
          <div className="acv-panel-head">
            <div>
              <p className="acv-eyebrow acv-eyebrow-sm">Vista mensual</p>
              <h2 className="acv-month">{monthLabel}</h2>
            </div>
            <div className="acv-nav">
              <button
                type="button"
                onClick={() => setViewDate((c) => addMonths(c, -1))}
                aria-label="Mes anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewDate((c) => addMonths(c, 1))}
                aria-label="Mes siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="acv-stats">
            <div className="acv-stat">
              <span>Espacios activos</span>
              <strong>{espaciosActivos.length}</strong>
            </div>
            <div className="acv-stat">
              <span>Horas disponibles</span>
              <strong>{horasDisponibles}</strong>
            </div>
            <div className="acv-stat">
              <span>Día seleccionado</span>
              <strong className="acv-stat-day">
                {formatterDiaLargo.format(selectedDate)}
              </strong>
            </div>
          </div>

          <div className="acv-weekdays">
            {diasSemana.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <div className="acv-days">
            {calendarDays.map((day) => {
              const key = toDayKey(day);
              const blocks = bloquesPorDia[key] ?? [];
              const outside = !isSameMonth(day, viewDate);
              const selected = isSameDay(day, selectedDate);
              const today = isSameDay(day, new Date());

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDate(day)}
                  className={[
                    'acv-day',
                    outside && 'is-outside',
                    selected && 'is-selected',
                    today && 'is-today',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className="acv-day-num">{day.getDate()}</span>
                  {blocks.length > 0 && (
                    <span className="acv-day-count">{blocks.length}</span>
                  )}
                  {blocks.length > 0 && (
                    <span className="acv-day-blocks">
                      {blocks.slice(0, 3).map((b, i) => (
                        <span
                          key={`${b.disponibilidad_id}-${i}`}
                          className="acv-chip"
                        >
                          {formatterHora.format(b.inicio)}
                        </span>
                      ))}
                      {blocks.length > 3 && (
                        <span className="acv-more">+{blocks.length - 3}</span>
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* ---------- columna lateral ---------- */}
        <aside className="acv-side">
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
                  {resumenRecurrencia && <p className="acv-muted">{resumenRecurrencia}</p>}
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
                          setForm((prev) => ({ ...prev, fechaInicio: e.target.value }))
                        }
                      />
                    </label>
                    <label className="acv-field">
                      <span>Fecha fin recurrencia</span>
                      <input
                        type="date"
                        value={form.fechaFin}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, fechaFin: e.target.value }))
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
              <div className="acv-panel">
                <p className="acv-eyebrow acv-eyebrow-sm">Próximos espacios</p>
                <h2 className="acv-month">Agenda</h2>
                <p className="acv-muted acv-mb">
                  Tus siguientes ventanas activas de disponibilidad.
                </p>
                {proximosEspacios.length === 0 ? (
                  <div className="acv-empty">
                    Aún no tienes espacios futuros registrados.
                  </div>
                ) : (
                  <div className="acv-list">
                    {proximosEspacios.map((e) => (
                      <div key={`${e.disponibilidad_id}-${e.inicio_real}`} className="acv-item">
                        <div>
                          <strong>{formatterFecha.format(new Date(e.inicio_real))}</strong>
                          <span className="acv-muted">
                            {formatterHora.format(new Date(e.inicio_real))} –{' '}
                            {formatterHora.format(new Date(e.fin_real))}
                          </span>
                        </div>
                        <EstadoBadge activo={e.activo} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="acv-panel">
                <div className="acv-panel-head">
                  <div>
                    <p className="acv-eyebrow acv-eyebrow-sm">Espacios del día</p>
                    <h2 className="acv-month acv-stat-day">
                      {formatterDiaLargo.format(selectedDate)}
                    </h2>
                  </div>
                  <span className="acv-count-pill">{espaciosDelDia.length}</span>
                </div>

                {loading ? (
                  <p className="acv-muted">Cargando espacios…</p>
                ) : espaciosDelDia.length === 0 ? (
                  <div className="acv-empty">
                    No tienes espacios registrados para este día. Crea una franja
                    libre para empezar a recibir reservas.
                  </div>
                ) : (
                  <div className="acv-list">
                    {espaciosDelDia.map((espacio) => {
                      const blocks = buildBlocksForOccurrence(espacio);
                      return (
                        <div
                          key={`${espacio.disponibilidad_id}-${espacio.inicio_real}`}
                          className="acv-item acv-item-col"
                        >
                          <div className="acv-item-row">
                            <strong className="acv-item-time">
                              <Clock3 className="h-4 w-4" />
                              {formatterHora.format(new Date(espacio.inicio_real))} –{' '}
                              {formatterHora.format(new Date(espacio.fin_real))}
                            </strong>
                            <EstadoBadge activo={espacio.activo} />
                          </div>
                          <span className="acv-muted">
                            {espacio.duracion_bloque_minutos} min por bloque
                          </span>
                          <div className="acv-item-chips">
                            {blocks.slice(0, 6).map((b) => (
                              <span key={`${espacio.disponibilidad_id}-${b.inicio.toISOString()}`}>
                                {formatterHora.format(b.inicio)}
                              </span>
                            ))}
                            {blocks.length > 6 && <span>+{blocks.length - 6}</span>}
                          </div>
                          <div className="acv-item-row">
                            <span className="acv-muted acv-item-rec">
                              {espacio.recurrente ? (
                                <>
                                  <Repeat className="h-3.5 w-3.5" />
                                  Recurrente
                                </>
                              ) : (
                                'Única vez'
                              )}
                            </span>
                            {espacio.activo !== false && (
                              <button
                                type="button"
                                className="acv-del"
                                onClick={() => handleDesactivar(espacio.disponibilidad_id)}
                                disabled={desactivandoId === espacio.disponibilidad_id}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                {desactivandoId === espacio.disponibilidad_id
                                  ? 'Desactivando…'
                                  : 'Desactivar'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  UserRound,
} from 'lucide-react';

import { Card } from '../../components/ui/card';
import Modal from '../../components/ui/modal';
import SubscriptionSummaryCard from '../../components/student/SubscriptionSummaryCard';
import { Select, SelectItem } from '../../components/ui/select';
import {
  crearCitaAsesoria,
  obtenerAsesores,
  obtenerHorariosPresustentacionAsesor,
} from '../../services/advisorService';
import { obtenerMiSuscripcion } from '../../services/suscripcionService';

const PRICE_PEN = 200;
const DIEGO_ASESOR_ID = 'cadc37f0-6037-4430-b993-533880b036b1';
const DEFAULT_DURATION_MINUTES = 45;
const fallbackAvatar =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBfY_M1vYqCVJM6C281-xl9p2WF-lRoXoF6XWzZ3OqCcsHuwSRxUQP-xUghy-u2Bub3dY-GFZgtO43We88a02lzg2ET9t9HPW_r-Z2C5pajAgGBthu0_JRhit-K_6qz0OOOJpruPijct0DLYYuXb47wLCaWCYr7D-u0FeS6Otbx5PaPL73ofhNRn8nat3vu10fB-1hEezuYn0ZumKHVMGzcrxLFAxbzHMp4yUlO4jQW9oHWW25bJh9WZflyp94rlf3CjlU01K_QO9u1';

const SLOT_VIEW_OPTIONS = [
  { value: 'this_week', label: 'Esta semana' },
  { value: 'next_week', label: 'Siguiente semana' },
  { value: 'this_month', label: 'Este mes' },
  { value: 'all', label: 'Todo lo disponible' },
];

const formatDateKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}`;
};

const formatFullDate = (value) =>
  new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(value));

const formatDayChip = (value) =>
  new Intl.DateTimeFormat('es-PE', {
    weekday: 'short',
    day: '2-digit',
  }).format(new Date(value));

const formatTime = (value) =>
  new Intl.DateTimeFormat('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));

const buildSlotKey = (slot) =>
  `${slot?.disponibilidad_id}-${slot?.inicio || slot?.inicio_bloque}`;

const getSlotStart = (slot) => slot?.inicio || slot?.inicio_bloque;

const getSlotEnd = (slot) => slot?.fin || slot?.fin_bloque;

const getSlotDurationMinutes = (slot) => {
  const explicitDuration = Number(slot?.duracion_minutos || 0);
  if (Number.isFinite(explicitDuration) && explicitDuration > 0) {
    return explicitDuration;
  }

  const start = new Date(getSlotStart(slot));
  const end = new Date(getSlotEnd(slot));
  const computed = Math.round((end.getTime() - start.getTime()) / 60000);

  if (Number.isFinite(computed) && computed > 0) {
    return computed;
  }

  return DEFAULT_DURATION_MINUTES;
};

const formatDurationMinutes = (minutes) => `${Number(minutes || 45)} min`;

const getSlotTimeRangeLabel = (slot) =>
  `${formatTime(getSlotStart(slot))} - ${formatTime(getSlotEnd(slot))}`;

const startOfDay = (date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const endOfDay = (date) => {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
};

const getStartOfWeek = (date) => {
  const next = startOfDay(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  return next;
};

const getEndOfWeek = (date) => {
  const next = getStartOfWeek(date);
  next.setDate(next.getDate() + 6);
  return endOfDay(next);
};

const getEndOfMonth = (date) => {
  const next = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return endOfDay(next);
};

const getSlotRange = (view) => {
  const today = new Date();
  const rangeStart = startOfDay(today);

  if (view === 'next_week') {
    const start = getStartOfWeek(today);
    start.setDate(start.getDate() + 7);
    return { start, end: getEndOfWeek(start) };
  }

  if (view === 'this_month') {
    return { start: rangeStart, end: getEndOfMonth(today) };
  }

  if (view === 'all') {
    return { start: null, end: null };
  }

  return { start: rangeStart, end: getEndOfWeek(today) };
};

const formatDateParam = (date) => {
  if (!date) return null;

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}`;
};

const getFetchRange = (view) => {
  const baseRange = getSlotRange(view);

  if (view === 'all') {
    const today = startOfDay(new Date());
    const end = new Date(today);
    end.setDate(end.getDate() + 180);

    return {
      start: today,
      end: endOfDay(end),
    };
  }

  return baseRange;
};

export default function Services() {
  const [serviceAdvisor, setServiceAdvisor] = useState(null);
  const [loadingAdvisor, setLoadingAdvisor] = useState(true);
  const [suscripcion, setSuscripcion] = useState(null);
  const [loadingSuscripcion, setLoadingSuscripcion] = useState(true);

  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlotKey, setSelectedSlotKey] = useState(null);
  const [slotView, setSlotView] = useState('this_week');

  const [booking, setBooking] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [reservationSummary, setReservationSummary] = useState(null);

  const slotFetchRange = useMemo(() => getFetchRange(slotView), [slotView]);

  const syncSlotsState = useCallback((incomingSlots) => {
    const normalizedSlots = (incomingSlots || [])
      .filter((slot) => slot.estado === 'libre')
      .map((slot) => ({
        ...slot,
        inicio: getSlotStart(slot),
        fin: getSlotEnd(slot),
        slotKey: buildSlotKey(slot),
      }));

    setSlots(normalizedSlots);

    if (normalizedSlots.length === 0) {
      setSelectedDay(null);
      setSelectedSlotKey(null);
      return;
    }

    const firstSlot = normalizedSlots[0];
    setSelectedDay(formatDateKey(firstSlot.inicio));
    setSelectedSlotKey(firstSlot.slotKey);
  }, []);

  useEffect(() => {
    const loadAdvisor = async () => {
      try {
        setLoadingAdvisor(true);
        const data = await obtenerAsesores();
        const diego = (data || []).find(
          (item) => (item.asesor_id || item.id) === DIEGO_ASESOR_ID,
        );

        if (!diego) {
          setServiceAdvisor(null);
          return;
        }

        setServiceAdvisor({
          id: diego.asesor_id || diego.id,
          name:
            diego.nombre_mostrar ||
            [diego.nombres, diego.apellidos].filter(Boolean).join(' ') ||
            'Diego',
          role: diego.carrera || diego.rol || 'Pre-sustentacion',
          avatar: diego.foto_url || fallbackAvatar,
          university: diego.universidad_nombre || 'AEIA',
          bio:
            diego.biografia ||
            'Servicio guiado de ensayo de pre-sustentacion con enfoque practico y horarios reales.',
          tags: [
            diego.especialidad_nombre || diego.especialidad,
            diego.nivel_academico,
          ].filter(Boolean),
        });
      } catch (error) {
        console.error(error);
        toast.error('No se pudo cargar el servicio de pre-sustentacion');
        setServiceAdvisor(null);
      } finally {
        setLoadingAdvisor(false);
      }
    };

    loadAdvisor();
  }, []);

  useEffect(() => {
    const loadSuscripcion = async () => {
      try {
        setLoadingSuscripcion(true);
        const data = await obtenerMiSuscripcion();
        setSuscripcion(data ?? null);
      } catch (error) {
        console.error('Error cargando suscripcion activa:', error);
        setSuscripcion(null);
      } finally {
        setLoadingSuscripcion(false);
      }
    };

    loadSuscripcion();
  }, []);

  useEffect(() => {
    if (!serviceAdvisor?.id) {
      syncSlotsState([]);
      return;
    }

    let ignore = false;

    const loadSlots = async () => {
      try {
        setLoadingSlots(true);
        const data = await obtenerHorariosPresustentacionAsesor(
          serviceAdvisor.id,
          formatDateParam(slotFetchRange.start),
          formatDateParam(slotFetchRange.end),
        );

        if (!ignore) {
          syncSlotsState(data || []);
        }
      } catch (error) {
        console.error(error);
        if (!ignore) {
          toast.error(
            error.message || 'No se pudo cargar la disponibilidad de Diego',
          );
          syncSlotsState([]);
        }
      } finally {
        if (!ignore) {
          setLoadingSlots(false);
        }
      }
    };

    loadSlots();

    return () => {
      ignore = true;
    };
  }, [serviceAdvisor?.id, slotFetchRange, syncSlotsState]);

  const filteredSlots = useMemo(() => {
    const { start, end } = getSlotRange(slotView);

    return slots.filter((slot) => {
      const slotDate = new Date(slot.inicio);
      if (start && slotDate < start) return false;
      if (end && slotDate > end) return false;
      return true;
    });
  }, [slotView, slots]);

  const availableDays = useMemo(() => {
    const uniqueDays = [];
    const seen = new Set();

    filteredSlots.forEach((slot) => {
      const dayKey = formatDateKey(slot.inicio);
      if (!dayKey || seen.has(dayKey)) return;

      seen.add(dayKey);
      uniqueDays.push({
        key: dayKey,
        label: formatDayChip(slot.inicio),
        fullLabel: formatFullDate(slot.inicio),
      });
    });

    return uniqueDays;
  }, [filteredSlots]);

  const slotsForSelectedDay = useMemo(() => {
    if (!selectedDay) return [];

    return filteredSlots.filter(
      (slot) => formatDateKey(slot.inicio) === selectedDay,
    );
  }, [filteredSlots, selectedDay]);

  const selectedSlot = useMemo(
    () => filteredSlots.find((slot) => slot.slotKey === selectedSlotKey) || null,
    [filteredSlots, selectedSlotKey],
  );

  useEffect(() => {
    if (filteredSlots.length === 0) {
      setSelectedDay(null);
      setSelectedSlotKey(null);
      return;
    }

    const nextDay =
      selectedDay &&
      filteredSlots.some((slot) => formatDateKey(slot.inicio) === selectedDay)
        ? selectedDay
        : formatDateKey(filteredSlots[0].inicio);

    if (nextDay !== selectedDay) {
      setSelectedDay(nextDay);
    }

    const visibleSlot =
      selectedSlotKey &&
      filteredSlots.some((slot) => slot.slotKey === selectedSlotKey);

    if (!visibleSlot) {
      const nextSlot = filteredSlots.find(
        (slot) => formatDateKey(slot.inicio) === nextDay,
      );
      setSelectedSlotKey(nextSlot?.slotKey || null);
    }
  }, [filteredSlots, selectedDay, selectedSlotKey]);

  const handleSelectDay = useCallback(
    (dayKey) => {
      setSelectedDay(dayKey);
      const nextSlot = filteredSlots.find(
        (slot) => formatDateKey(slot.inicio) === dayKey,
      );
      setSelectedSlotKey(nextSlot?.slotKey || null);
    },
    [filteredSlots],
  );

  const handleReserve = useCallback(async () => {
    if (!serviceAdvisor || !selectedSlot) {
      toast.error('Selecciona un horario disponible');
      return;
    }

    try {
      setBooking(true);
      setReservationSummary({
        advisorName: serviceAdvisor.name,
        fullDate: formatFullDate(selectedSlot.inicio),
        timeRange: getSlotTimeRangeLabel(selectedSlot),
        duration: formatDurationMinutes(getSlotDurationMinutes(selectedSlot)),
      });

      const result = await crearCitaAsesoria({
        p_asesor_id: serviceAdvisor.id,
        p_disponibilidad_id: selectedSlot.disponibilidad_id,
        p_inicio: selectedSlot.inicio,
        p_fin: selectedSlot.fin,
        p_tesis_id: null,
        p_motivo: 'Solicitud de pre-sustentacion',
        p_tipo_servicio: 'presustentacion',
        p_modalidad: 'virtual',
        p_lugar: null,
        p_enlace_reunion: null,
        p_notas: null,
      });

      setBookingResult(result || null);
      setConfirmOpen(false);
      setResultOpen(true);
      toast.success('Solicitud enviada correctamente');

      const refreshed = await obtenerHorariosPresustentacionAsesor(
        serviceAdvisor.id,
        formatDateParam(slotFetchRange.start),
        formatDateParam(slotFetchRange.end),
      );

      syncSlotsState(refreshed || []);
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'No se pudo reservar la pre-sustentacion');
    } finally {
      setBooking(false);
    }
  }, [selectedSlot, serviceAdvisor, slotFetchRange, syncSlotsState]);

  if (!loadingAdvisor && !serviceAdvisor) {
    return (
      <div className="relative w-full px-4 py-10 text-slate-900 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <Card className="rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-[0_24px_60px_-46px_rgba(15,23,42,0.35)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <UserRound className="h-7 w-7" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
              Servicio no disponible
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
              No se encontro el servicio de pre-sustentacion de Diego en este
              momento.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full px-4 py-10 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-6">
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="space-y-5">
            <Card className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-40px_rgba(15,23,42,0.35)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Especialista asignado
              </p>

              {loadingAdvisor ? (
                <div className="mt-5 flex items-center gap-3 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando servicio...
                </div>
              ) : (
                <>
                  <div className="mt-5 flex items-center gap-4">
                    <img
                      src={serviceAdvisor.avatar}
                      alt={serviceAdvisor.name}
                      className="h-16 w-16 rounded-[20px] object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold text-slate-950">
                        {serviceAdvisor.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {serviceAdvisor.role}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {serviceAdvisor.university}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {serviceAdvisor.bio}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {serviceAdvisor.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                      Pre-sustentacion
                    </span>
                  </div>
                </>
              )}
            </Card>

            <SubscriptionSummaryCard
              compact
              subscription={suscripcion}
              loading={loadingSuscripcion}
              serviceType="presustentacion"
            />
          </div>

          <div className="space-y-5">
            <Card className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-40px_rgba(15,23,42,0.35)]">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Agenda
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                      Disponibilidad de Diego
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                      Selecciona un dia y luego un bloque disponible para tu
                      ensayo de pre-sustentacion.
                    </p>
                  </div>

                  <div className="w-full lg:w-[220px]">
                    <Select
                      value={slotView}
                      onChange={(event) => setSlotView(event.target.value)}
                      className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-none"
                    >
                      {SLOT_VIEW_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Fechas disponibles
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {loadingSlots ? (
                      <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Cargando horarios...
                      </div>
                    ) : availableDays.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-8 text-sm text-slate-500">
                        No hay horarios disponibles en este momento.
                      </div>
                    ) : (
                      availableDays.map((day) => (
                        <button
                          key={day.key}
                          type="button"
                          onClick={() => handleSelectDay(day.key)}
                          className={`rounded-2xl border px-4 py-3 text-left transition ${
                            selectedDay === day.key
                              ? 'border-blue-200 bg-blue-50 text-blue-700'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                          title={day.fullLabel}
                        >
                          <span className="block text-sm font-semibold">
                            {day.label}
                          </span>
                          <span className="mt-1 block text-[11px] uppercase tracking-[0.16em] text-slate-400">
                            {day.fullLabel}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {availableDays.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Bloques disponibles
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {loadingSlots ? (
                        Array.from({ length: 6 }).map((_, index) => (
                          <div
                            key={`slot-skeleton-${index}`}
                            className="h-[92px] animate-pulse rounded-2xl border border-slate-200 bg-slate-50"
                          />
                        ))
                      ) : slotsForSelectedDay.length === 0 ? (
                        <div className="sm:col-span-2 xl:col-span-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-8 text-sm text-slate-500">
                          No hay horarios para la fecha seleccionada.
                        </div>
                      ) : (
                        slotsForSelectedDay.map((slot) => {
                          const isSelected = selectedSlotKey === slot.slotKey;
                          const durationLabel = formatDurationMinutes(
                            getSlotDurationMinutes(slot),
                          );

                          return (
                            <button
                              key={slot.slotKey}
                              type="button"
                              onClick={() => setSelectedSlotKey(slot.slotKey)}
                              className={`rounded-2xl border p-4 text-left transition ${
                                isSelected
                                  ? 'border-blue-200 bg-blue-50 shadow-[0_18px_40px_-34px_rgba(37,99,235,0.35)]'
                                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              <span className="block text-sm font-semibold text-slate-950">
                                {getSlotTimeRangeLabel(slot)}
                              </span>
                              <span className="mt-2 block text-xs text-slate-500">
                                Duracion: {durationLabel}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </Card>

            <Card className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-40px_rgba(15,23,42,0.35)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Resumen de la solicitud
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-500">Servicio</span>
                  <span className="text-sm font-semibold text-slate-950">
                    Pre-sustentacion
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-500">Especialista</span>
                  <span className="text-sm font-semibold text-slate-950">
                    {serviceAdvisor?.name || 'Diego'}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-500">Inversion</span>
                  <span className="text-sm font-semibold text-slate-950">
                    S/ {PRICE_PEN.toFixed(2)}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-500">Duracion</span>
                  <span className="text-sm font-semibold text-slate-950">
                    {selectedSlot
                      ? formatDurationMinutes(
                          getSlotDurationMinutes(selectedSlot),
                        )
                      : 'Selecciona un bloque'}
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600">
                {selectedSlot ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-blue-600" />
                      <span className="capitalize">
                        {formatFullDate(selectedSlot.inicio)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-blue-600" />
                      <span>{getSlotTimeRangeLabel(selectedSlot)}</span>
                    </div>
                  </div>
                ) : (
                  <p>Selecciona un bloque libre para enviar tu solicitud.</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={!serviceAdvisor || !selectedSlot || booking}
                className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
              >
                {booking ? 'Enviando...' : 'Solicitar reserva'}
              </button>
            </Card>
          </div>
        </div>
      </div>

      <Modal
        open={confirmOpen && !!serviceAdvisor && !!selectedSlot}
        onClose={() => !booking && setConfirmOpen(false)}
        title="Confirmar reserva"
        subtitle="La solicitud quedara pendiente de validacion"
        description={
          serviceAdvisor && selectedSlot
            ? `${serviceAdvisor.name} · ${formatFullDate(selectedSlot.inicio)} · ${getSlotTimeRangeLabel(
                selectedSlot,
              )}`
            : ''
        }
        primaryAction={{
          label: booking ? 'Enviando...' : 'Solicitar reserva',
          onClick: handleReserve,
          disabled: booking || !serviceAdvisor || !selectedSlot,
        }}
        secondaryAction={{
          label: 'Cancelar',
          onClick: () => setConfirmOpen(false),
          disabled: booking,
        }}
      />

      <Modal
        open={resultOpen}
        onClose={() => setResultOpen(false)}
        title="Solicitud creada"
        subtitle="Ahora debes esperar la validacion de Diego"
        description={
          bookingResult
            ? `Solicitud ID: ${bookingResult.validation_cita_id}\nEstado: ${bookingResult.estado || 'pending'}`
            : ''
        }
        primaryAction={{
          label: 'Listo',
          onClick: () => setResultOpen(false),
        }}
      >
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left text-sm text-emerald-800">
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            Solicitud registrada correctamente
          </div>
          <p>
            {reservationSummary
              ? `${reservationSummary.advisorName} revisara tu solicitud para el bloque ${reservationSummary.timeRange}.`
              : 'Diego revisara tu solicitud antes de confirmar la sesion.'}
          </p>
        </div>
      </Modal>
    </div>
  );
}

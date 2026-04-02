import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Card } from '../../components/ui/card';
import Modal from '../../components/ui/modal';
import { Select, SelectItem } from '../../components/ui/select';
import {
  obtenerAsesores,
  obtenerHorariosPresustentacionAsesor,
} from '../../services/advisorService';
import { reservarReunion } from '../../services/pagosService';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
} from 'lucide-react';

const fallbackAvatar =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBfY_M1vYqCVJM6C281-xl9p2WF-lRoXoF6XWzZ3OqCcsHuwSRxUQP-xUghy-u2Bub3dY-GFZgtO43We88a02lzg2ET9t9HPW_r-Z2C5pajAgGBthu0_JRhit-K_6qz0OOOJpruPijct0DLYYuXb47wLCaWCYr7D-u0FeS6Otbx5PaPL73ofhNRn8nat3vu10fB-1hEezuYn0ZumKHVMGzcrxLFAxbzHMp4yUlO4jQW9oHWW25bJh9WZflyp94rlf3CjlU01K_QO9u1';

const PRICE_PEN = 200;
const DIEGO_ASESOR_ID = 'cadc37f0-6037-4430-b993-533880b036b1';

const formatDateKey = (value) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
};

const formatDayChip = (value) =>
  new Intl.DateTimeFormat('es-PE', {
    weekday: 'short',
    day: '2-digit',
  }).format(new Date(value));

const formatFullDate = (value) =>
  new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(value));

const formatTime = (value) =>
  new Intl.DateTimeFormat('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));

const buildSlotKey = (slot) =>
  `${slot.disponibilidad_id}-${slot.inicio || slot.inicio_bloque}`;

const SLOT_VIEW_OPTIONS = [
  { value: 'this_week', label: 'Esta semana' },
  { value: 'next_week', label: 'Siguiente semana' },
  { value: 'this_month', label: 'Este mes' },
  { value: 'all', label: 'Todo lo disponible' },
];

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
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
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

const formatDuration = (start, end) => {
  if (!start || !end) return 'No definida';
  const diff = Math.max(
    0,
    Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000),
  );
  if (diff % 60 === 0) {
    return `${diff / 60} hora${diff === 60 ? '' : 's'}`;
  }
  return `${diff} minutos`;
};

const Services = () => {
  const [advisors, setAdvisors] = useState([]);
  const [loadingAdvisors, setLoadingAdvisors] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState(null);
  const [searchAdvisor, setSearchAdvisor] = useState('');
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlotKey, setSelectedSlotKey] = useState(null);
  const [slotView, setSlotView] = useState('this_week');
  const [booking, setBooking] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const pageSize = 3;

  const totalPages = Math.max(1, Math.ceil(advisors.length / pageSize));

  const paginatedAdvisors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return advisors.slice(start, start + pageSize);
  }, [advisors, currentPage]);

  const filteredSearch = useMemo(() => {
    const query = searchAdvisor.trim().toLowerCase();
    if (!query) return advisors.slice(0, 5);
    return advisors
      .filter((advisor) =>
        [advisor.name, advisor.role]
          .filter(Boolean)
          .some((text) => text.toLowerCase().includes(query)),
      )
      .slice(0, 5);
  }, [advisors, searchAdvisor]);

  const selectedAdvisor = useMemo(
    () => advisors.find((advisor) => advisor.id === selectedAdvisorId) || null,
    [advisors, selectedAdvisorId],
  );

  const slotFetchRange = useMemo(() => getFetchRange(slotView), [slotView]);

  const filteredSlots = useMemo(() => {
    const { start, end } = getSlotRange(slotView);

    return slots.filter((slot) => {
      const slotDate = new Date(slot.inicio);
      if (start && slotDate < start) return false;
      if (end && slotDate > end) return false;
      return true;
    });
  }, [slots, slotView]);

  const availableDays = useMemo(() => {
    const uniqueDays = [];
    const seen = new Set();

    filteredSlots.forEach((slot) => {
      const key = formatDateKey(slot.inicio);
      if (seen.has(key)) return;
      seen.add(key);
      uniqueDays.push({
        key,
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
    () =>
      filteredSlots.find((slot) => buildSlotKey(slot) === selectedSlotKey) ||
      null,
    [filteredSlots, selectedSlotKey],
  );

  useEffect(() => {
    const loadAdvisors = async () => {
      try {
        setLoadingAdvisors(true);
        const data = await obtenerAsesores();
        const mapped = (data || []).map((item) => ({
          id: item.asesor_id || item.id,
          name:
            item.nombre_mostrar ||
            [item.nombres, item.apellidos].filter(Boolean).join(' ') ||
            'Asesor',
          role: item.carrera || item.rol || 'Asesoría de tesis',
          avatar: item.foto_url || fallbackAvatar,
          rating: item.calificacion || item.rating || 4.8,
          tags: [item.especialidad || item.nivel_academico].filter(Boolean),
        }));

        const onlyDiego = mapped.filter(
          (advisor) => advisor.id === DIEGO_ASESOR_ID,
        );

        setAdvisors(onlyDiego);
        if (onlyDiego.length > 0) {
          setSelectedAdvisorId(onlyDiego[0].id);
        }
      } catch (error) {
        console.error(error);
        toast.error('No se pudieron cargar los asesores');
        setAdvisors([]);
      } finally {
        setLoadingAdvisors(false);
      }
    };

    loadAdvisors();
  }, []);

  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedAdvisorId) {
        setSlots([]);
        setSelectedDay(null);
        setSelectedSlotKey(null);
        return;
      }

      try {
        setLoadingSlots(true);
        const data = await obtenerHorariosPresustentacionAsesor(
          selectedAdvisorId,
          formatDateParam(slotFetchRange.start),
          formatDateParam(slotFetchRange.end),
        );

        const normalizedSlots = (data || [])
          .filter((slot) => slot.estado === 'libre')
          .map((slot) => ({
            ...slot,
            inicio: slot.inicio || slot.inicio_bloque,
            fin: slot.fin || slot.fin_bloque,
            slotKey: buildSlotKey(slot),
          }));

        setSlots(normalizedSlots);

        if (normalizedSlots.length > 0) {
          const firstDay = formatDateKey(normalizedSlots[0].inicio);
          setSelectedDay(firstDay);
          setSelectedSlotKey(normalizedSlots[0].slotKey);
        } else {
          setSelectedDay(null);
          setSelectedSlotKey(null);
        }
      } catch (error) {
        console.error(error);
        toast.error(error.message || 'No se pudo cargar la disponibilidad');
        setSlots([]);
        setSelectedDay(null);
        setSelectedSlotKey(null);
      } finally {
        setLoadingSlots(false);
      }
    };

    loadSlots();
  }, [selectedAdvisorId, slotFetchRange]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchAdvisor]);

  useEffect(() => {
    if (filteredSlots.length === 0) {
      setSelectedDay(null);
      setSelectedSlotKey(null);
      return;
    }

    const currentDayStillVisible =
      selectedDay &&
      filteredSlots.some((slot) => formatDateKey(slot.inicio) === selectedDay);

    const nextDay = currentDayStillVisible
      ? selectedDay
      : formatDateKey(filteredSlots[0].inicio);

    if (nextDay !== selectedDay) {
      setSelectedDay(nextDay);
    }

    const currentSlotStillVisible =
      selectedSlotKey &&
      filteredSlots.some((slot) => buildSlotKey(slot) === selectedSlotKey);

    if (!currentSlotStillVisible) {
      const firstSlotForDay = filteredSlots.find(
        (slot) => formatDateKey(slot.inicio) === nextDay,
      );
      setSelectedSlotKey(firstSlotForDay ? buildSlotKey(firstSlotForDay) : null);
    }
  }, [filteredSlots, selectedDay, selectedSlotKey]);

  const handleSelectAdvisor = (advisorId, advisorName = '') => {
    setSelectedAdvisorId(advisorId);
    if (advisorName) {
      setSearchAdvisor(advisorName);
    }
  };

  const handleSelectDay = (dayKey) => {
    setSelectedDay(dayKey);
    const firstSlotForDay = filteredSlots.find(
      (slot) => formatDateKey(slot.inicio) === dayKey,
    );
    setSelectedSlotKey(firstSlotForDay ? buildSlotKey(firstSlotForDay) : null);
  };

  const handleReserve = async () => {
    if (!selectedAdvisor || !selectedSlot) {
      toast.error('Selecciona un asesor y un horario');
      return;
    }

    try {
      setBooking(true);
      const result = await reservarReunion({
        disponibilidadId: selectedSlot.disponibilidad_id,
        asesorId: selectedAdvisor.id,
        motivo: 'Reserva de pre-sustentación',
        modalidad: 'virtual',
      });

      setBookingResult(result || null);
      setConfirmOpen(false);
      setResultOpen(true);
      toast.success('Pre-sustentación reservada correctamente');

      const refreshed = await obtenerHorariosPresustentacionAsesor(
        selectedAdvisor.id,
        formatDateParam(slotFetchRange.start),
        formatDateParam(slotFetchRange.end),
      );

      const normalizedSlots = (refreshed || [])
        .filter((slot) => slot.estado === 'libre')
        .map((slot) => ({
          ...slot,
          inicio: slot.inicio || slot.inicio_bloque,
          fin: slot.fin || slot.fin_bloque,
          slotKey: buildSlotKey(slot),
        }));

      setSlots(normalizedSlots);

      if (normalizedSlots.length > 0) {
        const nextDay = normalizedSlots.some(
          (slot) => formatDateKey(slot.inicio) === selectedDay,
        )
          ? selectedDay
          : formatDateKey(normalizedSlots[0].inicio);
        setSelectedDay(nextDay);

        const nextSlot = normalizedSlots.find(
          (slot) => formatDateKey(slot.inicio) === nextDay,
        );
        setSelectedSlotKey(nextSlot ? buildSlotKey(nextSlot) : null);
      } else {
        setSelectedDay(null);
        setSelectedSlotKey(null);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'No se pudo reservar la pre-sustentación');
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="relative w-full px-4 sm:px-6 lg:px-10 py-12 animate-in fade-in duration-700 text-slate-900">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-8">
        <div className="grid grid-cols-12 gap-8 items-start">
          <section className="col-span-12 lg:col-span-7 space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Catálogo de asesores
                  </p>
                  <h3 className="text-xl font-bold">
                    Selecciona un asesor para tu ensayo
                  </h3>
                </div>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-600">
                  {advisors.length} disponibles
                </span>
              </div>

              <div className="space-y-3">
                {loadingAdvisors && (
                  <p className="text-sm text-slate-500">Cargando asesores...</p>
                )}
                {!loadingAdvisors && paginatedAdvisors.length === 0 && (
                  <p className="text-sm text-slate-500">
                    No hay asesores disponibles.
                  </p>
                )}
                {paginatedAdvisors.map((advisor) => (
                  <Card
                    key={advisor.id}
                    className={`p-4 flex items-start gap-4 border-slate-200 transition ${
                      selectedAdvisorId === advisor.id
                        ? 'border-blue-200 bg-blue-50/40'
                        : 'hover:border-blue-100'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={advisor.avatar}
                        alt={advisor.name}
                        className="w-14 h-14 rounded-full object-cover border border-white/60"
                      />
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {advisor.name}
                          </p>
                          <p className="text-[12px] text-slate-500 font-semibold">
                            {advisor.role}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {advisor.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      className="text-xs font-bold text-white hover:underline p-3 rounded-full bg-background-dark"
                      onClick={() =>
                        handleSelectAdvisor(advisor.id, advisor.name)
                      }
                    >
                      {selectedAdvisorId === advisor.id
                        ? 'Seleccionado'
                        : 'Seleccionar'}
                    </button>
                  </Card>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200/60">
                <p className="text-sm text-slate-500">
                  Página {currentPage} de {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-slate-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-slate-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </Card>
          </section>

          <aside className="col-span-12 lg:col-span-5">
            <Card className="max-w-[480px] w-full p-8 relative overflow-hidden">
              <header className="relative z-10 mb-6">
                <h2 className="font-headline text-3xl font-bold tracking-tight text-slate-900 leading-tight mb-2">
                  Pre-Sustentación
                </h2>
                <p className="text-slate-600 text-sm font-medium leading-relaxed">
                  Selecciona un asesor del catálogo y agenda tu cita con bloques
                  realmente disponibles.
                </p>
              </header>

              <div className="space-y-8 relative z-10">
                <section>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-blue-600/80">
                      Seleccionar fecha
                    </h3>
                    <div className="min-w-[180px]">
                      <Select
                        value={slotView}
                        onChange={(event) => setSlotView(event.target.value)}
                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600"
                      >
                        {SLOT_VIEW_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      Próximas 2 semanas
                    </span>
                  </div>
                  <p className="mb-4 text-xs text-slate-500">
                    Vista de bloques para{' '}
                    {SLOT_VIEW_OPTIONS.find((option) => option.value === slotView)?.label.toLowerCase() || 'la agenda'}.
                  </p>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {loadingSlots && (
                      <div className="col-span-7 flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Cargando fechas...
                      </div>
                    )}
                    {!loadingSlots && availableDays.length === 0 && (
                      <div className="col-span-7 rounded-lg border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                        No hay fechas libres en esta vista. Prueba con otra
                        semana o con este mes.
                      </div>
                    )}
                    {!loadingSlots &&
                      availableDays.map((day) => (
                        <button
                          key={day.key}
                          onClick={() => handleSelectDay(day.key)}
                          className={`p-2 text-xs rounded-lg transition-colors ${
                            selectedDay === day.key
                              ? 'font-bold text-white bg-blue-600 shadow-lg shadow-blue-200'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                          title={day.fullLabel}
                        >
                          {day.label}
                        </button>
                      ))}
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-blue-600/80">
                      Seleccionar hora
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {loadingSlots && (
                      <div className="col-span-3 rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                        Buscando horarios...
                      </div>
                    )}
                    {!loadingSlots && slotsForSelectedDay.length === 0 && (
                      <div className="col-span-3 rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                        No hay horas disponibles para la fecha seleccionada.
                      </div>
                    )}
                    {!loadingSlots &&
                      slotsForSelectedDay.map((slot) => {
                        const slotKey = buildSlotKey(slot);
                        const isSelected = selectedSlotKey === slotKey;
                        return (
                          <button
                            key={slotKey}
                            onClick={() => setSelectedSlotKey(slotKey)}
                            className={`py-3 rounded-lg text-xs font-semibold transition-all border ${
                              isSelected
                                ? 'bg-blue-100 text-blue-700 border-blue-200 shadow-sm shadow-blue-200'
                                : 'bg-white/60 text-slate-700 border-slate-200 hover:border-blue-200'
                            }`}
                          >
                            <span className="block">
                              {formatTime(slot.inicio)}
                            </span>
                            <span className="block text-[10px] opacity-70">
                              hasta {formatTime(slot.fin)}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </section>

                <section>
                  <div className="relative">
                    <input
                      value={searchAdvisor}
                      onChange={(event) => setSearchAdvisor(event.target.value)}
                      className="w-full bg-white/70 border border-slate-200 rounded-lg py-3 px-4 pr-10 text-sm focus:ring-2 focus:ring-blue-400"
                      placeholder="Busca por nombre o especialidad"
                    />
                    <span className="absolute right-3 top-3.5 text-slate-400 text-lg">
                      <ArrowRight className="w-4 h-4 rotate-180" />
                    </span>
                  </div>
                  {filteredSearch.length > 0 && (
                    <div className="mt-3 bg-white border border-slate-200 rounded-lg shadow-sm max-h-52 overflow-y-auto">
                      {filteredSearch.map((item) => (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() =>
                            handleSelectAdvisor(item.id, item.name)
                          }
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-3"
                        >
                          <img
                            src={item.avatar || fallbackAvatar}
                            alt={item.name}
                            className="w-9 h-9 rounded-full object-cover border border-white/60"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {item.role}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-slate-700">
                            {item.rating}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </section>

                <section className="flex items-center justify-between p-4 bg-white/60 rounded-lg border border-slate-200/60">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        alt="Advisor"
                        className="w-12 h-12 rounded-full object-cover border border-white/60"
                        src={selectedAdvisor?.avatar || fallbackAvatar}
                      />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-blue-600/80 uppercase tracking-tighter">
                        Asesor
                      </p>
                      <h4 className="text-sm font-bold text-slate-900">
                        {selectedAdvisor?.name || 'Selecciona un asesor'}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {selectedAdvisor?.role || 'Sin carrera registrada'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center bg-slate-50 px-3 py-1 rounded-full border border-slate-200/60 text-[11px] font-bold text-slate-600">
                    {selectedSlot
                      ? 'Listo para reservar'
                      : 'Selecciona un horario'}
                  </div>
                </section>

                <section className="pt-4 border-t border-slate-200/50">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Inversión
                      </p>
                      <div className="flex items-baseline">
                        <span className="text-lg font-headline font-medium text-slate-900 mr-1">
                          S/
                        </span>
                        <span className="text-4xl font-headline font-bold text-slate-900 tracking-tighter">
                          {PRICE_PEN.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Duración
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {selectedSlot
                          ? formatDuration(
                              selectedSlot.inicio,
                              selectedSlot.fin,
                            )
                          : 'Selecciona un bloque'}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600">
                    {selectedSlot ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-blue-600" />
                          <span className="capitalize">
                            {formatFullDate(selectedSlot.inicio)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock3 className="w-4 h-4 text-blue-600" />
                          <span>
                            {formatTime(selectedSlot.inicio)} -{' '}
                            {formatTime(selectedSlot.fin)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p>
                        Elige primero un bloque libre para reservar tu ensayo de
                        pre-sustentación.
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => setConfirmOpen(true)}
                    disabled={!selectedAdvisor || !selectedSlot || booking}
                    className="w-full py-5 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-500 text-white font-headline font-bold text-base shadow-[0_10px_30px_rgba(10,71,238,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span>Reservar y pagar</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <p className="text-center text-[10px] text-slate-500 mt-4 font-medium">
                    Se generará una nota de pago para tu pre-sustentación
                  </p>
                </section>
              </div>
            </Card>
          </aside>
        </div>
      </div>

      <Modal
        open={confirmOpen && !!selectedAdvisor && !!selectedSlot}
        onClose={() => !booking && setConfirmOpen(false)}
        title="Confirmar reserva"
        subtitle="Pre-sustentación"
        description={
          selectedAdvisor && selectedSlot
            ? `${selectedAdvisor.name} · ${formatFullDate(selectedSlot.inicio)} · ${formatTime(
                selectedSlot.inicio,
              )} - ${formatTime(selectedSlot.fin)}`
            : ''
        }
        primaryAction={{
          label: booking ? 'Reservando...' : 'Reservar y generar pago',
          onClick: handleReserve,
        }}
        secondaryAction={{
          label: 'Cancelar',
          onClick: () => setConfirmOpen(false),
        }}
      />

      <Modal
        open={resultOpen}
        onClose={() => setResultOpen(false)}
        title="Reserva creada"
        subtitle="Tu pre-sustentación quedó registrada"
        description={
          bookingResult
            ? `Reunión ID: ${bookingResult.reunion_id}\nPago ID: ${bookingResult.pago_id}\nEstado: ${bookingResult.estado || 'pendiente'}`
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
            Reserva registrada correctamente
          </div>
          <p>Ahora puedes continuar con el pago desde tu bandeja de pagos.</p>
        </div>
      </Modal>
    </div>
  );
};

export default Services;

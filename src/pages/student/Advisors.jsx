import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { ArrowRight, CalendarDays, CheckCircle2, Users } from 'lucide-react';

import Modal from '../../components/ui/modal';
import AdvisorsQuickActions from '../../components/student/advisors/AdvisorsQuickActions';
import AdvisorFiltersBar from '../../components/student/advisors/AdvisorFiltersBar';
import AdvisorCatalogSection from '../../components/student/advisors/AdvisorCatalogSection';
import MyAdvisorsSection from '../../components/student/advisors/MyAdvisorsSection';
import AdvisorScheduleSection from '../../components/student/advisors/AdvisorScheduleSection';
import {
  crearCitaAsesoria,
  obtenerAsesores,
  obtenerHorariosDisponiblesAsesor,
  obtenerMisAsesores,
  vincularmeConAsesorPorSlug,
} from '../../services/advisorService';
import { obtenerMiSuscripcion } from '../../services/suscripcionService';
import {
  buildSlotKey,
  canScheduleRelation,
  formatDateKey,
  formatDurationMinutes,
  formatFullDate,
  getRelationStatusMeta,
  getSlotDurationMinutes,
  getSlotRange,
  getSlotTimeRangeLabel,
  getUniqueOptions,
  normalizeCatalogAdvisor,
  normalizeMyAdvisor,
} from '../../components/student/advisors/advisors.utils';

const PAGE_SIZE = 8;

export default function Advisors() {
  const [activeSection, setActiveSection] = useState('browse');
  const [catalogAdvisors, setCatalogAdvisors] = useState([]);
  const [myAdvisors, setMyAdvisors] = useState([]);
  const [subscription, setSubscription] = useState(null);

  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [loadingMyAdvisors, setLoadingMyAdvisors] = useState(true);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [linkingAdvisorId, setLinkingAdvisorId] = useState(null);
  const [booking, setBooking] = useState(false);

  const [searchValue, setSearchValue] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedCareer, setSelectedCareer] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedAdvisorId, setSelectedAdvisorId] = useState(null);
  const [slotView, setSlotView] = useState('this_week');
  const [slots, setSlots] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlotKey, setSelectedSlotKey] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [reservationSummary, setReservationSummary] = useState(null);

  const refreshMyAdvisors = useCallback(async () => {
    const data = await obtenerMisAsesores();
    const normalized = (data || [])
      .map(normalizeMyAdvisor)
      .filter((advisor) => advisor.id);

    setMyAdvisors(normalized);
    return normalized;
  }, []);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setLoadingCatalog(true);
        const data = await obtenerAsesores();
        const normalized = (data || [])
          .map(normalizeCatalogAdvisor)
          .filter((advisor) => advisor.id);
        setCatalogAdvisors(normalized);
      } catch (error) {
        console.error(error);
        toast.error('No se pudo cargar el catálogo de asesores');
      } finally {
        setLoadingCatalog(false);
      }
    };

    loadCatalog();
  }, []);

  useEffect(() => {
    const loadMyAdvisorList = async () => {
      try {
        setLoadingMyAdvisors(true);
        await refreshMyAdvisors();
      } catch (error) {
        console.error(error);
        toast.error('No se pudieron cargar tus asesores');
      } finally {
        setLoadingMyAdvisors(false);
      }
    };

    loadMyAdvisorList();
  }, [refreshMyAdvisors]);

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        setLoadingSubscription(true);
        const data = await obtenerMiSuscripcion();
        setSubscription(data ?? null);
      } catch (error) {
        console.error(error);
        setSubscription(null);
      } finally {
        setLoadingSubscription(false);
      }
    };

    loadSubscription();
  }, []);

  useEffect(() => {
    if (myAdvisors.length === 0) {
      setSelectedAdvisorId(null);
      return;
    }

    const hasSelectedAdvisor = myAdvisors.some(
      (advisor) => advisor.id === selectedAdvisorId,
    );

    if (!hasSelectedAdvisor) {
      const nextAdvisor =
        myAdvisors.find((advisor) => canScheduleRelation(advisor.estado)) ||
        myAdvisors[0];
      setSelectedAdvisorId(nextAdvisor.id);
    }
  }, [myAdvisors, selectedAdvisorId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, selectedUniversity, selectedCareer]);

  const relationsByAdvisorId = useMemo(
    () => new Map(myAdvisors.map((advisor) => [advisor.id, advisor])),
    [myAdvisors],
  );

  const selectedAdvisor = useMemo(
    () => myAdvisors.find((advisor) => advisor.id === selectedAdvisorId) || null,
    [myAdvisors, selectedAdvisorId],
  );

  const selectedAdvisorRelation = selectedAdvisor
    ? relationsByAdvisorId.get(selectedAdvisor.id) || null
    : null;

  const universityOptions = useMemo(
    () => getUniqueOptions(catalogAdvisors, 'university'),
    [catalogAdvisors],
  );

  const careerOptions = useMemo(
    () => getUniqueOptions(catalogAdvisors, 'career'),
    [catalogAdvisors],
  );

  const filteredCatalog = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return catalogAdvisors.filter((advisor) => {
      const matchesSearch =
        !query ||
        [advisor.name, advisor.publicCode]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));

      const matchesUniversity =
        !selectedUniversity || advisor.university === selectedUniversity;

      const matchesCareer = !selectedCareer || advisor.career === selectedCareer;

      return matchesSearch && matchesUniversity && matchesCareer;
    });
  }, [catalogAdvisors, searchValue, selectedUniversity, selectedCareer]);

  const totalPages = Math.max(1, Math.ceil(filteredCatalog.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedCatalog = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCatalog.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredCatalog]);

  const hasActiveFilters = Boolean(
    searchValue.trim() || selectedUniversity || selectedCareer,
  );

  const loadSlotsForAdvisor = useCallback(async (advisor) => {
    if (!advisor?.id || !canScheduleRelation(advisor.estado)) {
      setSlots([]);
      setSelectedDay(null);
      setSelectedSlotKey(null);
      return;
    }

    try {
      setLoadingSlots(true);
      const data = await obtenerHorariosDisponiblesAsesor(advisor.id);
      const normalized = (data || [])
        .filter((slot) => slot.estado === 'libre')
        .map((slot) => ({
          ...slot,
          slotKey: buildSlotKey(slot),
        }));

      setSlots(normalized);

      if (normalized.length === 0) {
        setSelectedDay(null);
        setSelectedSlotKey(null);
        return;
      }

      const firstSlot = normalized[0];
      setSelectedDay(formatDateKey(firstSlot.inicio_bloque));
      setSelectedSlotKey(firstSlot.slotKey);
    } catch (error) {
      console.error(error);
      toast.error('No se pudo cargar la disponibilidad del asesor');
      setSlots([]);
      setSelectedDay(null);
      setSelectedSlotKey(null);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    loadSlotsForAdvisor(selectedAdvisor);
  }, [loadSlotsForAdvisor, selectedAdvisor]);

  const filteredSlots = useMemo(() => {
    const { start, end } = getSlotRange(slotView);

    return slots.filter((slot) => {
      const slotDate = new Date(slot.inicio_bloque);
      if (start && slotDate < start) return false;
      if (end && slotDate > end) return false;
      return true;
    });
  }, [slotView, slots]);

  const availableDays = useMemo(() => {
    const uniqueDays = [];
    const seen = new Set();

    filteredSlots.forEach((slot) => {
      const dayKey = formatDateKey(slot.inicio_bloque);
      if (!dayKey || seen.has(dayKey)) return;

      seen.add(dayKey);
      uniqueDays.push({
        key: dayKey,
        label: new Intl.DateTimeFormat('es-PE', {
          weekday: 'short',
          day: '2-digit',
        }).format(new Date(slot.inicio_bloque)),
        fullLabel: formatFullDate(slot.inicio_bloque),
      });
    });

    return uniqueDays;
  }, [filteredSlots]);

  const slotsForSelectedDay = useMemo(() => {
    if (!selectedDay) return [];

    return filteredSlots.filter(
      (slot) => formatDateKey(slot.inicio_bloque) === selectedDay,
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
      filteredSlots.some(
        (slot) => formatDateKey(slot.inicio_bloque) === selectedDay,
      )
        ? selectedDay
        : formatDateKey(filteredSlots[0].inicio_bloque);

    if (nextDay !== selectedDay) {
      setSelectedDay(nextDay);
    }

    const visibleSlot =
      selectedSlotKey &&
      filteredSlots.some((slot) => slot.slotKey === selectedSlotKey);

    if (!visibleSlot) {
      const nextSlot = filteredSlots.find(
        (slot) => formatDateKey(slot.inicio_bloque) === nextDay,
      );
      setSelectedSlotKey(nextSlot?.slotKey || null);
    }
  }, [filteredSlots, selectedDay, selectedSlotKey]);

  const readyForMeetingCount = useMemo(
    () => myAdvisors.filter((advisor) => canScheduleRelation(advisor.estado)).length,
    [myAdvisors],
  );

  const quickActionCounts = useMemo(
    () => ({
      browse: filteredCatalog.length,
      'my-advisors': myAdvisors.length,
      meeting: readyForMeetingCount,
    }),
    [filteredCatalog.length, myAdvisors.length, readyForMeetingCount],
  );

  const handleClearFilters = useCallback(() => {
    setSearchValue('');
    setSelectedUniversity('');
    setSelectedCareer('');
  }, []);

  const handleContactAdvisor = useCallback(
    async (advisor) => {
      if (!advisor?.slug) {
        toast.error('Este asesor no tiene acceso público disponible');
        return;
      }

      try {
        setLinkingAdvisorId(advisor.id);
        await vincularmeConAsesorPorSlug(advisor.slug);
        const nextMyAdvisors = await refreshMyAdvisors();
        const linkedAdvisor = nextMyAdvisors.find((item) => item.id === advisor.id);

        if (linkedAdvisor) {
          setSelectedAdvisorId(linkedAdvisor.id);
        }

        setActiveSection('my-advisors');
        toast.success('Asesor contactado correctamente');
      } catch (error) {
        console.error(error);
        toast.error(error.message || 'No se pudo contactar al asesor');
      } finally {
        setLinkingAdvisorId(null);
      }
    },
    [refreshMyAdvisors],
  );

  const handleSelectAdvisor = useCallback((advisorId) => {
    setSelectedAdvisorId(advisorId);
  }, []);

  const handleSelectDay = useCallback(
    (dayKey) => {
      setSelectedDay(dayKey);
      const nextSlot = filteredSlots.find(
        (slot) => formatDateKey(slot.inicio_bloque) === dayKey,
      );
      setSelectedSlotKey(nextSlot?.slotKey || null);
    },
    [filteredSlots],
  );

  const handleReserve = useCallback(async () => {
    if (!selectedAdvisor || !selectedSlot) {
      toast.error('Selecciona un horario disponible');
      return;
    }

    if (!canScheduleRelation(selectedAdvisor.estado)) {
      toast.error('Solo puedes reservar con asesores ya conectados');
      return;
    }

    try {
      setBooking(true);
      setReservationSummary({
        advisorName: selectedAdvisor.name,
        fullDate: formatFullDate(selectedSlot.inicio_bloque),
        timeRange: getSlotTimeRangeLabel(selectedSlot),
        duration: formatDurationMinutes(getSlotDurationMinutes(selectedSlot)),
        status: getRelationStatusMeta(selectedAdvisor.estado).label,
      });

      const result = await crearCitaAsesoria({
        p_asesor_id: selectedAdvisor.id,
        p_disponibilidad_id: selectedSlot.disponibilidad_id,
        p_inicio: selectedSlot.inicio_bloque,
        p_fin: selectedSlot.fin_bloque,
        p_tesis_id: null,
        p_motivo: 'Solicitud de asesoría',
        p_tipo_servicio: 'asesoria',
        p_modalidad: 'virtual',
        p_lugar: null,
        p_enlace_reunion: null,
        p_notas: null,
      });

      setBookingResult(result || null);
      setConfirmOpen(false);
      setResultOpen(true);
      toast.success('Solicitud enviada correctamente');
      await loadSlotsForAdvisor(selectedAdvisor);
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'No se pudo solicitar la reunión');
    } finally {
      setBooking(false);
    }
  }, [loadSlotsForAdvisor, selectedAdvisor, selectedSlot]);

  const selectedAdvisorStatus = selectedAdvisor
    ? getRelationStatusMeta(selectedAdvisor.estado)
    : null;

  return (
    <div className="relative w-full px-4 py-10 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-6">

        <AdvisorsQuickActions
          activeSection={activeSection}
          onChange={setActiveSection}
          counts={quickActionCounts}
        />

        {activeSection === 'browse' ? (
          <div className="space-y-5">
            <AdvisorFiltersBar
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              selectedUniversity={selectedUniversity}
              onUniversityChange={setSelectedUniversity}
              selectedCareer={selectedCareer}
              onCareerChange={setSelectedCareer}
              universityOptions={universityOptions}
              careerOptions={careerOptions}
              resultCount={filteredCatalog.length}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
            />

            <AdvisorCatalogSection
              loading={loadingCatalog}
              advisors={paginatedCatalog}
              selectedAdvisorId={selectedAdvisorId}
              currentPage={currentPage}
              totalPages={totalPages}
              linkedCount={myAdvisors.length}
              linkingAdvisorId={linkingAdvisorId}
              relationsByAdvisorId={relationsByAdvisorId}
              onSelectAdvisor={handleSelectAdvisor}
              onContactAdvisor={handleContactAdvisor}
              onOpenMyAdvisors={() => setActiveSection('my-advisors')}
              onPrevPage={() => setCurrentPage((page) => Math.max(1, page - 1))}
              onNextPage={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              hasActiveFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
            />
          </div>
        ) : null}

        {activeSection === 'my-advisors' ? (
          <MyAdvisorsSection
            loading={loadingMyAdvisors}
            advisors={myAdvisors}
            selectedAdvisorId={selectedAdvisorId}
            onSelectAdvisor={handleSelectAdvisor}
            onOpenBrowse={() => setActiveSection('browse')}
          />
        ) : null}

        {activeSection === 'meeting' ? (
          <AdvisorScheduleSection
            advisors={myAdvisors}
            loadingMyAdvisors={loadingMyAdvisors}
            selectedAdvisor={selectedAdvisor}
            selectedAdvisorRelation={selectedAdvisorRelation}
            loadingSlots={loadingSlots}
            slotView={slotView}
            onSlotViewChange={setSlotView}
            availableDays={availableDays}
            selectedDay={selectedDay}
            onSelectDay={handleSelectDay}
            slotsForSelectedDay={slotsForSelectedDay}
            selectedSlotKey={selectedSlotKey}
            onSelectSlot={setSelectedSlotKey}
            selectedSlot={selectedSlot}
            booking={booking}
            onOpenConfirm={() => setConfirmOpen(true)}
            onOpenBrowse={() => setActiveSection('browse')}
            onSelectAdvisor={handleSelectAdvisor}
            subscription={subscription}
            loadingSubscription={loadingSubscription}
          />
        ) : null}
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirmar solicitud"
        subtitle="Asesorías"
        description="Revisa los datos antes de enviar tu solicitud al asesor seleccionado."
        modalWidth="lg"
        primaryAction={{
          label: booking ? 'Enviando...' : 'Confirmar solicitud',
          onClick: handleReserve,
          disabled: booking || !selectedAdvisor || !selectedSlot,
        }}
        secondaryAction={{
          label: 'Cancelar',
          onClick: () => setConfirmOpen(false),
          disabled: booking,
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Asesor
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {selectedAdvisor?.name || 'Sin selección'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {selectedAdvisorStatus?.label || 'Sin vínculo'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Horario
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {selectedSlot ? getSlotTimeRangeLabel(selectedSlot) : 'Sin selección'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {selectedSlot
                ? formatDurationMinutes(getSlotDurationMinutes(selectedSlot))
                : 'Selecciona un bloque'}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Fecha
          </p>
          <p className="mt-2 text-sm text-slate-700">
            {selectedSlot
              ? formatFullDate(selectedSlot.inicio_bloque)
              : 'Selecciona primero un horario disponible'}
          </p>
        </div>
      </Modal>

      <Modal
        open={resultOpen}
        onClose={() => setResultOpen(false)}
        title="Solicitud enviada"
        subtitle="Asesorías"
        description="Tu solicitud ya fue enviada al asesor. Te avisaremos cuando cambie de estado."
        modalWidth="lg"
        primaryAction={{
          label: 'Entendido',
          onClick: () => setResultOpen(false),
        }}
      >
        <div className="grid gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
            <p className="text-sm font-medium">
              {bookingResult?.status || bookingResult?.estado
                ? `Estado actual: ${bookingResult.status || bookingResult.estado}`
                : 'La solicitud quedó registrada correctamente.'}
            </p>
          </div>

          {reservationSummary ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    {reservationSummary.advisorName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {reservationSummary.fullDate}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                  {reservationSummary.duration}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <CalendarDays className="h-4 w-4" />
                  <span className="text-sm">{reservationSummary.timeRange}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{reservationSummary.status}</span>
                </div>
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => {
              setResultOpen(false);
              setActiveSection('meeting');
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Volver a la agenda
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </Modal>
    </div>
  );
}

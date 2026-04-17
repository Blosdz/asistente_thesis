import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Users,
} from 'lucide-react';

import { Select, SelectItem } from '../../ui/select';
import { Card } from '../../ui/card';
import SubscriptionSummaryCard from '../SubscriptionSummaryCard';
import AdvisorsEmptyState from './AdvisorsEmptyState';
import {
  SLOT_VIEW_OPTIONS,
  canScheduleRelation,
  formatDurationMinutes,
  formatFullDate,
  getRelationStatusMeta,
  getSlotDurationMinutes,
  getSlotTimeRangeLabel,
} from './advisors.utils';

function ScheduleAdvisorItem({ advisor, isSelected, onSelect }) {
  const statusMeta = getRelationStatusMeta(advisor.estado);
  const canSchedule = canScheduleRelation(advisor.estado);

  return (
    <button
      type="button"
      onClick={() => onSelect(advisor.id)}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        isSelected
          ? 'border-blue-200 bg-blue-50/70'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <img
          src={advisor.avatar}
          alt={advisor.name}
          className="h-12 w-12 rounded-2xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-slate-950">
              {advisor.name}
            </p>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusMeta.className}`}
            >
              {statusMeta.label}
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-slate-500">
            {advisor.career}
          </p>
          <p className="mt-1 truncate text-xs text-slate-400">
            {canSchedule
              ? 'Agenda disponible al seleccionar este asesor.'
              : 'Primero espera la confirmación del vínculo.'}
          </p>
        </div>
      </div>
    </button>
  );
}

function ScheduleSummaryCard({ selectedAdvisor, selectedSlot, onConfirm, booking, canConfirm }) {
  const slotDuration = selectedSlot
    ? formatDurationMinutes(getSlotDurationMinutes(selectedSlot))
    : null;

  return (
    <Card className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-40px_rgba(15,23,42,0.35)]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        Resumen de la solicitud
      </p>

      {selectedAdvisor ? (
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
          <img
            src={selectedAdvisor.avatar}
            alt={selectedAdvisor.name}
            className="h-12 w-12 rounded-2xl object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950">
              {selectedAdvisor.name}
            </p>
            <p className="truncate text-xs text-slate-500">
              {selectedAdvisor.career}
            </p>
          </div>
        </div>
      ) : null}

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600">
        {selectedSlot ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-600" />
              <span className="capitalize">
                {formatFullDate(selectedSlot.inicio_bloque)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-blue-600" />
              <span>{getSlotTimeRangeLabel(selectedSlot)}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <span>Duración: {slotDuration}</span>
            </div>
          </div>
        ) : (
          <p>
            Selecciona un bloque para completar tu solicitud de reunión.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onConfirm}
        disabled={!canConfirm || booking}
        className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
      >
        {booking ? 'Enviando...' : 'Solicitar reunión'}
      </button>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        El asesor validará la solicitud antes de confirmar la sesión y definir
        si corresponde un pago adicional.
      </p>
    </Card>
  );
}

export default function AdvisorScheduleSection({
  advisors,
  loadingMyAdvisors,
  selectedAdvisor,
  selectedAdvisorRelation,
  loadingSlots,
  slotView,
  onSlotViewChange,
  availableDays,
  selectedDay,
  onSelectDay,
  slotsForSelectedDay,
  selectedSlotKey,
  onSelectSlot,
  selectedSlot,
  booking,
  onOpenConfirm,
  onOpenBrowse,
  onSelectAdvisor,
  subscription,
  loadingSubscription,
}) {
  const canScheduleSelectedAdvisor = selectedAdvisorRelation
    ? canScheduleRelation(selectedAdvisorRelation.estado)
    : false;
  const canConfirm = Boolean(
    selectedAdvisor && selectedAdvisorRelation && canScheduleSelectedAdvisor && selectedSlot,
  );

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Solicitar reunión
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
          Selecciona un asesor y revisa su disponibilidad
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
          La agenda se habilita desde tus asesores vinculados. Elige uno para
          ver sus bloques disponibles y reservar una reunión.
        </p>
      </div>

      {loadingMyAdvisors ? (
        <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="h-[520px] animate-pulse rounded-[28px] border border-slate-200 bg-white" />
          <div className="h-[520px] animate-pulse rounded-[28px] border border-slate-200 bg-white" />
        </div>
      ) : advisors.length === 0 ? (
        <AdvisorsEmptyState
          icon={Users}
          title="Aún no puedes solicitar reuniones"
          description="Primero necesitas contactar al menos a un asesor desde el catálogo. Cuando tu vínculo exista, la agenda se habilitará aquí."
          actionLabel="Buscar asesores"
          onAction={onOpenBrowse}
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <Card className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-40px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Mis asesores
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-950">
                  Elige con quién agendar
                </h3>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {advisors.length}
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {advisors.map((advisor) => (
                <ScheduleAdvisorItem
                  key={advisor.relacionId || advisor.id}
                  advisor={advisor}
                  isSelected={selectedAdvisor?.id === advisor.id}
                  onSelect={onSelectAdvisor}
                />
              ))}
            </div>
          </Card>

          <div className="space-y-5">
            <Card className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-40px_rgba(15,23,42,0.35)]">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Agenda
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-950">
                      {selectedAdvisor
                        ? `Disponibilidad de ${selectedAdvisor.name}`
                        : 'Selecciona un asesor'}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedAdvisor
                        ? 'Todos los bloques se presentan como espacios compactos para reservar tu reunión.'
                        : 'Selecciona un asesor para revisar su disponibilidad.'}
                    </p>
                  </div>

                  <div className="w-full lg:w-[220px]">
                    <Select
                      value={slotView}
                      onChange={(event) => onSlotViewChange(event.target.value)}
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

                {!selectedAdvisor ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-10 text-center text-sm text-slate-500">
                    Selecciona un asesor para revisar su disponibilidad.
                  </div>
                ) : !selectedAdvisorRelation ? (
                  <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50 px-4 py-8 text-sm text-amber-700">
                    Primero debes contactar a este asesor para habilitar su
                    agenda.
                  </div>
                ) : !canScheduleSelectedAdvisor ? (
                  <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50 px-4 py-8 text-sm text-amber-700">
                    Tu vínculo con este asesor aún está pendiente. Cuando sea
                    aceptado, podrás solicitar una reunión.
                  </div>
                ) : (
                  <>
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
                              onClick={() => onSelectDay(day.key)}
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
                              No hay horarios disponibles para la fecha
                              seleccionada.
                            </div>
                          ) : (
                            slotsForSelectedDay.map((slot) => {
                              const slotKey = slot.slotKey;
                              const isSelected = selectedSlotKey === slotKey;
                              const durationLabel = formatDurationMinutes(
                                getSlotDurationMinutes(slot),
                              );

                              return (
                                <button
                                  key={slotKey}
                                  type="button"
                                  onClick={() => onSelectSlot(slotKey)}
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
                                    Duración: {durationLabel}
                                  </span>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </Card>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
              <ScheduleSummaryCard
                selectedAdvisor={selectedAdvisor}
                selectedSlot={selectedSlot}
                onConfirm={onOpenConfirm}
                booking={booking}
                canConfirm={canConfirm}
              />

              <SubscriptionSummaryCard
                compact
                subscription={subscription}
                loading={loadingSubscription}
                serviceType="asesoria"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

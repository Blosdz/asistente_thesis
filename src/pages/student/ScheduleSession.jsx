import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  CheckCircle2,
  CalendarClock,
  Loader2,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import Modal from '../../components/ui/modal';
import { obtenerAsesores } from '../../services/advisorService';
import {
  disponibilidadAsesorSemana,
  reservarReunion,
} from '../../services/pagosService';

const formatTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const formatDate = (iso) => new Date(iso).toLocaleDateString();

export default function ScheduleSession() {
  const [advisors, setAdvisors] = useState([]);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  useEffect(() => {
    const loadAdvisors = async () => {
      try {
        const data = await obtenerAsesores();
        setAdvisors(data || []);
        if (data?.[0]?.asesor_id || data?.[0]?.id) {
          setSelectedAdvisorId(data[0].asesor_id || data[0].id);
        }
      } catch (error) {
        console.error(error);
        toast.error('No se pudieron cargar los asesores');
      }
    };
    loadAdvisors();
  }, []);

  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedAdvisorId) return;
      try {
        setLoadingSlots(true);
        const today = new Date();
        const in7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const data = await disponibilidadAsesorSemana({
          asesorId: selectedAdvisorId,
          desde: today,
          hasta: in7,
        });
        setSlots(data || []);
        setSelectedSlotId(data?.[0]?.disponibilidad_id || null);
      } catch (error) {
        console.error(error);
        toast.error('No se pudo cargar la disponibilidad');
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    loadSlots();
  }, [selectedAdvisorId]);

  const selectedSlot = useMemo(
    () => slots.find((s) => s.disponibilidad_id === selectedSlotId),
    [slots, selectedSlotId],
  );

  const handleReserve = async () => {
    if (!selectedSlot) {
      toast.error('Selecciona un horario');
      return;
    }
    try {
      setBooking(true);
      const result = await reservarReunion({
        disponibilidadId: selectedSlot.disponibilidad_id,
        asesorId: selectedAdvisorId,
        motivo: 'Reserva de sesión',
        modalidad: 'virtual',
      });
      setBookingResult(result);
      setConfirmOpen(false);
      setResultOpen(true);
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'No se pudo reservar');
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center py-10 px-6 animate-fade-in">
      <div className="w-full max-w-[1200px] flex flex-col gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass-card rounded-3xl p-8 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-900">Agenda tu sesión</h3>
              <div className="flex gap-2">
                <button className="p-2 rounded-full hover:bg-white/40 text-slate-600 transition-colors" aria-label="Mes anterior">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-full hover:bg-white/40 text-slate-600 transition-colors" aria-label="Mes siguiente">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 mb-4">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-3">
              {Array.from({ length: 21 }, (_, i) => i + 1).map((day) => (
                <div
                  key={`day-${day}`}
                  className="aspect-square flex items-center justify-center rounded-2xl glass-card transition-all font-medium text-slate-700 border border-white/60"
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="glass-card border-white/50 bg-white/20 p-6 rounded-3xl shadow-xl flex flex-col gap-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <CalendarClock className="w-4 h-4" /> Horarios disponibles
              </h4>

              <div className="flex flex-col gap-2 min-h-[200px]">
                {loadingSlots ? (
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Cargando disponibilidad...
                  </div>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-slate-500">No hay horarios disponibles esta semana.</p>
                ) : (
                  slots.map((slot) => {
                    const isSelected = selectedSlotId === slot.disponibilidad_id;
                    return (
                      <button
                        key={slot.disponibilidad_id}
                        onClick={() => setSelectedSlotId(slot.disponibilidad_id)}
                        className={`w-full py-3 px-4 glass-card rounded-xl my-1 flex justify-between items-center transition-all group ${
                          isSelected
                            ? 'border-[1.5px] border-blue-500 bg-white/80 shadow-md'
                            : 'border border-white/60 hover:bg-white/70 hover:shadow-md'
                        }`}
                      >
                        <div className="flex flex-col items-start">
                          <span className={`font-semibold ${isSelected ? 'text-blue-700' : 'text-slate-900'}`}>
                            {formatDate(slot.inicio)}
                          </span>
                          <span className={`text-xs ${isSelected ? 'text-blue-600/70' : 'text-slate-500'}`}>
                            {formatTime(slot.inicio)} - {formatTime(slot.fin)}
                          </span>
                        </div>

                        {isSelected ? (
                          <CheckCircle2 className="w-6 h-6 text-blue-600" />
                        ) : (
                          <PlusCircle className="w-6 h-6 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl mt-4 shadow-lg shadow-blue-500/30 transition-all active:scale-95 border border-blue-500 backdrop-blur-sm"
                disabled={!selectedSlot || booking}
                onClick={() => setConfirmOpen(true)}
              >
                {booking ? 'Reservando...' : 'Confirmar Reserva'}
              </Button>
            </div>

            <div className="glass-card rounded-3xl p-6 shadow-xl flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-cover bg-center border-2 border-white shadow-sm" style={{ backgroundImage: `url(${advisors.find((a) => a.asesor_id === selectedAdvisorId)?.foto_url || advisors.find((a) => a.id === selectedAdvisorId)?.foto_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfdGuJzGbQCJDNygmZDy66lTD1k8dsAJC-y1EKHskRKL1hHPkVI-nCr62e1J_ix9u4HNjz8X0rX68oIMQnExazzqJHqwMJ7aI93EGOnf5_PY30S4K7uS-2NL5dgGyTEQh9LWE2M1yGXX2O1tmccgvgI0Qg0Ki7IVfj1Ni9jisHmAyGOGjniWB2Aeo8qVAeyOJe81Du68uKasOW_1mM6HlHhRiRUWOpqHn6P6kgkVDGiDYwzL0zNbFWkPR2TzmF-crd3cBHsHVRwTg'})` }}></div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900">{advisors.find((a) => a.asesor_id === selectedAdvisorId || a.id === selectedAdvisorId)?.nombre_mostrar || 'Asesor'}</span>
                <span className="text-xs text-slate-600 uppercase font-bold tracking-tight">
                  {advisors.find((a) => a.asesor_id === selectedAdvisorId || a.id === selectedAdvisorId)?.carrera || 'Asesoría'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={confirmOpen && !!selectedSlot}
        onClose={() => !booking && setConfirmOpen(false)}
        title="Confirmar reserva"
        subtitle="Se generará una nota de pago de S/200"
        description={selectedSlot ? `${formatDate(selectedSlot.inicio)} · ${formatTime(selectedSlot.inicio)} - ${formatTime(selectedSlot.fin)}` : ''}
        primaryAction={{
          label: booking ? 'Reservando...' : 'Reservar y pagar',
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
        subtitle="Revisa tu pago pendiente"
        description={bookingResult ? `Pago ID: ${bookingResult.pago_id}\nEstado: ${bookingResult.estado}` : ''}
        primaryAction={{
          label: 'Listo',
          onClick: () => setResultOpen(false),
        }}
      >
        {bookingResult?.enlace && (
          <div className="text-sm text-slate-700 bg-white/70 border border-slate-200 rounded-2xl p-4">
            <p className="font-semibold mb-1">Enlace provisional:</p>
            <a
              className="text-blue-600 hover:underline break-all"
              href={bookingResult.enlace}
              target="_blank"
              rel="noreferrer"
            >
              {bookingResult.enlace}
            </a>
          </div>
        )}
      </Modal>
    </div>
  );
}

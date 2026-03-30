import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Card } from '../../components/ui/card';
import { obtenerAsesores } from '../../services/advisorService';
import { ArrowRight } from 'lucide-react';

const fallbackAvatar =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBfY_M1vYqCVJM6C281-xl9p2WF-lRoXoF6XWzZ3OqCcsHuwSRxUQP-xUghy-u2Bub3dY-GFZgtO43We88a02lzg2ET9t9HPW_r-Z2C5pajAgGBthu0_JRhit-K_6qz0OOOJpruPijct0DLYYuXb47wLCaWCYr7D-u0FeS6Otbx5PaPL73ofhNRn8nat3vu10fB-1hEezuYn0ZumKHVMGzcrxLFAxbzHMp4yUlO4jQW9oHWW25bJh9WZflyp94rlf3CjlU01K_QO9u1';

const days = [
  { label: 'L', value: '5', muted: true },
  { label: 'M', value: '6', muted: true },
  { label: 'M', value: '7' },
  { label: 'J', value: '8', active: true },
  { label: 'V', value: '9' },
  { label: 'S', value: '10' },
  { label: 'D', value: '11' },
];

const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

const Services = () => {
  const [advisors, setAdvisors] = useState([]);
  const [loadingAdvisors, setLoadingAdvisors] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDay, setSelectedDay] = useState('8');
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [selectedAdvisorId, setSelectedAdvisorId] = useState(null);
  const [searchAdvisor, setSearchAdvisor] = useState('');
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
      .filter((a) =>
        [a.nombre_mostrar, a.nombres, a.apellidos, a.rol, a.role]
          .filter(Boolean)
          .some((t) => t.toLowerCase().includes(query)),
      )
      .slice(0, 5);
  }, [advisors, searchAdvisor]);

  useEffect(() => {
    const loadAdvisors = async () => {
      try {
        setLoadingAdvisors(true);
        const data = await obtenerAsesores();
        const mapped = (data || []).map((item) => ({
          id: item.asesor_id || item.id,
          name: item.nombre_mostrar || [item.nombres, item.apellidos].filter(Boolean).join(' ') || 'Asesor',
          role: item.carrera || item.rol || 'Asesoría de tesis',
          avatar: item.foto_url || fallbackAvatar,
          rating: item.calificacion || item.rating || 4.8,
          tags: [item.especialidad || item.nivel_academico].filter(Boolean),
        }));

        setAdvisors(mapped);
        if (mapped.length > 0) {
          setSelectedAdvisorId(mapped[0].id);
        }
      } catch (err) {
        console.error(err);
        toast.error('No se pudieron cargar los asesores');
        setAdvisors([]);
      } finally {
        setLoadingAdvisors(false);
      }
    };

    loadAdvisors();
  }, []);

  return (
    <div className="relative w-full px-4 sm:px-6 lg:px-10 py-12 animate-in fade-in duration-700 text-slate-900">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-8">
        <div className="grid grid-cols-12 gap-8 items-start">
          <section className="col-span-12 lg:col-span-7 space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Lista de asesores</p>
                  <h3 className="text-xl font-bold">Elige un mentor</h3>
                </div>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-600">
                  {advisors.length} disponibles
                </span>
              </div>

              <div className="space-y-3">
                {loadingAdvisors && <p className="text-sm text-slate-500">Cargando asesores...</p>}
                {!loadingAdvisors && paginatedAdvisors.length === 0 && (
                  <p className="text-sm text-slate-500">No hay asesores disponibles.</p>
                )}
                {paginatedAdvisors.map((advisor) => (
                  <Card
                    key={advisor.id}
                    className="p-4 flex items-start gap-4 border-slate-200 hover:border-blue-100 transition"
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
                          <p className="text-sm font-bold text-slate-900">{advisor.name}</p>
                          <p className="text-[12px] text-slate-500 font-semibold">{advisor.role}</p>
                        </div>
                        <div className="flex items-center bg-slate-50 px-3 py-1 rounded-full border border-slate-200/60 text-[11px] font-bold text-slate-600">
                          Disponibilidad
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
                      className="text-xs font-bold text-blue-600 hover:underline"
                      onClick={() => setSelectedAdvisorId(advisor.id)}
                    >
                      Elegir
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
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-slate-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
                  Pre-Sustentación Rehearsal
                </h2>
                <p className="text-slate-600 text-sm font-medium leading-relaxed">
                  Agenda un ensayo, recibe feedback y llega listo a tu defensa.
                </p>
              </header>

              <div className="space-y-8 relative z-10">
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-blue-600/80">
                      Seleccionar fecha
                    </h3>
                    <span className="text-xs font-semibold text-slate-500">Agosto 2024</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {days.map((day) => (
                      <button
                        key={day.value + day.label}
                        onClick={() => setSelectedDay(day.value)}
                        className={`p-2 text-xs rounded-lg transition-colors ${
                          day.active || selectedDay === day.value
                            ? 'font-bold text-white bg-blue-600 shadow-lg shadow-blue-200'
                            : day.muted
                              ? 'text-slate-400 opacity-70'
                              : 'text-slate-700 hover:bg-slate-100'
                        }`}
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
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`py-3 rounded-lg text-xs font-semibold transition-all border ${
                          selectedTime === slot
                            ? 'bg-blue-100 text-blue-700 border-blue-200 shadow-sm shadow-blue-200'
                            : 'bg-white/60 text-slate-700 border-slate-200 hover:border-blue-200'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-blue-600/80">
                      Buscar asesor
                    </h3>
                  </div>
                  <div className="relative">
                    <input
                      value={searchAdvisor}
                      onChange={(e) => setSearchAdvisor(e.target.value)}
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
                          onClick={() => {
                            setSelectedAdvisorId(item.id);
                            setSearchAdvisor(item.name);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-3"
                        >
                          <img
                            src={item.avatar || fallbackAvatar}
                            alt={item.name}
                            className="w-9 h-9 rounded-full object-cover border border-white/60"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">{item.role}</p>
                          </div>
                          <span className="text-xs font-bold text-slate-700">{item.rating}</span>
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
                        src={
                          advisors.find((a) => a.id === selectedAdvisorId)?.avatar || fallbackAvatar
                        }
                      />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-blue-600/80 uppercase tracking-tighter">Advisor</p>
                      <h4 className="text-sm font-bold text-slate-900">
                        {advisors.find((a) => a.id === selectedAdvisorId)?.name || 'Selecciona un asesor'}
                      </h4>
                    </div>
                  </div>
                  <div className="flex items-center bg-slate-50 px-3 py-1 rounded-full border border-slate-200/60 text-[11px] font-bold text-slate-600">
                    Confirmado
                  </div>
                </section>

                <section className="pt-4 border-t border-slate-200/50">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inversión</p>
                      <div className="flex items-baseline">
                        <span className="text-lg font-headline font-medium text-slate-900 mr-1">S/</span>
                        <span className="text-4xl font-headline font-bold text-slate-900 tracking-tighter">200.00</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Duración</p>
                      <p className="text-sm font-bold text-slate-900">60 minutos</p>
                    </div>
                  </div>
                  <button className="w-full py-5 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-500 text-white font-headline font-bold text-base shadow-[0_10px_30px_rgba(10,71,238,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2">
                    <span>Reservar y pagar</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <p className="text-center text-[10px] text-slate-500 mt-4 font-medium">
                    Pago seguro para tu pre-sustentación
                  </p>
                </section>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Services;

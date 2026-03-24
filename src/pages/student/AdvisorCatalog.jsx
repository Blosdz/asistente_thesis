import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Star, Calendar, Handshake } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  obtenerAsesores,
  vincularmeConAsesorPorSlug,
} from '../../services/advisorService.js';

export default function AdvisorCatalog({ isComponent = false }) {
  const navigate = useNavigate();
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        setLoading(true);
        const data = await obtenerAsesores();
        setAdvisors(data || []);
      } catch (error) {
        toast.error('Error al cargar la lista de asesores');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdvisors();
  }, []);

  const handleConnect = async (slug) => {
    try {
      await vincularmeConAsesorPorSlug(slug);
      toast.success('Te has vinculado con el asesor exitosamente');
      navigate('/student/services');
    } catch (error) {
      toast.error(error.message || 'Error al vincularse con el asesor');
    }
  };

  const filteredAdvisors = advisors.filter(
    (advisor) =>
      advisor.nombre_mostrar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      advisor.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      advisor.email_publico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      advisor.carrera?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      advisor.universidad_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      advisor.nivel_academico?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-10 w-full animate-fade-in text-slate-900">
      {!isComponent && (
        <Button
          variant="link"
          onClick={() => navigate('/student/services')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver a Servicios</span>
        </Button>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-8">
        <aside className="glass-card rounded-3xl p-6 shadow-sm border border-white/60 flex flex-col gap-6 h-fit sticky top-28">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Filtrar asesores</h2>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
              Refinar búsqueda
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Búsqueda rápida
            </span>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 font-light" />
              <Input
                className="rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 border-none focus:ring-2 focus:ring-blue-500 shadow-sm placeholder:text-slate-400"
                placeholder="Nombre, carrera o universidad"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Estado
            </span>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full border border-blue-100">
                PhD Candidate
              </span>
              <span className="px-3 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">
                Profesor
              </span>
              <span className="px-3 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">
                Senior Researcher
              </span>
            </div>
          </div>

          <Button className="w-full py-3">Aplicar filtros</Button>
        </aside>

        <section className="flex flex-col gap-8">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Asesores disponibles
              </h1>
              <p className="text-slate-500 mt-1">
                {filteredAdvisors.length} mentores expertos disponibles para ti.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/60 p-1.5 rounded-xl border border-slate-200/50">
              <Button variant="secondary" className="px-4 py-2 text-xs font-bold">
                Vista lista
              </Button>
              <Button variant="ghost" className="px-4 py-2 text-xs font-bold text-slate-500">
                Vista grid
              </Button>
            </div>
          </header>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : filteredAdvisors.length > 0 ? (
            <div className="flex flex-col gap-6">
              {filteredAdvisors.map((advisor) => (
                <div
                  key={advisor.asesor_id || advisor.slug}
                  className="group bg-white/60 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-8 shadow-[0_12px_40px_rgba(0,88,188,0.06)] hover:translate-y-[-4px] transition-all duration-300"
                >
                  <div className="relative">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-[4px] border-white/70 shadow-inner bg-gray-100 flex items-center justify-center">
                      {advisor.foto_url ? (
                        <img
                          alt={advisor.nombre_mostrar || 'Asesor'}
                          className="w-full h-full object-cover rounded-full"
                          src={advisor.foto_url}
                        />
                      ) : (
                        <span className="text-2xl font-bold text-gray-400">
                          {advisor.nombre_mostrar?.[0] || 'A'}
                        </span>
                      )}
                    </div>
                    <div
                      className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"
                      title="Disponible"
                    ></div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                      <h3 className="text-xl font-extrabold text-slate-900">
                        {advisor.nombre_mostrar || 'Asesor Académico'}
                      </h3>
                      {advisor.nivel_academico && (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                          {advisor.nivel_academico}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-blue-700 mb-3">
                      {advisor.universidad_nombre || 'Universidad no registrada'}
                      {' • '}
                      {advisor.carrera || 'Carrera no registrada'}
                    </p>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4 max-w-xl">
                      {advisor.biografia ||
                        'Sin biografía disponible por el momento.'}
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md uppercase tracking-wider">
                        Slug: {advisor.slug}
                      </span>
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md uppercase tracking-wider">
                        {advisor.especialidad_nombre || 'Especialidad'}
                      </span>
                    </div>
                  </div>
                  <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-3 min-w-[180px]">
                    <div className="text-center md:text-right">
                      <div className="flex items-center justify-center md:justify-end gap-1 text-amber-500 mb-1">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-lg font-black text-slate-900">4.9</span>
                        <span className="text-xs text-slate-400 font-medium">(128)</span>
                      </div>
                      <div className="text-2xl font-black text-slate-900">
                        $85<span className="text-sm font-medium text-slate-400">/hr</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                      <Button
                        onClick={() => handleConnect(advisor.slug)}
                        className="w-full py-3 bg-blue-600 text-white shadow-md hover:shadow-lg transition-all active:scale-95"
                      >
                        Vincular asesor
                      </Button>
                      <Button
                        variant="secondary"
                        className="w-full py-3 text-slate-700"
                      >
                        Ver perfil
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500 font-medium bg-white/40 rounded-3xl border border-white/50">
              No se encontraron asesores.
            </div>
          )}

          <div className="mt-8 glass-card rounded-[40px] p-10 bg-gradient-to-br from-white/60 to-white/20 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <div className="w-14 h-14 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-500/30 mb-6 mx-auto md:mx-0">
                  <Handshake className="w-7 h-7 font-light" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                  ¿No estás seguro por dónde empezar?
                </h2>
                <p className="text-gray-600 max-w-lg leading-relaxed">
                  Reserva una sesión de diagnóstico con nuestro equipo. Revisaremos
                  el estado actual de tu tesis y te indicaremos los siguientes pasos.
                </p>
              </div>
              <Button
                className="whitespace-nowrap bg-blue-600 text-white px-10 py-5 text-lg shadow-xl shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all"
                onClick={() =>
                  window.open(
                    'https://cal.com/aeiaespacio/sesion-de-diagnostico',
                    '_blank',
                  )
                }
              >
                Consigue una cita
              </Button>
            </div>

            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl"></div>
          </div>
        </section>
      </div>
    </div>
  );
}

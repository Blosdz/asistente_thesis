import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Star, Calendar, Handshake } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
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
      advisor.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      advisor.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      advisor.especialidad?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-10 w-full animate-fade-in text-slate-900">
      {/* Hero Section */}
      <div className="mb-12">
        {!isComponent && (
          <button
            onClick={() => navigate('/student/services')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver a Servicios</span>
          </button>
        )}
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          Elige a tu Asesor
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
          Conecta con mentores experimentados que puedan guiar tu camino
          académico y el desarrollo de tu tesis.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-10 text-slate-900">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 font-light" />
            <input
              className="w-full glass-card rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 border-none focus:ring-2 focus:ring-blue-500 shadow-sm placeholder:text-slate-400"
              placeholder="Buscar por nombre o especialidad..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          <button className="px-6 py-2.5 rounded-full bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/20 whitespace-nowrap">
            Todos
          </button>
          <button className="px-6 py-2.5 rounded-full glass-card text-gray-700 font-semibold text-sm hover:bg-white/60 transition-all border-white/50 whitespace-nowrap">
            Metodología
          </button>
          <button className="px-6 py-2.5 rounded-full glass-card text-gray-700 font-semibold text-sm hover:bg-white/60 transition-all border-white/50 whitespace-nowrap">
            Software
          </button>
          <button className="px-6 py-2.5 rounded-full glass-card text-gray-700 font-semibold text-sm hover:bg-white/60 transition-all border-white/50 whitespace-nowrap">
            Electrónica
          </button>
          <button className="px-6 py-2.5 rounded-full glass-card text-gray-700 font-semibold text-sm hover:bg-white/60 transition-all border-white/50 whitespace-nowrap">
            Investigación
          </button>
        </div>
      </div>

      {/* Advisor Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAdvisors.length > 0 ? (
            filteredAdvisors.map((advisor) => (
              <div
                key={advisor.id || advisor.slug}
                className="glass-card rounded-3xl p-8 flex flex-col hover:translate-y-[-4px] transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/50 shadow-sm bg-gray-100 flex items-center justify-center">
                      {advisor.foto_perfil ? (
                        <img
                          alt={`${advisor.nombres} ${advisor.apellidos}`}
                          className="w-full h-full object-cover"
                          src={advisor.foto_perfil}
                        />
                      ) : (
                        <span className="text-2xl font-bold text-gray-400">
                          {advisor.nombres?.[0] || 'A'}
                          {advisor.apellidos?.[0] || ''}
                        </span>
                      )}
                    </div>
                    <div
                      className="absolute -bottom-1.5 -right-1.5 bg-green-500 w-5 h-5 rounded-full border-4 border-white shadow-sm"
                      title="Disponible"
                    ></div>
                  </div>
                  <div className="flex items-center gap-1 bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full text-sm font-bold">
                    <Star className="w-4 h-4 fill-current" />
                    <span>4.9</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {advisor.nombres} {advisor.apellidos}
                </h3>
                <p className="text-blue-600 font-semibold text-sm mb-4">
                  {advisor.especialidad || 'Asesor Académico'}
                </p>
                <p className="text-gray-600 text-sm mb-8 leading-relaxed line-clamp-3">
                  {advisor.biografia ||
                    'Experto en desarrollo académico y estrategias de investigación personalizadas para estudiantes de alto rendimiento.'}
                </p>

                <button
                  onClick={() => handleConnect(advisor.slug)}
                  className="w-full py-4 mt-auto bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Vincular Asesor
                  <Handshake className="w-5 h-5 font-light" />
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-gray-500 font-medium bg-white/40 rounded-3xl border border-white/50">
              No se encontraron asesores.
            </div>
          )}
        </div>
      )}

      {/* Match Assistance Callout */}
      <div className="mt-16 glass-card rounded-[40px] p-12 bg-gradient-to-br from-white/60 to-white/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-500/30 mb-6 mx-auto md:mx-0">
              <Handshake className="w-8 h-8 font-light" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
              ¿No estás seguro por dónde empezar?
            </h2>
            <p className="text-gray-600 max-w-lg leading-relaxed">
              Reserva una sesión de diagnóstico con nuestro equipo. Revisaremos
              el estado actual de tu tesis y te indicaremos los siguientes pasos
              ideales para ti.
            </p>
          </div>
          <button
            className="whitespace-nowrap bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all"
            onClick={() =>
              window.open(
                'https://cal.com/aeiaespacio/sesion-de-diagnostico',
                '_blank',
              )
            }
          >
            Consigue una cita
          </button>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}

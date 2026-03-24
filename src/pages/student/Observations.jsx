import { useState, useEffect } from 'react';
import { MessageSquare, AlertCircle, CheckCircle2, ChevronRight, Filter, Calendar, FileText } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { obtenerSugerenciasMiTesis, obtenerMisTesis } from '../../services/thesisService';
import { Select, SelectItem } from '../../components/ui/select';
import { toast } from 'react-hot-toast';

const Observations = () => {
  const [theses, setTheses] = useState([]);
  const [selectedThesisId, setSelectedThesisId] = useState('');
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load theses to select from
  useEffect(() => {
    const loadTheses = async () => {
      try {
        const data = await obtenerMisTesis();
        setTheses(data || []);
        if (data && data.length > 0 && !selectedThesisId) {
          setSelectedThesisId(data[0].id);
        }
      } catch (err) {
        console.error(err);
        toast.error('Error al cargar tus tesis');
      }
    };
    loadTheses();
  }, []);

  // Load observations when thesis changes
  useEffect(() => {
    const loadObservations = async () => {
      if (!selectedThesisId) {
        setObservations([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const data = await obtenerSugerenciasMiTesis(selectedThesisId);
        setObservations(data || []);
      } catch (err) {
        console.error(err);
        toast.error('Error al cargar las observaciones');
      } finally {
        setLoading(false);
      }
    };
    
    loadObservations();
  }, [selectedThesisId]);

  const selectedThesis = theses.find(t => t.id === selectedThesisId);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Sin fecha';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header aligned with the HTML design */}
      <header className="mb-10">
        <div className="flex items-center gap-2 text-primary font-semibold mb-2">
          <span className="text-xs uppercase tracking-widest text-ios-blue">Revisión y Feedback</span>
        </div>
        
        {theses.length > 0 ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">
                {selectedThesis?.titulo || "Selecciona una tesis"}
              </h1>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="bg-ios-blue/10 text-ios-blue px-3 py-1 rounded-full font-bold">
                  {selectedThesis?.estado || 'En progreso'}
                </span>
                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold">
                  ID: {selectedThesis?.id?.slice(0, 8)}...
                </span>
              </div>
            </div>
            
            {/* Tesis Selector */}
            <div className="w-full md:w-64 flex-shrink-0">
              <Select 
                value={selectedThesisId} 
                onChange={(e) => setSelectedThesisId(e.target.value)}
                className="w-full bg-white shadow-sm border-slate-200"
              >
                {theses.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.titulo}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
        ) : (
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">
            Mis Observaciones
          </h1>
        )}
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Observations List */}
        <div className="lg:col-span-8 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                <MessageSquare className="text-ios-blue" size={24} />
                Feedback del Asesor
              </h2>
              <button className="p-2 rounded-lg bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors text-slate-500">
                <Filter size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="bg-white/60 backdrop-blur-md p-8 rounded-2xl shadow-sm text-center border border-slate-100 animate-pulse">
                  <p className="text-slate-500 font-medium">Cargando observaciones...</p>
                </div>
              ) : observations.length === 0 ? (
                <div className="bg-white/60 backdrop-blur-md p-10 rounded-2xl shadow-sm text-center border border-slate-100">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="text-slate-400" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">¡Todo en orden!</h3>
                  <p className="text-sm text-slate-500">Aún no hay observaciones o sugerencias registradas para esta tesis.</p>
                </div>
              ) : (
                observations.map((obs) => {
                  /* Parse logical statuses if present, or assign base on data */
                  const isCritical = obs.r_sugerencia?.toLowerCase().includes('urgente') || obs.r_sugerencia?.toLowerCase().includes('crítico');
                  const isApproved = obs.r_sugerencia?.toLowerCase().includes('aprobado') || obs.r_sugerencia?.toLowerCase().includes('excelente');
                  
                  // Style configurations based on content analysis
                  let borderClass = 'border-l-4 border-ios-blue';
                  let badgeBg = 'bg-blue-100 text-blue-700';
                  let badgeText = 'Sugerencia';
                  
                  if (isCritical) {
                    borderClass = 'border-l-4 border-red-500';
                    badgeBg = 'bg-red-100 text-red-700';
                    badgeText = 'Crítico';
                  } else if (isApproved) {
                    borderClass = 'border border-slate-200 opacity-80'; // no strong left border
                    badgeBg = 'bg-emerald-100 text-emerald-700';
                    badgeText = 'Positivo';
                  }

                  return (
                    <div 
                      key={obs.r_sugerencia_id} 
                      className={`bg-white p-6 rounded-2xl shadow-[0_12px_40px_rgba(0,88,188,0.04)] hover:shadow-[0_20px_50px_rgba(0,88,188,0.08)] transition-all duration-300 ${borderClass}`}
                    >
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full flex-shrink-0 bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-400 overflow-hidden border-2 border-white shadow-sm">
                          {obs.r_nombre_asesor ? obs.r_nombre_asesor.charAt(0).toUpperCase() : 'A'}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                            <div>
                              <h3 className="font-bold text-base text-slate-900 truncate">{obs.r_nombre_asesor || 'Asesor'}</h3>
                              <p className="text-xs text-slate-400 font-medium mt-0.5">{formatDate(obs.r_creado_en)}</p>
                            </div>
                            <span className={`${badgeBg} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider self-start shrink-0`}>
                              {badgeText}
                            </span>
                          </div>
                          
                          <p className={`text-sm mb-4 leading-relaxed ${isApproved ? 'text-slate-500 italic' : 'text-slate-700'}`}>
                            {obs.r_sugerencia}
                          </p>
                          
                          {obs.r_documento_tesis_id && !isApproved && (
                            <Button variant="link" className="h-auto p-0 text-ios-blue font-bold text-sm hover:underline flex items-center gap-1.5">
                              <FileText size={16} />
                              Ver Documento Asociado
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Status & Action Panel */}
        <aside className="lg:col-span-4 space-y-6">
          
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_12px_40px_rgba(0,88,188,0.06)] flex flex-col items-center text-center">
            <h3 className="text-lg font-bold text-slate-900 mb-6 w-full text-left">Resumen Actual</h3>
            
            <div className="flex justify-center w-full mb-6">
              <div className="relative w-32 h-32 flex items-center justify-center bg-slate-50 rounded-full border-8 border-slate-100 shadow-inner">
                <span className="text-3xl font-black text-slate-800">{observations.length}</span>
                <span className="absolute bottom-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Notas</span>
              </div>
            </div>
            
            <div className="w-full space-y-3 mb-6">
               <div className="flex justify-between items-center text-sm p-3.5 bg-slate-50 rounded-xl">
                 <span className="text-slate-500 font-medium">Asesor asignado</span>
                 <span className="font-bold text-slate-700 truncate max-w-[120px]">
                   {observations.length > 0 ? observations[0].r_nombre_asesor : 'No definido'}
                 </span>
               </div>
               <div className="flex justify-between items-center text-sm p-3.5 bg-slate-50 rounded-xl">
                 <span className="text-slate-500 font-medium">Última revisión</span>
                 <span className="font-bold text-slate-700">
                   {observations.length > 0 ? formatDate(observations[0].r_creado_en) : '—'}
                 </span>
               </div>
            </div>
          </div>

          <div className="bg-ios-blue text-white p-6 rounded-3xl shadow-xl shadow-blue-500/20 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <Calendar className="w-32 h-32" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-4 flex items-center gap-2">
               Consejo Rápido
            </h3>
            <p className="text-sm font-medium leading-relaxed mb-6">
              Revisa las notas del asesor y realiza los ajustes en tu documento antes de subir una nueva versión para optimizar el tiempo de respuesta.
            </p>
            <Button className="w-full bg-white text-ios-blue rounded-xl py-5 text-sm font-bold shadow-sm hover:bg-white/90 transition-colors">
              Ir a Mis Tesis
            </Button>
          </div>

        </aside>

      </div>
    </div>
  );
};

export default Observations;

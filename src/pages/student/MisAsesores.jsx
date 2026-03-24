import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FileText, User, Calendar, ExternalLink } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { obtenerMisAsesores } from '../../services/advisorService';
import AssignThesisModal from '../../components/AssignThesisModal';

export default function MisAsesores({ hideHeader = false }) {
  const navigate = useNavigate();
  const [asesores, setAsesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRelacionId, setSelectedRelacionId] = useState(null);

  const fetchMisAsesores = async () => {
    try {
      setLoading(true);
      const data = await obtenerMisAsesores();
      setAsesores(data || []);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar tus asesores vinculados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMisAsesores();
  }, []);

  const openAssignModal = (relacionId) => {
    setSelectedRelacionId(relacionId);
    setModalOpen(true);
  };

  const handleAssigned = () => {
    setModalOpen(false);
    // Recargar la lista para reflejar la tesis vinculada
    fetchMisAsesores();
  };

  return (
    <div className="mb-0">
      {!hideHeader && (
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Mis Asesores</h2>
            <p className="text-slate-500 mt-1">Asesores con los que estás trabajando actualmente.</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-ios-blue border-t-transparent"></div>
        </div>
      ) : asesores.length === 0 ? (
        <div className="bg-white/60 border border-slate-200/50 rounded-3xl p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Aún no tienes asesores</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
            Explora nuestro catálogo de asesores y solicita vincularte con el que mejor se adapte a tus necesidades.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Asesor</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tesis Vinculada</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {asesores.map((asesor) => (
                  <tr key={asesor.relacion_id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-100 bg-white flex-shrink-0">
                          {asesor.foto_url ? (
                            <img src={asesor.foto_url} alt={asesor.nombre_mostrar} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-lg">
                              {asesor.nombre_mostrar?.charAt(0) || 'A'}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 group-hover:text-ios-blue transition-colors capitalize">
                            {asesor.nombre_mostrar || 'Asesor Sin Nombre'}
                          </h3>
                          <p className="text-xs text-slate-500">{asesor.carrera}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${asesor.estado === 'activo' || !asesor.estado ? 'bg-green-100 text-green-700' : 
                          asesor.estado === 'pendiente' ? 'bg-amber-100 text-amber-700' : 
                          'bg-slate-100 text-slate-700'}`}
                      >
                        {asesor.estado || 'Activo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {asesor.tiene_tesis ? (
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-blue-50 text-ios-blue rounded-lg">
                            <FileText className="w-4 h-4 flex-shrink-0" />
                          </div>
                          <p className="text-sm font-semibold text-slate-800 line-clamp-2 max-w-[250px]" title={asesor.tesis_titulo || 'Tesis asignada'}>
                            {asesor.tesis_titulo || 'Tesis asignada'}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400 italic">Ninguna asignada</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2 w-full">
                        {asesor.tiene_tesis ? (
                          <Button 
                            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 shadow-sm min-w-[140px]"
                            onClick={() => navigate('/student/my-thesis')}
                          >
                            <ExternalLink className="w-4 h-4" />
                            Ver tesis
                          </Button>
                        ) : (
                          <div className="flex flex-col items-center gap-1.5 min-w-[140px]">
                            <Button 
                              className="bg-ios-blue hover:bg-blue-600 text-white shadow-sm flex items-center justify-center gap-2 w-full"
                              onClick={() => openAssignModal(asesor.relacion_id)}
                              disabled={asesor.estado === 'pendiente'}
                            >
                              <FileText className="w-4 h-4" />
                              Asignar tesis
                            </Button>
                            {asesor.estado === 'pendiente' && (
                              <p className="text-[10px] text-center text-slate-400">
                                Esperando aprobación
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <AssignThesisModal 
          relacionId={selectedRelacionId} 
          onClose={() => setModalOpen(false)} 
          onAssigned={handleAssigned} 
        />
      )}
    </div>
  );
}
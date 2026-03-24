import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { toast } from 'react-hot-toast';
import { obtenerMisTesis } from '../services/thesisService';
import { asignarTesisAsesor } from '../services/advisorService';

export default function AssignThesisModal({ relacionId, onClose, onAssigned }) {
  const [tesis, setTesis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    cargarTesis();
  }, []);

  const cargarTesis = async () => {
    try {
      setLoading(true);
      const data = await obtenerMisTesis();
      setTesis(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar tus tesis');
    } finally {
      setLoading(false);
    }
  };

  const asignar = async (tesisId) => {
    try {
      setAssigning(true);
      toast.loading('Asignando tesis...', { id: 'assign_thesis' });
      
      await asignarTesisAsesor(relacionId, tesisId);
      
      toast.success('Tesis asignada correctamente', { id: 'assign_thesis' });
      onAssigned();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error al asignar la tesis', { id: 'assign_thesis' });
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 shadow-xl w-full max-w-md border border-slate-100 flex flex-col gap-6" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-bold text-slate-900">Selecciona una tesis</h3>
          <p className="text-sm text-slate-500">
            Elige qué tesis deseas vincular con este asesor para que pueda revisarla.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-ios-blue border-t-transparent"></div>
          </div>
        ) : tesis.length > 0 ? (
          <div className="flex flex-col gap-3 max-h-[40vh] overflow-y-auto pr-2">
            {tesis.map((t) => (
              <div 
                key={t.id} 
                className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 transition-colors"
              >
                <div>
                  <h4 className="font-bold text-slate-800 text-sm truncate max-w-[200px]">
                    {t.titulo || 'Tesis sin título'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Creada: {new Date(t.creado_en).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => asignar(t.id)}
                  disabled={assigning}
                  className="bg-ios-blue hover:bg-blue-600 text-white shrink-0"
                >
                  Seleccionar
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            No tienes tesis creadas todavía.
            <br/>Ve a "Mi Tesis" para crear una.
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button variant="ghost" onClick={onClose} disabled={assigning}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
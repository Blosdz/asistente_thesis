import { useEffect, useState } from 'react';
import { Loader2, Table2, X } from 'lucide-react';

import { toast } from 'react-hot-toast';

import { listColmenaForms, listColmenaProjects } from '../../../api/colmenaCharts';
import {
  buildBaremoMarker,
  getFormBaremoResolution,
  importBaremoToThesis,
} from '../../../api/colmenaBaremos';

/**
 * Modal para insertar un baremo (escala de puntuación) de Colmena en la tesis.
 * Flujo: proyecto → formulario → lista de baremos (uno por instrumento/dimensión/
 * variable). Al elegir uno, llama onInsert(marker, meta) con el marcador que la
 * vista previa convierte en una tabla de niveles.
 */
export default function ColmenaBaremoPickerModal({ open, onClose, onInsert, tesisId }) {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [forms, setForms] = useState([]);
  const [formId, setFormId] = useState('');
  const [baremos, setBaremos] = useState([]); // VariableBaremoRead[]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar proyectos al abrir.
  useEffect(() => {
    if (!open) return;
    let cancel = false;
    setError('');
    setLoading(true);
    listColmenaProjects()
      .then((items) => {
        if (cancel) return;
        setProjects(items);
      })
      .catch((e) => !cancel && setError(`No se pudieron cargar los proyectos de Colmena: ${e.message}`))
      .finally(() => !cancel && setLoading(false));
    return () => {
      cancel = true;
    };
  }, [open]);

  // Al cambiar proyecto → cargar formularios.
  useEffect(() => {
    if (!projectId) {
      setForms([]);
      setFormId('');
      return;
    }
    let cancel = false;
    setError('');
    setLoading(true);
    listColmenaForms(projectId)
      .then((items) => {
        if (cancel) return;
        setForms(items);
        setFormId('');
        setBaremos([]);
      })
      .catch((e) => !cancel && setError(`No se pudieron cargar los formularios: ${e.message}`))
      .finally(() => !cancel && setLoading(false));
    return () => {
      cancel = true;
    };
  }, [projectId]);

  // Al cambiar formulario → resolver baremos (incluye niveles, sin llamada extra).
  useEffect(() => {
    if (!formId) {
      setBaremos([]);
      return;
    }
    let cancel = false;
    setError('');
    setLoading(true);
    getFormBaremoResolution(formId)
      .then((items) => {
        if (!cancel) setBaremos(items);
      })
      .catch((e) => !cancel && setError(`No se pudieron cargar los baremos: ${e.message}`))
      .finally(() => !cancel && setLoading(false));
    return () => {
      cancel = true;
    };
  }, [formId]);

  if (!open) return null;

  const handlePick = async (baremo) => {
    const caption = baremo.variable_label || baremo.scoring_config_name || 'Baremo';
    const marker = buildBaremoMarker({
      formId,
      configId: baremo.scoring_config_id,
      caption,
    });
    // Persistir en la tesis (colmena_baremos_tesis) para exportarlo luego en el DOCX.
    if (tesisId) {
      try {
        await importBaremoToThesis(tesisId, {
          formId,
          scoringConfigId: baremo.scoring_config_id,
          titulo: caption,
        });
      } catch (e) {
        toast.error(`No se pudo importar el baremo a la tesis: ${e.message}`);
        return;
      }
    }
    onInsert?.(marker, { item: baremo });
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Table2 className="h-5 w-5 text-violet-500" />
            <h3 className="text-base font-semibold text-gray-800">Insertar baremo de Colmena</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Selectores */}
        <div className="grid grid-cols-1 gap-3 border-b border-gray-100 px-6 py-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
            Proyecto
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200"
            >
              <option value="">Selecciona un proyecto</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
            Formulario
            <select
              value={formId}
              onChange={(e) => setFormId(e.target.value)}
              disabled={!projectId || forms.length === 0}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {forms.length === 0 ? 'Sin formularios' : 'Selecciona un formulario'}
              </option>
              {forms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title || f.name || f.id}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando...
            </div>
          ) : !formId ? (
            <p className="py-12 text-center text-sm text-gray-400">
              Elige un proyecto y un formulario para ver sus baremos.
            </p>
          ) : baremos.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-gray-400">
              <Table2 className="h-8 w-8" />
              Este formulario aún no tiene baremos configurados.
              <span className="text-xs">Configura un scoring en Colmena → Puntuación.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {baremos.map((baremo) => (
                <button
                  key={baremo.scoring_config_id}
                  type="button"
                  onClick={() => handlePick(baremo)}
                  className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 p-3 text-left transition-all hover:border-violet-400 hover:shadow-md"
                  title="Insertar este baremo"
                >
                  <span className="truncate text-sm font-medium text-gray-700 group-hover:text-violet-600">
                    {baremo.variable_label || baremo.scoring_config_name || 'Baremo'}
                  </span>
                  <span className="mt-0.5 truncate text-xs text-gray-400">
                    {baremo.scoring_config_name}
                  </span>
                  <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-600">
                    {baremo.levels?.length || 0} niveles
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

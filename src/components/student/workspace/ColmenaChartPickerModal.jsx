import { useEffect, useState } from 'react';
import { BarChart3, ImageOff, Loader2, X } from 'lucide-react';

import { toast } from 'react-hot-toast';

import {
  buildFigureMarker,
  getChartDataUrl,
  importChartToThesis,
  listColmenaForms,
  listColmenaProjects,
  listWordReadyCharts,
} from '../../../api/colmenaCharts';

/**
 * Modal para insertar una gráfica de Colmena en la tesis.
 * Flujo: proyecto → formulario → grid de gráficas (word-ready). Al elegir una,
 * llama onInsert(marker) con el marcador que el doc-generator convierte en imagen.
 */
export default function ColmenaChartPickerModal({ open, onClose, onInsert, tesisId }) {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [forms, setForms] = useState([]);
  const [formId, setFormId] = useState('');
  const [charts, setCharts] = useState([]); // { ...chart, dataUrl }
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
        setCharts([]);
      })
      .catch((e) => !cancel && setError(`No se pudieron cargar los formularios: ${e.message}`))
      .finally(() => !cancel && setLoading(false));
    return () => {
      cancel = true;
    };
  }, [projectId]);

  // Al cambiar formulario → cargar gráficas word-ready + thumbnails.
  useEffect(() => {
    if (!formId) {
      setCharts([]);
      return;
    }
    let cancel = false;
    setError('');
    setLoading(true);
    listWordReadyCharts(formId)
      .then(async (items) => {
        const withThumbs = await Promise.all(
          items.map(async (chart) => {
            try {
              const dataUrl = await getChartDataUrl(formId, chart.artifact_id);
              return { ...chart, dataUrl };
            } catch {
              return { ...chart, dataUrl: '' };
            }
          }),
        );
        if (!cancel) setCharts(withThumbs);
      })
      .catch((e) => !cancel && setError(`No se pudieron cargar las gráficas: ${e.message}`))
      .finally(() => !cancel && setLoading(false));
    return () => {
      cancel = true;
    };
  }, [formId]);

  if (!open) return null;

  const handlePick = async (chart) => {
    const caption = chart.title || chart.chart_type || 'Gráfica de Colmena';
    const marker = buildFigureMarker({ formId, artifactId: chart.artifact_id, caption });
    // Persistir en la tesis (colmena_graficos_tesis) para que el DOCX la exporte.
    if (tesisId) {
      try {
        await importChartToThesis(tesisId, {
          formId,
          artifactId: chart.artifact_id,
          titulo: caption,
        });
      } catch (e) {
        toast.error(`No se pudo importar la gráfica a la tesis: ${e.message}`);
        return;
      }
    }
    onInsert?.(marker, { dataUrl: chart.dataUrl });
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
            <BarChart3 className="h-5 w-5 text-amber-500" />
            <h3 className="text-base font-semibold text-gray-800">Insertar gráfica de Colmena</h3>
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
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200"
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
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
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
              Elige un proyecto y un formulario para ver sus gráficas.
            </p>
          ) : charts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-gray-400">
              <ImageOff className="h-8 w-8" />
              Este formulario aún no tiene gráficas listas para Word.
              <span className="text-xs">Genera gráficas en Colmena → Reportes.</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {charts.map((chart) => (
                <button
                  key={chart.artifact_id}
                  type="button"
                  onClick={() => handlePick(chart)}
                  className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 text-left transition-all hover:border-amber-400 hover:shadow-md"
                  title="Insertar esta gráfica"
                >
                  <div className="flex aspect-video items-center justify-center bg-gray-50">
                    {chart.dataUrl ? (
                      <img
                        src={chart.dataUrl}
                        alt={chart.title || 'Gráfica'}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <BarChart3 className="h-8 w-8 text-gray-300" />
                    )}
                  </div>
                  <span className="truncate px-2 py-1.5 text-xs font-medium text-gray-700 group-hover:text-amber-600">
                    {chart.title || chart.chart_type || 'Gráfica'}
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

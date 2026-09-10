// Cliente ligero contra la API del backend de Colmena para listar proyectos,
// formularios y sus gráficas (chart-images) e insertarlas en la tesis.
import { apiRequest, getStoredToken } from './client';

const COLMENA_API_BASE = (
  import.meta.env.VITE_COLMENA_API_BASE_URL || 'http://127.0.0.1:8080'
).replace(/\/+$/, '');

async function getJson(path) {
  // Colmena acepta el mismo JWT de AppThesis como Bearer (cross-login): con él
  // /api/v1/projects devuelve sólo los proyectos del estudiante.
  const token = getStoredToken();
  const response = await fetch(`${COLMENA_API_BASE}${path}`, {
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    throw new Error(`Colmena API ${response.status}: ${path}`);
  }
  return response.json();
}

/** Lista los proyectos de Colmena. */
export async function listColmenaProjects() {
  const data = await getJson('/api/v1/projects');
  return Array.isArray(data?.items) ? data.items : [];
}

/** Lista los formularios de un proyecto de Colmena. */
export async function listColmenaForms(projectId) {
  const data = await getJson(`/api/v1/projects/${projectId}/forms`);
  return Array.isArray(data?.items) ? data.items : [];
}

/** Lista las gráficas listas para Word (PNG) de un formulario. */
export async function listWordReadyCharts(formId) {
  const data = await getJson(`/api/v1/forms/${formId}/chart-images/word-ready`);
  return Array.isArray(data?.items) ? data.items : [];
}

/** Devuelve el data URL (base64) de una gráfica para previsualización. */
export async function getChartDataUrl(formId, artifactId) {
  const data = await getJson(`/api/v1/forms/${formId}/chart-images/${artifactId}/base64`);
  return data?.data_url || '';
}

/**
 * Persiste la gráfica asociada a la tesis (tabla colmena_graficos_tesis) vía el
 * backend Nest, para que el doc-generator la exporte en el DOCX. Autenticado.
 */
export function importChartToThesis(tesisId, { formId, artifactId, titulo }) {
  return apiRequest(`/colmena/${tesisId}/charts/import`, {
    method: 'POST',
    body: { form_id: formId, artifact_id: artifactId, titulo },
  });
}

/** Construye el marcador que el doc-generator convierte en imagen + caption. */
export function buildFigureMarker({ formId, artifactId, caption }) {
  const safeCaption = String(caption || '').replace(/"/g, "'").trim();
  return `[[colmena-figura form=${formId} artifact=${artifactId} caption="${safeCaption}"]]`;
}

const FIGURE_MARKER_RE =
  /\[\[colmena-figura\s+form=([A-Za-z0-9_-]+)\s+artifact=([A-Za-z0-9_-]+)(?:\s+caption="([^"]*)")?\s*\]\]/;

/** Parsea un marcador de figura; devuelve { formId, artifactId, caption } o null. */
export function parseFigureMarker(text) {
  const match = FIGURE_MARKER_RE.exec(String(text || '').trim());
  if (!match) return null;
  return { formId: match[1], artifactId: match[2], caption: (match[3] || '').trim() };
}

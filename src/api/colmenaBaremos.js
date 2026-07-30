// Cliente ligero contra la API del backend de Colmena para listar baremos
// (escalas de puntuación) de un formulario e insertarlos en la tesis.
import { apiRequest } from './client';

const COLMENA_API_BASE = (
  import.meta.env.VITE_COLMENA_API_BASE_URL || 'http://127.0.0.1:8080'
).replace(/\/+$/, '');

async function getJson(path) {
  const response = await fetch(`${COLMENA_API_BASE}${path}`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Colmena API ${response.status}: ${path}`);
  }
  return response.json();
}

/** Resuelve los baremos (uno por scoring_config) de un formulario, con sus niveles. */
export async function getFormBaremoResolution(formId, levelsCount = 3) {
  const data = await getJson(
    `/api/v1/forms/${formId}/scoring/baremos/resolution?levels_count=${levelsCount}`,
  );
  return Array.isArray(data?.items) ? data.items : [];
}

/**
 * Persiste el baremo elegido (tabla colmena_baremos_tesis) vía el backend Nest,
 * para que la vista previa y el doc-generator lo muestren sin volver a consultar
 * a Colmena. Autenticado.
 */
export function importBaremoToThesis(tesisId, { formId, scoringConfigId, titulo }) {
  return apiRequest(`/colmena/${tesisId}/baremos/import`, {
    method: 'POST',
    body: { form_id: formId, scoring_config_id: scoringConfigId, titulo },
  });
}

/** Lista los baremos ya importados a la tesis (incluye levels). */
export function listThesisBaremos(tesisId) {
  return apiRequest(`/colmena/${tesisId}/baremos`);
}

/** Construye el marcador que el editor/doc-generator convierte en tabla de niveles. */
export function buildBaremoMarker({ formId, configId, caption }) {
  const safeCaption = String(caption || '').replace(/"/g, "'").trim();
  return `[[colmena-baremo form=${formId} config=${configId} caption="${safeCaption}"]]`;
}

const BAREMO_MARKER_RE =
  /\[\[colmena-baremo\s+form=([A-Za-z0-9_-]+)\s+config=([A-Za-z0-9_-]+)(?:\s+caption="([^"]*)")?\s*\]\]/;

/** Parsea un marcador de baremo; devuelve { formId, configId, caption } o null. */
export function parseBaremoMarker(text) {
  const match = BAREMO_MARKER_RE.exec(String(text || '').trim());
  if (!match) return null;
  return { formId: match[1], configId: match[2], caption: (match[3] || '').trim() };
}

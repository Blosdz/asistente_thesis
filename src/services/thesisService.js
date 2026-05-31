import { documentosApi } from '../api/documentos.api';
import { tesisApi } from '../api/tesis.api';
import { catalogosApi } from '../api/catalogos.api';
import { docGeneratorApi } from '../api/docGenerator.api';
import { pagosApi } from '../api/pagos.api';
import { sugerenciasApi } from '../api/sugerencias.api';

const asArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.tesis)) return data.tesis;
  if (Array.isArray(data?.documentos)) return data.documentos;
  return data ? [data] : [];
};

const unwrap = (data) => data?.data || data?.tesis || data?.documento || data;

const getDocumentDate = (document) =>
  document?.creado_en ||
  document?.created_at ||
  document?.actualizado_en ||
  document?.updated_at ||
  '';

const getDocumentTime = (document) => {
  const time = new Date(getDocumentDate(document)).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const normalizeDocument = (document, source = 'tesis') => {
  if (!document || typeof document !== 'object') return document;

  return {
    ...document,
    source: document.source || document.tipo_documento_categoria || source,
    tipo_documento_categoria:
      document.tipo_documento_categoria || document.source || source,
    tesis_id: document.tesis_id || document.thesis_id || null,
    nombre:
      document.nombre ||
      document.nombre_archivo ||
      document.file_name ||
      'Documento sin nombre',
    nombre_archivo:
      document.nombre_archivo ||
      document.nombre ||
      document.file_name ||
      'Documento sin nombre',
    url_google_doc:
      document.url_google_doc ||
      document.url_archivo_drive ||
      document.webViewLink ||
      null,
    url_archivo_drive:
      document.url_archivo_drive ||
      document.url_google_doc ||
      document.webViewLink ||
      null,
    tipo_documento: document.tipo_documento || document.tipo || null,
    created_at: document.created_at || document.creado_en || null,
  };
};

const sortDocumentsByDateDesc = (documents) =>
  [...documents].sort((a, b) => getDocumentTime(b) - getDocumentTime(a));

export async function crearMiTesis(payload) {
  const data = await tesisApi.crear({
    universidadId: payload.universidad_id || payload.universidadId || null,
    titulo: payload.titulo,
    descripcion: payload.descripcion ?? null,
  });

  return unwrap(data);
}

export async function obtenerTiposTesisActivos() {
  return asArray(await catalogosApi.obtenerTiposTesis(), 'data');
}

export async function cotizarTesisPlan(payload) {
  const data = await pagosApi.cotizar({
    planId: payload.plan_id,
    tipoTesisId: payload.tipo_tesis_id,
    nivelAcademico: payload.nivel_academico,
    requiereAnalisisEstadistico: payload.requiere_analisis_estadistico ?? true,
  });

  return unwrap(data);
}

export async function crearTesisConPlan(payload) {
  const data = await tesisApi.crearConPlan({
    titulo: payload.titulo,
    descripcion: payload.descripcion ?? null,
    universidadId: payload.universidad_id || payload.universidadId || null,
    programaId: payload.programa_id || payload.programaId || null,
    planId: payload.plan_id,
    tipoTesisId: payload.tipo_tesis_id,
    nivelAcademico: payload.nivel_academico,
    requiereAnalisisEstadistico:
      payload.requiere_analisis_estadistico ?? true,
  });

  return unwrap(data);
}

export async function obtenerMisTesis() {
  return asArray(await tesisApi.listar());
}

export async function obtenerDetalleTesis(tesisId) {
  return unwrap(await tesisApi.detalle(tesisId));
}

export async function actualizarEstadoTesis(tesisId, estado) {
  return unwrap(await tesisApi.actualizarEstado(tesisId, estado));
}

export async function obtenerDocumentosMiTesis(tesisId) {
  return sortDocumentsByDateDesc(
    asArray(await documentosApi.listarPorTesis(tesisId)).map((document) =>
      normalizeDocument(document, 'tesis'),
    ),
  );
}

export async function obtenerDocumentosApoyoTesis(tesisId) {
  return sortDocumentsByDateDesc(
    asArray(await documentosApi.listarApoyo(tesisId)).map((document) =>
      normalizeDocument(document, 'apoyo'),
    ),
  );
}

export async function obtenerTodosDocumentosMiTesis(tesisId) {
  const [tesisDocuments, supportDocuments] = await Promise.all([
    obtenerDocumentosMiTesis(tesisId),
    obtenerDocumentosApoyoTesis(tesisId),
  ]);

  return sortDocumentsByDateDesc([...tesisDocuments, ...supportDocuments]);
}

export async function subirDocumentoAGoogleDrive({
  tesisId,
  file,
  modo = 'tesis',
  tipoDocumento = null,
}) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('modo', modo);
  if (tipoDocumento) formData.append('tipo_documento', tipoDocumento);

  return unwrap(await documentosApi.subirArchivo(tesisId, formData));
}

export async function registrarDocumentoTesis({
  tesisId,
  nombreArchivo,
  urlArchivoDrive,
  carpetaDriveId,
  documentoDriveId,
  version = 1,
  tipoMime,
  tamanoBytes,
}) {
  return unwrap(
    await documentosApi.registrar({
      tesisId,
      nombreArchivo,
      urlArchivoDrive,
      carpetaDriveId,
      documentoDriveId,
      version,
      tipoMime,
      tamanoBytes,
    }),
  );
}

export async function crearCarpetaDriveParaTesis(tesisId) {
  return unwrap(await documentosApi.crearCarpetaDrive(tesisId));
}

export async function obtenerDocumentosComplementarios(tesisId) {
  return obtenerDocumentosApoyoTesis(tesisId);
}

export async function crearSugerenciaAsesor(payload) {
  const data = await sugerenciasApi.crear({
    tesisId: payload.tesis_id || payload.tesisId,
    documentoTesisId: payload.documento_tesis_id || payload.documentoTesisId || null,
    sugerencia: payload.sugerencia || payload.titulo || payload.descripcion,
    detalle: payload.detalle || payload.descripcion || null,
    tipoSugerenciaId: payload.tipo_sugerencia_id || payload.tipoSugerenciaId || null,
  });

  return unwrap(data);
}

export async function obtenerSugerenciasMiTesis(tesisId) {
  return asArray(await sugerenciasApi.listarPorTesis(tesisId));
}

export async function marcarSugerenciaAplicadaEstudiante(sugerenciaId, comentario = null) {
  return unwrap(
    await sugerenciasApi.marcarAplicada(sugerenciaId, {
      aplicado: true,
      comentario,
    }),
  );
}

export async function obtenerIndiceTesis(tesisId) {
  return asArray(await docGeneratorApi.listIndex(tesisId));
}

export async function crearSeccionIndiceTesis(tesisId, payload) {
  return unwrap(await docGeneratorApi.createIndexSection(tesisId, payload));
}

export async function actualizarSeccionIndiceTesis(tesisId, sectionId, payload) {
  return unwrap(await docGeneratorApi.updateIndexSection(tesisId, sectionId, payload));
}

export async function eliminarSeccionIndiceTesis(tesisId, sectionId) {
  return unwrap(await docGeneratorApi.deleteIndexSection(tesisId, sectionId));
}

export async function obtenerReferenciasTesis(tesisId) {
  return asArray(await docGeneratorApi.listReferences(tesisId));
}

export async function crearReferenciaTesis(tesisId, payload) {
  return unwrap(await docGeneratorApi.createReference(tesisId, payload));
}

export async function eliminarReferenciaTesis(referenceId) {
  return unwrap(await docGeneratorApi.deleteReference(referenceId));
}

export async function generarDocumentoDocxTesis(tesisId) {
  return unwrap(await tesisApi.generateDocx(tesisId));
}

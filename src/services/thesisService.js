import { documentosApi } from '../api/documentos.api';
import { tesisApi } from '../api/tesis.api';
import { catalogosApi } from '../api/catalogos.api';
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
  return asArray(await documentosApi.listarPorTesis(tesisId));
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

export async function obtenerDocumentosComplementarios(tesisId) {
  return obtenerDocumentosMiTesis(tesisId);
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

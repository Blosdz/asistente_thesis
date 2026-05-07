import { documentosApi } from '../api/documentos.api';
import { pendingEndpoint } from '../api/client';
import { tesisApi } from '../api/tesis.api';

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
  pendingEndpoint('Tipos de tesis activos');
}

export async function cotizarTesisPlan() {
  pendingEndpoint('Cotización de tesis con plan');
}

export async function crearTesisConPlan() {
  pendingEndpoint('Creación de tesis con plan');
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

export async function subirDocumentoAGoogleDrive() {
  pendingEndpoint('Subida binaria de documentos');
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

export async function crearSugerenciaAsesor() {
  pendingEndpoint('Creación de sugerencias de asesor');
}

export async function obtenerSugerenciasMiTesis() {
  pendingEndpoint('Listado de sugerencias de tesis');
}

export async function marcarSugerenciaAplicadaEstudiante() {
  pendingEndpoint('Marcado de sugerencias aplicadas');
}

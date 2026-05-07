import { asesoresApi } from '../api/asesores.api';
import { documentosApi } from '../api/documentos.api';
import { pendingEndpoint } from '../api/client';
import { reunionesApi } from '../api/reuniones.api';
import { tesisApi } from '../api/tesis.api';
import { usuariosApi } from '../api/usuarios.api';

const asArray = (data, key = null) => {
  if (Array.isArray(data)) return data;
  if (key && Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;
  return data ? [data] : [];
};

const unwrap = (data) => data?.data || data?.usuario || data?.asesor || data;

function pickPerfilAsesor(usuario) {
  return (
    usuario?.perfil_asesor ||
    usuario?.asesor ||
    usuario?.perfil?.asesor ||
    usuario?.perfil ||
    usuario ||
    null
  );
}

function mapearPerfilAsesor(raw) {
  if (!raw) return null;

  const asesorId = raw.asesor_id ?? raw.r_asesor_id ?? raw.id ?? null;
  const nombreMostrar = raw.nombre_mostrar ?? raw.nombreMostrar ?? raw.r_nombre_mostrar ?? '';

  return {
    tiene_informacion:
      raw.tiene_informacion ??
      raw.r_tiene_informacion ??
      Boolean(asesorId || nombreMostrar || raw.email_publico || raw.slug),
    asesor_id: asesorId,
    perfil_id: raw.perfil_id ?? raw.r_perfil_id ?? null,
    nombre_mostrar: nombreMostrar,
    universidad_id:
      raw.universidad_id ?? raw.universidadId ?? raw.r_universidad_id ?? null,
    slug: raw.slug ?? raw.r_slug ?? '',
    email_publico: raw.email_publico ?? raw.emailPublico ?? raw.r_email_publico ?? raw.email ?? '',
    biografia: raw.biografia ?? raw.r_biografia ?? '',
    foto_url: raw.foto_url ?? raw.fotoUrl ?? raw.r_foto_url ?? '',
    especialidad_id:
      raw.especialidad_id ?? raw.especialidadId ?? raw.r_especialidad_id ?? null,
    carrera: raw.carrera ?? raw.r_carrera ?? '',
    nivel_academico:
      raw.nivel_academico ?? raw.nivelAcademico ?? raw.r_nivel_academico ?? '',
    nombres: raw.nombres ?? raw.r_nombres ?? '',
    apellidos: raw.apellidos ?? raw.r_apellidos ?? '',
    dni: raw.dni ?? raw.r_dni ?? '',
    telefono: raw.telefono ?? raw.r_telefono ?? '',
    creado_en: raw.creado_en ?? raw.r_creado_en ?? null,
    actualizado_en: raw.actualizado_en ?? raw.r_actualizado_en ?? null,
    mensaje: raw.mensaje ?? raw.r_mensaje ?? null,
  };
}

export async function obtenerAsesores() {
  return asArray(await asesoresApi.listar(), 'asesores');
}

export async function vincularmeConAsesorPorSlug() {
  pendingEndpoint('Vinculación con asesor por slug');
}

export async function vincularmeConAsesorPorCodigo() {
  pendingEndpoint('Vinculación con asesor por código');
}

export async function generarCodigoAsesor() {
  pendingEndpoint('Generación de código público de asesor');
}

export async function obtenerMiCodigoPublicoAsesor() {
  pendingEndpoint('Código público del asesor');
}

export async function obtenerPerfilAsesor() {
  const data = await usuariosApi.me();
  return mapearPerfilAsesor(pickPerfilAsesor(unwrap(data)));
}

export async function guardarPerfilAsesor(perfil) {
  const data = await usuariosApi.guardarPerfilAsesor({
    nombreMostrar: perfil.nombre_mostrar,
    universidadId: perfil.universidad_id || null,
    slug: perfil.slug,
    emailPublico: perfil.email_publico,
    biografia: perfil.biografia,
    fotoUrl: perfil.foto_url,
    especialidadId: perfil.especialidad_id || null,
    carrera: perfil.carrera,
    nivelAcademico: perfil.nivel_academico,
    nombres: perfil.nombres,
    apellidos: perfil.apellidos,
    dni: perfil.dni,
    telefono: perfil.telefono || null,
  });

  return mapearPerfilAsesor(pickPerfilAsesor(unwrap(data))) || data;
}

export async function crearScheduleAsesor() {
  pendingEndpoint('Creación de horario de asesor');
}

export async function obtenerHorariosDisponiblesAsesor() {
  pendingEndpoint('Horarios disponibles de asesor');
}

export async function obtenerHorariosPresustentacionAsesor() {
  pendingEndpoint('Horarios de presustentación de asesor');
}

export async function crearCitaAsesoria(params) {
  const inicio = params?.p_inicio || params?.inicio;
  const fin = params?.p_fin || params?.fin;

  if (!inicio || !fin) {
    pendingEndpoint('Creación de cita sin inicio/fin documentados');
  }

  return unwrap(
    await reunionesApi.crear({
      disponibilidadId: params?.p_disponibilidad_id || params?.disponibilidadId || null,
      inicio,
      fin,
      tesisId: params?.p_tesis_id || params?.tesisId || null,
      motivo: params?.p_motivo || params?.motivo || 'Asesoría',
      modalidad: params?.p_modalidad || params?.modalidad || 'virtual',
      lugar: params?.p_lugar || params?.lugar || null,
      enlaceReunion: params?.p_enlace_reunion || params?.enlaceReunion || null,
      notas: params?.p_notas || params?.notas || null,
    }),
  );
}

export async function obtenerHistorialValidacionesCitaAsesor() {
  pendingEndpoint('Historial de validaciones de cita del asesor');
}

export async function responderReservaCita() {
  pendingEndpoint('Respuesta de reserva de cita');
}

export async function aprobarPagoReservaCita() {
  pendingEndpoint('Aprobación de pago de reserva de cita');
}

export async function crearObservacionTesisEnriquecida() {
  pendingEndpoint('Observaciones enriquecidas de tesis');
}

export async function listarHistorialObservacionesTesis() {
  pendingEndpoint('Historial de observaciones de tesis');
}

export async function obtenerBloquesDisponibles() {
  pendingEndpoint('Bloques disponibles de asesor');
}

export async function crearCitaEstudianteAsesor(params) {
  return crearCitaAsesoria(params);
}

export async function obtenerEstudiantesAsesor() {
  pendingEndpoint('Estudiantes del asesor');
}

export async function obtenerEstudiantesMisAsesorias() {
  pendingEndpoint('Estudiantes de mis asesorías');
}

export async function cambiarEstadoRelacion() {
  pendingEndpoint('Cambio de estado de relación asesor-estudiante');
}

export async function obtenerMisAsesores() {
  pendingEndpoint('Mis asesores');
}

export async function asignarTesisAsesor() {
  pendingEndpoint('Asignación de tesis a asesor');
}

export async function asignarMiTesisAAsesor() {
  pendingEndpoint('Asignación de mi tesis a asesor');
}

export async function obtenerMisTesisConAsesores() {
  return asArray(await tesisApi.listar(), 'tesis');
}

export async function obtenerTesisAsignadasAsesor() {
  return asArray(await tesisApi.listar(), 'tesis');
}

export async function getTesisAsesor() {
  return obtenerTesisAsignadasAsesor();
}

export async function getDocumentosApoyo(tesisId) {
  return asArray(await documentosApi.listarPorTesis(tesisId), 'documentos');
}

export async function obtenerDocumentosTesisAsignada(tesisId) {
  return getDocumentosApoyo(tesisId);
}

export async function registrarSugerenciaAsesor() {
  pendingEndpoint('Registro de sugerencias de asesor');
}

export async function obtenerSugerenciasTesisAsignada() {
  pendingEndpoint('Sugerencias de tesis asignada');
}

export async function obtenerSugerenciasAsesor(tesisId) {
  return obtenerSugerenciasTesisAsignada(tesisId);
}

export async function listarTiposSugerenciaAsesor() {
  pendingEndpoint('Tipos de sugerencia de asesor');
}

export async function validarAplicacionSugerenciaAsesor() {
  pendingEndpoint('Validación de aplicación de sugerencia');
}

export async function actualizarEstadoSugerenciaAsesor(sugerenciaId, aplicado) {
  return validarAplicacionSugerenciaAsesor({
    sugerenciaId,
    aprobado: aplicado,
  });
}

export async function crearEspacioLibreAsesor() {
  pendingEndpoint('Creación de espacio libre de asesor');
}

export async function obtenerMisEspaciosLibresAsesor() {
  pendingEndpoint('Espacios libres del asesor');
}

export async function desactivarEspacioLibreAsesor() {
  pendingEndpoint('Desactivación de espacio libre de asesor');
}

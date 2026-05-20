import { asesoresApi } from '../api/asesores.api';
import { disponibilidadApi } from '../api/disponibilidad.api';
import { documentosApi } from '../api/documentos.api';
import { observacionesApi } from '../api/observaciones.api';
import { pendingEndpoint } from '../api/client';
import { relacionesApi } from '../api/relaciones.api';
import { reunionesApi } from '../api/reuniones.api';
import { sugerenciasApi } from '../api/sugerencias.api';
import { tesisApi } from '../api/tesis.api';
import { usuariosApi } from '../api/usuarios.api';

const asArray = (data, key = null) => {
  if (Array.isArray(data)) return data;
  if (key && Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;
  return data ? [data] : [];
};

const unwrap = (data) => data?.data || data?.usuario || data?.asesor || data;

const addRelacionAlias = (item) =>
  item
    ? {
        ...item,
        relacion_id: item.relacion_id || item.relacionId || item.id || null,
      }
    : item;

const normalizarEstudianteAsesor = (item) => {
  if (!item) return item;

  const relacionId = item.r_relacion_id || item.relacion_id || item.relacionId || item.id || null;
  const estudianteId =
    item.r_estudiante_id || item.estudiante_id || item.estudianteId || null;
  const estado = item.r_estado_relacion || item.estado || 'pendiente';

  return {
    ...item,
    id: item.id || relacionId,
    relacion_id: relacionId,
    r_relacion_id: relacionId,
    r_estudiante_id: estudianteId,
    r_estado_relacion: estado,
    r_nombres: item.r_nombres || item.nombres || '',
    r_apellidos: item.r_apellidos || item.apellidos || '',
    r_carrera: item.r_carrera || item.carrera || '',
    r_email: item.r_email || item.email || '',
    r_universidad_nombre:
      item.r_universidad_nombre || item.universidad_nombre || item.universidadNombre || '',
    r_tesis_id: item.r_tesis_id || item.tesis_id || item.tesisId || null,
    r_tesis_titulo: item.r_tesis_titulo || item.tesis_titulo || item.titulo || '',
    r_tesis_estado: item.r_tesis_estado || item.tesis_estado || '',
    r_reunion_inicio: item.r_reunion_inicio || item.reunion_inicio || null,
  };
};

const normalizarTesisAsignadaAsesor = (item) => {
  if (!item) return item;

  const tesisId = item.tesis_id || item.tesisId || item.id || null;
  const estudianteNombres =
    item.estudiante_nombres || item.nombres || item.r_nombres || '';
  const estudianteApellidos =
    item.estudiante_apellidos || item.apellidos || item.r_apellidos || '';

  return {
    ...item,
    id: item.id || tesisId,
    tesis_id: tesisId,
    estudiante_nombres: estudianteNombres,
    estudiante_apellidos: estudianteApellidos,
    estudiante_carrera:
      item.estudiante_carrera || item.carrera || item.r_carrera || '',
    titulo: item.titulo || item.tesis_titulo || item.r_tesis_titulo || '',
    descripcion:
      item.descripcion || item.tesis_descripcion || item.r_tesis_descripcion || '',
    estado: item.estado || item.tesis_estado || item.r_tesis_estado || '',
  };
};

const flattenTesisConAsesores = (rows) =>
  rows.flatMap((tesis) => {
    const asesores = Array.isArray(tesis?.asesores) ? tesis.asesores : [];
    if (asesores.length === 0) return [];

    return asesores.map((asesor) => ({
      ...asesor,
      tesis_id: tesis.id || tesis.tesis_id,
      tesis_titulo: tesis.titulo,
    }));
  });

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

export async function buscarAsesores(filtros = {}) {
  return asArray(await asesoresApi.listar(filtros), 'asesores');
}

export async function vincularmeConAsesorPorSlug(slug, payload = {}) {
  return unwrap(await asesoresApi.vincularPorSlug(slug, payload));
}

export async function vincularmeConAsesorPorCodigo(codigo, payload = {}) {
  return unwrap(await asesoresApi.vincularPorCodigo(codigo, payload));
}

export async function generarCodigoAsesor() {
  return unwrap(await asesoresApi.generarCodigoPublico());
}

export async function obtenerMiCodigoPublicoAsesor() {
  return unwrap(await asesoresApi.miCodigoPublico());
}

export async function obtenerPerfilAsesor() {
  const data = await usuariosApi.obtenerPerfilAsesor();
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

export async function subirFotoPerfilAsesor(file) {
  if (!file) {
    throw new Error('Selecciona una imagen para subir.');
  }

  const formData = new FormData();
  formData.append('file', file);

  const data = unwrap(await usuariosApi.subirFotoPerfil(formData));
  return data?.foto_url || data?.data?.foto_url || '';
}

export async function crearScheduleAsesor(params) {
  return crearEspacioLibreAsesor(params);
}

export async function obtenerHorariosDisponiblesAsesor(asesorId, range = {}) {
  const now = new Date();
  const defaultEnd = new Date(now);
  defaultEnd.setDate(defaultEnd.getDate() + 45);

  return obtenerBloquesDisponibles({
    asesorId,
    desde: range.desde || now.toISOString(),
    hasta: range.hasta || defaultEnd.toISOString(),
  });
}

export async function obtenerHorariosPresustentacionAsesor(asesorId, range = {}) {
  return obtenerHorariosDisponiblesAsesor(asesorId, range);
}

export async function crearCitaAsesoria(params) {
  const asesorId = params?.p_asesor_id || params?.asesorId;
  const inicio = params?.p_inicio || params?.inicio;
  const fin = params?.p_fin || params?.fin;

  if (!asesorId || !inicio || !fin) {
    pendingEndpoint('Creación de cita sin asesor/inicio/fin documentados');
  }

  return unwrap(
    await reunionesApi.crearAsesoria({
      asesorId,
      disponibilidadId: params?.p_disponibilidad_id || params?.disponibilidadId || null,
      tarifaId: params?.p_tarifa_id || params?.tarifaId || null,
      inicio,
      fin,
      duracionMinutos: params?.p_duracion_minutos || params?.duracionMinutos || null,
      costoReunion: params?.p_costo_reunion || params?.costoReunion || null,
      tesisId: params?.p_tesis_id || params?.tesisId || null,
      motivo: params?.p_motivo || params?.motivo || 'Asesoría',
      modalidad: params?.p_modalidad || params?.modalidad || 'virtual',
      lugar: params?.p_lugar || params?.lugar || null,
      notas: params?.p_notas || params?.notas || null,
    }),
  );
}

export async function obtenerHistorialValidacionesCitaAsesor(status = null) {
  return asArray(await reunionesApi.listarValidacionesAsesor(status), 'data');
}

export async function responderReservaCita(validationCitaId, accion) {
  return unwrap(await reunionesApi.responderReserva(validationCitaId, accion));
}

export async function aprobarPagoReservaCita(validationCitaId, payload = {}) {
  return unwrap(
    await reunionesApi.aprobarPagoReserva(validationCitaId, {
      enlaceReunion: payload.enlace_reunion || payload.enlaceReunion || null,
      lugar: payload.lugar || null,
      notas: payload.notas || null,
    }),
  );
}

export async function crearObservacionTesisEnriquecida(params) {
  return unwrap(
    await observacionesApi.crear({
      tesisId: params?.tesisId || params?.p_tesis_id,
      documentoTesisId:
        params?.documentoTesisId || params?.p_documento_tesis_id || null,
      texto: params?.texto || params?.p_texto || params?.contenido || '',
      titulo: params?.titulo || params?.p_titulo || null,
      contenidoHtml: params?.contenidoHtml || params?.p_contenido_html || null,
      contenidoDelta:
        params?.contenidoDelta || params?.p_contenido_delta || null,
    }),
  );
}

export async function listarHistorialObservacionesTesis(tesisId) {
  return asArray(await observacionesApi.historial(tesisId));
}

export async function obtenerBloquesDisponibles({
  asesorId,
  desde,
  hasta,
} = {}) {
  if (!asesorId || !desde || !hasta) {
    pendingEndpoint('Bloques disponibles de asesor sin asesorId/desde/hasta');
  }

  const data = asArray(await disponibilidadApi.bloques(asesorId, { desde, hasta }));
  return data.map((slot) => ({
    ...slot,
    inicio_bloque: slot.inicio_bloque || slot.inicio,
    fin_bloque: slot.fin_bloque || slot.fin,
    estado: slot.estado || 'libre',
  }));
}

export async function crearCitaEstudianteAsesor(params) {
  return crearCitaAsesoria(params);
}

export async function obtenerEstudiantesAsesor() {
  return asArray(await asesoresApi.estudiantes()).map(normalizarEstudianteAsesor);
}

export async function obtenerEstudiantesMisAsesorias() {
  return obtenerEstudiantesAsesor();
}

export async function obtenerDetalleEstudianteAsesor(studentId) {
  return normalizarEstudianteAsesor(unwrap(await asesoresApi.estudiante(studentId)));
}

export async function cambiarEstadoRelacion(relacionId, estado) {
  return normalizarEstudianteAsesor(
    unwrap(await relacionesApi.cambiarEstado(relacionId, estado)),
  );
}

export async function obtenerMisAsesores() {
  return asArray(await asesoresApi.misAsesores()).map(addRelacionAlias);
}

export async function asignarTesisAsesor(tesisId, asesorId, rol = 'principal') {
  return unwrap(
    await tesisApi.asignarAsesor(tesisId, {
      asesorId,
      rol,
    }),
  );
}

export async function asignarMiTesisAAsesor(tesisId, asesorId, rol = 'principal') {
  return asignarTesisAsesor(tesisId, asesorId, rol);
}

export async function obtenerMisTesisConAsesores() {
  return flattenTesisConAsesores(asArray(await tesisApi.listarConAsesores(), 'tesis'));
}

export async function obtenerTesisAsignadasAsesor() {
  return asArray(await tesisApi.listarAsignadasAsesor(), 'tesis').map(
    normalizarTesisAsignadaAsesor,
  );
}

export async function getTesisAsesor() {
  return obtenerTesisAsignadasAsesor();
}

export async function getDocumentosApoyo(tesisId) {
  return asArray(await documentosApi.listarApoyo(tesisId), 'documentos');
}

export async function obtenerDocumentosTesisAsignada(tesisId) {
  return asArray(await documentosApi.listarPorTesisAsignada(tesisId), 'documentos');
}

export async function registrarSugerenciaAsesor(params) {
  const detalle = params?.detalle || params?.sugerencia || '';
  return unwrap(
    await sugerenciasApi.crear({
      tesisId: params?.tesisId || params?.p_tesis_id,
      documentoTesisId:
        params?.documentoTesisId || params?.p_documento_tesis_id || null,
      tipoSugerenciaId:
        params?.tipoSugerenciaId || params?.p_tipo_sugerencia_id || null,
      sugerencia: params?.sugerencia || detalle,
      detalle,
    }),
  );
}

export async function obtenerSugerenciasTesisAsignada(tesisId) {
  return asArray(await sugerenciasApi.listarValidacion(tesisId));
}

export async function obtenerSugerenciasAsesor(tesisId) {
  return obtenerSugerenciasTesisAsignada(tesisId);
}

export async function listarTiposSugerenciaAsesor() {
  return asArray(await sugerenciasApi.tipos());
}

export async function validarAplicacionSugerenciaAsesor({
  sugerenciaId,
  aprobado,
  comentarioAsesor = null,
  comentario = null,
}) {
  return unwrap(
    await sugerenciasApi.actualizarEstado(sugerenciaId, {
      estado: aprobado ? 'verificado' : 'rechazado',
      comentario: comentarioAsesor || comentario || null,
    }),
  );
}

export async function actualizarEstadoSugerenciaAsesor(sugerenciaId, aplicado) {
  return validarAplicacionSugerenciaAsesor({
    sugerenciaId,
    aprobado: aplicado,
  });
}

export async function crearEspacioLibreAsesor(params) {
  const diasSemana = params?.p_dias_semana || params?.diasSemana;
  const basePayload = {
    asesorId: params?.p_asesor_id || params?.asesorId || undefined,
    inicio: params?.p_inicio || params?.inicio,
    fin: params?.p_fin || params?.fin,
    usaBloques: params?.p_usa_bloques ?? params?.usaBloques ?? true,
    duracionBloqueMinutos:
      params?.p_duracion_bloque_minutos ||
      params?.duracionBloqueMinutos ||
      undefined,
    recurrente: params?.p_recurrente ?? params?.recurrente ?? false,
    fechaInicio: params?.p_fecha_inicio || params?.fechaInicio || undefined,
    fechaFin: params?.p_fecha_fin || params?.fechaFin || undefined,
  };

  if (basePayload.recurrente && Array.isArray(diasSemana) && diasSemana.length > 0) {
    const results = await Promise.all(
      diasSemana.map((diaSemana) =>
        disponibilidadApi.crear({
          ...basePayload,
          diaSemana,
        }),
      ),
    );
    return results.map(unwrap);
  }

  return unwrap(
    await disponibilidadApi.crear({
      ...basePayload,
      diaSemana: params?.p_dia_semana ?? params?.diaSemana ?? undefined,
    }),
  );
}

export async function obtenerMisEspaciosLibresAsesor() {
  return asArray(await disponibilidadApi.misEspacios());
}

export async function desactivarEspacioLibreAsesor(disponibilidadId) {
  return unwrap(await disponibilidadApi.desactivar(disponibilidadId));
}

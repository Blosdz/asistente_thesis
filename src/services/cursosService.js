import { cursosApi } from '../api/cursos.api';

const asArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return data ? [data] : [];
};

const unwrap = (data) => data?.data || data?.curso || data;

export const formatCourseCurrency = (value, currency = 'PEN') =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: currency || 'PEN',
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

export const normalizeCourse = (course) => {
  if (!course || typeof course !== 'object') return course;

  return {
    ...course,
    id: course.curso_id || course.id,
    estudiante_curso_id: course.estudiante_curso_id || course.id || null,
    titulo: course.titulo || 'Curso sin título',
    descripcion: course.descripcion || '',
    precio: Number(course.precio ?? course.precio_pagado ?? 0),
    moneda: course.moneda || 'PEN',
    portada_url_drive: course.portada_url_drive || course.portadaUrlDrive || '',
    estado: course.estado || 'borrador',
    estado_compra: course.estado_compra || course.estadoCompra || course.estado || null,
    estado_pago: course.estado_pago || course.estadoPago || null,
    pago_id: course.pago_id || course.pagoId || null,
    total_materiales: Number(course.total_materiales || 0),
  };
};

export async function listarMisCursosAsesor() {
  return asArray(await cursosApi.misCursosAsesor()).map(normalizeCourse);
}

export async function crearCursoAsesor(payload) {
  return normalizeCourse(unwrap(await cursosApi.crearCursoAsesor(payload)));
}

export async function actualizarCursoAsesor(cursoId, payload) {
  return normalizeCourse(
    unwrap(await cursosApi.actualizarCursoAsesor(cursoId, payload)),
  );
}

export async function listarMaterialesCursoAsesor(cursoId) {
  return asArray(await cursosApi.materialesCursoAsesor(cursoId));
}

export async function crearMaterialCursoAsesor(cursoId, payload) {
  return unwrap(await cursosApi.crearMaterialCursoAsesor(cursoId, payload));
}

export async function subirMaterialesCursoAsesor({
  cursoId,
  files,
  titulo = '',
  descripcion = null,
  tipo = 'documento',
  orden = 1,
  esVistaPrevia = false,
}) {
  const selectedFiles = Array.from(files || []);
  if (!selectedFiles.length) {
    throw new Error('Selecciona al menos un archivo para subir.');
  }

  const formData = new FormData();
  selectedFiles.forEach((file) => formData.append('files', file));
  formData.append('titulo', titulo || selectedFiles[0].name);
  if (descripcion) formData.append('descripcion', descripcion);
  formData.append('tipo', tipo);
  formData.append('orden', String(orden || 1));
  formData.append('esVistaPrevia', String(Boolean(esVistaPrevia)));

  return asArray(await cursosApi.subirMaterialesCursoAsesor(cursoId, formData));
}

export async function listarMisCursosEstudiante() {
  return asArray(await cursosApi.misCursosEstudiante()).map(normalizeCourse);
}

export async function listarCursosDeAsesor(asesorId) {
  return asArray(await cursosApi.cursosDeAsesor(asesorId)).map(normalizeCourse);
}

export async function comprarCurso(cursoId) {
  const response = await cursosApi.comprarCurso(cursoId);
  return {
    ...response,
    data: normalizeCourse(response?.data),
    pago: response?.pago
      ? {
          ...response.pago,
          pago_id: response.pago.pago_id || response.pago.id,
          estado_pago: response.pago.estado_pago || response.pago.estado,
        }
      : null,
  };
}

export async function obtenerDetalleCursoEstudiante(cursoId) {
  return normalizeCourse(unwrap(await cursosApi.detalleCursoEstudiante(cursoId)));
}

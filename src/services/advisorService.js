import { supabase } from '../lib/supabase';

// Helper for schema
const atSchema = () => supabase.schema('AT');

export async function obtenerAsesores() {
  const { data, error } = await atSchema().rpc('obtener_asesores');

  if (error) {
    console.error('Error obteniendo asesores:', error);
    throw error;
  }

  return data ?? [];
}

export async function vincularmeConAsesorPorSlug(slug) {
  const { data, error } = await atSchema().rpc('vincularme_con_asesor_por_slug', {
    p_slug: slug,
  });

  if (error) {
    console.error('Error vinculando con asesor por slug:', error);
    throw error;
  }

  return data?.[0] ?? null;
}

export async function vincularmeConAsesorPorCodigo(codigo) {
  const { data, error } = await atSchema().rpc('vincularme_con_asesor_por_codigo', {
    p_codigo: codigo,
  });

  if (error) {
    console.error('Error vinculando con asesor por código:', error);
    throw error;
  }

  return data?.[0] ?? null;
}

export async function generarCodigoAsesor() {
  const { data, error } = await atSchema().rpc('generar_codigo_publico_asesor');

  if (error) {
    console.error('Error generando código del asesor:', error);
    throw error;
  }

  return data?.[0] ?? null;
}

export async function obtenerMiCodigoPublicoAsesor() {
  const { data, error } = await atSchema().rpc('obtener_mi_codigo_publico_asesor');

  if (error) {
    console.error('Error obteniendo mi código público de asesor:', error);
    throw error;
  }

  return data?.[0] ?? null;
}

function mapearPerfilAsesorRPC(raw) {
  if (!raw) return null;

  const asesorId = raw.r_asesor_id ?? raw.asesor_id ?? null;
  const nombreMostrar = raw.r_nombre_mostrar ?? raw.nombre_mostrar ?? '';
  const universidadId = raw.r_universidad_id ?? raw.universidad_id ?? null;
  const slug = raw.r_slug ?? raw.slug ?? '';
  const emailPublico = raw.r_email_publico ?? raw.email_publico ?? '';
  const biografia = raw.r_biografia ?? raw.biografia ?? '';
  const fotoUrl = raw.r_foto_url ?? raw.foto_url ?? '';
  const especialidadId = raw.r_especialidad_id ?? raw.especialidad_id ?? null;
  const carrera = raw.r_carrera ?? raw.carrera ?? '';
  const nivelAcademico =
    raw.r_nivel_academico ?? raw.nivel_academico ?? '';
  const nombres = raw.r_nombres ?? raw.nombres ?? '';
  const apellidos = raw.r_apellidos ?? raw.apellidos ?? '';
  const dni = raw.r_dni ?? raw.dni ?? '';
  const telefono = raw.r_telefono ?? raw.telefono ?? '';
  const creadoEn = raw.r_creado_en ?? raw.creado_en ?? null;
  const actualizadoEn = raw.r_actualizado_en ?? raw.actualizado_en ?? null;

  return {
    tiene_informacion:
      raw.r_tiene_informacion ??
      Boolean(asesorId || nombreMostrar || emailPublico || slug),
    asesor_id: asesorId,
    perfil_id: raw.r_perfil_id,
    nombre_mostrar: nombreMostrar,
    universidad_id: universidadId,
    slug,
    email_publico: emailPublico,
    biografia,
    foto_url: fotoUrl,
    especialidad_id: especialidadId,
    carrera,
    nivel_academico: nivelAcademico,
    nombres,
    apellidos,
    dni,
    telefono,
    creado_en: creadoEn,
    actualizado_en: actualizadoEn,
    mensaje: raw.r_mensaje ?? raw.mensaje ?? null,
  };
}

export async function obtenerPerfilAsesor() {
  const { data, error } = await atSchema().rpc('obtener_perfil_asesor');

  if (error) {
    console.error('Error obteniendo perfil de asesor:', error);
    throw error;
  }

  const raw = Array.isArray(data) ? data[0] : data;
  return mapearPerfilAsesorRPC(raw);
}

export async function guardarPerfilAsesor(perfil) {
  const { data, error } = await atSchema().rpc('guardar_perfil_asesor', {
    p_nombre_mostrar: perfil.nombre_mostrar,
    p_universidad_id: perfil.universidad_id || null,
    p_slug: perfil.slug,
    p_email_publico: perfil.email_publico,
    p_biografia: perfil.biografia,
    p_foto_url: perfil.foto_url,
    p_especialidad_id: perfil.especialidad_id || null,
    p_carrera: perfil.carrera,
    p_nivel_academico: perfil.nivel_academico,
    p_nombres: perfil.nombres,
    p_apellidos: perfil.apellidos,
    p_dni: perfil.dni,
    p_telefono: perfil.telefono || null,
  });

  if (error) {
    console.error('Error guardando perfil de asesor:', error);
    throw error;
  }

  const raw = Array.isArray(data) ? data[0] : data;
  return mapearPerfilAsesorRPC(raw);
}

export async function crearScheduleAsesor(params) {
  const { data, error } = await atSchema().rpc('crear_schedule_asesor', params);
  
  if (error) {
    console.error('Error creando schedule de asesor:', error);
    throw error;
  }

  return data;
}

export async function obtenerHorariosDisponiblesAsesor(asesorId) {
  const { data, error } = await atSchema().rpc(
    'obtener_horarios_disponibles_asesor',
    {
      p_asesor_id: asesorId,
    },
  );

  if (error) {
    console.error('Error obteniendo horarios disponibles del asesor:', error);
    throw error;
  }

  return data ?? [];
}

export async function obtenerHorariosPresustentacionAsesor(
  asesorId,
  fechaDesde,
  fechaHasta,
) {
  const { data, error } = await atSchema().rpc(
    'obtener_horarios_presustentacion_asesor',
    {
      p_asesor_id: asesorId,
      p_fecha_desde: fechaDesde,
      p_fecha_hasta: fechaHasta,
    },
  );

  if (error) {
    console.error(
      'Error obteniendo horarios de pre-sustentacion del asesor:',
      error,
    );
    throw error;
  }

  return data ?? [];
}

export async function crearCitaAsesoria(params) {
  const { data, error } = await atSchema().rpc('crear_cita_asesoria', params);

  if (error) {
    console.error('Error creando cita de asesoría:', error);
    throw error;
  }

  return Array.isArray(data) ? data[0] : data;
}

export async function obtenerBloquesDisponibles(asesorId, desde, hasta) {
  const { data, error } = await atSchema().rpc('obtener_bloques_disponibles_asesor', {
    p_asesor_id: asesorId,
    p_desde: desde,
    p_hasta: hasta,
  });

  if (error) {
    console.error('Error obteniendo bloques disponibles:', error);
    throw error;
  }

  return data ?? [];
}

export async function crearCitaEstudianteAsesor(params) {
  const { data, error } = await atSchema().rpc('crear_cita_estudiante_asesor', params);

  if (error) {
    console.error('Error creando cita:', error);
    throw error;
  }

  return data;
}

export async function obtenerEstudiantesAsesor() {
  const { data, error } = await atSchema().rpc('obtener_estudiantes_asesor');

  if (error) {
    console.error('Error obteniendo estudiantes del asesor:', error);
    throw error;
  }

  return data ?? [];
}

export async function obtenerEstudiantesMisAsesorias() {
  const { data, error } = await atSchema().rpc('obtener_estudiantes_mis_asesorias');

  if (error) {
    console.error('Error obteniendo detalles de asesorías:', error);
    throw error;
  }

  return data ?? [];
}

export async function cambiarEstadoRelacion(relacionId, nuevoEstado) {
  const { data, error } = await atSchema().rpc('cambiar_estado_relacion', {
    p_relacion_id: relacionId,
    p_estado: nuevoEstado,
  });

  if (error) {
    console.error('Error al cambiar estado de la relación:', error);
    throw error;
  }

  return data ?? null;
}

export async function obtenerMisAsesores() {
  const { data, error } = await atSchema().rpc('obtener_mis_asesores');

  if (error) {
    console.error('Error obteniendo mis asesores:', error);
    throw error;
  }

  return data ?? [];
}

export async function asignarTesisAsesor(relacionId, tesisId) {
  const { data, error } = await atSchema().rpc('asignar_tesis_asesor', {
    p_relacion_id: relacionId,
    p_tesis_id: tesisId,
  });

  if (error) {
    console.error('Error asignando tesis al asesor:', error);
    throw error;
  }

  return data;
}

export async function asignarMiTesisAAsesor(
  tesisId,
  asesorId,
  rol = 'principal',
) {
  const { data, error } = await atSchema().rpc('asignar_mi_tesis_a_asesor', {
    p_tesis_id: tesisId,
    p_asesor_id: asesorId,
    p_rol: rol,
  });

  if (error) {
    console.error('Error asignando mi tesis a un asesor:', error);
    throw error;
  }

  return Array.isArray(data) ? (data[0] ?? null) : data;
}

export async function obtenerMisTesisConAsesores() {
  const { data, error } = await atSchema().rpc('obtener_mis_tesis_con_asesores');

  if (error) {
    console.error('Error obteniendo mis tesis con asesores:', error);
    throw error;
  }

  return data ?? [];
}

export async function obtenerTesisAsignadasAsesor() {
  const { data, error } = await atSchema().rpc('obtener_tesis_asignadas_asesor');

  if (error) {
    console.error('Error obteniendo tesis asignadas del asesor:', error);
    throw error;
  }

  return data ?? [];
}

export async function getTesisAsesor() {
  return obtenerTesisAsignadasAsesor();
}

export async function getDocumentosApoyo(tesisId) {
  const { data, error } = await atSchema().rpc('get_estudiante_documentos', {
    p_tesis_id: tesisId,
  });

  if (error) {
    console.error('Error obteniendo documentos de la tesis:', error);
    throw error;
  }

  return data ?? [];
}

export async function obtenerDocumentosTesisAsignada(tesisId) {
  const { data, error } = await atSchema().rpc(
    'obtener_documentos_tesis_asignada',
    {
      p_tesis_id: tesisId,
    },
  );

  if (error) {
    console.error('Error obteniendo documentos de tesis asignada:', error);
    throw error;
  }

  return data ?? [];
}

export async function registrarSugerenciaAsesor({
  tesisId,
  tipoSugerenciaId,
  detalle,
  documentoTesisId = null,
}) {
  const { data, error } = await atSchema().rpc('crear_sugerencia_asesor', {
    p_tesis_id: tesisId,
    p_documento_tesis_id: documentoTesisId,
    p_tipo_sugerencia_id: tipoSugerenciaId,
    p_detalle: detalle,
  });

  if (error) {
    console.error('Error registrando sugerencia del asesor:', error);
    throw error;
  }

  return Array.isArray(data) ? (data[0] ?? null) : data;
}

export async function obtenerSugerenciasTesisAsignada(tesisId) {
  const { data, error } = await atSchema().rpc('listar_sugerencias_tesis', {
    p_tesis_id: tesisId,
  });

  if (error) {
    console.error('Error obteniendo sugerencias de tesis asignada:', error);
    throw error;
  }

  return data ?? [];
}

export async function obtenerSugerenciasAsesor(tesisId) {
  return obtenerSugerenciasTesisAsignada(tesisId);
}

export async function listarTiposSugerenciaAsesor() {
  const { data, error } = await atSchema().rpc(
    'listar_tipos_sugerencia_asesor',
  );

  if (error) {
    console.error('Error obteniendo tipos de sugerencia:', error);
    throw error;
  }

  return data ?? [];
}

// Compatibilidad temporal con imports antiguos del panel asesor.
export async function actualizarEstadoSugerenciaAsesor(
  sugerenciaId,
  aplicado,
) {
  const { data, error } = await atSchema().rpc(
    'actualizar_estado_sugerencia_asesor',
    {
      p_sugerencia_id: sugerenciaId,
      p_aplicado: aplicado,
    },
  );

  if (error) {
    console.error('Error actualizando estado de sugerencia:', error);
    throw error;
  }

  return Array.isArray(data) ? (data[0] ?? null) : data;
}

export async function crearEspacioLibreAsesor(payload) {
  const rpcPayload = {
    p_inicio: payload.p_inicio,
    p_fin: payload.p_fin,
    p_usa_bloques: payload.p_usa_bloques ?? true,
    p_duracion_bloque_minutos: payload.p_duracion_bloque_minutos ?? 30,
    p_recurrente: payload.p_recurrente ?? false,
    p_fecha_inicio: payload.p_fecha_inicio ?? null,
    p_fecha_fin: payload.p_fecha_fin ?? null,
  };

  if (Array.isArray(payload.p_dias_semana)) {
    rpcPayload.p_dias_semana = payload.p_dias_semana;
  } else {
    rpcPayload.p_dia_semana = payload.p_dia_semana ?? null;
  }

  const { data, error } = await atSchema().rpc(
    'crear_espacio_libre_asesor',
    rpcPayload,
  );

  if (error) {
    console.error('Error creando espacio libre:', error);
    throw error;
  }

  return Array.isArray(data) ? (data[0] ?? null) : data;
}

export async function obtenerMisEspaciosLibresAsesor() {
  const { data, error } = await atSchema().rpc(
    'obtener_mis_espacios_libres_asesor',
  );

  if (error) {
    console.error('Error obteniendo espacios libres:', error);
    throw error;
  }

  return data ?? [];
}

export async function desactivarEspacioLibreAsesor(disponibilidadId) {
  const { data, error } = await atSchema().rpc(
    'desactivar_espacio_libre_asesor',
    {
      p_disponibilidad_id: disponibilidadId,
    },
  );

  if (error) {
    console.error('Error desactivando espacio libre:', error);
    throw error;
  }

  return Array.isArray(data) ? (data[0] ?? null) : data;
}

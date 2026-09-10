import { cursosApi } from '../api/cursos.api';
import { reunionesApi } from '../api/reuniones.api';
import { sugerenciasApi } from '../api/sugerencias.api';
import { normalizeCourse } from './cursosService';
import {
  obtenerEstudiantesAsesor,
  obtenerMiCodigoPublicoAsesor,
  obtenerTesisAsignadasAsesor,
} from './advisorService';

const asArray = (data, key = null) => {
  if (Array.isArray(data)) return data;
  if (key && Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;
  return data ? [data] : [];
};

const TESIS_APROBADA = ['completado'];
const TESIS_EN_PROGRESO = ['en_progreso', 'borrador', 'pendiente_pago'];
const TESIS_EN_REVISION = ['revision'];
const RELACION_ACTIVA = ['activo', 'completado'];
const REUNION_CONTABILIZA_HONORARIO = ['confirmado', 'completado'];

const toTime = (value) => {
  if (!value) return NaN;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? NaN : time;
};

const nombreEstudiante = (row) =>
  `${row?.estudiante_nombres || row?.nombres || row?.r_nombres || ''} ${
    row?.estudiante_apellidos || row?.apellidos || row?.r_apellidos || ''
  }`.trim();

/**
 * Trae las sugerencias que el asesor emitió sobre cada tesis asignada, las
 * aplana y las ordena de la más reciente a la más antigua. Sirve para las
 * tarjetas "Mis revisiones" y "Última sugerencia enviada".
 */
async function obtenerRevisionesAsesor(tesisAsignadas, limiteTesis = 12) {
  const objetivo = tesisAsignadas.slice(0, limiteTesis);

  const resultados = await Promise.allSettled(
    objetivo.map((tesis) => {
      const tesisId = tesis.tesis_id || tesis.id;
      return sugerenciasApi.listarValidacion(tesisId);
    }),
  );

  const revisiones = resultados.flatMap((resultado, index) => {
    if (resultado.status !== 'fulfilled') return [];

    const tesis = objetivo[index];
    const tesisId = tesis.tesis_id || tesis.id;

    return asArray(resultado.value).map((sug) => ({
      id: sug.id,
      tesis_id: tesisId,
      tesis_titulo: tesis.titulo || tesis.tesis_titulo || 'Sin título',
      estudiante: nombreEstudiante(tesis) || 'Estudiante asignado',
      tipo: sug.tipo_nombre || sug.tipo_codigo || 'Observación',
      detalle: sug.detalle || sug.sugerencia || sug.comentario_asesor || 'Sin detalle',
      comentario_asesor: sug.comentario_asesor || null,
      comentario_estudiante: sug.comentario_estudiante || null,
      estado_validacion: sug.estado_validacion || 'pendiente',
      marcado_aplicado: Boolean(sug.marcado_aplicado),
      creado_en: sug.creado_en || sug.created_at || null,
    }));
  });

  return revisiones.sort((a, b) => {
    const tb = toTime(b.creado_en);
    const ta = toTime(a.creado_en);
    return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta);
  });
}

function resumirHonorarios(reuniones) {
  const contabilizadas = reuniones.filter((reunion) =>
    REUNION_CONTABILIZA_HONORARIO.includes(
      String(reunion.estado || '').toLowerCase(),
    ),
  );

  const moneda = contabilizadas[0]?.moneda || reuniones[0]?.moneda || 'PEN';
  const total = contabilizadas.reduce(
    (acc, reunion) => acc + Number(reunion.costo_reunion || 0),
    0,
  );

  return { total, moneda, contabilizadas: contabilizadas.length };
}

function proximaReunionDesde(reuniones) {
  const ahora = Date.now();
  return reuniones
    .filter((reunion) => {
      const inicio = toTime(reunion.inicio);
      return (
        !Number.isNaN(inicio) &&
        inicio >= ahora &&
        String(reunion.estado || '').toLowerCase() !== 'cancelado'
      );
    })
    .sort((a, b) => toTime(a.inicio) - toTime(b.inicio))[0] || null;
}

export async function obtenerDashboardAsesor() {
  const [
    estudiantesRes,
    tesisRes,
    reunionesRes,
    cursosRes,
    codigoRes,
  ] = await Promise.allSettled([
    obtenerEstudiantesAsesor(),
    obtenerTesisAsignadasAsesor(),
    reunionesApi.listarAsesor(),
    cursosApi.misCursosAsesor(),
    obtenerMiCodigoPublicoAsesor(),
  ]);

  const estudiantes =
    estudiantesRes.status === 'fulfilled' ? estudiantesRes.value || [] : [];
  const tesis = tesisRes.status === 'fulfilled' ? tesisRes.value || [] : [];
  const reuniones =
    reunionesRes.status === 'fulfilled' ? asArray(reunionesRes.value) : [];
  const cursos =
    cursosRes.status === 'fulfilled'
      ? asArray(cursosRes.value).map(normalizeCourse)
      : [];
  const codigoPublico =
    codigoRes.status === 'fulfilled' ? codigoRes.value || null : null;

  const revisiones = await obtenerRevisionesAsesor(tesis);

  const estadoTesis = (row) => String(row.estado || '').toLowerCase();
  const honorarios = resumirHonorarios(reuniones);

  return {
    resumen: {
      total_estudiantes: estudiantes.length,
      estudiantes_activos: estudiantes.filter((e) =>
        RELACION_ACTIVA.includes(
          String(e.r_estado_relacion || e.estado || '').toLowerCase(),
        ),
      ).length,
      solicitudes_pendientes: estudiantes.filter(
        (e) =>
          String(e.r_estado_relacion || e.estado || '').toLowerCase() ===
          'pendiente',
      ).length,
      tesis_total: tesis.length,
      tesis_aprobadas: tesis.filter((t) => TESIS_APROBADA.includes(estadoTesis(t)))
        .length,
      tesis_en_progreso: tesis.filter((t) =>
        TESIS_EN_PROGRESO.includes(estadoTesis(t)),
      ).length,
      tesis_en_revision: tesis.filter((t) =>
        TESIS_EN_REVISION.includes(estadoTesis(t)),
      ).length,
      revisiones_pendientes: revisiones.filter((r) =>
        ['pendiente', 'marcado_por_estudiante'].includes(r.estado_validacion),
      ).length,
      honorarios_total: honorarios.total,
      honorarios_moneda: honorarios.moneda,
      cursos_total: cursos.length,
    },
    estudiantes,
    tesis,
    reuniones,
    cursos,
    revisiones,
    ultima_revision: revisiones[0] || null,
    proxima_reunion: proximaReunionDesde(reuniones),
    codigo_publico: codigoPublico,
  };
}

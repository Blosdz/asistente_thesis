import { supabase } from '../lib/supabase';

const atSchema = () => supabase.schema('AT');

export async function registrarLeadEstudiante(lead) {
  const payload = {
    p_telefono: lead.telefono,
    p_nombre: lead.nombre ?? null,
    p_email: lead.email ?? null,
    p_nivel_academico: lead.nivelAcademico ?? null,
    p_tipo_tesis_codigo: lead.carrera ?? null,
    p_requiere_analisis_estadistico: null,
    p_plan_recomendado_id: null,
    p_precio_cotizado: lead.presupuesto ?? null,
    p_estado_lead: 'cotizado',
    p_metadata: {
      acepta_contacto: lead.aceptaContacto,
      carrera: lead.carrera ?? null,
      plan_recomendado: lead.planRecomendado ?? null,
      presupuesto: lead.presupuesto ?? null,
      universidad_id: lead.universidadId ?? null,
      respuestas: lead.respuestas ?? {},
      source: 'assessment_funnel',
    },
  };

  const { data, error } = await atSchema().rpc(
    'registrar_lead_estudiante',
    payload,
  );

  if (error) {
    console.error('Error registrando lead:', error);
    throw error;
  }

  return data;
}

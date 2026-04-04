import { supabase } from '../lib/supabase';

const atSchema = () => supabase.schema('AT');

export async function adminListarUsuarios() {
  const { data, error } = await atSchema().rpc('admin_listar_usuarios');

  if (error) {
    console.error('Error listando usuarios desde admin:', error);
    throw error;
  }

  return data ?? [];
}

export async function adminListarPagos() {
  const { data, error } = await atSchema().rpc('admin_listar_pagos');

  if (error) {
    console.error('Error listando pagos desde admin:', error);
    throw error;
  }

  return data ?? [];
}

export async function adminObtenerPago(pagoId) {
  const { data, error } = await atSchema().rpc('admin_obtener_pago', {
    p_pago_id: pagoId,
  });

  if (error) {
    console.error('Error obteniendo detalle del pago:', error);
    throw error;
  }

  return Array.isArray(data) ? (data[0] ?? null) : data;
}

export async function adminVerificarPago(
  pagoId,
  {
    estado,
    notaVerificacion = null,
  } = {},
) {
  const { data, error } = await atSchema().rpc('admin_verificar_pago', {
    p_pago_id: pagoId,
    p_estado: estado,
    p_nota_verificacion: notaVerificacion,
  });

  if (error) {
    console.error('Error verificando pago desde admin:', error);
    throw error;
  }

  return Array.isArray(data) ? (data[0] ?? null) : data;
}

export async function validarCitaAsesoriaAdmin(
  validationCitaId,
  {
    aprobado,
    notasAdmin = null,
    enlaceReunion = null,
  } = {},
) {
  const { data, error } = await atSchema().rpc(
    'validar_cita_asesoria_admin',
    {
      p_validation_cita_id: validationCitaId,
      p_aprobado: aprobado,
      p_notas_admin: notasAdmin,
      p_enlace_reunion: enlaceReunion,
    },
  );

  if (error) {
    console.error('Error validando cita desde administración:', error);
    throw error;
  }

  return Array.isArray(data) ? (data[0] ?? null) : data;
}

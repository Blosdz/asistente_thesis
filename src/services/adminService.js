import { adminApi } from '../api/admin.api';

const asArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.pagos)) return data.pagos;
  return data ? [data] : [];
};

const unwrap = (data) => data?.data || data?.pago || data;

export async function adminListarUsuarios() {
  return asArray(await adminApi.listarUsuarios());
}

export async function adminListarPagos() {
  return asArray(await adminApi.listarPagos());
}

export async function adminObtenerPago(pagoId) {
  return unwrap(await adminApi.obtenerPago(pagoId));
}

export async function adminVerificarPago(
  pagoId,
  {
    estado,
    notaVerificacion = null,
  } = {},
) {
  return unwrap(
    await adminApi.verificarPago(pagoId, {
      aprobado: estado === true || estado === 'aprobado' || estado === 'verificado',
      notaVerificacion,
    }),
  );
}

export async function adminVerificarPagoPlan(pagoId, options = {}) {
  return unwrap(
    await adminApi.verificarPagoPlan(pagoId, {
      aprobado:
        options.estado === true ||
        options.estado === 'aprobado' ||
        options.estado === 'verificado',
      notaVerificacion: options.notaVerificacion ?? null,
    }),
  );
}

export async function validarCitaAsesoriaAdmin(reunionId, estado = 'confirmado', nota = null) {
  return unwrap(
    await adminApi.actualizarEstadoReunion(reunionId, {
      estado,
      nota,
    }),
  );
}

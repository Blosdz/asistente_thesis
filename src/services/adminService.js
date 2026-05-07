import { pagosApi } from '../api/pagos.api';
import { pendingEndpoint } from '../api/client';

const asArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.pagos)) return data.pagos;
  return data ? [data] : [];
};

const unwrap = (data) => data?.data || data?.pago || data;

export async function adminListarUsuarios() {
  pendingEndpoint('Listado administrativo de usuarios');
}

export async function adminListarPagos() {
  return asArray(await pagosApi.listar());
}

export async function adminObtenerPago(pagoId) {
  const pagos = await adminListarPagos();
  return pagos.find((pago) => pago?.pago_id === pagoId || pago?.id === pagoId) || null;
}

export async function adminVerificarPago(
  pagoId,
  {
    estado,
    notaVerificacion = null,
  } = {},
) {
  return unwrap(
    await pagosApi.verificar(pagoId, {
      aprobado: estado === true || estado === 'aprobado' || estado === 'verificado',
      notaVerificacion,
    }),
  );
}

export async function adminVerificarPagoPlan(pagoId, options = {}) {
  return adminVerificarPago(pagoId, options);
}

export async function validarCitaAsesoriaAdmin() {
  pendingEndpoint('Validación administrativa de citas');
}

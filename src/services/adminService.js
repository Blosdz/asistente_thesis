import { adminApi } from '../api/admin.api';
import { reunionesApi } from '../api/reuniones.api';

const asArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.pagos)) return data.pagos;
  return data ? [data] : [];
};

const unwrap = (data) => data?.data || data?.pago || data;

const assertPaymentId = (pagoId) => {
  if (!pagoId || pagoId === 'undefined') {
    throw new Error('No se pudo identificar el pago');
  }
};

export async function adminListarUsuarios() {
  return asArray(await adminApi.listarUsuarios());
}

export async function adminListarPagos() {
  return asArray(await adminApi.listarPagos());
}

export async function adminObtenerPago(pagoId) {
  assertPaymentId(pagoId);
  return unwrap(await adminApi.obtenerPago(pagoId));
}

export async function adminObtenerVoucherImagen(pagoId) {
  assertPaymentId(pagoId);
  return adminApi.obtenerVoucherImagen(pagoId);
}

export async function adminVerificarPago(
  pagoId,
  {
    estado,
    notaVerificacion = null,
  } = {},
) {
  assertPaymentId(pagoId);
  return unwrap(
    await adminApi.verificarPago(pagoId, {
      aprobado:
        estado === true ||
        estado === 'aprobado' ||
        estado === 'verificado' ||
        estado === 'validado',
      notaVerificacion,
    }),
  );
}

export async function adminVerificarPagoPlan(pagoId, options = {}) {
  assertPaymentId(pagoId);
  return unwrap(
    await adminApi.verificarPagoPlan(pagoId, {
      aprobado:
        options.estado === true ||
        options.estado === 'aprobado' ||
        options.estado === 'verificado' ||
        options.estado === 'validado',
      notaVerificacion: options.notaVerificacion ?? null,
    }),
  );
}

export async function adminAprobarPagoReserva(validationCitaId, payload = {}) {
  if (!validationCitaId || validationCitaId === 'undefined') {
    throw new Error('No se pudo identificar la reserva');
  }

  return unwrap(
    await reunionesApi.aprobarPagoReserva(validationCitaId, {
      enlaceReunion: payload.enlaceReunion || payload.enlace_reunion || null,
      googleEventId: payload.googleEventId || payload.google_event_id || null,
      meetCodigo: payload.meetCodigo || payload.meet_codigo || null,
      meetError: payload.meetError || payload.meet_error || null,
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

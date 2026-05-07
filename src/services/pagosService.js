import { pagosApi } from '../api/pagos.api';
import { pendingEndpoint } from '../api/client';
import { reunionesApi } from '../api/reuniones.api';

const asArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.pagos)) return data.pagos;
  return data ? [data] : [];
};

const unwrap = (data) => data?.data || data?.pago || data;

export async function obtenerPlanesDisponibles() {
  pendingEndpoint('Planes disponibles');
}

export async function iniciarPagoPlan({ planId, tesisId = null, monto = 0 }) {
  return unwrap(
    await pagosApi.registrar({
      concepto: 'Pago de plan',
      monto,
      tesisId,
      metadata: { planId },
    }),
  );
}

export async function obtenerMisPagosEstudiante() {
  return asArray(await pagosApi.listar());
}

export async function registrarVoucherPago({
  pagoId,
  codigoOperacion = null,
  operationCode = null,
  driveId,
  driveUrl,
  nombreArchivo,
  tipoMime,
  tamanoBytes,
  metadata = {},
}) {
  return unwrap(
    await pagosApi.registrarVoucher(pagoId, {
      codigoOperacion: codigoOperacion || operationCode || null,
      documentoDriveId: driveId,
      urlArchivoDrive: driveUrl,
      nombreArchivoVoucher: nombreArchivo ?? null,
      tipoMimeVoucher: tipoMime ?? null,
      tamanoBytesVoucher: tamanoBytes ?? null,
      metadata,
    }),
  );
}

export async function subirVoucherPago() {
  pendingEndpoint('Subida binaria de vouchers');
}

export async function disponibilidadAsesorSemana() {
  pendingEndpoint('Disponibilidad semanal de asesor');
}

export async function reservarReunion({
  disponibilidadId,
  tesisId = null,
  motivo = '',
  modalidad = 'virtual',
  inicio = null,
  fin = null,
  lugar = null,
  enlaceReunion = null,
  notas = null,
}) {
  if (!inicio || !fin) {
    pendingEndpoint('Reserva de reunión sin inicio/fin documentados');
  }

  return unwrap(
    await reunionesApi.crear({
      disponibilidadId,
      inicio,
      fin,
      tesisId,
      motivo: motivo || 'Asesoría',
      modalidad,
      lugar,
      enlaceReunion,
      notas,
    }),
  );
}

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
  return asArray(await pagosApi.obtenerPlanes(), 'data');
}

export async function iniciarPagoPlan({
  planId,
  tesisId = null,
  codigoOperacion = null,
}) {
  return unwrap(
    await pagosApi.iniciarPagoPlan({
      planId,
      tesisId,
      codigoOperacion,
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
  driveId = null,
  driveUrl = null,
  nombreArchivo = null,
  tipoMime = null,
  tamanoBytes = null,
  paymentMethod = null,
} = {}) {
  return unwrap(
    await pagosApi.registrarVoucher(pagoId, {
      codigoOperacion: codigoOperacion || operationCode || null,
      documentoDriveId: driveId,
      urlArchivoDrive: driveUrl,
      nombreArchivoVoucher: nombreArchivo,
      tipoMimeVoucher: tipoMime,
      tamanoBytesVoucher: tamanoBytes,
      paymentMethod,
    }),
  );
}

export async function subirVoucherPago({
  pagoId,
  file,
  voucherFile,
  paymentMethod = null,
  codigoOperacion = null,
  operationCode = null,
}) {
  const selectedFile = file || voucherFile;
  if (!selectedFile) {
    throw new Error('Selecciona un voucher para subir.');
  }
  const formData = new FormData();
  formData.append('file', selectedFile);
  if (paymentMethod) formData.append('payment_method', paymentMethod);
  if (codigoOperacion || operationCode) {
    formData.append('operation_code', codigoOperacion || operationCode);
  }

  return unwrap(await pagosApi.subirVoucher(pagoId, formData));
}

export async function disponibilidadAsesorSemana() {
  pendingEndpoint('Disponibilidad semanal de asesor sin asesorId');
}

export async function reservarReunion({
  asesorId,
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
  if (!asesorId || !inicio || !fin) {
    pendingEndpoint('Reserva de reunión sin asesor/inicio/fin documentados');
  }

  return unwrap(
    await reunionesApi.crearAsesoria({
      asesorId,
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

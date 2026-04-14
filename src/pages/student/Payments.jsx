import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  AlertCircle,
  CheckCircle2,
  FileUp,
  Loader2,
  Receipt,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import SubscriptionSummaryCard from '../../components/student/SubscriptionSummaryCard';
import Modal from '../../components/ui/modal';
import {
  obtenerMisPagosEstudiante,
  subirVoucherPago,
} from '../../services/pagosService';
import { obtenerMiSuscripcion } from '../../services/suscripcionService';

const formatCurrency = (value, currency = 'PEN') =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: currency || 'PEN',
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

const buildPreviewUrl = (url) => {
  if (!url) return null;

  const driveUcMatch = url.match(/drive\.google\.com\/uc\?id=([^&]+)/);
  if (driveUcMatch) {
    return `https://drive.google.com/file/d/${driveUcMatch[1]}/preview`;
  }

  const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveFileMatch) {
    return `https://drive.google.com/file/d/${driveFileMatch[1]}/preview`;
  }

  if (url.includes('drive.google.com')) {
    return url.replace('/view', '/preview');
  }

  return url;
};

const paymentStatusStyles = {
  pendiente: 'bg-amber-100 text-amber-700',
  voucher_subido: 'bg-blue-100 text-blue-700',
  validado: 'bg-emerald-100 text-emerald-700',
  rechazado: 'bg-rose-100 text-rose-700',
};

const meetingStatusStyles = {
  pendiente: 'bg-amber-100 text-amber-700',
  confirmado: 'bg-emerald-100 text-emerald-700',
  cancelado: 'bg-slate-200 text-slate-700',
  completado: 'bg-violet-100 text-violet-700',
};

const canUploadVoucher = (pago) =>
  ['pendiente', 'rechazado', 'voucher_subido'].includes(pago.estado_pago);

const getPaymentMetadata = (payment) => {
  if (payment?.metadata && typeof payment.metadata === 'object') {
    return payment.metadata;
  }

  if (typeof payment?.metadata === 'string') {
    try {
      return JSON.parse(payment.metadata);
    } catch {
      return {};
    }
  }

  return {};
};

const isPlanPayment = (payment) => {
  const metadata = getPaymentMetadata(payment);
  const concepto = String(payment?.concepto || '').toLowerCase();
  const origenPago = String(
    payment?.origen_pago || metadata?.origen_pago || '',
  ).toLowerCase();

  return Boolean(
    payment?.plan_id ||
      payment?.planId ||
      metadata?.plan_id ||
      metadata?.planId ||
      origenPago === 'tesis_con_plan' ||
      origenPago === 'plan' ||
      concepto.startsWith('plan:') ||
      concepto.includes('plan de tesis'),
  );
};

const inferServiceType = (payment) => {
  const metadata = getPaymentMetadata(payment);
  const rawType = String(
    payment?.tipo_servicio || metadata?.tipo_servicio || '',
  ).toLowerCase();

  if (rawType === 'presustentacion' || rawType === 'asesoria') {
    return rawType;
  }

  const searchableText = [
    payment?.motivo,
    metadata?.motivo,
    payment?.concepto,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return searchableText.includes('pre-sustent') ||
    searchableText.includes('presustent')
    ? 'presustentacion'
    : 'asesoria';
};

const getPaymentTypeMeta = (payment) => {
  if (isPlanPayment(payment)) {
    return {
      label: 'Plan',
      className: 'bg-violet-50 text-violet-700',
    };
  }

  return inferServiceType(payment) === 'presustentacion'
    ? {
        label: 'Pre-sustentación',
        className: 'bg-cyan-50 text-cyan-700',
      }
    : {
        label: 'Asesoría',
        className: 'bg-slate-100 text-slate-700',
      };
};

const extractValidationCitaId = (payment) => {
  const metadata = getPaymentMetadata(payment);

  return (
    payment?.validation_cita_id ||
    payment?.validationCitaId ||
    metadata?.validation_cita_id ||
    metadata?.validationCitaId ||
    null
  );
};

const extractReservationStartAt = (payment) => {
  const metadata = getPaymentMetadata(payment);

  return (
    payment?.inicio_reunion ||
    payment?.reunion_inicio ||
    payment?.inicio ||
    payment?.start_at ||
    metadata?.start_at ||
    metadata?.inicio ||
    null
  );
};

const getPaymentSubtitle = (payment) => {
  if (isPlanPayment(payment)) {
    return 'Compra de plan de tesis';
  }

  if (payment?.asesor_nombre) {
    return `Asesor: ${payment.asesor_nombre}`;
  }

  return inferServiceType(payment) === 'presustentacion'
    ? 'Solicitud de pre-sustentación'
    : 'Solicitud de asesoría';
};

const getScheduleCardMeta = (payment) => {
  if (isPlanPayment(payment)) {
    return {
      label: 'Cobertura',
      value: 'Plan de tesis, sin reunión asociada',
    };
  }

  return {
    label: inferServiceType(payment) === 'presustentacion'
      ? 'Pre-sustentación'
      : 'Asesoría',
    value: extractReservationStartAt(payment)
      ? formatDate(extractReservationStartAt(payment))
      : 'Horario pendiente de confirmación',
  };
};

const Payments = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [pagos, setPagos] = useState([]);
  const [loadingPagos, setLoadingPagos] = useState(true);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [selectedPago, setSelectedPago] = useState(null);
  const [voucherFile, setVoucherFile] = useState(null);
  const [uploadingVoucher, setUploadingVoucher] = useState(false);
  const [previewVoucherOpen, setPreviewVoucherOpen] = useState(false);
  const [previewPago, setPreviewPago] = useState(null);
  const [consumedRouteState, setConsumedRouteState] = useState(false);
  const [suscripcion, setSuscripcion] = useState(null);
  const [loadingSuscripcion, setLoadingSuscripcion] = useState(true);

  const loadPagos = async () => {
    try {
      setLoadingPagos(true);
      const data = await obtenerMisPagosEstudiante();
      setPagos(data || []);
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'No se pudieron cargar tus pagos');
      setPagos([]);
    } finally {
      setLoadingPagos(false);
    }
  };

  useEffect(() => {
    loadPagos();
  }, []);

  useEffect(() => {
    const loadSuscripcion = async () => {
      try {
        setLoadingSuscripcion(true);
        const data = await obtenerMiSuscripcion();
        setSuscripcion(data ?? null);
      } catch (error) {
        console.error('Error cargando suscripción activa:', error);
        setSuscripcion(null);
      } finally {
        setLoadingSuscripcion(false);
      }
    };

    loadSuscripcion();
  }, []);

  useEffect(() => {
    if (loadingPagos || consumedRouteState) return;

    const targetPagoId = location.state?.pagoId;
    const targetValidationCitaId = location.state?.validationCitaId;
    const autoOpenVoucher = location.state?.autoOpenVoucher;

    if ((!targetPagoId && !targetValidationCitaId) || !autoOpenVoucher) return;

    const pago = pagos.find((item) => {
      if (targetPagoId && item.pago_id === targetPagoId) {
        return true;
      }

      if (
        targetValidationCitaId &&
        extractValidationCitaId(item) === targetValidationCitaId
      ) {
        return true;
      }

      return false;
    });

    if (pago && canUploadVoucher(pago)) {
      abrirModalVoucher(pago);
    } else if (pago && !canUploadVoucher(pago)) {
      toast('Ese pago ya no admite carga de voucher.');
    }

    setConsumedRouteState(true);
    navigate(location.pathname, { replace: true, state: null });
  }, [
    consumedRouteState,
    loadingPagos,
    location.pathname,
    location.state,
    navigate,
    pagos,
  ]);

  const resumen = useMemo(() => {
    const pendientes = pagos.filter((pago) =>
      ['pendiente', 'voucher_subido', 'rechazado'].includes(pago.estado_pago),
    );
    const totalPendiente = pendientes.reduce(
      (sum, pago) => sum + Number(pago.monto || 0),
      0,
    );

    return {
      pendientes,
      historial: pagos.filter((pago) => !pendientes.includes(pago)),
      totalPendiente,
    };
  }, [pagos]);

  const abrirModalVoucher = (pago) => {
    setSelectedPago(pago);
    setVoucherFile(null);
    setVoucherModalOpen(true);
  };

  const abrirPreviewVoucher = (pago) => {
    setPreviewPago(pago);
    setPreviewVoucherOpen(true);
  };

  const confirmarSubidaVoucher = async () => {
    if (!selectedPago) return;
    if (!voucherFile) {
      toast.error('Selecciona un archivo PDF o imagen');
      return;
    }

    try {
      setUploadingVoucher(true);
      await subirVoucherPago({
        pagoId: selectedPago.pago_id,
        file: voucherFile,
      });

      toast.success('Voucher subido correctamente');
      setVoucherModalOpen(false);
      setVoucherFile(null);
      setSelectedPago(null);
      await loadPagos();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'No se pudo subir el voucher');
    } finally {
      setUploadingVoucher(false);
    }
  };

  return (
    <>
      <div className="relative min-h-screen mt-10 text-slate-900 overflow-hidden">
        <main className="relative z-10 px-6 sm:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <section className="lg:col-span-4 space-y-6">
              <Card className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                      Resumen
                    </p>
                    <h2 className="text-xl font-bold tracking-tight">
                      Tus pagos
                    </h2>
                  </div>
                  <Wallet className="text-primary" size={22} />
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-primary to-blue-500 text-white p-6 shadow-lg">
                  <p className="text-xs uppercase tracking-[0.2em] text-blue-100">
                    Saldo pendiente
                  </p>
                  <p className="mt-2 text-4xl font-black tracking-tight">
                    {formatCurrency(resumen.totalPendiente)}
                  </p>
                  <p className="mt-3 text-sm text-blue-100">
                    {resumen.pendientes.length} pago(s) esperando voucher o validación.
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Pendientes
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {resumen.pendientes.length}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Validados
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {pagos.filter((pago) => pago.estado_pago === 'validado').length}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                      Nuevo flujo
                    </p>
                    <h3 className="text-lg font-bold text-slate-900">
                      Cotización y tesis
                    </h3>
                  </div>
                  <Sparkles className="text-primary" size={20} />
                </div>

                <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-slate-50 p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-800">
                    La cotización del plan ya no se genera desde esta pantalla.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Ahora primero creas tu tesis en <span className="font-semibold text-slate-700">Mi Tesis</span>,
                    revisas el desglose del precio y desde allí se abre el pago
                    pendiente listo para subir tu voucher.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/student/my-thesis')}
                    className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:brightness-105"
                  >
                    Ir a Mi Tesis
                  </button>
                </div>
              </Card>

              <SubscriptionSummaryCard
                subscription={suscripcion}
                loading={loadingSuscripcion}
              />
            </section>

            <section className="lg:col-span-8 space-y-8">
              <Card className="p-0">
                <div className="px-7 py-6 border-b border-slate-200/60 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">
                      Pagos pendientes
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Sube tu voucher para que el equipo revise y confirme tu pago.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                    {resumen.pendientes.length} en curso
                  </span>
                </div>

                <div className="divide-y divide-slate-200/50">
                  {loadingPagos && (
                    <div className="px-7 py-10 flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Cargando pagos...
                    </div>
                  )}

                  {!loadingPagos && resumen.pendientes.length === 0 && (
                    <div className="px-7 py-10 text-sm text-slate-500">
                      No tienes pagos pendientes por ahora.
                    </div>
                  )}

                  {!loadingPagos &&
                    resumen.pendientes.map((pago) => (
                      (() => {
                        const paymentTypeMeta = getPaymentTypeMeta(pago);
                        const scheduleCardMeta = getScheduleCardMeta(pago);
                        const planPayment = isPlanPayment(pago);

                        return (
                          <div
                            key={pago.pago_id}
                            className="px-7 py-6 flex flex-col gap-4"
                          >
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                              <div className="flex items-start gap-4">
                                <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center">
                                  <Receipt className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900">
                                    {pago.concepto || 'Pago'}
                                  </p>
                                  <p className="text-sm text-slate-500">
                                    {getPaymentSubtitle(pago)}
                                  </p>
                                  <p className="text-xs text-slate-400 mt-1">
                                    Creado el {formatDate(pago.creado_en)}
                                  </p>
                                </div>
                              </div>

                              <div className="text-left md:text-right">
                                <p className="text-lg font-black text-slate-900">
                                  {formatCurrency(pago.monto, pago.moneda)}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2 md:justify-end">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${paymentTypeMeta.className}`}
                                  >
                                    {paymentTypeMeta.label}
                                  </span>
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                      paymentStatusStyles[pago.estado_pago] ||
                                      'bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {pago.estado_pago}
                                  </span>
                                  {!planPayment && pago.estado_reunion && (
                                    <span
                                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                        meetingStatusStyles[pago.estado_reunion] ||
                                        'bg-slate-100 text-slate-700'
                                      }`}
                                    >
                                      {pago.estado_reunion}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/60">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                  {scheduleCardMeta.label}
                                </p>
                                <p className="mt-2 text-slate-700">
                                  {scheduleCardMeta.value}
                                </p>
                              </div>
                              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/60">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                  Voucher
                                </p>
                                <p className="mt-2 text-slate-700">
                                  {pago.nombre_archivo_voucher || 'Aún no subido'}
                                </p>
                              </div>
                              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/60">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                  Última actualización
                                </p>
                                <p className="mt-2 text-slate-700">
                                  {formatDate(pago.actualizado_en)}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                              {pago.url_archivo_drive && (
                                <button
                                  onClick={() => abrirPreviewVoucher(pago)}
                                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                  Ver voucher
                                </button>
                              )}
                              {canUploadVoucher(pago) && (
                                <button
                                  onClick={() => abrirModalVoucher(pago)}
                                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:brightness-105"
                                >
                                  <FileUp className="w-4 h-4" />
                                  {pago.url_archivo_drive
                                    ? 'Actualizar voucher'
                                    : 'Subir voucher'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })()
                    ))}
                </div>
              </Card>

              <Card className="p-0">
                <div className="px-7 py-6 border-b border-slate-200/60 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">
                      Historial de pagos
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Pagos que ya pasaron por revisión.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-7 py-4">Pago</th>
                        <th className="px-7 py-4">Fecha</th>
                        <th className="px-7 py-4">Monto</th>
                        <th className="px-7 py-4">Estado</th>
                        <th className="px-7 py-4">Voucher</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-200/70">
                      {!loadingPagos && resumen.historial.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-7 py-8 text-slate-500">
                            Aún no tienes pagos validados o cerrados.
                          </td>
                        </tr>
                      )}

                      {resumen.historial.map((pago) => (
                        <tr
                          key={pago.pago_id}
                          className="hover:bg-white/70 transition-colors"
                        >
                          <td className="px-7 py-5">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium text-slate-900">
                                {pago.concepto || 'Pago'}
                              </p>
                              <span
                                className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${getPaymentTypeMeta(pago).className}`}
                              >
                                {getPaymentTypeMeta(pago).label}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">
                              {getPaymentSubtitle(pago)}
                            </p>
                          </td>
                          <td className="px-7 py-5 text-slate-500">
                            {formatDate(pago.creado_en)}
                          </td>
                          <td className="px-7 py-5 font-bold">
                            {formatCurrency(pago.monto, pago.moneda)}
                          </td>
                          <td className="px-7 py-5">
                            <span
                              className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${
                                paymentStatusStyles[pago.estado_pago] ||
                                'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {pago.estado_pago}
                            </span>
                          </td>
                          <td className="px-7 py-5">
                            {pago.url_archivo_drive ? (
                              <button
                                onClick={() => abrirPreviewVoucher(pago)}
                                className="inline-flex items-center gap-1 text-primary font-semibold"
                              >
                                Ver voucher
                              </button>
                            ) : (
                              <span className="text-slate-400">No adjunto</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </section>
          </div>
        </main>
      </div>

      <Modal
        open={voucherModalOpen && !!selectedPago}
        onClose={() => !uploadingVoucher && setVoucherModalOpen(false)}
        title="Subir voucher"
        subtitle={selectedPago ? selectedPago.concepto || 'Pago' : ''}
        description={
          selectedPago
            ? `Monto: ${formatCurrency(selectedPago.monto, selectedPago.moneda)}`
            : ''
        }
        primaryAction={{
          label: uploadingVoucher ? 'Subiendo...' : 'Subir voucher',
          onClick: confirmarSubidaVoucher,
        }}
        secondaryAction={{
          label: 'Cancelar',
          onClick: () => setVoucherModalOpen(false),
        }}
      >
        <div className="space-y-4 text-left">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Archivo PDF o imagen
            </span>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(event) => setVoucherFile(event.target.files?.[0] || null)}
              className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold"
            />
          </label>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            {voucherFile ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{voucherFile.name}</span>
                </div>
                <p>{(voucherFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 text-amber-600" />
                <p>
                  Selecciona el comprobante de pago. El archivo se subirá a Drive
                  dentro de la carpeta de tu usuario.
                </p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        open={previewVoucherOpen && !!previewPago}
        onClose={() => setPreviewVoucherOpen(false)}
        title="Vista previa del voucher"
        subtitle={previewPago ? previewPago.nombre_archivo_voucher || 'Comprobante' : ''}
        description={
          previewPago
            ? `Monto: ${formatCurrency(previewPago.monto, previewPago.moneda)}`
            : ''
        }
        primaryAction={{
          label: 'Cerrar',
          onClick: () => setPreviewVoucherOpen(false),
        }}
      >
        {buildPreviewUrl(previewPago?.url_archivo_drive) ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <iframe
              title="Preview voucher"
              src={buildPreviewUrl(previewPago?.url_archivo_drive)}
              className="h-[65vh] w-full bg-white"
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            No se pudo generar la vista previa del voucher.
          </div>
        )}
      </Modal>
    </>
  );
};

export default Payments;

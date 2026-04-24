import { useEffect, useState } from 'react';
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  FileText,
  FileUp,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import Modal from '../../ui/modal';
import PaymentMethodDetails from '../payments/PaymentMethodDetails';
import PaymentMethodSelector from '../payments/PaymentMethodSelector';
import { normalizePaymentMethod } from '../payments/paymentMethodConfig';
import { subirVoucherPago } from '../../../services/pagosService';

const formatCurrency = (value, currency = 'PEN') =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: currency || 'PEN',
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

const humanizeToken = (value, fallback = 'Pendiente') => {
  if (!value) return fallback;

  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const checklist = [
  'Elige el método con el que vas a transferir.',
  'Usa el monto exacto de la orden para evitar observaciones.',
  'Termina el flujo en Pagos subiendo tu voucher.',
];

export default function PaymentGatewayModal({
  open,
  paymentSummary,
  onClose,
  onProceed,
}) {
  const [selectedMethod, setSelectedMethod] = useState('yape');
  const [operationCode, setOperationCode] = useState('');
  const [voucherFile, setVoucherFile] = useState(null);
  const [uploadingVoucher, setUploadingVoucher] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedMethod(normalizePaymentMethod('yape'));
      setOperationCode('');
      setVoucherFile(null);
    }
  }, [open, paymentSummary?.pago_id]);

  if (!paymentSummary) {
    return null;
  }

  const amount =
    paymentSummary.precio_total ??
    paymentSummary.monto ??
    paymentSummary.total ??
    0;
  const currency = paymentSummary.moneda || 'PEN';
  const thesisStatus = humanizeToken(paymentSummary.estado_tesis, 'Borrador');
  const paymentStatus = humanizeToken(paymentSummary.estado_pago, 'Pendiente');

  const handleClose = () => {
    if (uploadingVoucher) return;
    onClose?.();
  };

  const handleProceed = () => {
    if (uploadingVoucher) return;
    onProceed?.();
  };

  const handleUploadVoucher = async () => {
    if (!paymentSummary?.pago_id) {
      toast.error('No se pudo identificar el pago pendiente.');
      return;
    }

    if (!voucherFile) {
      toast.error('Selecciona un archivo PDF o imagen.');
      return;
    }

    try {
      setUploadingVoucher(true);
      await subirVoucherPago({
        pagoId: paymentSummary.pago_id,
        file: voucherFile,
        paymentMethod: selectedMethod,
        operationCode: operationCode.trim() || null,
      });

      toast.success('Voucher subido correctamente');
      onClose?.();
    } catch (error) {
      console.error('Upload voucher from payment gateway error:', error);
      toast.error(error.message || 'No se pudo subir el voucher.');
    } finally {
      setUploadingVoucher(false);
    }
  };

  const uploadSlot = (
    <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 shadow-[0_8px_24px_-22px_rgba(15,23,42,0.28)]">
      <label
        htmlFor="workspace-payment-voucher-input"
        className="group block cursor-pointer rounded-[20px] border border-dashed border-slate-300 bg-slate-50 px-5 py-5 transition hover:border-slate-400 hover:bg-white"
      >
        <input
          id="workspace-payment-voucher-input"
          type="file"
          accept="application/pdf,image/*"
          onChange={(event) => setVoucherFile(event.target.files?.[0] || null)}
          className="sr-only"
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-white/80 bg-white/82 text-slate-600 shadow-sm transition group-hover:bg-white group-hover:text-sky-700">
              <FileUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">
                Adjuntar comprobante
              </p>
              <p className="mt-1 text-xs text-slate-500">PDF, JPG o PNG.</p>
            </div>
          </div>
          <span className="inline-flex h-10 items-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition group-hover:bg-slate-50">
            Elegir archivo
          </span>
        </div>
      </label>

      <div className="mt-4 rounded-[18px] border border-slate-200 bg-white px-4 py-4">
        {voucherFile ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  Archivo listo para enviar
                </p>
                <p className="mt-1 text-sm text-slate-500">{voucherFile.name}</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[16px] bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                  Tamaño
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {(voucherFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div className="rounded-[16px] bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                  Tipo
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {voucherFile.type || 'Archivo seleccionado'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-slate-950">
                Falta adjuntar el voucher
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                El comprobante se subirá directamente a tu carpeta de Drive.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      modalWidth="full"
      showDefaultHeader={false}
      showDefaultActions={false}
      panelClassName="rounded-[32px] border-none shadow-[0_35px_110px_-62px_rgba(148,163,184,0.28)]"
      contentClassName="max-h-[min(92vh,980px)] overflow-y-auto p-0 text-left"
      closeButtonClassName="top-4 right-4"
      closeIconClassName="text-slate-600"
    >
      <div className="overflow-hidden">
        <section className="bg-[linear-gradient(180deg,rgba(255,255,255,0.86)_0%,rgba(235,244,255,0.72)_100%)] px-6 py-6 text-slate-900 sm:px-7 sm:py-7">
          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/76 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                <BadgeCheck className="h-3.5 w-3.5" />
                Orden generada
              </div>

              <div className="space-y-2">
                <h3 className="max-w-2xl text-[22px] font-semibold tracking-tight text-slate-900 sm:text-[24px]">
                  Método de pago para tu nueva tesis
                </h3>
                <p className="max-w-2xl text-sm leading-6 text-slate-600">
                  Elige cómo vas a pagar y continúa en la pantalla de pagos para
                  subir el comprobante.
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/80 bg-white/72 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_16px_34px_rgba(148,163,184,0.14)] backdrop-blur-md">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Total a pagar
              </p>
              <p className="mt-2 text-[30px] font-semibold tracking-tight text-slate-900">
                {formatCurrency(amount, currency)}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full border border-white/80 bg-white/78 px-3 py-1">
                  Pago ID {paymentSummary.pago_id}
                </span>
                <span className="rounded-full border border-white/80 bg-white/78 px-3 py-1">
                  Tesis ID {paymentSummary.tesis_id}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="border-b border-slate-200/80 bg-amber-50/90 px-6 py-3 sm:px-7">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-amber-700">
            <Clock3 className="h-4 w-4" />
            Puedes subir el voucher aquí o hacerlo luego desde Pagos.
          </div>
        </div>

        <div className="grid gap-6 px-6 py-6  sm:px-7 sm:py-7">
          <section className="space-y-5">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Elige tu método
              </p>
              <p className="text-sm leading-6 text-slate-500">
                Puedes revisar Yape, Plin o transferencia y cargar el voucher
                desde este mismo modal.
              </p>
            </div>

            <PaymentMethodSelector
              selectedMethod={selectedMethod}
              onSelect={setSelectedMethod}
            />

            <div className="rounded-[26px] border border-slate-200 bg-slate-50/70 p-5 shadow-[0_18px_55px_-42px_rgba(15,23,42,0.25)]">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Datos del método
                  </p>
                  <h4 className="mt-2 text-base font-semibold tracking-tight text-slate-950">
                    Información de pago
                  </h4>
                </div>
                <ShieldCheck className="h-5 w-5 text-slate-300" />
              </div>

              <PaymentMethodDetails
                methodId={selectedMethod}
                operationValue={operationCode}
                onOperationChange={setOperationCode}
                uploadSlot={uploadSlot}
              />
            </div>
            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
              <button
                type="button"
                onClick={handleUploadVoucher}
                disabled={uploadingVoucher}
                className="ios-accent-button flex-1 rounded-[16px] px-5 py-3.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploadingVoucher ? 'Subiendo...' : 'Subir voucher ahora'}
              </button>
              <button
                type="button"
                onClick={handleProceed}
                disabled={uploadingVoucher}
                className="rounded-[16px] border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Ir a Pagos
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={uploadingVoucher}
                className="rounded-[16px] border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Luego
              </button>
            </div>
          </section>
        </div>
      </div>
    </Modal>
  );
}

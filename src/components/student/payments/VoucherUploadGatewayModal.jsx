import { useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  FileUp,
} from 'lucide-react';

import Modal from '../../ui/modal';
import PaymentMethodDetails from './PaymentMethodDetails';
import PaymentMethodSelector from './PaymentMethodSelector';
import { normalizePaymentMethod } from './paymentMethodConfig';

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

const getStatusTone = (status) => {
  if (status === 'rechazado') {
    return 'border-rose-200 bg-rose-50 text-rose-700';
  }

  if (status === 'voucher_subido') {
    return 'border-blue-200 bg-blue-50 text-blue-700';
  }

  return 'border-amber-200 bg-amber-50 text-amber-700';
};

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

const getModalScroller = () =>
  document.querySelector('[data-modal-scroll="true"]');

const restoreScroll = (scrollTop) => {
  const scroller = getModalScroller();

  if (!scroller) return;

  scroller.scrollTop = scrollTop;

  requestAnimationFrame(() => {
    scroller.scrollTop = scrollTop;

    requestAnimationFrame(() => {
      scroller.scrollTop = scrollTop;
    });
  });

  window.setTimeout(() => {
    scroller.scrollTop = scrollTop;
  }, 0);
};

export default function VoucherUploadGatewayModal({
  open,
  payment,
  voucherFile,
  uploading,
  onFileChange,
  onClose,
  onSubmit,
}) {
  const paymentMetadata = useMemo(() => getPaymentMetadata(payment), [payment]);

  const [selectedMethod, setSelectedMethod] = useState('yape');
  const [operationCode, setOperationCode] = useState('');

  const fileInputRef = useRef(null);
  const lastScrollTopRef = useRef(0);

  const saveScroll = () => {
    const scroller = getModalScroller();
    lastScrollTopRef.current = scroller?.scrollTop ?? 0;
  };

  const openFilePicker = () => {
    saveScroll();
    fileInputRef.current?.click();
  };

  const handleVoucherChange = (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0] || null;
    const scrollTop = lastScrollTopRef.current;

    input.blur();

    flushSync(() => {
      onFileChange(file);
    });

    input.value = '';
    restoreScroll(scrollTop);
  };

  useEffect(() => {
    if (!open || !payment) return;

    const savedMethod =
      paymentMetadata?.metodo_pago || paymentMetadata?.payment_method || 'yape';

    const savedCode =
      paymentMetadata?.codigo_operacion_referencia ||
      paymentMetadata?.codigo_operacion ||
      (String(payment.codigo_operacion || '').startsWith('PAY-')
        ? ''
        : payment.codigo_operacion || '');

    setSelectedMethod(normalizePaymentMethod(savedMethod));
    setOperationCode(savedCode);
    lastScrollTopRef.current = 0;
  }, [open, payment, paymentMetadata]);

  if (!payment) {
    return null;
  }

  const amount = formatCurrency(payment.monto, payment.moneda);
  const status = humanizeToken(payment.estado_pago, 'Pendiente');
  const statusTone = getStatusTone(payment.estado_pago);
  const hasExistingVoucher = Boolean(payment.url_archivo_drive);

  const primaryLabel = uploading
    ? 'Subiendo...'
    : hasExistingVoucher
      ? 'Actualizar voucher'
      : 'Confirmar pago';

  const handleSubmit = () => {
    onSubmit({
      paymentMethod: selectedMethod,
      operationCode: operationCode.trim(),
    });
  };

  const uploadSlot = (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-[0_8px_24px_-22px_rgba(15,23,42,0.28)] [overflow-anchor:none]">
      <input
        ref={fileInputRef}
        id="voucher-upload-input"
        type="file"
        accept="application/pdf,image/*"
        tabIndex={-1}
        onChange={handleVoucherChange}
        className="fixed left-[-9999px] top-0 h-px w-px opacity-0"
      />

      <button
        type="button"
        onMouseDown={saveScroll}
        onTouchStart={saveScroll}
        onClick={openFilePicker}
        className="group block w-full cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-5 text-left transition hover:border-slate-400 hover:bg-white"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/80 bg-white/80 text-slate-600 shadow-sm transition group-hover:bg-white group-hover:text-sky-700">
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
      </button>

      <div className="mt-4 h-[172px] overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-4">
        {voucherFile ? (
          <div className="flex h-full flex-col justify-center space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-950">
                  Archivo listo para enviar
                </p>
                <p className="mt-1 line-clamp-2 break-all text-sm text-slate-500">
                  {voucherFile.name}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                  Tamaño
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {(voucherFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                  Tipo
                </p>
                <p className="mt-2 line-clamp-1 break-all text-sm font-semibold text-slate-900">
                  {voucherFile.type || 'Archivo seleccionado'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />

            <div>
              <p className="text-sm font-semibold text-slate-950">
                Falta adjuntar el voucher
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                El comprobante se subirá a Drive dentro de tu carpeta de usuario.
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
      onClose={onClose}
      modalWidth="full"
      showDefaultHeader={false}
      panelClassName="my-4 rounded-[32px] border-none shadow-[0_35px_110px_-62px_rgba(148,163,184,0.28)] sm:my-6"
      contentClassName="p-0 [overflow-anchor:none]"
      closeButtonClassName="top-4 right-4"
      closeIconClassName="text-slate-600"
      primaryAction={{
        label: primaryLabel,
        onClick: handleSubmit,
        disabled: uploading,
      }}
      secondaryAction={{
        label: 'Cancelar',
        onClick: onClose,
        disabled: uploading,
      }}
    >
      <section className="bg-[linear-gradient(180deg,rgba(255,255,255,0.86)_0%,rgba(235,244,255,0.72)_100%)] px-6 py-6 pr-16 text-slate-900 sm:px-7 sm:py-7 sm:pr-16">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
              <BadgeCheck className="h-3.5 w-3.5" />
              Pago pendiente de validación
            </div>

            <div className="space-y-2">
              <h3 className="max-w-2xl text-[22px] font-semibold tracking-tight text-slate-900 sm:text-[24px]">
                Sube tu voucher de pago
              </h3>

              <p className="max-w-2xl text-sm leading-6 text-slate-600">
                Selecciona el método, añade la referencia de operación y carga
                el comprobante.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/80 bg-white/70 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_16px_34px_rgba(148,163,184,0.14)] backdrop-blur-md">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Monto asociado
            </p>

            <p className="mt-2 text-[30px] font-semibold tracking-tight text-slate-900">
              {amount}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="rounded-full border border-white/80 bg-white/75 px-3 py-1">
                Pago ID {payment.pago_id}
              </span>

              <span className="rounded-full border border-white/80 bg-white/75 px-3 py-1">
                {payment.concepto || 'Pago'}
              </span>

              <span className={`rounded-full border px-3 py-1 ${statusTone}`}>
                {status}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200/80 bg-amber-50/90 px-6 py-3 sm:px-7">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-amber-700">
          <Clock3 className="h-4 w-4" />
          Usa el mismo monto exacto y un comprobante legible.
        </div>
      </section>

      <section className="space-y-5 px-6 py-6 sm:px-7 sm:py-7">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Método de pago
          </p>

          <p className="text-sm leading-6 text-slate-500">
            Elige Yape, Plin o transferencia y completa la referencia de
            operación.
          </p>
        </div>

        <PaymentMethodSelector
          selectedMethod={selectedMethod}
          onSelect={setSelectedMethod}
        />

        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 shadow-[0_18px_55px_-42px_rgba(15,23,42,0.25)]">
          <PaymentMethodDetails
            methodId={selectedMethod}
            operationValue={operationCode}
            onOperationChange={setOperationCode}
            uploadSlot={uploadSlot}
          />
        </div>
      </section>
    </Modal>
  );
}

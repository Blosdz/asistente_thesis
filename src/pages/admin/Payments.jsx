import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CreditCard,
  ExternalLink,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectItem } from '../../components/ui/select';
import Modal from '../../components/ui/modal';
import {
  adminListarPagos,
  adminObtenerPago,
  adminVerificarPago,
} from '../../services/adminService';

const VERIFICATION_STATUS_OPTIONS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'aprobado', label: 'Aprobado' },
  { value: 'verificado', label: 'Verificado' },
  { value: 'rechazado', label: 'Rechazado' },
];

const statusBadgeClass = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'verificado':
    case 'validado':
      return 'bg-emerald-50 text-emerald-700';
    case 'aprobado':
    case 'pagado':
      return 'bg-cyan-50 text-cyan-700';
    case 'rechazado':
    case 'fallido':
      return 'bg-rose-50 text-rose-700';
    case 'reembolsado':
      return 'bg-violet-50 text-violet-700';
    case 'pendiente':
    default:
      return 'bg-amber-50 text-amber-700';
  }
};

const roleBadgeClass = (role) => {
  switch (role) {
    case 'asesor':
      return 'bg-blue-50 text-blue-700';
    case 'admin':
      return 'bg-slate-900 text-white';
    case 'estudiante':
    default:
      return 'bg-emerald-50 text-emerald-700';
  }
};

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatStatusLabel = (value) =>
  (value || 'sin_estado').replaceAll('_', ' ');

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [verificationModal, setVerificationModal] = useState({
    open: false,
    payment: null,
    estado: 'aprobado',
    nota: '',
  });
  const [submittingVerification, setSubmittingVerification] = useState(false);

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminListarPagos();
      setPayments(data || []);
    } catch (error) {
      console.error('Error loading admin payments:', error);
      toast.error(error.message || 'No se pudieron cargar los pagos');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const statusOptions = useMemo(() => {
    const statuses = Array.from(
      new Set(payments.map((item) => item.estado).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));

    return [
      { value: 'all', label: 'Todos' },
      ...statuses.map((value) => ({
        value,
        label: formatStatusLabel(value),
      })),
    ];
  }, [payments]);

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payments.filter((item) => {
      const matchesStatus =
        statusFilter === 'all' || item.estado === statusFilter;
      if (!matchesStatus) return false;

      if (!query) return true;

      return [
        item.pagador_nombre,
        item.pagador_rol,
        item.asesor_nombre,
        item.concepto,
        item.codigo_operacion,
        item.estado,
        item.nombre_archivo_voucher,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [payments, search, statusFilter]);

  const counters = useMemo(() => {
    return payments.reduce(
      (acc, item) => {
        const status = (item.estado || '').toLowerCase();
        acc.total += 1;
        acc.monto += Number(item.monto || 0);

        if (['pendiente'].includes(status)) acc.pendientes += 1;
        if (['aprobado', 'pagado'].includes(status)) acc.aprobados += 1;
        if (['verificado', 'validado'].includes(status)) acc.verificados += 1;
        if (['rechazado', 'fallido'].includes(status)) acc.rechazados += 1;

        return acc;
      },
      {
        total: 0,
        monto: 0,
        pendientes: 0,
        aprobados: 0,
        verificados: 0,
        rechazados: 0,
      },
    );
  }, [payments]);

  const openDetail = async (paymentId) => {
    try {
      setDetailModalOpen(true);
      setDetailLoading(true);
      const data = await adminObtenerPago(paymentId);
      setSelectedPayment(data);
    } catch (error) {
      console.error('Error loading payment detail:', error);
      toast.error(error.message || 'No se pudo cargar el detalle del pago');
      setDetailModalOpen(false);
      setSelectedPayment(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedPayment(null);
  };

  const openVerificationModal = (payment) => {
    setVerificationModal({
      open: true,
      payment,
      estado: ['aprobado', 'verificado', 'rechazado', 'pendiente'].includes(
        (payment?.estado || '').toLowerCase(),
      )
        ? payment.estado
        : 'aprobado',
      nota: payment?.nota_verificacion || '',
    });
  };

  const closeVerificationModal = () => {
    setVerificationModal({
      open: false,
      payment: null,
      estado: 'aprobado',
      nota: '',
    });
  };

  const handleVerifyPayment = async () => {
    if (submittingVerification) return;

    const pagoId = verificationModal.payment?.pago_id;
    if (!pagoId) {
      toast.error('No se pudo identificar el pago');
      return;
    }

    try {
      setSubmittingVerification(true);
      await adminVerificarPago(pagoId, {
        estado: verificationModal.estado,
        notaVerificacion: verificationModal.nota.trim() || null,
      });

      toast.success('Pago actualizado correctamente');
      closeVerificationModal();
      await loadPayments();

      if (selectedPayment?.pago_id === pagoId) {
        const data = await adminObtenerPago(pagoId);
        setSelectedPayment(data);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error(error.message || 'No se pudo actualizar el pago');
    } finally {
      setSubmittingVerification(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 py-10 text-slate-900">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
          Admin / Pagos
        </p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Validación de pagos
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
              Revisa vouchers, abre el detalle de cada pago y registra la
              decisión administrativa con nota de verificación.
            </p>
          </div>

          <button
            type="button"
            onClick={loadPayments}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="rounded-[26px] border border-white/80 bg-white/80 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Total pagos
          </p>
          <p className="mt-3 text-3xl font-black text-slate-900">
            {counters.total}
          </p>
        </Card>
        <Card className="rounded-[26px] border border-white/80 bg-white/80 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Pendientes
          </p>
          <p className="mt-3 text-3xl font-black text-amber-600">
            {counters.pendientes}
          </p>
        </Card>
        <Card className="rounded-[26px] border border-white/80 bg-white/80 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Verificados
          </p>
          <p className="mt-3 text-3xl font-black text-emerald-600">
            {counters.verificados}
          </p>
        </Card>
        <Card className="rounded-[26px] border border-white/80 bg-white/80 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Monto total
          </p>
          <p className="mt-3 text-3xl font-black text-slate-900">
            {formatCurrency(counters.monto)}
          </p>
        </Card>
      </section>

      <Card className="overflow-hidden rounded-[32px] border border-white/80 bg-white/80 p-0 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 border-b border-slate-200/70 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por pagador, asesor, estado u operación"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm"
            />
          </div>

          <div className="w-full max-w-[240px]">
            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900"
            >
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Pago</th>
                <th className="px-6 py-4">Pagador</th>
                <th className="px-6 py-4">Asesor</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Verificación</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 text-sm">
              {loading && (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cargando pagos...
                    </span>
                  </td>
                </tr>
              )}

              {!loading && filteredPayments.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-slate-500">
                    No hay pagos para este filtro.
                  </td>
                </tr>
              )}

              {!loading &&
                filteredPayments.map((item) => (
                  <tr key={item.pago_id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-5 align-top">
                      <div className="flex items-start gap-3">
                        <div className="inline-flex rounded-2xl bg-slate-100 p-3 text-slate-700">
                          <CreditCard className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {formatCurrency(item.monto)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.concepto || 'Sin concepto'}
                          </p>
                          <p className="mt-1 font-mono text-[11px] text-slate-400">
                            {item.codigo_operacion || item.pago_id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <p className="font-semibold text-slate-900">
                        {item.pagador_nombre || 'Usuario'}
                      </p>
                      <span
                        className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${roleBadgeClass(item.pagador_rol)}`}
                      >
                        {item.pagador_rol || 'sin rol'}
                      </span>
                    </td>
                    <td className="px-6 py-5 align-top text-slate-600">
                      <p className="font-medium text-slate-800">
                        {item.asesor_nombre || 'Sin asesor'}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {item.asesor_id || '—'}
                      </p>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${statusBadgeClass(item.estado)}`}
                      >
                        {formatStatusLabel(item.estado)}
                      </span>
                    </td>
                    <td className="px-6 py-5 align-top text-slate-600">
                      <p>{formatDateTime(item.verificado_en)}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {item.verificado_por_nombre || 'Sin verificador'}
                      </p>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openDetail(item.pago_id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                          <Eye className="h-4 w-4" />
                          Detalle
                        </button>
                        <button
                          type="button"
                          onClick={() => openVerificationModal(item)}
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                        >
                          <ShieldCheck className="h-4 w-4" />
                          Verificar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={detailModalOpen}
        onClose={closeDetailModal}
        title="Detalle del pago"
        subtitle="Información completa para revisión administrativa."
        primaryAction={{
          label: 'Cerrar',
          onClick: closeDetailModal,
        }}
      >
        {detailLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando detalle...
          </div>
        ) : selectedPayment ? (
          <div className="space-y-4 text-left">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Pagador
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {selectedPayment.pagador_nombre || 'Usuario'}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedPayment.pagador_rol || 'sin rol'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Estado actual
                </p>
                <span
                  className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${statusBadgeClass(selectedPayment.estado)}`}
                >
                  {formatStatusLabel(selectedPayment.estado)}
                </span>
                <p className="mt-2 text-xs text-slate-500">
                  Verificado: {formatDateTime(selectedPayment.verificado_en)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Monto
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  {formatCurrency(selectedPayment.monto)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedPayment.concepto || 'Sin concepto'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Operación
                </p>
                <p className="mt-2 font-mono text-sm text-slate-900">
                  {selectedPayment.codigo_operacion || 'Sin código'}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Creado: {formatDateTime(selectedPayment.creado_en)}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                Voucher
              </p>
              <div className="mt-2 flex flex-col gap-2 text-sm text-slate-700">
                <p>Archivo: {selectedPayment.nombre_archivo_voucher || 'No registrado'}</p>
                <p>Tipo MIME: {selectedPayment.tipo_mime_voucher || '—'}</p>
                <p>Subido: {formatDateTime(selectedPayment.subido_en)}</p>
                {selectedPayment.url_archivo_drive && (
                  <a
                    href={selectedPayment.url_archivo_drive}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Abrir voucher
                  </a>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                Nota de verificación
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {selectedPayment.nota_verificacion || 'Sin nota registrada'}
              </p>
            </div>

            {selectedPayment.metadata && (
              <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">
                    Metadata
                  </p>
                </div>
                <pre className="mt-3 overflow-x-auto text-xs leading-6 text-slate-200">
                  {JSON.stringify(selectedPayment.metadata, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => openVerificationModal(selectedPayment)}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <ShieldCheck className="h-4 w-4" />
                Verificar pago
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-500">
            No se encontró información para este pago.
          </div>
        )}
      </Modal>

      <Modal
        open={verificationModal.open}
        onClose={closeVerificationModal}
        title="Verificar pago"
        subtitle="Registra la decisión administrativa y una nota opcional."
        primaryAction={{
          label: submittingVerification ? 'Guardando...' : 'Guardar decisión',
          onClick: handleVerifyPayment,
        }}
        secondaryAction={{
          label: 'Cancelar',
          onClick: closeVerificationModal,
        }}
      >
        <div className="space-y-4 text-left">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Pago seleccionado
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {verificationModal.payment?.pagador_nombre || 'Usuario'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {verificationModal.payment?.codigo_operacion || verificationModal.payment?.pago_id}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Nuevo estado
            </label>
            <Select
              value={verificationModal.estado}
              onChange={(event) =>
                setVerificationModal((current) => ({
                  ...current,
                  estado: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900"
            >
              {VERIFICATION_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Nota de verificación
            </label>
            <textarea
              rows="4"
              value={verificationModal.nota}
              onChange={(event) =>
                setVerificationModal((current) => ({
                  ...current,
                  nota: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100 resize-none"
              placeholder="Ejemplo: Voucher válido y operación confirmada."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminPayments;

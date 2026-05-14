import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  FileText,
  Sparkles,
  Users,
} from 'lucide-react';

import { Card } from '../../components/ui/card';
import SubscriptionSummaryCard from '../../components/student/SubscriptionSummaryCard';
import { normalizeMyAdvisor } from '../../components/student/advisors/advisors.utils';
import { obtenerDashboardEstudianteBase } from '../../services/dashboardService';

const formatterFechaLarga = new Intl.DateTimeFormat('es-PE', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  hour: 'numeric',
  minute: '2-digit',
});

const formatterFechaCorta = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const resumenInicial = {
  cantidad_citas_proximas: 0,
  pagos_pendientes: 0,
  documentos_recientes: 0,
  tesis_id: null,
  tesis_titulo: null,
  proxima_reunion_id: null,
  proxima_reunion_inicio: null,
  proxima_reunion_fin: null,
  proxima_reunion_estado: null,
  proxima_reunion_enlace: null,
  proximo_asesor_id: null,
  proximo_asesor_nombre: null,
};

const dashboardInicial = {
  resumen: resumenInicial,
  perfil: null,
  tesis: [],
  suscripcion: null,
  citas: [],
  pagos: [],
  asesores: [],
};

const paymentPendingStatuses = ['pendiente', 'voucher_subido', 'rechazado'];

const cleanText = (value, fallback = '') => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }

  return fallback;
};

const toNumber = (value) => Number(value || 0);

const hasValidDate = (value) => {
  if (!value) return false;
  return !Number.isNaN(new Date(value).getTime());
};

const humanizeToken = (value, fallback = 'Sin estado') => {
  const safeValue = cleanText(value, fallback);
  return safeValue
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getStudentName = (perfil) => {
  const nombres = cleanText(perfil?.nombres || perfil?.r_nombres, '');
  const apellidos = cleanText(perfil?.apellidos || perfil?.r_apellidos, '');
  const nombreCompleto = [nombres, apellidos].filter(Boolean).join(' ');

  return nombreCompleto || 'Estudiante';
};

const getThesisId = (tesis) => tesis?.id || tesis?.tesis_id || null;
const getThesisTitle = (tesis) =>
  cleanText(tesis?.titulo || tesis?.tesis_titulo || tesis?.nombre, 'Tesis sin título');
const getThesisStatus = (tesis) =>
  cleanText(tesis?.estado || tesis?.estado_tesis, 'en progreso');
const getThesisDescription = (tesis) =>
  cleanText(tesis?.descripcion || tesis?.tema || tesis?.resumen, '');

const getMeetingStart = (cita) =>
  cita?.inicio ||
  cita?.start_at ||
  cita?.inicio_reunion ||
  cita?.fecha_inicio ||
  cita?.inicio_bloque ||
  null;

const getMeetingEnd = (cita) =>
  cita?.fin ||
  cita?.end_at ||
  cita?.fin_reunion ||
  cita?.fecha_fin ||
  cita?.fin_bloque ||
  null;

const getMeetingStatus = (cita) =>
  cleanText(
    cita?.status || cita?.estado_reunion || cita?.estado || cita?.proxima_reunion_estado,
    'pendiente',
  ).toLowerCase();

const getMeetingAdvisorName = (cita) =>
  cleanText(
      cita?.asesor_nombre ||
      cita?.advisor_nombre ||
      cita?.nombre_asesor ||
      cita?.proximo_asesor_nombre ||
      cita?.nombre_mostrar,
    'Asesor académico',
  );

const getMeetingLink = (cita) =>
  cita?.meet_link || cita?.enlace_reunion || cita?.enlace || cita?.proxima_reunion_enlace || null;

const getPaymentId = (pago) => pago?.pago_id || pago?.id || null;
const getPaymentStatus = (pago) =>
  cleanText(pago?.estado_pago || pago?.estado, 'pendiente').toLowerCase();
const getPaymentAmount = (pago) => toNumber(pago?.monto || pago?.amount || 0);
const getPaymentConcept = (pago) =>
  cleanText(pago?.concepto || pago?.motivo || pago?.descripcion, 'Pago registrado');
const getPaymentDate = (pago) =>
  pago?.created_at || pago?.fecha_pago || pago?.fecha_creacion || pago?.updated_at || null;

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(dashboardInicial);

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        setLoading(true);
        const data = await obtenerDashboardEstudianteBase();
        setDashboard({
          resumen: { ...resumenInicial, ...(data?.resumen ?? {}) },
          perfil: data?.perfil ?? null,
          tesis: data?.tesis ?? [],
          suscripcion: data?.suscripcion ?? null,
          citas: data?.citas ?? [],
          pagos: data?.pagos ?? [],
          asesores: data?.asesores ?? [],
        });
      } catch (error) {
        console.error('Error cargando dashboard de estudiante:', error);
        toast.error('No se pudo cargar el dashboard del estudiante.');
      } finally {
        setLoading(false);
      }
    };

    cargarDashboard();
  }, []);

  const perfilNombre = useMemo(
    () => getStudentName(dashboard.perfil),
    [dashboard.perfil],
  );

  const tesisNormalizadas = useMemo(
    () =>
      (dashboard.tesis ?? [])
        .map((tesis) => ({
          id: getThesisId(tesis),
          titulo: getThesisTitle(tesis),
          estado: getThesisStatus(tesis),
          descripcion: getThesisDescription(tesis),
        }))
        .filter((tesis) => tesis.id || tesis.titulo),
    [dashboard.tesis],
  );

  const tesisActiva = useMemo(() => {
    const thesisBySummary = tesisNormalizadas.find(
      (tesis) => tesis.id && tesis.id === dashboard.resumen.tesis_id,
    );

    if (thesisBySummary) return thesisBySummary;

    if (dashboard.resumen.tesis_titulo) {
      return {
        id: dashboard.resumen.tesis_id,
        titulo: dashboard.resumen.tesis_titulo,
        estado: 'activa',
        descripcion: '',
      };
    }

    return tesisNormalizadas[0] ?? null;
  }, [dashboard.resumen, tesisNormalizadas]);

  const citasNormalizadas = useMemo(
    () =>
      (dashboard.citas ?? [])
        .map((cita) => {
          const inicio = getMeetingStart(cita);

          return {
            id: cita?.reunion_id || cita?.validation_cita_id || cita?.id || null,
            inicio,
            fin: getMeetingEnd(cita),
            estado: getMeetingStatus(cita),
            asesorNombre: getMeetingAdvisorName(cita),
            enlace: getMeetingLink(cita),
            tipoServicio: cleanText(cita?.tipo_servicio, 'asesoria'),
          };
        })
        .filter((cita) => hasValidDate(cita.inicio))
        .sort((a, b) => new Date(a.inicio) - new Date(b.inicio)),
    [dashboard.citas],
  );

  const citasProximas = useMemo(() => {
    const now = Date.now();

    return citasNormalizadas
      .filter((cita) => new Date(cita.inicio).getTime() >= now)
      .slice(0, 3);
  }, [citasNormalizadas]);

  const proximaCita = useMemo(() => {
    if (hasValidDate(dashboard.resumen.proxima_reunion_inicio)) {
      return {
        id: dashboard.resumen.proxima_reunion_id,
        inicio: dashboard.resumen.proxima_reunion_inicio,
        fin: dashboard.resumen.proxima_reunion_fin,
        estado: getMeetingStatus(dashboard.resumen),
        asesorNombre: cleanText(
          dashboard.resumen.proximo_asesor_nombre,
          'Asesor académico',
        ),
        enlace: dashboard.resumen.proxima_reunion_enlace,
      };
    }

    return citasProximas[0] ?? null;
  }, [dashboard.resumen, citasProximas]);

  const pagosNormalizados = useMemo(
    () =>
      (dashboard.pagos ?? [])
        .map((pago) => ({
          id: getPaymentId(pago),
          estado: getPaymentStatus(pago),
          monto: getPaymentAmount(pago),
          concepto: getPaymentConcept(pago),
          moneda: pago?.moneda || 'PEN',
          fecha: getPaymentDate(pago),
        }))
        .filter((pago) => pago.id || pago.concepto),
    [dashboard.pagos],
  );

  const pagosPendientes = useMemo(
    () =>
      pagosNormalizados.filter((pago) =>
        paymentPendingStatuses.includes(pago.estado),
      ),
    [pagosNormalizados],
  );

  const asesoresNormalizados = useMemo(
    () =>
      (dashboard.asesores ?? [])
        .map(normalizeMyAdvisor)
        .filter((asesor) => asesor.id || asesor.name),
    [dashboard.asesores],
  );

  const stats = useMemo(
    () => [
      {
        label: 'Citas próximas',
        value: String(toNumber(dashboard.resumen.cantidad_citas_proximas)).padStart(2, '0'),
        note: proximaCita?.inicio
          ? proximaCita.enlace || formatterFechaCorta.format(new Date(proximaCita.inicio))
          : 'Sin reuniones programadas',
        href: proximaCita?.enlace || null,
        icon: CalendarClock,
        tone: 'text-violet-800 bg-violet-100 border-violet-300 shadow-violet-500/15',
      },
      {
        label: 'Pagos pendientes',
        value: String(toNumber(dashboard.resumen.pagos_pendientes)).padStart(2, '0'),
        note:
          pagosPendientes.length > 0
            ? 'Revisa voucher, validación o pago por completar'
            : 'No tienes pagos pendientes',
        icon: CreditCard,
        tone: 'text-amber-800 bg-amber-100 border-amber-300 shadow-amber-500/15',
      },
      {
        label: 'Documentos recientes',
        value: String(toNumber(dashboard.resumen.documentos_recientes)).padStart(2, '0'),
        note: 'Documentos vinculados a tu tesis',
        icon: FileText,
        tone: 'text-emerald-800 bg-emerald-100 border-emerald-300 shadow-emerald-500/15',
      },
      {
        label: 'Tesis activa',
        value: tesisActiva ? 'Activa' : 'Sin tesis',
        note: tesisActiva?.titulo || 'Crea o selecciona tu tesis',
        icon: CheckCircle2,
        tone: 'text-blue-800 bg-blue-100 border-blue-300 shadow-blue-500/15',
      },
    ],
    [dashboard.resumen, pagosPendientes.length, proximaCita, tesisActiva],
  );

  return (
    <div className="relative w-full px-4 py-12 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
              Dashboard Estudiante
            </p>
            <h1 className="font-['Ubuntu'] text-4xl font-bold tracking-tighter text-slate-900 md:text-5xl">
              {loading ? 'Cargando tu dashboard...' : `Hola, ${perfilNombre}`}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-500 md:text-base">
              Revisa tu tesis activa, tu plan, citas, pagos y asesores desde una
              sola vista.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('/student/my-thesis')}
              className="ios-secondary-button inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold"
            >
              Ir a mi tesis
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/student/asesorias')}
              className="ios-accent-button inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold"
            >
              Ver asesorías
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.label}
                className="rounded-[28px] border border-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)]"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border shadow-lg ${item.tone}`}
                >
                  <Icon className="h-6 w-6" strokeWidth={2.55} />
                </div>
                <p className="mt-5 text-sm font-semibold text-slate-500">
                  {item.label}
                </p>
                <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                  {loading ? '--' : item.value}
                </p>
                {item.href ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex max-w-full items-center gap-1 truncate text-sm font-semibold text-blue-700 hover:text-blue-800"
                    title={item.href}
                  >
                    <span className="truncate">{item.note}</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </a>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">{item.note}</p>
                )}
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <section className="space-y-8 lg:col-span-8">
            <Card className="relative overflow-hidden rounded-[32px] !p-5 sm:!p-6 lg:!p-7">
              <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="relative z-10">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 sm:text-sm">
                      Tesis activa
                    </p>
                    <h2 className="mt-2 font-['Ubuntu'] text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                      {tesisActiva?.titulo || 'Aún no tienes una tesis activa'}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                      {tesisActiva
                        ? 'Tu tesis ya está vinculada a tu espacio de trabajo. Desde aquí puedes revisar documentos, sugerencias y el avance general.'
                        : 'Cuando crees o selecciones una tesis, aquí verás su título, estado y accesos rápidos para continuar tu proceso.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/student/my-thesis')}
                    className="ios-accent-button inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold sm:w-auto"
                  >
                    Abrir espacio de tesis
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="bg-sky-400/10 p-4 rounded-2xl border border-slate-200 text-black">
                    <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl border border-blue-300 bg-blue-100 text-blue-800 shadow-md shadow-blue-500/15">
                      <FileText className="h-5 w-5" strokeWidth={2.55} />
                    </div>
                    <p className="text-sm font-bold text-slate-900">Estado</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {humanizeToken(tesisActiva?.estado, 'Sin estado')}
                    </p>
                  </div>

                  <div className="bg-sky-400/10 p-4 rounded-2xl border border-slate-200 text-black">
                    <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-300 bg-emerald-100 text-emerald-800 shadow-md shadow-emerald-500/15">
                      <CheckCircle2 className="h-5 w-5" strokeWidth={2.55} />
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      Documentos recientes
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {toNumber(dashboard.resumen.documentos_recientes)} registrado(s)
                    </p>
                  </div>

                  <div className="bg-sky-400/10 p-4 rounded-2xl border border-slate-200 text-black">
                    <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl border border-violet-300 bg-violet-100 text-violet-800 shadow-md shadow-violet-500/15">
                      <CalendarClock className="h-5 w-5" strokeWidth={2.55} />
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      Próxima reunión
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {proximaCita?.inicio
                        ? formatterFechaLarga.format(new Date(proximaCita.inicio))
                        : 'Sin cita agendada'}
                    </p>
                    {proximaCita?.enlace && (
                      <a
                        href={proximaCita.enlace}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex max-w-full items-center gap-1 truncate text-xs font-semibold text-blue-700 hover:text-blue-800"
                        title={proximaCita.enlace}
                      >
                        <span className="truncate">{proximaCita.enlace}</span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card className="rounded-[32px] border border-white/70 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Tesis
                    </p>
                    <h3 className="mt-3 text-xl font-bold text-slate-900">
                      Mis tesis
                    </h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-300 bg-blue-100 text-blue-800 shadow-lg shadow-blue-500/15">
                    <FileText className="h-6 w-6" strokeWidth={2.55} />
                  </div>
                </div>


                <div className="mt-6 space-y-3">
                  {tesisNormalizadas.length > 0 ? (
                    tesisNormalizadas.slice(0, 3).map((tesis) => (
                      <div
                        key={tesis.id || tesis.titulo}
                        className="rounded-2xl border border-slate-200 bg-sky-400/10 p-4"
                      >
                        <p className="text-sm font-bold text-slate-900">
                          {tesis.titulo}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Estado: {humanizeToken(tesis.estado, 'En progreso')}
                        </p>
                        {tesis.descripcion && (
                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                            {tesis.descripcion}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-500">
                      Aún no se encontraron tesis registradas para tu cuenta.
                    </div>
                  )}
                </div>
              </Card>

              <Card className="rounded-[32px] border border-white/70 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Citas
                    </p>
                    <h3 className="mt-3 text-xl font-bold text-slate-900">
                      Próximas reuniones
                    </h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-300 bg-violet-100 text-violet-800 shadow-lg shadow-violet-500/15">
                    <CalendarClock className="h-6 w-6" strokeWidth={2.55} />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {citasProximas.length > 0 ? (
                    citasProximas.map((cita) => (
                      <div
                        key={cita.id || cita.inicio}
                        className="rounded-2xl border border-slate-200 bg-sky-400/10 p-4"
                      >
                        <p className="text-sm font-bold text-slate-900">
                          {cita.asesorNombre}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatterFechaLarga.format(new Date(cita.inicio))}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          Estado: {humanizeToken(cita.estado)}
                        </p>
                        {cita.enlace && (
                          <a
                            href={cita.enlace}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex max-w-full items-center gap-1 truncate text-xs font-semibold text-blue-700 hover:text-blue-800"
                            title={cita.enlace}
                          >
                            <span className="truncate">{cita.enlace}</span>
                            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-500">
                      No tienes citas próximas por ahora.
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/student/citas')}
                  className="ios-secondary-button mt-6 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold"
                >
                  Ver reuniones
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card className="rounded-[32px] border border-white/70 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Pagos
                    </p>
                    <h3 className="mt-3 text-xl font-bold text-slate-900">
                      Pagos del estudiante
                    </h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300 bg-amber-100 text-amber-800 shadow-lg shadow-amber-500/15">
                    <CreditCard className="h-6 w-6" strokeWidth={2.55} />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {pagosPendientes.length > 0 ? (
                    pagosPendientes.slice(0, 3).map((pago) => (
                      <div
                        key={pago.id || pago.concepto}
                        className="rounded-2xl border border-slate-200 bg-sky-400/10 p-4"
                      >
                        <p className="text-sm font-bold text-slate-900">
                          {pago.concepto}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Estado: {humanizeToken(pago.estado)}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          Monto: {new Intl.NumberFormat('es-PE', {
                            style: 'currency',
                            currency: pago.moneda || 'PEN',
                            minimumFractionDigits: 2,
                          }).format(pago.monto)}
                        </p>
                        {pago.fecha && hasValidDate(pago.fecha) && (
                          <p className="mt-1 text-xs text-slate-500">
                            Registrado: {formatterFechaCorta.format(new Date(pago.fecha))}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-500">
                      No tienes pagos pendientes en este momento.
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/student/payments')}
                  className="ios-secondary-button mt-6 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold"
                >
                  Ver pagos
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Card>

              <Card className="rounded-[32px] border border-white/70 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Asesores
                    </p>
                    <h3 className="mt-3 text-xl font-bold text-slate-900">
                      Mis asesores
                    </h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300 bg-cyan-100 text-cyan-800 shadow-lg shadow-cyan-500/15">
                    <Users className="h-6 w-6" strokeWidth={2.55} />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {asesoresNormalizados.length > 0 ? (
                    asesoresNormalizados.slice(0, 3).map((asesor) => (
                      <div
                        key={asesor.relacionId || asesor.id || asesor.name}
                        className="rounded-2xl border border-slate-200 bg-sky-400/10 p-4"
                      >
                        <p className="text-sm font-bold text-slate-900">
                          {asesor.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Estado: {humanizeToken(asesor.estado)}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          {asesor.thesisTitle || asesor.career}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-500">
                      Aún no tienes asesores vinculados.
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/student/asesorias')}
                  className="ios-secondary-button mt-6 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold"
                >
                  Ver asesores
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Card>
            </div>
          </section>

          <aside className="space-y-8 lg:col-span-4">
            <SubscriptionSummaryCard
              subscription={dashboard.suscripcion}
              loading={loading}
            />

            <Card className="rounded-[32px] border border-white/70 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                <Sparkles className="h-5 w-5 text-blue-800" strokeWidth={2.55} />
                Perfil del estudiante
              </p>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="text-sm font-bold text-slate-900">
                    {perfilNombre}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {cleanText(
                      dashboard.perfil?.carrera || dashboard.perfil?.r_carrera,
                      'Carrera no registrada',
                    )}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="text-sm font-bold text-slate-900">
                    Universidad
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {cleanText(
                      dashboard.perfil?.universidad_nombre ||
                        dashboard.perfil?.universidad ||
                        dashboard.perfil?.r_universidad_id,
                      'Pendiente de completar',
                    )}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="text-sm font-bold text-slate-900">
                    Contacto
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {cleanText(
                      dashboard.perfil?.telefono || dashboard.perfil?.r_telefono,
                      'Sin teléfono registrado',
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/student/profile')}
                className="ios-secondary-button mt-6 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold"
              >
                Actualizar perfil
                <ArrowRight className="h-4 w-4" />
              </button>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  CalendarClock,
  CheckCircle2,
  CreditCard,
  FileText,
  BookOpen,
  PlayCircle,
  UploadCloud,
  UserPlus,
} from 'lucide-react';

import SubscriptionSummaryCard from '../../components/student/SubscriptionSummaryCard';
import { normalizeMyAdvisor } from '../../components/student/advisors/advisors.utils';
import {
  ActiveCourseCard,
  AdvisorConnectionCard,
  AdvisorSuggestions,
  AdvisorsCard,
  HeroSection,
  MeetingsCalendar,
  MetricsGrid,
  PaymentsCard,
  QuickActions,
  StudentProfileCard,
  ThesisProgressCard,
} from '../../components/student/dashboard';
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

const formatterDiaCorto = new Intl.DateTimeFormat('es-PE', {
  weekday: 'short',
  day: '2-digit',
});

const formatterHora = new Intl.DateTimeFormat('es-PE', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
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
const getThesisUpdatedAt = (tesis) =>
  tesis?.updated_at || tesis?.fecha_actualizacion || tesis?.updatedAt || null;

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
          updatedAt: getThesisUpdatedAt(tesis),
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
          'Asesor academico',
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

  const resumenItems = useMemo(
    () => [
      {
        label: 'Tesis activa',
        value: tesisActiva ? 'Activa' : 'Sin tesis',
        note: tesisActiva?.titulo || 'Crea tu primera tesis',
      },
      {
        label: 'Citas proximas',
        value: String(toNumber(dashboard.resumen.cantidad_citas_proximas)).padStart(2, '0'),
        note: proximaCita?.inicio
          ? formatterFechaCorta.format(new Date(proximaCita.inicio))
          : 'Sin reuniones programadas',
      },
      {
        label: 'Pagos pendientes',
        value: String(toNumber(dashboard.resumen.pagos_pendientes)).padStart(2, '0'),
        note:
          pagosPendientes.length > 0
            ? 'Revisa vouchers o validaciones'
            : 'No tienes pagos pendientes',
      },
    ],
    [dashboard.resumen, pagosPendientes.length, proximaCita, tesisActiva],
  );

  const progressGeneral = useMemo(() => {
    const documentos = toNumber(dashboard.resumen.documentos_recientes);
    const value = Math.min(100, Math.round(documentos * 12.5));

    return {
      value,
      label: documentos > 0 ? `${documentos} documentos` : 'Sin avances',
      helper:
        documentos > 0
          ? 'Basado en los documentos recientes de tu tesis.'
          : 'Registra documentos para ver el avance general.',
    };
  }, [dashboard.resumen.documentos_recientes]);

  const thesisProgress = useMemo(() => {
    const documentos = toNumber(dashboard.resumen.documentos_recientes);
    const value = Math.min(100, Math.round(documentos * 12.5));

    return {
      value,
      label: documentos > 0 ? `${documentos} documentos` : 'Sin registros',
      helper:
        documentos > 0
          ? 'Actividad registrada en tu workspace.'
          : 'Aun no tienes documentos registrados.',
    };
  }, [dashboard.resumen.documentos_recientes]);

  const tesisUpdatedLabel = useMemo(() => {
    if (tesisActiva?.updatedAt && hasValidDate(tesisActiva.updatedAt)) {
      return formatterFechaCorta.format(new Date(tesisActiva.updatedAt));
    }

    return 'Sin modificaciones recientes';
  }, [tesisActiva?.updatedAt]);

  const thesisTimeline = useMemo(
    () => [
      {
        label: 'Tesis activa',
        detail: tesisActiva?.titulo || 'Sin tesis vinculada',
        status: tesisActiva ? 'done' : 'todo',
      },
      {
        label: 'Documentos registrados',
        detail: `${toNumber(dashboard.resumen.documentos_recientes)} documento(s)`,
        status: dashboard.resumen.documentos_recientes ? 'done' : 'todo',
      },
      {
        label: 'Proxima reunion',
        detail: proximaCita?.inicio
          ? formatterFechaCorta.format(new Date(proximaCita.inicio))
          : 'Por agendar',
        status: proximaCita?.inicio ? 'done' : 'todo',
      },
    ],
    [dashboard.resumen.documentos_recientes, proximaCita, tesisActiva],
  );

  const activeCourse = useMemo(() => {
    const rawCourse =
      dashboard?.curso_activo ||
      dashboard?.curso ||
      (Array.isArray(dashboard?.cursos) ? dashboard.cursos[0] : null) ||
      dashboard?.suscripcion ||
      null;

    if (!rawCourse) return null;

    const title = cleanText(
      rawCourse?.titulo ||
        rawCourse?.nombre ||
        rawCourse?.curso_nombre ||
        rawCourse?.plan_nombre ||
        rawCourse?.nombre_plan,
      null,
    );

    if (!title) return null;

    const totalSesiones =
      toNumber(rawCourse?.asesorias_incluidas) ||
      toNumber(rawCourse?.presustentaciones_incluidas);
    const sesionesUsadas =
      toNumber(rawCourse?.asesorias_usadas) ||
      toNumber(rawCourse?.presustentaciones_usadas);
    const progress =
      totalSesiones > 0
        ? Math.min(100, Math.round((sesionesUsadas / totalSesiones) * 100))
        : 0;

    return {
      title,
      summary: 'Plan premium con sesiones y recursos para impulsar tu tesis.',
      modules:
        totalSesiones > 0
          ? `${sesionesUsadas}/${totalSesiones} sesiones`
          : 'Contenido disponible',
      progress,
      progressLabel: sesionesUsadas > 0 ? 'Sesiones completadas' : 'Listo para iniciar',
      lastLesson: cleanText(rawCourse?.ultimo_modulo || rawCourse?.modulo_actual, 'Inicio del curso'),
    };
  }, [dashboard]);

  const metrics = useMemo(
    () => [
      {
        label: 'Citas proximas',
        value: String(toNumber(dashboard.resumen.cantidad_citas_proximas)).padStart(2, '0'),
        note: proximaCita?.inicio
          ? formatterFechaCorta.format(new Date(proximaCita.inicio))
          : 'Sin reuniones programadas',
        href: proximaCita?.enlace || null,
        icon: CalendarClock,
        tone: 'bg-gradient-to-br from-white via-white to-blue-50 border-blue-100',
        size: 'lg',
      },
      {
        label: 'Pagos pendientes',
        value: String(toNumber(dashboard.resumen.pagos_pendientes)).padStart(2, '0'),
        note:
          pagosPendientes.length > 0
            ? 'Revisa voucher, validacion o pago por completar'
            : 'No tienes pagos pendientes',
        icon: CreditCard,
        tone: 'bg-gradient-to-br from-white via-white to-amber-50 border-amber-100',
        size: 'md',
      },
      {
        label: 'Documentos recientes',
        value: String(toNumber(dashboard.resumen.documentos_recientes)).padStart(2, '0'),
        note: 'Documentos vinculados a tu tesis',
        icon: FileText,
        tone: 'bg-gradient-to-br from-white via-white to-emerald-50 border-emerald-100',
        size: 'md',
      },
      {
        label: 'Tesis activa',
        value: tesisActiva ? 'Activa' : 'Sin tesis',
        note: tesisActiva?.titulo || 'Crea o selecciona tu tesis',
        icon: CheckCircle2,
        tone: 'bg-gradient-to-br from-white via-white to-slate-50 border-slate-200',
        size: 'sm',
      },
    ],
    [dashboard.resumen, pagosPendientes.length, proximaCita, tesisActiva],
  );

  const quickActions = useMemo(
    () => [
      {
        label: 'Continuar tesis',
        description: 'Retoma tu workspace',
        icon: PlayCircle,
        onClick: () => navigate('/student/my-thesis'),
        tone: 'hover:border-blue-200 hover:shadow-blue-500/15',
      },
      {
        label: 'Entrar al curso',
        description: 'Accede al ultimo modulo',
        icon: BookOpen,
        onClick: () => navigate('/student/cursos'),
        tone: 'hover:border-emerald-200 hover:shadow-emerald-500/15',
      },
      {
        label: 'Ver reuniones',
        description: 'Agenda o consulta',
        icon: CalendarClock,
        onClick: () => navigate('/student/citas'),
        tone: 'hover:border-cyan-200 hover:shadow-cyan-500/15',
      },
      {
        label: 'Subir documento',
        description: 'Carga tus avances',
        icon: UploadCloud,
        onClick: () => navigate('/student/documents'),
        tone: 'hover:border-amber-200 hover:shadow-amber-500/15',
      },
      {
        label: 'Conectar asesor',
        description: 'Vincula tu mentor',
        icon: UserPlus,
        onClick: () => navigate('/student/asesorias'),
        tone: 'hover:border-rose-200 hover:shadow-rose-500/15',
      },
    ],
    [navigate],
  );

  const meetingsCalendar = useMemo(
    () =>
      citasProximas.map((cita) => ({
        id: cita.id || cita.inicio,
        title: cita.asesorNombre,
        date: formatterFechaCorta.format(new Date(cita.inicio)),
        day: formatterDiaCorto.format(new Date(cita.inicio)),
        time: formatterHora.format(new Date(cita.inicio)),
        status: humanizeToken(cita.estado),
        link: cita.enlace,
      })),
    [citasProximas],
  );

  const suggestionsFeed = useMemo(() => {
    const raw = Array.isArray(dashboard?.sugerencias)
      ? dashboard.sugerencias
      : [];

    return raw.slice(0, 4).map((item, index) => {
      const prioridad = cleanText(item?.prioridad || item?.nivel, 'Normal');
      const prioridadLower = prioridad.toLowerCase();
      const badgeTone =
        prioridadLower === 'alta'
          ? 'bg-rose-100 text-rose-700'
          : prioridadLower === 'media'
            ? 'bg-amber-100 text-amber-700'
            : 'bg-emerald-100 text-emerald-700';
      const dateValue =
        item?.created_at ||
        item?.fecha_creacion ||
        item?.fecha ||
        item?.updated_at ||
        null;

      return {
        id: item?.id || item?.sugerencia_id || item?.observacion_id || index,
        title: cleanText(
          item?.titulo || item?.sugerencia || item?.observacion,
          'Nueva sugerencia del asesor',
        ),
        description: cleanText(
          item?.detalle || item?.descripcion || item?.comentario,
          'Revisa la observacion para mantener el avance.',
        ),
        date: hasValidDate(dateValue)
          ? formatterFechaCorta.format(new Date(dateValue))
          : 'Sin fecha',
        priority: prioridad,
        badgeTone,
        read: Boolean(item?.leido || item?.visto || item?.estado === 'leido'),
      };
    });
  }, [dashboard?.sugerencias]);

  const proximaCitaMeta = useMemo(
    () => ({
      label: proximaCita?.inicio
        ? formatterFechaLarga.format(new Date(proximaCita.inicio))
        : 'Sin cita agendada',
      link: proximaCita?.enlace || null,
    }),
    [proximaCita],
  );

  return (
    <div className="relative w-full px-4 py-12 text-slate-900 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(16,185,129,0.08),_transparent_60%)]" />
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <HeroSection
          loading={loading}
          perfilNombre={perfilNombre}
          resumenItems={resumenItems}
          progress={progressGeneral}
          proximaCita={proximaCitaMeta}
          tesisActiva={tesisActiva}
          onPrimaryCta={() => navigate('/student/my-thesis')}
          onSecondaryCta={() => navigate('/student/citas')}
        />

        <QuickActions actions={quickActions} />

        <div className="grid gap-8 lg:grid-cols-12">
          <section className="space-y-8 lg:col-span-8">
            <AdvisorsCard
                  advisors={asesoresNormalizados}
                  onOpenAdvisors={() => navigate('/student/asesorias')}
            />
            <ThesisProgressCard
              thesis={{
                ...tesisActiva,
                updatedLabel: tesisUpdatedLabel,
              }}
              progress={thesisProgress}
              timeline={thesisTimeline}
              onOpenThesis={() => navigate('/student/my-thesis')}
            />
            <ActiveCourseCard
              course={activeCourse}
              onContinue={() => navigate('/student/cursos')}
            />
          </section>

          <aside className="space-y-8 lg:col-span-4">
            <AdvisorConnectionCard
              advisor={asesoresNormalizados[0]}
              onOpenAdvisors={() => navigate('/student/asesorias')}
            />

            <SubscriptionSummaryCard
              subscription={dashboard.suscripcion}
              loading={loading}
            />

          </aside>
        </div>
      </div>
    </div>
  );
}

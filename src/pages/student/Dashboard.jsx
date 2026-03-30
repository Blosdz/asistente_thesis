import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Clock3,
  CreditCard,
  ExternalLink,
  FileText,
  Sparkles,
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { obtenerResumenDashboardEstudiante } from '../../services/dashboardService';
import { toast } from 'react-hot-toast';

const formatterFecha = new Intl.DateTimeFormat('es-PE', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  hour: 'numeric',
  minute: '2-digit',
});

const formatterDia = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: 'short',
});

const formatterHora = new Intl.DateTimeFormat('es-PE', {
  hour: 'numeric',
  minute: '2-digit',
});

const milestones = [
  {
    title: 'Propuesta',
    state: 'Aprobada',
    icon: CheckCircle2,
    tone: 'text-emerald-600 bg-emerald-50',
  },
  {
    title: 'Marco teórico',
    state: 'En revisión',
    icon: FileText,
    tone: 'text-blue-600 bg-blue-50',
  },
  {
    title: 'Próxima cita',
    state: 'Agenda actualizada',
    icon: CalendarClock,
    tone: 'text-violet-600 bg-violet-50',
  },
];

const resumenInicial = {
  cantidad_citas_proximas: 0,
  pagos_pendientes: 0,
  tesis_id: null,
  tesis_titulo: null,
  documentos_recientes: 0,
  proxima_reunion_id: null,
  proxima_reunion_inicio: null,
  proxima_reunion_fin: null,
  proxima_reunion_estado: null,
  proxima_reunion_enlace: null,
  proximo_asesor_id: null,
  proximo_asesor_nombre: null,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState(resumenInicial);

  useEffect(() => {
    const cargarResumen = async () => {
      try {
        setLoading(true);
        const data = await obtenerResumenDashboardEstudiante();
        setResumen({ ...resumenInicial, ...(data ?? {}) });
      } catch (error) {
        console.error('Error cargando dashboard:', error);
        toast.error('No se pudo cargar el dashboard.');
      } finally {
        setLoading(false);
      }
    };

    cargarResumen();
  }, []);

  const stats = useMemo(
    () => [
      {
        label: 'Avance general',
        value: resumen.tesis_titulo ? 'Activo' : 'Sin tesis',
        note: resumen.tesis_titulo ?? 'Crea o selecciona tu tesis',
        icon: BarChart3,
        tone: 'text-blue-600 bg-blue-50 border-blue-100',
      },
      {
        label: 'Documentos',
        value: String(resumen.documentos_recientes ?? 0).padStart(2, '0'),
        note: 'Archivos registrados',
        icon: FileText,
        tone: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      },
      {
        label: 'Pagos pendientes',
        value: String(resumen.pagos_pendientes ?? 0).padStart(2, '0'),
        note: 'En revisión o por subir',
        icon: CreditCard,
        tone: 'text-amber-600 bg-amber-50 border-amber-100',
      },
      {
        label: 'Próximas citas',
        value: String(resumen.cantidad_citas_proximas ?? 0).padStart(2, '0'),
        note: resumen.proxima_reunion_inicio
          ? formatterDia.format(new Date(resumen.proxima_reunion_inicio))
          : 'Sin reuniones próximas',
        icon: CalendarClock,
        tone: 'text-violet-600 bg-violet-50 border-violet-100',
      },
    ],
    [resumen],
  );

  const proximaReunionTexto = resumen.proxima_reunion_inicio
    ? formatterFecha.format(new Date(resumen.proxima_reunion_inicio))
    : 'Aún no tienes una cita agendada';

  return (
    <div className="relative w-full px-4 py-12 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
              Dashboard
            </p>
            <h1 className="font-['Ubuntu'] text-4xl font-bold tracking-tighter text-slate-900 md:text-5xl">
              Tu espacio de seguimiento académico
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-500 md:text-base">
              Consulta el estado de tu tesis, pagos y próximas reuniones desde
              una sola vista.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <section className="space-y-8 lg:col-span-8">
            <Card className="relative overflow-hidden rounded-[32px] border border-white/70 bg-gradient-to-br from-white via-slate-50 to-blue-50 p-10 shadow-[0_24px_60px_rgba(18,74,240,0.08)]">
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="relative z-10">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
                      Tesis activa
                    </p>
                    <h2 className="mt-2 font-['Ubuntu'] text-3xl font-bold tracking-tight text-slate-900">
                      {resumen.tesis_titulo ?? 'Selecciona o crea una tesis'}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-slate-500">
                      {resumen.tesis_titulo
                        ? 'Tu espacio principal ya está listo para seguir subiendo versiones, revisar sugerencias y mantener ordenado tu avance.'
                        : 'Aún no se detecta una tesis activa. Puedes ir a tu espacio de tesis para crearla o elegirla.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/student/my-thesis')}
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-[0_16px_30px_rgba(37,99,235,0.26)] hover:bg-blue-700"
                  >
                    Abrir mi tesis
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {milestones.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.title}
                        className="rounded-2xl border border-white/70 bg-white/70 p-5"
                      >
                        <div
                          className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${item.tone}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-bold text-slate-900">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.title === 'Próxima cita'
                            ? (resumen.proxima_reunion_estado ?? item.state)
                            : item.state}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((item) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={item.label}
                    className="rounded-[28px] border border-white/80 bg-white/75 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)]"
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${item.tone}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-5 text-sm font-semibold text-slate-500">
                      {item.label}
                    </p>
                    <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                      {loading ? '--' : item.value}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">{item.note}</p>
                  </Card>
                );
              })}
            </div>
          </section>

          <aside className="space-y-8 lg:col-span-4">
            <Card className="rounded-[32px] border border-white/70 bg-white/70 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Citas
                  </p>
                  <h3 className="mt-3 text-xl font-bold text-slate-900">
                    {loading
                      ? 'Cargando agenda...'
                      : resumen.cantidad_citas_proximas > 0
                        ? `${resumen.cantidad_citas_proximas} próxima(s)`
                        : 'Sin citas próximas'}
                  </h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <CalendarClock className="h-6 w-6" />
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-500">
                {proximaReunionTexto}
              </p>

              {resumen.proximo_asesor_nombre && (
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {resumen.proximo_asesor_nombre}
                </p>
              )}

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={() => navigate('/student/citas')}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Ver calendario de citas
                  <ArrowRight className="h-4 w-4" />
                </button>

                {resumen.proxima_reunion_enlace && (
                  <a
                    href={resumen.proxima_reunion_enlace}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Abrir Google Meet
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </Card>

            <Card className="rounded-[32px] border border-white/70 bg-white/70 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                <Sparkles className="h-4 w-4 text-blue-600" />
                Resumen rápido
              </p>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="text-sm font-bold text-slate-900">
                    Pagos por revisar
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {loading
                      ? 'Cargando...'
                      : `${resumen.pagos_pendientes ?? 0} pago(s) aún requieren seguimiento.`}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="text-sm font-bold text-slate-900">
                    Documentos recientes
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {loading
                      ? 'Cargando...'
                      : `${resumen.documentos_recientes ?? 0} documento(s) vinculados a tu tesis activa.`}
                  </p>
                </div>
                {resumen.proxima_reunion_inicio && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <p className="text-sm font-bold text-slate-900">
                      Hora estimada
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatterHora.format(
                        new Date(resumen.proxima_reunion_inicio),
                      )}{' '}
                      -{' '}
                      {resumen.proxima_reunion_fin
                        ? formatterHora.format(
                            new Date(resumen.proxima_reunion_fin),
                          )
                        : '--'}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

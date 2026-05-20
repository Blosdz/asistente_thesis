import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  CalendarCheck2,
  CheckCheck,
  CreditCard,
  Link as LinkIcon,
  Loader2,
  MessageSquareText,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import { notificacionesApi } from '../../api/notificaciones.api';

const getRows = (payload) => payload?.data || payload?.notifications || [];

const categoryConfig = [
  { id: 'all', label: 'Todas', icon: Bell, match: () => true },
  {
    id: 'advisors',
    label: 'Asesorías',
    icon: Users,
    match: (item) =>
      ['solicitud_asesor', 'solicitud_cita', 'estudiante_aceptado'].includes(
        item.type,
      ),
  },
  {
    id: 'payments',
    label: 'Pagos',
    icon: CreditCard,
    match: (item) =>
      ['pago_generado', 'pago_pendiente', 'pago_aceptado'].includes(item.type),
  },
  {
    id: 'meetings',
    label: 'Reuniones',
    icon: CalendarCheck2,
    match: (item) =>
      ['reunion_creada', 'url_sesion_generada'].includes(item.type),
  },
  {
    id: 'suggestions',
    label: 'Sugerencias',
    icon: MessageSquareText,
    match: (item) =>
      ['sugerencia_tesis', 'sugerencia_resuelta_estudiante'].includes(
        item.type,
      ),
  },
];

const typeMeta = {
  solicitud_asesor: { label: 'Conexión', tone: 'bg-emerald-100 text-emerald-700' },
  solicitud_cita: { label: 'Asesoría', tone: 'bg-emerald-100 text-emerald-700' },
  estudiante_aceptado: { label: 'Aceptado', tone: 'bg-blue-100 text-blue-700' },
  pago_generado: { label: 'Pago', tone: 'bg-amber-100 text-amber-700' },
  pago_pendiente: { label: 'Pago', tone: 'bg-amber-100 text-amber-700' },
  pago_aceptado: { label: 'Validado', tone: 'bg-emerald-100 text-emerald-700' },
  reunion_creada: { label: 'Reunión', tone: 'bg-sky-100 text-sky-700' },
  url_sesion_generada: { label: 'Sesión', tone: 'bg-violet-100 text-violet-700' },
  sugerencia_tesis: { label: 'Tesis', tone: 'bg-fuchsia-100 text-fuchsia-700' },
  sugerencia_resuelta_estudiante: {
    label: 'Resuelta',
    tone: 'bg-fuchsia-100 text-fuchsia-700',
  },
};

const formatTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDay = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Hoy';
  if (date.toDateString() === yesterday.toDateString()) return 'Ayer';

  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
  });
};

const isExternalPath = (path) => /^https?:\/\//i.test(path || '');

export default function NotificationCenter() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isAdvisor = location.pathname.startsWith('/advisor');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [markingAll, setMarkingAll] = useState(false);

  const homePath = isAdmin
    ? '/admin/dashboard'
    : isAdvisor
      ? '/advisor/students'
      : '/student/dashboard';
  const backLabel = isAdmin
    ? 'Volver al panel'
    : isAdvisor
      ? 'Volver al panel'
      : 'Volver al dashboard';

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const payload = await notificacionesApi.listar();
      setItems(getRows(payload));
    } catch (error) {
      console.error('Error loading notifications:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = useMemo(
    () => items.filter((item) => !item.read).length,
    [items],
  );

  const filteredItems = useMemo(() => {
    const active =
      categoryConfig.find((category) => category.id === activeCategory) ||
      categoryConfig[0];
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesCategory = active.match(item);
      const searchable = `${item.title || ''} ${item.description || ''}`.toLowerCase();
      const matchesQuery =
        !normalizedQuery || searchable.includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, items, query]);

  const recentItems = useMemo(() => items.slice(0, 6), [items]);

  const markRead = async (item) => {
    if (!item.read) {
      setItems((current) =>
        current.map((notification) =>
          notification.id === item.id
            ? { ...notification, read: true }
            : notification,
        ),
      );

      try {
        await notificacionesApi.marcarLeida(item.id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
        loadNotifications();
      }
    }
  };

  const openNotification = async (item) => {
    await markRead(item);

    if (!item.path) return;

    if (isExternalPath(item.path)) {
      window.open(item.path, '_blank', 'noreferrer');
      return;
    }

    navigate(item.path);
  };

  const markAllRead = async () => {
    if (!unreadCount || markingAll) return;

    try {
      setMarkingAll(true);
      await notificacionesApi.marcarTodasLeidas();
      setItems((current) =>
        current.map((notification) => ({ ...notification, read: true })),
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      loadNotifications();
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-6rem)] text-slate-950">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-0 pb-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              Centro de notificaciones
            </h1>
            <button
              type="button"
              onClick={() => navigate(homePath)}
              className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </button>
          </div>

          <div className="flex h-11 w-full items-center gap-2 rounded-xl border border-white/80 bg-white/72 px-3 shadow-[0_16px_36px_-30px_rgba(15,23,42,0.45)] lg:max-w-xl">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar..."
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
        </header>

        <div className="grid min-h-[680px] gap-4 xl:grid-cols-[250px_minmax(0,1fr)_320px]">
          <aside className="rounded-3xl border border-white/80 bg-white/78 p-3 shadow-[0_24px_60px_-46px_rgba(15,23,42,0.42)]">
            <div className="flex h-10 items-center gap-2 rounded-2xl bg-slate-50 px-3">
              <Search className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-400">Buscar...</span>
            </div>

            <div className="mt-4 space-y-1">
              {categoryConfig.map((category) => {
                const Icon = category.icon;
                const count = items.filter((item) => category.match(item)).length;
                const isActive = activeCategory === category.id;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex h-12 w-full items-center justify-between rounded-2xl px-3 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 shadow-[inset_3px_0_0_#10b981]'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                    }`}
                  >
                    <span className="inline-flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {category.label}
                    </span>
                    <span className="text-xs text-slate-400">{count}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="overflow-hidden rounded-3xl border border-white/80 bg-white/84 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.45)]">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-950">
                    {categoryConfig.find((item) => item.id === activeCategory)?.label ||
                      'Todas'}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {filteredItems.length} notificaciones
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={markAllRead}
                disabled={!unreadCount || markingAll}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {markingAll ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCheck className="h-4 w-4" />
                )}
                Marcar leídas
              </button>
            </div>

            <div className="max-h-[calc(100dvh-16rem)] overflow-y-auto px-6 py-6">
              {loading ? (
                <div className="flex h-64 items-center justify-center gap-2 text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Cargando notificaciones...
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <Bell className="h-6 w-6" />
                  </div>
                  <p className="mt-4 font-semibold text-slate-900">
                    No hay notificaciones
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Cuando ocurra algo importante, aparecerá aquí.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {filteredItems.map((item) => {
                    const meta = typeMeta[item.type] || {
                      label: 'Info',
                      tone: 'bg-slate-100 text-slate-600',
                    };

                    return (
                      <div key={item.id} className="grid grid-cols-[72px_1fr] gap-4">
                        <div className="relative text-right text-xs font-medium text-slate-400">
                          <span>{formatTime(item.created_at || item.createdAt)}</span>
                          <span className="absolute right-[-1.55rem] top-1 h-full w-px bg-slate-200" />
                          <span
                            className={`absolute right-[-1.9rem] top-0 flex h-6 w-6 items-center justify-center rounded-full border border-white ${
                              item.read ? 'bg-slate-100' : 'bg-emerald-100'
                            }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${
                                item.read ? 'bg-slate-300' : 'bg-emerald-600'
                              }`}
                            />
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => openNotification(item)}
                          className="group rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-[0_14px_34px_-28px_rgba(15,23,42,0.5)] transition hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-[0_20px_42px_-30px_rgba(15,23,42,0.45)]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-bold text-slate-950">
                                {item.title}
                              </p>
                              <p className="mt-1 text-sm leading-6 text-slate-600">
                                {item.description}
                              </p>
                            </div>
                            <span
                              className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-bold ${meta.tone}`}
                            >
                              {meta.label}
                            </span>
                          </div>
                          {item.path ? (
                            <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 group-hover:text-emerald-700">
                              <LinkIcon className="h-3.5 w-3.5" />
                              Abrir destino
                            </div>
                          ) : null}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </main>

          <aside className="rounded-3xl border border-white/80 bg-white/78 p-4 shadow-[0_24px_60px_-46px_rgba(15,23,42,0.42)]">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-black text-slate-950">
                Recientes
              </h3>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">
                {items.length}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {recentItems.map((item) => {
                const meta = typeMeta[item.type] || {
                  label: 'Info',
                  tone: 'bg-slate-100 text-slate-600',
                };

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openNotification(item)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left transition hover:bg-slate-50"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                          item.read ? 'bg-slate-300' : 'bg-emerald-600'
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-bold text-slate-900">
                          {item.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                          {item.description}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${meta.tone}`}
                          >
                            {meta.label}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400">
                            {formatDay(item.created_at || item.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}

              {!loading && recentItems.length === 0 ? (
                <p className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  Sin actividad reciente.
                </p>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

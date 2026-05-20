import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Loader2, Rows3 } from 'lucide-react';
import { notificacionesApi } from '../../api/notificaciones.api';

const getRows = (payload) => payload?.data || payload?.notifications || [];

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function NotificationsBell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const shellRef = useRef(null);

  const unreadCount = useMemo(
    () => items.filter((item) => !item.read).length,
    [items],
  );

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
    const interval = window.setInterval(loadNotifications, 30000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!shellRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const handleOpen = () => {
    setOpen((current) => !current);
    if (!open) loadNotifications();
  };

  const handleViewAll = () => {
    setOpen(false);
    const basePath = location.pathname.startsWith('/admin')
      ? '/admin'
      : location.pathname.startsWith('/advisor')
        ? '/advisor'
        : '/student';
    navigate(`${basePath}/notifications`);
  };

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

  const handleNotificationClick = async (item) => {
    await markRead(item);
    setOpen(false);

    if (!item.path) return;

    if (/^https?:\/\//i.test(item.path)) {
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
    <div ref={shellRef} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        className="app-icon-button relative flex h-10 w-10 items-center justify-center rounded-full text-slate-900 transition-shadow hover:shadow-md"
        aria-label="Notificaciones"
        aria-expanded={open}
      >
        <Bell size={18} />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="app-menu absolute right-0 top-12 z-30 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl p-0 text-sm">
          <div className="flex items-center justify-between gap-3 border-b border-white/60 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-slate-950">Notificaciones</p>
              <p className="text-xs text-slate-500">
                {unreadCount ? `${unreadCount} sin leer` : 'Todo al día'}
              </p>
            </div>

            <button
              type="button"
              onClick={markAllRead}
              disabled={!unreadCount || markingAll}
              className="inline-flex h-8 items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold text-slate-700 transition hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {markingAll ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCheck className="h-3.5 w-3.5" />
              )}
              Leer
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto p-2">
            {loading && items.length === 0 ? (
              <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando...
              </div>
            ) : items.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">
                No tienes notificaciones.
              </div>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNotificationClick(item)}
                  className={`w-full rounded-xl px-3 py-3 text-left transition ${
                    item.read ? 'hover:bg-white/60' : 'bg-blue-50/80 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        item.read ? 'bg-slate-300' : 'bg-blue-600'
                      }`}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-900">
                        {item.title}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-600">
                        {item.description}
                      </span>
                      <span className="mt-1 block text-[11px] font-medium text-slate-400">
                        {formatDate(item.created_at || item.createdAt)}
                      </span>
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="border-t border-white/60 p-2">
            <button
              type="button"
              onClick={handleViewAll}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-slate-800 transition hover:bg-white/70"
            >
              <Rows3 className="h-4 w-4" />
              Ver todas las notificaciones
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

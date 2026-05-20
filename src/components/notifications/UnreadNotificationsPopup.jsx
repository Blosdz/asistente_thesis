import { useEffect, useMemo, useState } from 'react';
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

const isExternalPath = (path) => /^https?:\/\//i.test(path || '');

export default function UnreadNotificationsPopup() {
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [visible, setVisible] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [openingId, setOpeningId] = useState(null);

  const unreadItems = useMemo(
    () => items.filter((item) => !item.read),
    [items],
  );

  useEffect(() => {
    let cancelled = false;

    const loadUnread = async () => {
      try {
        const payload = await notificacionesApi.listar();
        if (cancelled) return;

        const rows = getRows(payload);
        setItems(rows.filter((item) => !item.read));
      } catch (error) {
        if (!cancelled) {
          console.error('Error loading unread notification badges:', error);
        }
      }
    };

    loadUnread();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (unreadItems.length === 0) {
      setVisible(false);
      return undefined;
    }

    setVisible(true);
    const timeout = window.setTimeout(() => {
      setVisible(false);
    }, 4000);

    return () => window.clearTimeout(timeout);
  }, [unreadItems.length]);

  const currentBase = location.pathname.startsWith('/admin')
    ? '/admin'
    : location.pathname.startsWith('/advisor')
      ? '/advisor'
      : '/student';

  const markReadLocal = (notificationId) => {
    setItems((current) =>
      current.map((item) =>
        item.id === notificationId ? { ...item, read: true } : item,
      ),
    );
  };

  const openNotification = async (item) => {
    try {
      setOpeningId(item.id);
      markReadLocal(item.id);
      await notificacionesApi.marcarLeida(item.id);

      if (!item.path) return;

      if (isExternalPath(item.path)) {
        window.open(item.path, '_blank', 'noreferrer');
        return;
      }

      navigate(item.path);
    } catch (error) {
      console.error('Error opening notification badge:', error);
    } finally {
      setOpeningId(null);
    }
  };

  const markAllRead = async () => {
    if (markingAll || unreadItems.length === 0) return;

    try {
      setMarkingAll(true);
      await notificacionesApi.marcarTodasLeidas();
      setItems((current) => current.map((item) => ({ ...item, read: true })));
    } catch (error) {
      console.error('Error marking notification badges as read:', error);
    } finally {
      setMarkingAll(false);
    }
  };

  if (unreadItems.length === 0 || !visible) {
    return null;
  }

  return (
    <aside
      className="fixed right-4 top-24 z-40 w-[min(22rem,calc(100vw-2rem))] rounded-[24px] border border-blue-100 bg-white/92 p-3 text-slate-950 shadow-[0_28px_80px_-48px_rgba(15,23,42,0.55)] backdrop-blur-xl"
      aria-label="Notificaciones sin leer"
    >
      <div className="flex items-center justify-between gap-3 px-1 pb-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
            <Bell className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-950">Sin leer</p>
            <p className="text-xs font-semibold text-blue-700">
              {unreadItems.length} notificación(es)
            </p>
          </div>
        </div>

        <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-blue-600 px-2 text-xs font-black text-white">
          {unreadItems.length > 99 ? '99+' : unreadItems.length}
        </span>
      </div>

      <div className="max-h-[calc(100dvh-13rem)] space-y-2 overflow-y-auto pr-1">
        {unreadItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => openNotification(item)}
            disabled={openingId === item.id}
            className="group w-full rounded-2xl border border-blue-100 bg-blue-50/85 px-3 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50 disabled:cursor-wait disabled:opacity-70"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-blue-700 shadow-sm transition group-hover:text-blue-800">
                {openingId === item.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Bell className="h-4 w-4" />
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-slate-950">
                  {item.title}
                </span>
                <span className="mt-1 line-clamp-2 block text-xs leading-5 text-slate-600">
                  {item.description}
                </span>
                <span className="mt-1 block text-[11px] font-semibold text-slate-400">
                  {formatDate(item.created_at || item.createdAt)}
                </span>
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-blue-100 pt-3">
        <button
          type="button"
          onClick={() => navigate(`${currentBase}/notifications`)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
        >
          <Rows3 className="h-3.5 w-3.5" />
          Ver todas
        </button>
        <button
          type="button"
          onClick={markAllRead}
          disabled={markingAll}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 text-xs font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {markingAll ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <CheckCheck className="h-3.5 w-3.5" />
          )}
          Leídas
        </button>
      </div>
    </aside>
  );
}

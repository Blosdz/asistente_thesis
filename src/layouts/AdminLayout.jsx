import { Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Settings,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getCurrentUser, logout } from '../services/authService';
import AnimatedTopNav from '../components/navigation/AnimatedTopNav';
import NotificationsBell from '../components/notifications/NotificationsBell';
import UnreadNotificationsPopup from '../components/notifications/UnreadNotificationsPopup';

const navItems = [
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: 'Usuarios',
    path: '/admin/users',
    icon: <Users size={18} />,
  },
  {
    label: 'Pagos',
    path: '/admin/payments',
    icon: <CreditCard size={18} />,
  },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to fetch admin user:', error);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="app-shell min-h-screen">
        <header className="app-topbar fixed top-0 z-50 h-20 w-full rounded-none">
          <div className="flex h-20 w-full items-center justify-between px-8 animate-pulse">
            <div className="h-6 w-40 rounded-full bg-slate-200" />
            <div className="h-10 w-72 rounded-full bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-200" />
              <div className="h-8 w-8 rounded-full bg-slate-200" />
              <div className="h-10 w-10 rounded-full bg-slate-200" />
            </div>
          </div>
        </header>
        <main className="space-y-6 px-8 pt-24 animate-pulse">
          <div className="h-10 w-56 rounded bg-slate-200" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="h-48 rounded-2xl bg-slate-200" />
            <div className="h-48 rounded-2xl bg-slate-200" />
            <div className="h-48 rounded-2xl bg-slate-200" />
          </div>
          <div className="h-64 rounded-2xl bg-slate-200" />
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell font-sans text-gray-900">
      <UnreadNotificationsPopup />
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="app-topbar fixed top-0 z-50 w-full rounded-none">
          <div className="flex h-20 w-full items-center justify-between px-8">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-slate-900">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                <p className="truncate text-lg font-bold tracking-tight">
                  {user?.email || 'Admin'}
                </p>
              </div>
              <p className="text-sm font-medium text-slate-500">
                Panel de administración
              </p>
            </div>

            <AnimatedTopNav
              ariaLabel="Navegación de administración"
              className="hidden rounded-full px-2 py-1 md:flex"
              items={navItems}
              linkClassName="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f1eb]"
              navClassName="gap-2"
            />

            <div className="relative flex items-center gap-4" ref={menuRef}>
              <NotificationsBell />
              <button
                className="app-icon-button rounded-full p-2 text-slate-800"
                aria-label="Settings"
                type="button"
              >
                <Settings size={18} />
              </button>
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="app-icon-button flex h-10 w-10 items-center justify-center rounded-full text-slate-900 transition-shadow hover:shadow-md"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <UserIcon size={18} />
              </button>

              {menuOpen && (
                <div className="app-menu absolute right-0 top-12 z-20 w-56 rounded-2xl p-3 text-sm">
                  <div className="rounded-2xl border border-white/70 bg-white/68 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.86)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Sesión activa
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {user?.email || 'Administrador'}
                    </p>
                  </div>

                  <div className="mt-3 border-t border-white/60 pt-2">
                    <button
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-red-600 hover:bg-white/70"
                      onClick={() => {
                        setMenuOpen(false);
                        handleLogout();
                      }}
                      type="button"
                    >
                      <LogOut size={16} />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="w-full flex-1 px-4 pt-24 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

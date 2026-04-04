import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Bell,
  Settings,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getCurrentUser, logout } from '../services/authService';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

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
      <div className="min-h-screen bg-white">
        <header className="fixed top-0 z-50 h-20 w-full rounded-none border-b border-white/60 bg-white/85 shadow-[0_0_30px_rgba(0,0,0,0.06)] backdrop-blur-[22px]">
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
    <div className="relative min-h-screen overflow-hidden font-sans text-gray-900">
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="fixed top-0 z-50 w-full rounded-none border-b border-white/60 bg-white/85 shadow-[0_0_30px_rgba(0,0,0,0.06)] backdrop-blur-[22px]">
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

            <div className="hidden rounded-full border border-white/70 bg-[#f4f1eb] px-2 py-1 shadow-[0_8px_24px_rgba(0,0,0,0.08)] md:flex">
              <nav className="relative flex gap-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'top-nav-link inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f1eb]',
                        isActive
                          ? 'bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.24)]'
                          : 'text-black hover:bg-white/70 hover:text-black',
                      )
                    }
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="relative flex items-center gap-4" ref={menuRef}>
              <button
                className="rounded-full p-2 text-slate-800 hover:bg-white/10"
                aria-label="Notifications"
                type="button"
              >
                <Bell size={18} />
              </button>
              <button
                className="rounded-full p-2 text-slate-800 hover:bg-white/10"
                aria-label="Settings"
                type="button"
              >
                <Settings size={18} />
              </button>
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/30 bg-white text-slate-900 shadow-sm transition-shadow hover:shadow-md"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <UserIcon size={18} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-12 z-20 w-56 rounded-2xl border border-slate-100 bg-white p-3 text-sm shadow-xl">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Sesión activa
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {user?.email || 'Administrador'}
                    </p>
                  </div>

                  <div className="mt-3 border-t border-slate-100 pt-2">
                    <button
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-red-600 hover:bg-slate-50"
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

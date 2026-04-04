import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Users,
  CalendarDays,
  BookOpenCheck,
  ClipboardCheck,
  User as UserIcon,
  LogOut,
  Settings,
  Bell,
  KeyRound,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { getCurrentUser, logout } from '../services/authService';
import {
  generarCodigoAsesor,
  obtenerMiCodigoPublicoAsesor,
} from '../services/advisorService';
import { toast } from 'react-hot-toast';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const AdvisorLayout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [codigoPublico, setCodigoPublico] = useState(null);
  const [codigoLoading, setCodigoLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    const fetchCodigo = async () => {
      try {
        const codigo = await obtenerMiCodigoPublicoAsesor();
        setCodigoPublico(codigo);
      } catch (error) {
        console.error('Failed to fetch advisor public code:', error);
      }
    };

    fetchCodigo();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
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

  const handleGenerateCodigo = async () => {
    if (codigoLoading) return;

    if (codigoPublico?.r_codigo_publico) {
      const confirmed = window.confirm(
        'Ya tienes un código activo. Si generas otro, el anterior se desactivará. ¿Deseas continuar?',
      );

      if (!confirmed) return;
    }

    try {
      setCodigoLoading(true);
      const nuevoCodigo = await generarCodigoAsesor();
      setCodigoPublico(nuevoCodigo);
      toast.success('Código público actualizado.');
    } catch (error) {
      console.error('Error generando código público:', error);
      toast.error('No se pudo generar el código.');
    } finally {
      setCodigoLoading(false);
    }
  };

  const codigoTexto = codigoPublico?.r_codigo_publico;
  const codigoExpira = codigoPublico?.r_expira_en
    ? new Date(codigoPublico.r_expira_en).toLocaleDateString()
    : null;

  const handleCopyCodigo = async () => {
    if (!codigoTexto) return;

    try {
      await navigator.clipboard.writeText(codigoTexto);
      toast.success('Código copiado.');
    } catch (error) {
      console.error('Error copying code:', error);
      toast.error('No se pudo copiar el código.');
    }
  };

  const navItems = [
    {
      label: 'Estudiantes',
      path: '/advisor/students',
      icon: <Users size={18} />,
    },
    {
      label: 'Reservas',
      path: '/advisor/reservations',
      icon: <ClipboardCheck size={18} />,
    },
    {
      label: 'Calendario',
      path: '/advisor/calendar',
      icon: <CalendarDays size={18} />,
    },
    {
      label: 'Tesis',
      path: '/advisor/thesis',
      icon: <BookOpenCheck size={18} />,
    },
  ];

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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              <p className="truncate text-lg font-bold tracking-tight text-slate-900">
                {user?.email || 'Advisor'}
              </p>
              <p className="text-sm font-medium text-slate-500">
                Panel de asesor
              </p>
            </div>

            <div className="hidden md:flex rounded-full border border-white/70 bg-[#f4f1eb] px-2 py-1 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
              <nav className="relative flex gap-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'top-nav-link px-4 py-1.5 rounded-full text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f1eb]',
                        isActive
                          ? 'bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.24)]'
                          : 'text-black hover:bg-white/70 hover:text-black',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="relative flex items-center gap-4" ref={menuRef}>
              <button
                className="rounded-full p-2 text-slate-800 hover:bg-white/10"
                aria-label="Notifications"
              >
                <Bell size={18} />
              </button>
              <button
                className="rounded-full p-2 text-slate-800 hover:bg-white/10"
                aria-label="Settings"
              >
                <Settings size={18} />
              </button>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/30 bg-white text-slate-900 shadow-sm transition-shadow hover:shadow-md"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <UserIcon size={18} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-12 z-20 w-72 rounded-2xl border border-slate-100 bg-white p-3 text-sm shadow-xl">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Código público
                        </p>
                        <p className="mt-1 text-base font-bold text-slate-900">
                          {codigoTexto || 'Sin código'}
                        </p>
                        {codigoExpira && (
                          <p className="mt-1 text-xs text-slate-500">
                            Expira: {codigoExpira}
                          </p>
                        )}
                      </div>
                      <KeyRound className="mt-0.5 h-4 w-4 text-blue-600" />
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={handleCopyCodigo}
                        disabled={!codigoTexto}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Copy size={14} />
                        Copiar
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerateCodigo}
                        disabled={codigoLoading}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <RefreshCw size={14} className={codigoLoading ? 'animate-spin' : ''} />
                        {codigoTexto ? 'Regenerar' : 'Generar'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-slate-100 pt-2">
                    <button
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-slate-50"
                      onClick={() => {
                        navigate('/advisor/profile');
                        setMenuOpen(false);
                      }}
                    >
                      <UserIcon size={16} />
                      Perfil
                    </button>
                    <button
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-red-600 hover:bg-slate-50"
                      onClick={() => {
                        setMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      <LogOut size={16} />
                      Salir
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

export default AdvisorLayout;

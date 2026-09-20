import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  BookOpen,
  BookOpenCheck,
  User as UserIcon,
  LogOut,
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
import AnimatedTopNav from '../components/navigation/AnimatedTopNav';
import NotificationsBell from '../components/notifications/NotificationsBell';
import UnreadNotificationsPopup from '../components/notifications/UnreadNotificationsPopup';
import { avatarGradientFrom, initialsFrom } from '../lib/avatarGradient';
import AcademicFrame, { AcademicBrand } from './AcademicFrame';

function getCodigoPublicoTexto(codigoPublico) {
  return codigoPublico?.codigo_publico || codigoPublico?.r_codigo_publico || '';
}

function getCodigoPublicoExpira(codigoPublico) {
  return codigoPublico?.expira_en || codigoPublico?.r_expira_en || null;
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

    if (getCodigoPublicoTexto(codigoPublico)) {
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

  const codigoTexto = getCodigoPublicoTexto(codigoPublico);
  const codigoExpira = getCodigoPublicoExpira(codigoPublico)
    ? new Date(getCodigoPublicoExpira(codigoPublico)).toLocaleDateString()
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
      label: 'Panel',
      path: '/advisor/dashboard',
      icon: <LayoutDashboard size={18} />,
    },
    {
      label: 'Estudiantes',
      path: '/advisor/students',
      icon: <Users size={18} />,
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
    {
      label: 'Cursos',
      path: '/advisor/cursos',
      icon: <BookOpen size={18} />,
    },
  ];

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
    <div className="app-shell student-shell academic-shell font-sans text-gray-900">
      <UnreadNotificationsPopup />
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="app-topbar fixed top-0 z-50 w-full rounded-none">
          <div className="academic-header-inner">
            <AcademicBrand role="advisor" />

            <AnimatedTopNav
              ariaLabel="Navegación de asesor"
              className="min-w-0 px-2 py-1"
              items={navItems}
              linkClassName="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f1eb]"
              navClassName="gap-2"
            />

            <div className="relative flex items-center gap-4" ref={menuRef}>
              <NotificationsBell />
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr ${avatarGradientFrom(user?.user_metadata?.nombre || user?.email)} text-sm font-bold text-white shadow ring-2 ring-white transition-shadow hover:shadow-md`}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Menú de profesor"
              >
                {initialsFrom(user?.user_metadata?.nombre || user?.email)}
              </button>

              {menuOpen && (
                <div className="app-menu absolute right-0 top-12 z-20 w-72 rounded-2xl p-3 text-sm">
                  <div className="px-1 pb-2">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {user?.email || 'Asesor'}
                    </p>
                    <p className="text-xs font-medium text-slate-500">
                      Panel de asesor académico
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/70 bg-white/68 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.86)]">
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
                        className="ios-secondary-button inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Copy size={14} />
                        Copiar
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerateCodigo}
                        disabled={codigoLoading}
                        className="ios-accent-button inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <RefreshCw size={14} className={codigoLoading ? 'animate-spin' : ''} />
                        {codigoTexto ? 'Regenerar' : 'Generar'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-white/60 pt-2">
                    <button
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-white/70"
                      onClick={() => {
                        navigate('/advisor/profile');
                        setMenuOpen(false);
                      }}
                    >
                      <UserIcon size={16} />
                      Perfil
                    </button>
                    <button
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-red-600 hover:bg-white/70"
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

        <AcademicFrame role="advisor" />
      </div>
    </div>
  );
};

export default AdvisorLayout;

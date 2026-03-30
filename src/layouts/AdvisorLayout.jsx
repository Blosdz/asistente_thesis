import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Users,
  CalendarDays,
  BookOpenCheck,
  User as UserIcon,
  LogOut,
  Settings,
  Phone,
  KeyRound,
  Copy,
} from 'lucide-react';
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        navigate('/login');
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
    } catch (error) {
      console.error('Error generando código público:', error);
      alert('No se pudo generar el código. Intenta nuevamente.');
    } finally {
      setCodigoLoading(false);
    }
  };

  const handleCopyCodigo = async () => {
    if (!codigoTexto) return;

    try {
      await navigator.clipboard.writeText(codigoTexto);
      toast.success('Copiado con éxito', {
        className: 'animate-in slide-in-from-bottom-4 duration-300',
      });
    } catch (error) {
      console.error('Error copying code:', error);
      alert('No se pudo copiar el código.');
    }
  };

  const codigoTexto = codigoPublico?.r_codigo_publico;
  const codigoExpira = codigoPublico?.r_expira_en
    ? new Date(codigoPublico.r_expira_en).toLocaleDateString()
    : null;

  const navItems = [
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
  ];

  return (
    <div className="relative min-h-screen font-sans text-gray-900 overflow-hidden bg-ios-bg">
      {/* Animated Blur Background (Replicated Lights) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full opacity-50 mix-blend-multiply filter blur-[100px]"
          style={{
            background:
              'radial-gradient(circle, rgba(144, 238, 144, 0.8) 0%, transparent 70%)',
            animation: 'pastel-move-1 30s infinite alternate ease-in-out',
          }}
        ></div>
        <div
          className="absolute top-[40%] right-[-10%] w-[60vw] h-[60vw] rounded-full opacity-50 mix-blend-multiply filter blur-[100px]"
          style={{
            background:
              'radial-gradient(circle, rgba(176, 196, 222, 0.8) 0%, transparent 70%)',
            animation:
              'pastel-move-2 25s infinite alternate-reverse ease-in-out',
          }}
        ></div>
        <div
          className="absolute bottom-[-20%] left-[10%] w-[55vw] h-[55vw] rounded-full opacity-50 mix-blend-multiply filter blur-[100px]"
          style={{
            background:
              'radial-gradient(circle, rgba(230, 230, 250, 0.7) 0%, transparent 70%)',
            animation: 'pastel-move-1 35s infinite alternate ease-in-out',
          }}
        ></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-50 glass-card border-b border-gray-200/50 px-8 py-4 rounded-none">
          <div className="max-w-[1400px] mx-auto flex flex-col gap-4">
            <div className="flex items-center justify-between">
              {/* Profile Info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-800 flex items-center justify-center text-white font-bold text-xl uppercase shadow-md">
                  {user?.email?.[0] || 'A'}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">
                    {user?.email || 'Advisor'}
                  </h1>
                  <p className="text-sm text-ios-blue font-medium">Panel de Asesor</p>
                  <div className="mt-2 hidden md:flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <KeyRound size={14} className="text-ios-blue" />
                    <span>
                      {codigoTexto ? `Código: ${codigoTexto}` : 'Sin código'}
                    </span>
                      {codigoTexto && (
                        <button
                          onClick={handleCopyCodigo}
                          className="ml-1 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-bold hover:bg-slate-200 transition-colors"
                          title="Copiar código"
                        >
                          <Copy size={12} />
                          Copiar
                        </button>
                      )}
                    <button
                      onClick={handleGenerateCodigo}
                      className="ml-2 px-2.5 py-1 rounded-md bg-ios-blue text-white text-[11px] font-bold hover:bg-blue-600 transition-colors"
                    >
                      {codigoTexto ? 'Regenerar' : 'Generar'}
                    </button>
                    {codigoExpira && (
                      <span className="ml-2 text-[11px] text-slate-400">
                        Expira: {codigoExpira}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Main Navigation - Liquid Glass */}
              <nav className="hidden lg:flex items-center liquid-glass-dark liquid-nav-container gap-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'liquid-nav-item',
                        isActive ? 'active' : 'text-gray-300 hover:text-white',
                      )
                    }
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button className="hidden sm:flex px-4 py-2 bg-white/80 border border-gray-200 text-gray-900 rounded-lg text-sm font-bold items-center gap-2 hover:bg-white transition-colors">
                  <Phone size={16} className="text-green-500" />
                  Soporte
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500/10 text-red-600 border border-red-200 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all"
                >
                  <LogOut size={16} />
                  Salir
                </button>
              </div>
            </div>
            
            {/* Mobile Nav */}
            <nav className="flex lg:hidden overflow-x-auto hide-scrollbar gap-2 pb-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors',
                      isActive
                        ? 'bg-ios-blue text-white shadow-md'
                        : 'bg-white/50 text-gray-600 hover:bg-white',
                    )
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-[1400px] mx-auto w-full p-4 sm:p-8 flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdvisorLayout;

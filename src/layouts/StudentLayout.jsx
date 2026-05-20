import { Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  BookOpenCheck,
  CalendarCheck2,
  CreditCard,
  FileText,
  Home,
  LogOut,
  Settings,
  User as UserIcon,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { getCurrentUser, logout } from '../services/authService';
import AnimatedTopNav from '../components/navigation/AnimatedTopNav';
import NotificationsBell from '../components/notifications/NotificationsBell';
import UnreadNotificationsPopup from '../components/notifications/UnreadNotificationsPopup';

const StudentLayout = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        await getCurrentUser();
      } catch (error) {
        console.error('Failed to fetch user:', error);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    {
      label: 'Dashboard',
      path: '/student/dashboard',
      icon: <Home size={16} />,
    },
    {
      label: 'Mi Tesis',
      path: '/student/my-thesis',
      icon: <BookOpenCheck size={16} />,
    },
    {
      label: 'Documentos',
      path: '/student/documents',
      icon: <FileText size={16} />,
    },
    {
      label: 'Asesorías',
      path: '/student/asesorias',
      icon: <CalendarCheck2 size={16} />,
    },
    {
      label: 'Cursos',
      path: '/student/cursos',
      icon: <BookOpen size={16} />,
    },
    {
      label: 'Presustentación',
      path: '/student/services',
      icon: <Settings size={16} />,
    },
    {
      label: 'Pagos',
      path: '/student/payments',
      icon: <CreditCard size={16} />,
    },
    {
      label: 'Estadística',
      path: '/student/statistics',
      icon: <BarChart3 size={16} />,
    },
  ];

  if (isLoading) {
    return (
      <div className="app-shell student-shell min-h-screen">
        <header className="app-topbar fixed top-0 z-50 w-full rounded-none">
          <div className="flex items-center justify-between px-8 h-20 w-full animate-pulse">
            <div className="h-6 w-32 bg-slate-200 rounded-full" />
            <div className="h-10 w-80 bg-slate-200 rounded-full" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200" />
              <div className="w-8 h-8 rounded-full bg-slate-200" />
              <div className="w-10 h-10 rounded-full bg-slate-200" />
            </div>
          </div>
        </header>
        <main className="relative z-10 pt-24 px-8 space-y-6 animate-pulse">
          <div className="h-10 w-56 bg-slate-200 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-48 bg-slate-200 rounded-2xl" />
            <div className="h-48 bg-slate-200 rounded-2xl" />
          </div>
          <div className="h-64 bg-slate-200 rounded-2xl" />
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell student-shell font-sans text-gray-900">
      <UnreadNotificationsPopup />
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="app-topbar fixed top-0 z-50 w-full rounded-none">
          <div className="flex min-h-20 w-full items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="hidden min-w-0 flex-col sm:flex">
              <span className="text-sm font-black tracking-[-0.01em] text-slate-950 heading-ubuntu">
                AppThesis
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-700">
                Student
              </span>
            </div>

            <AnimatedTopNav
              ariaLabel="Navegación de estudiante"
              className="min-w-0 flex-1 px-1.5 py-1.5 md:max-w-fit"
              items={navItems}
              linkClassName="shrink-0 rounded-full px-3 py-2 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#eff6ff] lg:px-4 lg:text-sm"
              navClassName="student-nav-scroll gap-1"
            />

            <div className="flex items-center gap-3 relative" ref={menuRef}>
              <NotificationsBell />

              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="app-icon-button flex h-10 w-10 items-center justify-center rounded-full text-slate-900 transition-shadow hover:shadow-md"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <UserIcon size={18} />
              </button>

              {menuOpen && (
                <div className="app-menu absolute right-0 top-12 w-44 rounded-2xl py-2 text-sm">
                  <button
                    className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-white/70"
                    onClick={() => {
                      navigate('/student/profile');
                      setMenuOpen(false);
                    }}
                  >
                    <UserIcon size={16} />
                    Perfil
                  </button>
                  <button
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-red-600 hover:bg-white/70"
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut size={16} />
                    Salir
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="w-full px-4 sm:px-8 flex-1 pt-24">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;

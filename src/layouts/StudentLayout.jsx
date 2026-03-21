import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LogOut,
  User as UserIcon,
  MessageSquare,
  FileText,
  BarChart3,
  Settings,
  HelpCircle,
  Phone,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCurrentUser, logout } from '../services/authService';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const StudentLayout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    {
      label: 'Documentos',
      path: '/student/documents',
      icon: <FileText size={18} />,
    },
    {
      label: 'Mi Tesis',
      path: '/student/my-thesis',
      icon: <FileText size={18} />,
    },
    {
      label: 'Observaciones',
      path: '/student/observations',
      icon: <MessageSquare size={18} />,
    },
    {
      label: 'Servicios',
      path: '/student/services',
      icon: <Settings size={18} />,
    },
    {
      label: 'Estadística',
      path: '/student/dashboard',
      icon: <BarChart3 size={18} />,
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
              'radial-gradient(circle, rgba(173, 216, 230, 0.8) 0%, transparent 70%)',
            animation: 'pastel-move-1 30s infinite alternate ease-in-out',
          }}
        ></div>
        <div
          className="absolute top-[40%] right-[-10%] w-[60vw] h-[60vw] rounded-full opacity-50 mix-blend-multiply filter blur-[100px]"
          style={{
            background:
              'radial-gradient(circle, rgba(221, 160, 221, 0.8) 0%, transparent 70%)',
            animation:
              'pastel-move-2 25s infinite alternate-reverse ease-in-out',
          }}
        ></div>
        <div
          className="absolute bottom-[-20%] left-[10%] w-[55vw] h-[55vw] rounded-full opacity-50 mix-blend-multiply filter blur-[100px]"
          style={{
            background:
              'radial-gradient(circle, rgba(255, 182, 193, 0.7) 0%, transparent 70%)',
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
              <NavLink
                to="/student/profile"
                className="flex items-center gap-4 hover:opacity-80 transition-opacity"
              >
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-xl uppercase">
                  {user?.email?.[0] || 'S'}
                </div>
                <div>
                  <h1 className="text-xl font-bold">
                    {user?.email || 'Student'}
                  </h1>
                  <p className="text-sm text-ios-gray">Tesis de Grado</p>
                </div>
              </NavLink>

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

            {/* Status Bar */}
            <div className="flex flex-wrap items-center justify-between text-xs text-ios-gray border-t border-gray-100/50 pt-3">
              <div className="flex gap-6">
                <span>
                  Estado: <strong className="text-gray-900">Borrador</strong>
                </span>
                <span>
                  Checklist:{' '}
                  <strong className="text-gray-900">
                    1 pend · 0 prog · 1 list
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span>Avance</span>
                <div className="w-48 h-2 bg-gray-200/50 rounded-full overflow-hidden border border-gray-300/20">
                  <div
                    className="bg-ios-blue h-full shadow-[0_0_8px_rgba(0,122,255,0.4)]"
                    style={{ width: '45%' }}
                  ></div>
                </div>
                <span className="font-bold text-gray-900">45%</span>
                <button className="bg-ios-blue text-white px-5 py-1 rounded-full font-bold shadow-lg shadow-ios-blue/20 hover:scale-105 transition-transform active:scale-95">
                  Verificar
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-[1400px] mx-auto p-4 sm:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;

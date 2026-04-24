import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LogOut,
  User as UserIcon,
  CreditCard,
  FileText,
  BarChart3,
  Settings,
  Bell,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { getCurrentUser, logout } from '../services/authService';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const StudentLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
    },
    {
      label: 'Mi Tesis',
      path: '/student/my-thesis',
      icon: <FileText size={18} />,
    },
    {
      label: 'Documentos',
      path: '/student/documents',
      icon: <FileText size={18} />,
    },
    {
      label: 'Asesorías',
      // path: '/student/citas',
      path: '/student/asesorias',
      // icon: <Calendar size={18} />,
    },
    // {
    //   label: 'Planes',
    //   path: '/student/planes',
    //   icon: <BarChart3 size={18} />,
    // },
    {
      label: 'Presustentación',
      path: '/student/services',
      icon: <Settings size={18} />,
    },
    {
      label: 'Pagos',
      path: '/student/payments',
      icon: <CreditCard size={18} />,
    },
    {
      label: 'Estadística',
      path: '/student/statistics',
      icon: <BarChart3 size={18} />,
    },
  ];

  if (isLoading) {
    return (
      <div className="app-shell min-h-screen">
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
        <main className="pt-24 px-8 space-y-6 animate-pulse">
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
    <div className="app-shell font-sans text-gray-900">
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="app-topbar fixed top-0 z-50 w-full rounded-none">
          <div className="flex items-center justify-between px-8 h-20 w-full">
            <div className="text-2xl font-bold tracking-tighter text-slate-900 heading-ubuntu">
              {/* ThesisFlow */}
            </div>

            <div className="app-nav-cluster hidden rounded-full px-2 py-1 md:flex">
              <nav className="relative flex gap-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'top-nav-link app-nav-item px-4 py-1.5 rounded-full text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f1eb]',
                        isActive
                          ? 'app-nav-item-active'
                          : '',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4 relative" ref={menuRef}>
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
                    Profile
                  </button>
                  <button
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-red-600 hover:bg-white/70"
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut size={16} />
                    Exit
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

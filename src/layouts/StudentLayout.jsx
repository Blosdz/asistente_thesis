import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LogOut,
  User as UserIcon,
  Calendar,
  CreditCard,
  FileText,
  BarChart3,
  Settings,
  HelpCircle,
  Phone,
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
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, height: 0, opacity: 0, scale: 1 });
  const navContainerRef = useRef(null);
  const navItemRefs = useRef({});
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

  useEffect(() => {
    const activeItem = navItemRefs.current[location.pathname];
    const container = navContainerRef.current;
    if (!activeItem || !container) {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();
    const left = itemRect.left - containerRect.left;
    setIndicatorStyle((prev) => ({ ...prev, opacity: 1, scale: 0.5 }));
    requestAnimationFrame(() => {
      setIndicatorStyle({
        left,
        width: itemRect.width,
        height: itemRect.height,
        opacity: 1,
        scale: 1,
      });
    });
  }, [location.pathname]);

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
      label: 'Asesorías',
      path: '/student/citas',
      icon: <Calendar size={18} />,
    },
    {
      label: 'Planes',
      path: '/student/planes',
      icon: <BarChart3 size={18} />,
    },
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
      path: '/student/dashboard',
      icon: <BarChart3 size={18} />,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <header className="fixed top-0 w-full z-50 rounded-none bg-white/85 backdrop-blur-[22px] border-b border-white/60 shadow-[0_0_30px_rgba(0,0,0,0.06)]">
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
    <div className="relative min-h-screen font-sans text-gray-900 overflow-hidden">
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="fixed top-0 w-full z-50 rounded-none bg-white/85 backdrop-blur-[22px] border-b border-white/60 shadow-[0_0_30px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between px-8 h-20 w-full">
            <div className="text-2xl font-bold tracking-tighter text-slate-900 dark:text-white heading-ubuntu">ThesisFlow</div>

            <div className="hidden md:flex bg-[#f4f1eb] rounded-full px-2 py-1 shadow-[0_8px_24px_rgba(0,0,0,0.08)] border border-white/70">
              <nav
                ref={navContainerRef}
                className="relative flex gap-2"
              >
                {indicatorStyle.opacity > 0 && (
                  <span
                    className="nav-indicator"
                    style={{
                      width: indicatorStyle.width,
                      height: indicatorStyle.height,
                      transform: `translateX(${indicatorStyle.left}px) scale(${indicatorStyle.scale})`
                    }}
                  />
                )}
                {navItems.map((item, idx) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    ref={(el) => {
                      if (el) navItemRefs.current[item.path] = el;
                    }}
                    className={({ isActive }) =>
                      cn(
                        'top-nav-link px-4 py-1.5 rounded-full text-sm font-semibold transition-colors',
                        isActive
                          ? 'text-white'
                          : 'text-black hover:text-black',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4 relative" ref={menuRef}>
              <button className="p-2 hover:bg-white/10 rounded-full text-slate-800" aria-label="Notifications"> <Bell size={18} /> </button>
              <button className="p-2 hover:bg-white/10 rounded-full text-slate-800" aria-label="Settings">
                <Settings size={18} />
              </button>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="w-10 h-10 rounded-full border border-outline-variant/30 bg-white flex items-center justify-center text-slate-900 shadow-sm hover:shadow-md transition-shadow"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <UserIcon size={18} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-12 w-44 rounded-xl bg-white shadow-xl border border-slate-100 py-2 text-sm">
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2"
                    onClick={() => {
                      navigate('/student/profile');
                      setMenuOpen(false);
                    }}
                  >
                    <UserIcon size={16} />
                    Profile
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-red-600"
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

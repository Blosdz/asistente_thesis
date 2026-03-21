import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, Fingerprint, ScanFace } from 'lucide-react';
import { loginEstudiante } from '../../services/authService';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await loginEstudiante(email, password);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-ios-bg">
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

      {/* Login Card */}
      <div className="relative z-10 glass-card-login w-full max-w-[420px]">
        <div className="mb-8 text-center text-slate-900">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-500 text-sm">
            Sign in to continue to your dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50/80 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-slate-500 ml-1">
              Username or Email
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-ios-blue transition-colors">
                <User size={20} />
              </div>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border-none bg-slate-100/50 py-3.5 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-ios-blue/20 transition-all text-sm"
                placeholder="name@university.edu"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center ml-1 pr-1">
              <label className="text-[13px] font-medium text-slate-500">
                Password
              </label>
              <a
                href="#"
                className="text-[13px] font-medium text-ios-blue hover:opacity-80 transition-opacity"
              >
                Forgot?
              </a>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-ios-blue transition-colors">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border-none bg-slate-100/50 py-3.5 pl-11 pr-12 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-ios-blue/20 transition-all text-sm"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-ios-blue hover:bg-ios-blue/90 text-white font-semibold py-4 rounded-xl shadow-lg shadow-ios-blue/20 transition-all active:scale-[0.98] mt-4 flex items-center justify-center"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 flex flex-col gap-4 text-center">
          <div className="flex items-center gap-4 text-slate-300">
            <div className="h-px w-full bg-current"></div>
            <span className="text-xs uppercase tracking-widest font-semibold text-slate-400">
              or
            </span>
            <div className="h-px w-full bg-current"></div>
          </div>

          <div className="flex justify-center gap-6">
            <button className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100/50 text-slate-600 hover:bg-slate-200/50 transition-all">
              <ScanFace size={24} />
            </button>
            <button className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100/50 text-slate-600 hover:bg-slate-200/50 transition-all">
              <Fingerprint size={24} />
            </button>
          </div>

          <p className="text-sm text-slate-500">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-ios-blue font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <footer className="fixed bottom-6 w-full text-center text-xs text-slate-400">
        © 2024 University Student Portal. All rights reserved.
      </footer>
    </div>
  );
};

export default LoginPage;

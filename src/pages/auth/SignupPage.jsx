import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Lock,
  Mail,
  GraduationCap,
  Briefcase,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { registrarAsesor, registrarEstudiante } from '../../services/authService';
import { clsx } from 'clsx';

const SignupPage = () => {
  const [role, setRole] = useState('student'); // 'student' or 'advisor'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (role === 'student') {
        await registrarEstudiante(email, password);
      } else {
        await registrarAsesor(email, password);
      }

      // Registration successful, redirect to login
      navigate('/login', {
        state: { message: 'Check your email to confirm your account' },
      });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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

      {/* Signup Card */}
      <div className="relative z-10 liquid-glass w-full max-w-[480px] rounded-3xl p-8 sm:p-10">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
            Create Account
          </h1>
          <p className="text-slate-500 text-sm">
            Join the academic platform today
          </p>
        </div>

        {/* Role Selector */}
        <div className="mb-8 p-1.5 bg-slate-100/50 rounded-2xl flex gap-1.5 relative overflow-hidden backdrop-blur-sm border border-white/30">
          <button
            onClick={() => setRole('student')}
            className={clsx(
              'flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-500 flex items-center justify-center gap-2 z-10',
              role === 'student'
                ? 'bg-white text-ios-blue shadow-lg'
                : 'text-slate-500 hover:text-slate-700',
            )}
          >
            <GraduationCap size={18} />
            Estudiante
          </button>
          <button
            onClick={() => setRole('advisor')}
            className={clsx(
              'flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-500 flex items-center justify-center gap-2 z-10',
              role === 'advisor'
                ? 'bg-white text-ios-blue shadow-lg'
                : 'text-slate-500 hover:text-slate-700',
            )}
          >
            <Briefcase size={18} />
            Asesor
          </button>

          {/* Active indicator (animated) */}
          <div
            className={clsx(
              'absolute top-1.5 bottom-1.5 w-[calc(50%-0.5rem)] bg-white rounded-xl shadow-sm transition-all duration-500 ease-in-out z-0',
              role === 'student' ? 'left-1.5' : 'left-[50%]',
            )}
          />
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50/80 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm backdrop-blur-sm">
              {error}
            </div>
          )}

          {/* Name Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-slate-500 ml-1">
              Full Name
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-ios-blue transition-colors">
                <User size={20} />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-2xl border-none bg-white/40 py-4 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-ios-blue/20 transition-all text-sm backdrop-blur-md"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-slate-500 ml-1">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-ios-blue transition-colors">
                <Mail size={20} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-2xl border-none bg-white/40 py-4 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-ios-blue/20 transition-all text-sm backdrop-blur-md"
                placeholder="name@university.edu"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-slate-500 ml-1">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-ios-blue transition-colors">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-2xl border-none bg-white/40 py-4 pl-11 pr-12 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-ios-blue/20 transition-all text-sm backdrop-blur-md"
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
            className="w-full bg-ios-blue hover:bg-ios-blue/90 text-white font-bold py-4 rounded-2xl shadow-xl shadow-ios-blue/30 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={20} />
                Create {role === 'student' ? 'Student' : 'Advisor'} Account
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-sm text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-ios-blue font-bold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-6 w-full text-center text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
        Secure Academic Gateway • 2024
      </footer>
    </div>
  );
};

export default SignupPage;

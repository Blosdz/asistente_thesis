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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupQueued, setSignupQueued] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSignupSuccess(false);
    setSignupQueued(false);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);

    try {
      let result;
      if (role === 'student') {
        result = await registrarEstudiante(email, password, name.trim());
      } else {
        result = await registrarAsesor(email, password, name.trim());
      }

      setSignupQueued(Boolean(result?.queued));
      setSignupSuccess(true);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
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
        {signupSuccess ? (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-200/50">
              <CheckCircle2 size={36} />
            </div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">
              Cuenta creada
            </h1>
            <p className="mx-auto max-w-sm text-sm leading-6 text-slate-500">
              {signupQueued
                ? 'Tu cuenta quedó registrada en cola. El correo de validación se enviará automáticamente cuando el servicio vuelva a estar disponible.'
                : 'Tu cuenta fue creada correctamente. La validación por correo se enviará automáticamente para completar el acceso a la plataforma.'}
            </p>

            <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-4 text-left text-sm text-emerald-800">
              {signupQueued ? (
                <>
                  La invitación para <strong>{email}</strong> quedó en cola.
                  Revisaremos el envío automáticamente y podrás validar la
                  cuenta apenas se procese.
                </>
              ) : (
                <>
                  Revisa la bandeja de <strong>{email}</strong> y también spam
                  o promociones si el mensaje tarda unos minutos en aparecer.
                </>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <Link
                to="/login"
                className="w-full rounded-2xl bg-ios-blue py-4 text-center font-bold text-white shadow-xl shadow-ios-blue/30 transition-all hover:bg-ios-blue/90"
              >
                Ir al inicio de sesión
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSignupSuccess(false);
                  setName('');
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                  setError('');
                  setSignupQueued(false);
                }}
                className="w-full rounded-2xl border border-white/40 bg-white/40 py-4 text-center font-bold text-slate-700 transition-all hover:bg-white/60"
              >
                Registrar otra cuenta
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-10 text-center">
              <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">
                Crea tu acceso académico
              </h1>
              <p className="text-sm text-slate-500">
                Regístrate para comenzar tu experiencia en la plataforma
              </p>
            </div>

            <div className="relative mb-8 flex gap-1.5 overflow-hidden rounded-2xl border border-white/30 bg-slate-100/50 p-1.5 backdrop-blur-sm">
              <button
                onClick={() => setRole('student')}
                className={clsx(
                  'z-10 flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all duration-500',
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
                  'z-10 flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all duration-500',
                  role === 'advisor'
                    ? 'bg-white text-ios-blue shadow-lg'
                    : 'text-slate-500 hover:text-slate-700',
                )}
              >
                <Briefcase size={18} />
                Asesor
              </button>

              <div
                className={clsx(
                  'absolute top-1.5 bottom-1.5 z-0 w-[calc(50%-0.5rem)] rounded-xl bg-white shadow-sm transition-all duration-500 ease-in-out',
                  role === 'student' ? 'left-1.5' : 'left-[50%]',
                )}
              />
            </div>

            <form onSubmit={handleSignup} className="space-y-6">
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 backdrop-blur-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="ml-1 text-[13px] font-medium text-slate-500">
                  Nombre completo
                </label>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-ios-blue">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-2xl border-none bg-white/40 py-4 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 backdrop-blur-md transition-all focus:ring-2 focus:ring-ios-blue/20"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="ml-1 text-[13px] font-medium text-slate-500">
                  Correo electrónico
                </label>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-ios-blue">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-2xl border-none bg-white/40 py-4 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 backdrop-blur-md transition-all focus:ring-2 focus:ring-ios-blue/20"
                    placeholder="name@university.edu"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="ml-1 text-[13px] font-medium text-slate-500">
                  Contraseña
                </label>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-ios-blue">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-2xl border-none bg-white/40 py-4 pl-11 pr-12 text-sm text-slate-900 placeholder:text-slate-400 backdrop-blur-md transition-all focus:ring-2 focus:ring-ios-blue/20"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition-colors hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="ml-1 text-[13px] font-medium text-slate-500">
                  Confirmar contraseña
                </label>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-ios-blue">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full rounded-2xl border-none bg-white/40 py-4 pl-11 pr-12 text-sm text-slate-900 placeholder:text-slate-400 backdrop-blur-md transition-all focus:ring-2 focus:ring-ios-blue/20"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition-colors hover:text-slate-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-ios-blue py-4 font-bold text-white shadow-xl shadow-ios-blue/30 transition-all active:scale-[0.98] hover:bg-ios-blue/90"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    Crear cuenta de {role === 'student' ? 'estudiante' : 'asesor'}
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-sm text-slate-500">
                ¿Ya tienes una cuenta?{' '}
                <Link
                  to="/login"
                  className="font-bold text-ios-blue hover:underline"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="fixed bottom-6 w-full text-center text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
        Secure Academic Gateway • 2024
      </footer>
    </div>
  );
};

export default SignupPage;

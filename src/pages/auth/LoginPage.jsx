import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, Mail, Loader2, ShieldCheck } from 'lucide-react';
import { enviarResetPassword, loginUsuario } from '../../services/authService';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [error, setError] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { role } = await loginUsuario(email, password);

      if (role === 'asesor') {
        navigate('/advisor/students');
      } else if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student/dashboard');
      }
    } catch (loginError) {
      console.error('Error al iniciar sesión:', loginError);
      setError(
        'No pudimos acceder con esos datos. Revisa tu correo electrónico y tu contraseña.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setResetError('');
    setResetSuccess('');

    const emailToReset = resetEmail.trim() || email.trim();
    if (!emailToReset) {
      setResetError(
        'Ingresa tu correo electrónico para enviarte el enlace de recuperación.',
      );
      return;
    }

    try {
      setIsResetLoading(true);
      await enviarResetPassword(emailToReset);
      setResetEmail(emailToReset);
      setResetSuccess(
        'Te enviamos un enlace para cambiar tu contraseña. Revisa también spam o promociones.',
      );
    } catch (resetPasswordError) {
      console.error(
        'Error al enviar el correo de recuperación:',
        resetPasswordError,
      );
      setResetError(
        'No pudimos enviar el enlace de recuperación. Inténtalo nuevamente en unos minutos.',
      );
    } finally {
      setIsResetLoading(false);
    }
  };

  const toggleResetForm = () => {
    setShowResetForm((current) => !current);
    setResetError('');
    setResetSuccess('');
    setResetEmail((current) => current || email);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ios-bg p-6">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute left-[-10%] top-[-10%] h-[50vw] w-[50vw] rounded-full opacity-50 mix-blend-multiply blur-[100px]"
          style={{
            background:
              'radial-gradient(circle, rgba(173, 216, 230, 0.8) 0%, transparent 70%)',
            animation: 'none',
          }}
        />
        <div
          className="absolute right-[-10%] top-[40%] h-[60vw] w-[60vw] rounded-full opacity-50 mix-blend-multiply blur-[100px]"
          style={{
            background:
              'radial-gradient(circle, rgba(221, 160, 221, 0.8) 0%, transparent 70%)',
            animation:
              'pastel-move-2 25s infinite alternate-reverse ease-in-out',
          }}
        />
        <div
          className="absolute bottom-[-20%] left-[10%] h-[55vw] w-[55vw] rounded-full opacity-50 mix-blend-multiply blur-[100px]"
          style={{
            background:
              'radial-gradient(circle, rgba(255, 182, 193, 0.7) 0%, transparent 70%)',
            animation: 'none',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[440px] glass-card-login">
        <div className="mb-8 text-center text-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ios-blue">
            AppThesis
          </p>
          <h1 className="mb-2 mt-4 text-3xl font-bold tracking-tight">
            Accede a tu cuenta
          </h1>
          <p className="text-sm text-slate-500">
            Ingresa para revisar avances, observaciones y tu cotización
            académica.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

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
                onChange={(event) => setEmail(event.target.value)}
                className="block w-full rounded-xl border-none bg-slate-100/50 py-3.5 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:ring-2 focus:ring-ios-blue/20"
                placeholder="nombre@universidad.edu.pe"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="ml-1 flex items-center justify-between pr-1">
              <label className="text-[13px] font-medium text-slate-500">
                Contraseña
              </label>
              <button
                type="button"
                onClick={toggleResetForm}
                className="text-[13px] font-medium text-ios-blue transition-opacity hover:opacity-80"
              >
                {showResetForm
                  ? 'Ocultar recuperación'
                  : '¿Olvidaste tu contraseña?'}
              </button>
            </div>
            <div className="group relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-ios-blue">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="block w-full rounded-xl border-none bg-slate-100/50 py-3.5 pl-11 pr-12 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:ring-2 focus:ring-ios-blue/20"
                placeholder="Ingresa tu contraseña"
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

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 flex w-full items-center justify-center rounded-xl bg-ios-blue py-4 font-semibold text-white shadow-lg shadow-ios-blue/20 transition-all hover:bg-ios-blue/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-80"
          >
            {isLoading ? 'Accediendo...' : 'Acceder'}
          </button>
        </form>

        {showResetForm && (
          <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl bg-white/80 p-2 text-blue-600">
                <Mail size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold text-slate-900">
                  Recuperar contraseña
                </h2>
                <p className="mt-1 text-xs leading-6 text-slate-500">
                  Te enviaremos un enlace seguro a tu correo para que completes
                  el cambio desde la ruta <strong>/reset-password</strong>.
                </p>
              </div>
            </div>

            <form onSubmit={handleResetPassword} className="mt-4 space-y-3">
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-ios-blue">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(event) => setResetEmail(event.target.value)}
                  className="block w-full rounded-xl border border-white/70 bg-white/85 py-3.5 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:ring-2 focus:ring-ios-blue/20"
                  placeholder="nombre@universidad.edu.pe"
                  required
                />
              </div>

              {resetError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {resetError}
                </div>
              )}

              {resetSuccess && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {resetSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={isResetLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isResetLoading && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                {isResetLoading
                  ? 'Enviando enlace...'
                  : 'Enviar enlace de recuperación'}
              </button>
            </form>
          </div>
        )}
        <div className="mt-8 flex flex-col gap-4 text-center">
          <p className="text-sm text-slate-500">
            ¿Aún no tienes cuenta?{' '}
            <Link
              to="/signup"
              className="font-semibold text-ios-blue hover:underline"
            >
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>

      <footer className="fixed bottom-6 w-full text-center text-xs text-slate-400">
        © {currentYear} AppThesis. Plataforma de apoyo para organización,
        cotización y avance académico.
      </footer>
    </div>
  );
};

export default LoginPage;

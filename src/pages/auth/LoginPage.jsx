import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, Mail, Loader2 } from 'lucide-react';
import { enviarResetPassword, loginUsuario } from '../../services/authService';
import AuthLayout from './AuthLayout';

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

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { role } = await loginUsuario(email, password);

      // Si venimos de un cross-login con Colmena, retomamos ese flujo.
      let pendingSso = null;
      try {
        pendingSso = window.sessionStorage.getItem('colmena_sso_redirect');
        if (pendingSso) {
          window.sessionStorage.removeItem('colmena_sso_redirect');
        }
      } catch {
        pendingSso = null;
      }
      if (pendingSso) {
        navigate(pendingSso);
        return;
      }

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
    <AuthLayout
      eyebrow="Acceso seguro"
      title="Tu tesis avanza con"
      accent="claridad."
      description="Ingresa para revisar avances, observaciones, asesores y cotizaciones académicas desde una experiencia conectada."
    >
      <div className="w-full max-w-[430px] rounded-[28px] border border-slate-950/10 bg-white/58 p-7 shadow-[0_28px_74px_rgba(15,23,42,0.14),0_8px_32px_rgba(59,130,246,0.08),inset_0_1px_0_rgba(255,255,255,0.96)] backdrop-blur-[34px] backdrop-saturate-200 sm:p-9">
        <div className="mb-8 text-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-950">
            Bienvenido de vuelta
          </p>
          <h2 className="mb-2 mt-3 text-3xl font-semibold tracking-[-0.02em] text-slate-950">
            Accede a tu cuenta
          </h2>
          <p className="text-sm leading-6 text-slate-500">
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
            <label className="ml-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700">
              Correo electrónico
            </label>
            <div className="group relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-slate-950">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="block w-full rounded-[13px] border border-slate-950/10 bg-white/70 py-3.5 pl-11 pr-4 text-slate-950 placeholder:text-blue-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none transition-all focus:border-slate-950/40 focus:bg-white/95 focus:ring-4 focus:ring-blue-400/15"
                placeholder="nombre@universidad.edu.pe"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="ml-1 flex items-center justify-between pr-1">
              <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                Contraseña
              </label>
              <button
                type="button"
                onClick={toggleResetForm}
                className="text-[13px] font-semibold text-slate-950 transition-colors hover:text-blue-600"
              >
                {showResetForm
                  ? 'Ocultar recuperación'
                  : '¿Olvidaste tu contraseña?'}
              </button>
            </div>
            <div className="group relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-slate-950">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="block w-full rounded-[13px] border border-slate-950/10 bg-white/70 py-3.5 pl-11 pr-12 text-slate-950 placeholder:text-blue-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none transition-all focus:border-slate-950/40 focus:bg-white/95 focus:ring-4 focus:ring-blue-400/15"
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
            className="mt-4 flex w-full items-center justify-center rounded-[13px] bg-gradient-to-r from-slate-950 via-blue-700 to-blue-500 py-4 font-semibold text-white shadow-[0_16px_38px_rgba(15,23,42,0.26),0_10px_28px_rgba(59,130,246,0.2),inset_0_1px_0_rgba(255,255,255,0.18)] transition-all hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-80"
          >
            {isLoading ? 'Accediendo...' : 'Acceder'}
          </button>
        </form>

        {showResetForm && (
          <div className="mt-5 rounded-2xl border border-blue-100/80 bg-blue-50/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
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
                  className="block w-full rounded-xl border border-white/70 bg-white/85 py-3.5 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:ring-4 focus:ring-blue-400/15"
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
              className="font-semibold text-slate-950 hover:text-blue-600 hover:underline"
            >
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;

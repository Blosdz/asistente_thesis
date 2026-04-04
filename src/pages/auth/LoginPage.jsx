import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, Mail, Loader2 } from 'lucide-react';
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

  const handleLogin = async (e) => {
    e.preventDefault();
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
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setResetError('');
    setResetSuccess('');

    const emailToReset = resetEmail.trim() || email.trim();
    if (!emailToReset) {
      setResetError('Ingresa tu correo para enviarte el enlace de recuperación.');
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
      console.error('Error sending reset password email:', resetPasswordError);
      setResetError(
        resetPasswordError.message ||
          'No se pudo enviar el enlace de recuperación.',
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
          <h1 className="text-3xl font-bold tracking-tight mb-2">Bienvenido</h1>
          <p className="text-slate-500 text-sm">Ingresa a tu dashboard</p>
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
              Email
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
                Contraseña
              </label>
              <button
                type="button"
                onClick={toggleResetForm}
                className="text-[13px] font-medium text-ios-blue hover:opacity-80 transition-opacity"
              >
                {showResetForm ? 'Ocultar' : '¿Olvidaste tu contraseña?'}
              </button>
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
            {isLoading ? 'Entrando...' : 'Iniciar sesión'}
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
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-ios-blue transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(event) => setResetEmail(event.target.value)}
                  className="block w-full rounded-xl border border-white/70 bg-white/85 py-3.5 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-ios-blue/20 transition-all text-sm"
                  placeholder="name@university.edu"
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
                {isResetLoading && <Loader2 size={16} className="animate-spin" />}
                {isResetLoading
                  ? 'Enviando enlace...'
                  : 'Enviar enlace de recuperación'}
              </button>
            </form>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-4 text-center">
          <p className="text-sm text-slate-500">
            Registrate{' '}
            <Link
              to="/signup"
              className="text-ios-blue font-semibold hover:underline"
            >
              Crear Cuenta
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

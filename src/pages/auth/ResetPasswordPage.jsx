import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
} from 'lucide-react';
import {
  cambiarPassword,
  escucharCambiosAuth,
  esFlujoRecuperacionPassword,
  getCurrentSession,
  logout,
} from '../../services/authService';

const MIN_PASSWORD_LENGTH = 8;

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState(
    esFlujoRecuperacionPassword() ? 'checking' : 'invalid',
  );
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let fallbackTimerId;

    const syncSessionState = async () => {
      try {
        const session = await getCurrentSession();
        if (!isMounted) return;

        if (session) {
          setStatus('ready');
          return;
        }

        if (!esFlujoRecuperacionPassword()) {
          setStatus('invalid');
          return;
        }

        setStatus('checking');

        fallbackTimerId = window.setTimeout(async () => {
          try {
            const fallbackSession = await getCurrentSession();
            if (!isMounted) return;

            setStatus(fallbackSession ? 'ready' : 'invalid');
          } catch (sessionError) {
            if (!isMounted) return;

            console.error('Error validating recovery session:', sessionError);
            setStatus('invalid');
            setError(
              'No se pudo validar el enlace de recuperación. Solicita uno nuevo.',
            );
          }
        }, 1500);
      } catch (sessionError) {
        if (!isMounted) return;

        console.error('Error reading auth session:', sessionError);
        setStatus('invalid');
        setError(
          'No se pudo validar el enlace de recuperación. Solicita uno nuevo.',
        );
      }
    };

    const {
      data: { subscription },
    } = escucharCambiosAuth((event, session) => {
      if (!isMounted) return;

      if (
        (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') &&
        session
      ) {
        if (fallbackTimerId) {
          window.clearTimeout(fallbackTimerId);
        }

        setError('');
        setStatus('ready');
      }
    });

    syncSessionState();

    return () => {
      isMounted = false;
      if (fallbackTimerId) {
        window.clearTimeout(fallbackTimerId);
      }
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccessMessage('');

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(
        `La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
      );
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setIsSubmitting(true);
      await cambiarPassword(password);
      setSuccessMessage(
        'Tu contraseña fue actualizada. Te redirigiremos para iniciar sesión.',
      );
      setStatus('success');

      try {
        await logout();
      } catch (logoutError) {
        console.error('Error closing recovery session:', logoutError);
      }

      window.setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1800);
    } catch (submitError) {
      console.error('Error updating password:', submitError);
      setError(
        submitError.message ||
          'No se pudo actualizar la contraseña. Solicita un nuevo enlace.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-ios-bg px-6 py-10">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute left-[-10%] top-[-10%] h-[50vw] w-[50vw] rounded-full opacity-50 mix-blend-multiply blur-[100px]"
          style={{
            background:
              'radial-gradient(circle, rgba(173, 216, 230, 0.8) 0%, transparent 70%)',
            animation: 'pastel-move-1 30s infinite alternate ease-in-out',
          }}
        />
        <div
          className="absolute right-[-10%] top-[35%] h-[55vw] w-[55vw] rounded-full opacity-50 mix-blend-multiply blur-[100px]"
          style={{
            background:
              'radial-gradient(circle, rgba(221, 160, 221, 0.8) 0%, transparent 70%)',
            animation:
              'pastel-move-2 24s infinite alternate-reverse ease-in-out',
          }}
        />
        <div
          className="absolute bottom-[-18%] left-[12%] h-[48vw] w-[48vw] rounded-full opacity-50 mix-blend-multiply blur-[100px]"
          style={{
            background:
              'radial-gradient(circle, rgba(255, 182, 193, 0.75) 0%, transparent 70%)',
            animation: 'pastel-move-1 32s infinite alternate ease-in-out',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[460px] items-center">
        <div className="w-full rounded-3xl bg-white/70 p-8 shadow-[0_25px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:p-10">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al login
          </Link>

          {status === 'checking' && (
            <div className="py-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Loader2 className="h-7 w-7 animate-spin" />
              </div>
              <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
                Validando enlace
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                Estamos preparando tu sesión segura para que puedas cambiar la
                contraseña.
              </p>
            </div>
          )}

          {status === 'invalid' && (
            <div className="py-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <KeyRound className="h-7 w-7" />
              </div>
              <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
                Enlace no válido
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                El enlace de recuperación expiró o ya fue usado. Solicita uno
                nuevo desde la pantalla de inicio de sesión.
              </p>
              {error && (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-left text-sm text-red-700">
                  {error}
                </div>
              )}
              <div className="mt-8 flex flex-col gap-3">
                <Link
                  to="/login"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-ios-blue py-4 text-center font-bold text-white shadow-xl shadow-ios-blue/30 transition hover:bg-ios-blue/90"
                >
                  Ir al inicio de sesión
                </Link>
              </div>
            </div>
          )}

          {status === 'ready' && (
            <>
              <div className="mb-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <KeyRound className="h-7 w-7" />
                </div>
                <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
                  Crea tu nueva contraseña
                </h1>
                <p className="mt-3 text-sm leading-7 text-slate-500">
                  Ingresa una contraseña nueva para completar la recuperación de
                  tu acceso.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="ml-1 text-[13px] font-medium text-slate-500">
                    Nueva contraseña
                  </label>
                  <div className="group relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-ios-blue">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="block w-full rounded-2xl border-none bg-white/60 py-4 pl-11 pr-12 text-sm text-slate-900 placeholder:text-slate-400 backdrop-blur-md transition-all focus:ring-2 focus:ring-ios-blue/20"
                      placeholder="Mínimo 8 caracteres"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition-colors hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="ml-1 text-[13px] font-medium text-slate-500">
                    Confirmar contraseña
                  </label>
                  <div className="group relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-ios-blue">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      className="block w-full rounded-2xl border-none bg-white/60 py-4 pl-11 pr-12 text-sm text-slate-900 placeholder:text-slate-400 backdrop-blur-md transition-all focus:ring-2 focus:ring-ios-blue/20"
                      placeholder="Repite la contraseña"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((value) => !value)
                      }
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition-colors hover:text-slate-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ios-blue py-4 font-bold text-white shadow-xl shadow-ios-blue/30 transition hover:bg-ios-blue/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Actualizando...' : 'Guardar nueva contraseña'}
                </button>
              </form>
            </>
          )}

          {status === 'success' && (
            <div className="py-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
                Contraseña actualizada
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                {successMessage}
              </p>
              <div className="mt-8">
                <Link
                  to="/login"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-ios-blue px-6 py-4 text-center font-bold text-white shadow-xl shadow-ios-blue/30 transition hover:bg-ios-blue/90"
                >
                  Ir al inicio de sesión
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

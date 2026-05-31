import { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { clsx } from 'clsx';

import { registrarAsesor, registrarEstudiante } from '../../services/authService';
import AuthLayout from './AuthLayout';

const inputClassName =
  'block w-full rounded-[13px] border border-slate-950/10 bg-white/70 py-3.5 pl-11 pr-12 text-sm text-slate-950 placeholder:text-blue-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none transition-all focus:border-slate-950/40 focus:bg-white/95 focus:ring-4 focus:ring-blue-400/15';

const SignupPage = () => {
  const [role, setRole] = useState('student');
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
      setError(err.message || 'No pudimos crear la cuenta. Inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Nuevo acceso"
      title="Empieza tu ruta de tesis con"
      accent="más orden."
      description="Crea tu cuenta como estudiante o asesor para centralizar documentos, revisiones y pasos académicos en AppThesis."
    >
      <div className="w-full max-w-[480px] rounded-[28px] border border-slate-950/10 bg-white/58 p-7 shadow-[0_28px_74px_rgba(15,23,42,0.14),0_8px_32px_rgba(59,130,246,0.08),inset_0_1px_0_rgba(255,255,255,0.96)] backdrop-blur-[34px] backdrop-saturate-200 sm:p-9">
        {signupSuccess ? (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-200/50">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="mb-2 text-3xl font-semibold tracking-[-0.02em] text-slate-950">
              Cuenta creada
            </h2>
            <p className="mx-auto max-w-sm text-sm leading-6 text-slate-500">
              {signupQueued
                ? 'Tu cuenta quedó registrada en cola. El correo de validación se enviará automáticamente cuando el servicio vuelva a estar disponible.'
                : 'Tu cuenta fue creada correctamente. Te enviamos un correo con el enlace para verificarla y completar el acceso a la plataforma.'}
            </p>

            <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-4 text-left text-sm leading-6 text-emerald-800">
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
                className="w-full rounded-[13px] bg-gradient-to-r from-slate-950 via-blue-700 to-blue-500 py-4 text-center font-semibold text-white shadow-[0_16px_38px_rgba(15,23,42,0.26),0_10px_28px_rgba(59,130,246,0.2),inset_0_1px_0_rgba(255,255,255,0.18)] transition-all hover:-translate-y-0.5 hover:brightness-105"
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
                className="w-full rounded-[13px] border border-slate-950/10 bg-white/55 py-4 text-center font-semibold text-slate-950 transition-all hover:bg-white/80"
              >
                Registrar otra cuenta
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8 text-slate-900">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-950">
                Registro académico
              </p>
              <h2 className="mb-2 mt-3 text-3xl font-semibold tracking-[-0.02em] text-slate-950">
                Crea tu acceso académico
              </h2>
              <p className="text-sm leading-6 text-slate-500">
                Regístrate para comenzar tu experiencia en la plataforma.
              </p>
            </div>

            <div className="relative mb-7 flex gap-1.5 overflow-hidden rounded-2xl border border-slate-950/10 bg-white/45 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-xl">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={clsx(
                  'z-10 flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-300',
                  role === 'student'
                    ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/15'
                    : 'text-slate-500 hover:text-slate-700',
                )}
              >
                <GraduationCap size={18} />
                Estudiante
              </button>
              <button
                type="button"
                onClick={() => setRole('advisor')}
                className={clsx(
                  'z-10 flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-300',
                  role === 'advisor'
                    ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/15'
                    : 'text-slate-500 hover:text-slate-700',
                )}
              >
                <Briefcase size={18} />
                Asesor
              </button>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="ml-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                  Nombre completo
                </label>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-slate-950">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClassName.replace('pr-12', 'pr-4')}
                    placeholder="Nombre Apellido"
                    required
                  />
                </div>
              </div>

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
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClassName.replace('pr-12', 'pr-4')}
                    placeholder="nombre@universidad.edu.pe"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="ml-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                  Contraseña
                </label>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-slate-950">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClassName}
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

              <div className="flex flex-col gap-1.5">
                <label className="ml-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                  Confirmar contraseña
                </label>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-slate-950">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClassName}
                    placeholder="Repite tu contraseña"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition-colors hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-[13px] bg-gradient-to-r from-slate-950 via-blue-700 to-blue-500 py-4 font-semibold text-white shadow-[0_16px_38px_rgba(15,23,42,0.26),0_10px_28px_rgba(59,130,246,0.2),inset_0_1px_0_rgba(255,255,255,0.18)] transition-all hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-80"
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

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500">
                ¿Ya tienes una cuenta?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-slate-950 hover:text-blue-600 hover:underline"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
};

export default SignupPage;

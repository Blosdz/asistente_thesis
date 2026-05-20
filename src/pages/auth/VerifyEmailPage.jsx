import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import AuthLayout from './AuthLayout';
import { verificarEmail } from '../../services/authService';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verificando tu correo...');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('El enlace no contiene un token válido.');
      return;
    }

    verificarEmail(token)
      .then((response) => {
        setStatus('success');
        setMessage(response?.message || 'Correo verificado correctamente.');
      })
      .catch((error) => {
        setStatus('error');
        setMessage(error?.message || 'No se pudo verificar el correo.');
      });
  }, [searchParams]);

  const Icon =
    status === 'loading' ? Loader2 : status === 'success' ? CheckCircle2 : XCircle;

  return (
    <AuthLayout
      eyebrow="Verificación"
      title="Confirma tu cuenta"
      accent="académica."
      description="Este paso activa el correo asociado a tu cuenta de AppThesis."
    >
      <div className="w-full max-w-[460px] rounded-[28px] border border-slate-950/10 bg-white/70 p-8 text-center shadow-[0_28px_74px_rgba(15,23,42,0.14)] backdrop-blur-[34px]">
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
            status === 'success'
              ? 'bg-emerald-100 text-emerald-600'
              : status === 'error'
                ? 'bg-rose-100 text-rose-600'
                : 'bg-blue-100 text-blue-600'
          }`}
        >
          <Icon size={36} className={status === 'loading' ? 'animate-spin' : ''} />
        </div>
        <h2 className="mt-6 text-2xl font-semibold text-slate-950">
          {status === 'success'
            ? 'Correo verificado'
            : status === 'error'
              ? 'No se pudo verificar'
              : 'Verificando'}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">{message}</p>
        <Link
          to="/login"
          className="mt-8 inline-flex w-full justify-center rounded-[13px] bg-slate-950 py-4 font-semibold text-white transition-all hover:bg-slate-800"
        >
          Ir al inicio de sesión
        </Link>
      </div>
    </AuthLayout>
  );
}

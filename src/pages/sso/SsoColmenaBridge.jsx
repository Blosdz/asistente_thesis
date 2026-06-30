import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Hexagon } from 'lucide-react';
import { getStoredToken } from '../../api/client';

const DEFAULT_COLMENA_CALLBACK =
  import.meta.env.VITE_COLMENA_CALLBACK_URL || 'http://localhost:5174/auth/callback';

export const SSO_PENDING_KEY = 'colmena_sso_redirect';

/**
 * Puente de cross-login hacia Colmena.
 *
 * Colmena abre esta ruta (#/sso/colmena?redirect=<callback de Colmena>). Si el
 * usuario ya tiene sesion en AppThesis, reenviamos su JWT al callback de Colmena;
 * si no, lo mandamos a iniciar sesion y, al volver, retomamos el flujo.
 */
const SsoColmenaBridge = () => {
  const [params] = useSearchParams();
  const [message, setMessage] = useState('Conectando con Colmena…');

  useEffect(() => {
    const redirect = params.get('redirect') || DEFAULT_COLMENA_CALLBACK;
    const token = getStoredToken();

    if (!token) {
      // Guardamos la intencion para retomarla despues del login.
      try {
        window.sessionStorage.setItem(
          SSO_PENDING_KEY,
          `/sso/colmena?redirect=${encodeURIComponent(redirect)}`,
        );
      } catch {
        /* sessionStorage no disponible: continuamos igual */
      }
      setMessage('Necesitas iniciar sesión en AppThesis…');
      window.location.hash = '#/login';
      return;
    }

    const separator = redirect.includes('?') ? '&' : '?';
    const target = `${redirect}${separator}token=${encodeURIComponent(token)}`;
    setMessage('Vinculando tu cuenta con Colmena…');
    window.location.href = target;
  }, [params]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 text-slate-700">
      <div className="flex items-center gap-2 text-[#E6C200]">
        <Hexagon size={28} className="fill-[#FFD700]" />
        <Loader2 size={22} className="animate-spin" />
      </div>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};

export default SsoColmenaBridge;

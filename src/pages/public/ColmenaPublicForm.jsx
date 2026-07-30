import { useParams } from 'react-router-dom';

// Base pública del frontend de Colmena, que sirve la ruta /public/forms/:slug.
// Se resuelve desde el .env (compartido con appthesis) para no hardcodear el host.
const COLMENA_PUBLIC_FORM_BASE = (
  import.meta.env.VITE_COLMENA_PUBLIC_FORM_URL || 'http://localhost:5174'
).replace(/\/+$/, '');

/**
 * Tenant de Colmena dentro de AppThesis.
 * AppThesis es el gateway público (Cloudflare) y expone los formularios de
 * Colmena bajo /colmena/forms/:slug. Aquí embebemos el formulario público real
 * de Colmena (única fuente de verdad) en lugar de reimplementar su UI.
 */
export default function ColmenaPublicForm() {
  const { slug } = useParams();
  const src = `${COLMENA_PUBLIC_FORM_BASE}/public/forms/${slug}`;

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#ffffff' }}>
      <iframe
        title="Formulario Colmena"
        src={src}
        style={{ width: '100%', height: '100%', border: 'none' }}
        allow="clipboard-write"
      />
    </div>
  );
}

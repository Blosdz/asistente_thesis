import { navItems } from './landingData';
import { useStoryScroll } from './SmoothScrollProvider';

export default function LandingFooter() {
  const { scrollToSection } = useStoryScroll();

  return (
    <footer className="border-t border-blue-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-12">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
            AppThesis
          </p>
          <h2 className="mt-4 text-2xl font-semibold text-slate-900">
            Una experiencia premium para organizar tu tesis, activar asesoría y avanzar con más criterio.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            El footer mantiene accesos limpios para producto, resultados y conversión
            sin tocar las rutas protegidas del resto de la aplicación.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Producto
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="text-left text-sm text-slate-600 transition hover:text-blue-600"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Acceso
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <a href="#/login" className="text-sm text-slate-600 transition hover:text-blue-600">
                Ingresar
              </a>
              <a href="#/signup" className="text-sm text-slate-600 transition hover:text-blue-600">
                Crear cuenta
              </a>
              <a href="#/login" className="text-sm text-slate-600 transition hover:text-blue-600">
                Explorar asesores
              </a>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Legal
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <span className="text-sm text-slate-600">Privacidad</span>
              <span className="text-sm text-slate-600">Términos</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

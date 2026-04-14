import { ArrowRight, CheckCircle2 } from 'lucide-react';

const heroStats = [
  'Cotización según tu tesis',
  'Orden visible para tus avances',
  'Acompañamiento metodológico más claro',
];

const quoteRows = [
  ['Investigación', 'Según tema y modalidad'],
  ['Nivel académico', 'Según complejidad'],
  ['Alcance', 'Según variables y requisitos'],
  ['Resultado', 'Estimación clara'],
];

const progressRows = [
  { label: 'Tema definido', value: 'Claro', progress: '78%' },
  { label: 'Ruta de trabajo', value: 'Ordenada', progress: '88%' },
  { label: 'Seguimiento', value: 'Visible', progress: '82%' },
];

export default function Hero({ onNavigate }) {
  return (
    <section id="hero" className="relative mt-5 px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-10 -z-10 mx-auto h-[34rem] max-w-5xl rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.94),rgba(59,130,246,0.16)_34%,rgba(2,132,199,0.12)_62%,transparent_74%)] blur-3xl"
      />

      <div className="landing-fade-in mx-auto max-w-4xl text-center">
        <h1 className="mt-10 font-display text-5xl leading-[0.94] tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-[5.7rem]">
          Organización total de tu tesis
          <span className="mt-2 block bg-gradient-to-r from-slate-950 via-sky-700 to-blue-600 bg-clip-text text-transparent">
            con mayor claridad
          </span>
        </h1>

        <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
          AppThesis organiza tu tesis, estima una cotización según las
          características de tu investigación y te ayuda a avanzar con mejor
          criterio, más orden y menos ruido.
        </p>

        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => onNavigate('plans')}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-7 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-900"
          >
            Ver planes
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {heroStats.map((item) => (
            <div
              key={item}
              className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-2 text-sm text-slate-600 backdrop-blur-xl"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

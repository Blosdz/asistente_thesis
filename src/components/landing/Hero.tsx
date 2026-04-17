import {
  ArrowRight,
  CheckCircle2,
  Calendar,
  MessageSquare,
  UserRound,
  Zap,
} from 'lucide-react';

const heroStats = [
  'Cotización clara',
  'Orden en tus avances',
  'Defensa con método',
];

const floatingFeatures = [
  {
    icon: Calendar,
    title: 'Agenda asesorías',
    subtitle: 'En 48 horas',
    color: 'from-sky-100 to-blue-100',
    iconColor: 'text-sky-600',
  },
  {
    icon: MessageSquare,
    title: 'Chat inteligente',
    subtitle: 'Respuestas en 4h',
    color: 'from-emerald-100 to-teal-100',
    iconColor: 'text-emerald-600',
  },
  {
    icon: Zap,
    title: 'Análisis IA',
    subtitle: 'De tu avance',
    color: 'from-violet-100 to-purple-100',
    iconColor: 'text-violet-600',
  },
];

const howItWorks = [
  {
    number: '1',
    title: 'Cuéntanos tu tema',
    description: 'Describe tu proyecto y nivel académico',
  },
  {
    number: '2',
    title: 'Recibe retroalimentación',
    description: 'Asesorías personalizadas en 48h',
  },
  {
    number: '3',
    title: 'Avanza y defiende',
    description: 'Con claridad y confianza',
  },
];

const userFeedback = [
  {
    name: 'Tesista anónima',
    stage: 'Asesoría metodológica',
    comment:
      'Me ayudaron a ordenar mi tesis desde el inicio y por fin avancé con claridad.',
  },
  {
    name: 'Tesista anónimo',
    stage: 'Pre sustentación',
    comment:
      'Llegué a mi pre sustentación con una estructura mucho más sólida y segura.',
  },
  {
    name: 'Tesista anónima',
    stage: 'Sustentación final',
    comment:
      'Resolví mis observaciones y defendí mi trabajo con mucha más seguridad.',
  },
  {
    name: 'Tesista anónimo',
    stage: 'Asesoría y cierre',
    comment:
      'Sentí acompañamiento real en cada avance y mi cierre fue mucho más ordenado.',
  },
];

export default function Hero({ onNavigate }) {
  return (
    <>
      {/* MAIN HERO SECTION */}
      <section id="hero" className="relative mt-5 px-4 pb-20 pt-40 sm:px-6 lg:px-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-10 -z-10 mx-auto h-[34rem] max-w-6xl rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.94),rgba(59,130,246,0.16)_34%,rgba(2,132,199,0.12)_62%,transparent_74%)] blur-3xl"
        />

        <div className="mx-auto max-w-7xl">
          {/* Two Column Grid */}
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            {/* LEFT: Main Content */}
            <div className="landing-fade-in flex flex-col gap-6">
              {/* Social Proof Section */}
              <div className="flex flex-col items-start gap-4 lg:items-center lg:text-center">
                <div className="inline-flex items-center gap-3 rounded-full border border-white/70 bg-white/55 px-5 py-2.5 backdrop-blur-xl">
                  <div className="flex -space-x-2 items-center">
                    <div className="h-8 w-8 rounded-full border-2 border-white/70 bg-gradient-to-br from-sky-400 to-blue-500" />
                    <div className="h-8 w-8 rounded-full border-2 border-white/70 bg-gradient-to-br from-emerald-400 to-teal-500" />
                    <div className="h-8 w-8 rounded-full border-2 border-white/70 bg-gradient-to-br from-violet-400 to-purple-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-600">1000 usuarios confían en AppThesis</span>
                </div>
              </div>

              {/* Headline - MANTENER EXACTO */}
              <h1 className="mt-10 font-display text-5xl leading-[0.94] tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-[5.7rem]">
                Deja de aplazar
                <span className="mt-3 block bg-gradient-to-r from-slate-950 via-sky-700 to-blue-600 bg-clip-text text-transparent">
                  Haz tu tesis hoy!
                </span>
              </h1>

              <p className="mx-auto mt-8 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg lg:mx-0">
                Cotización clara, orden en tus avances y defensa con método estadístico.
              </p>

              {/* Primary CTA */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => onNavigate('plans')}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-8 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-900"
                >
                  Ver planes
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-slate-950 px-8 py-3 text-sm font-semibold text-slate-950 transition-all duration-300 hover:bg-slate-50"
                >
                  Ver cómo funciona
                </button>
              </div>

              {/* Benefit Chips */}
              <div className="mt-8 flex flex-wrap gap-3">
                {heroStats.map((item) => (
                  <div
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-2 text-sm text-slate-600 backdrop-blur-xl"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    {item}
                  </div>
                ))}
              </div>

            </div>

            {/* RIGHT: Visual Section with Dynamic Content */}
            <div className="relative hidden lg:block lg:h-[550px]">
              {/* Main Mockup Area with Video Background */}
              <div className="absolute inset-0 rounded-3xl border border-white/70 overflow-hidden backdrop-blur-xl shadow-[0_24px_48px_rgba(15,23,42,0.12)]">
                {/* Video Background */}
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 h-full w-full object-cover"
                >
                  <source src="https://www.dropbox.com/scl/fi/0z0f3udo86pex7c96bgde/tesis-video.mp4?rlkey=cze16aczianjh8gerpdmt87qa&st=r2hwqvky&raw=1" type="video/mp4" />

                </video>

                {/* Dark Overlay for better text visibility */}
                <div className="absolute inset-0 bg-black/20" />
              </div>

              {/* Floating Feature Cards */}
              {floatingFeatures.map((feature, idx) => {
                const positions = [
                  'absolute -top-8 -left-12',
                  'absolute bottom-16 -left-16',
                  'absolute -bottom-4 -right-8',
                ];
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className={`${positions[idx]} flex items-center gap-4 rounded-2xl border border-white/80 bg-white/85 px-6 py-4 shadow-[0_12px_32px_rgba(15,23,42,0.16)] backdrop-blur-md transition-all hover:shadow-lg hover:bg-white`}
                  >
                    <div className={`flex-shrink-0 flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color}`}>
                      <Icon className={`h-12 w-12 ${feature.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{feature.title}</p>
                      <p className="text-xs text-slate-500">{feature.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* AREA DE FEEDBACK DE USUARIOS*/}
      {/* INSTRUCCIONES PARA AGENTES DE IA TODO ESTE APARTADO DE COMENTARIOS DE USUARIOS TIENE QUE SER UN CARD AMPLIO DE TODO EL WIDTH DE LA PANTALLA EN AL QUE SE MUESTRA COMO MINIMO 4 COMENTARIOS POSITIVOS SOBRE LOS ASESORSES SUSTENATAICONES Y PRES SUSTENTACIONES EL ESTILO DE LA CARTA ES UN CARD CON UN ICONO DEL USUARIO MASCULINO O FEMENINO EN ANONIMATO UN lucide icon de  <UserRound />*/}
      <section className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 px-4 py-16 sm:px-6 lg:px-8">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.62),rgba(239,246,255,0.88))]"
        />

        <div className="relative mx-auto max-w-7xl border-y border-white/70 py-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Testimonios
            </p>
            <h3 className="mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">
              1000 usuarios, una experiencia más clara para avanzar tu tesis
            </h3>
          </div>

          <div className="mt-12 grid gap-10 sm:grid-cols-2 xl:grid-cols-4">
            {userFeedback.map((item, index) => (
              <article
                key={`${item.name}-${item.stage}-${index}`}
                className="flex flex-col items-center text-center"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/80 bg-white/82 text-sky-700 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-md">
                  <UserRound className="h-8 w-8" />
                </div>

                <p className="mt-5 text-sm font-semibold text-slate-950">{item.name}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  {item.stage}
                </p>
                <p className="mt-4 max-w-[17rem] text-sm leading-7 text-slate-600">
                  {item.comment}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16">
            <h2 className="text-center text-3xl font-semibold text-slate-950 sm:text-4xl">
              Cómo funciona en 3 pasos
            </h2>
            <p className="mt-4 text-center text-base text-slate-600">
              Desde tu idea hasta defensa exitosa
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {howItWorks.map((step, idx) => (
              <div key={step.number} className="relative">
                {/* Connector Line */}
                {idx < howItWorks.length - 1 && (
                  <div className="absolute -right-4 top-8 hidden h-1 w-8 bg-gradient-to-r from-sky-500 to-transparent sm:block" />
                )}

                <div className="rounded-2xl border border-white/70 bg-white/55 p-6 backdrop-blur-xl transition-all hover:border-sky-200 hover:bg-white/70">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-blue-100 text-xl font-bold text-sky-600">
                    {step.number}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-slate-950">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-6 text-slate-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}

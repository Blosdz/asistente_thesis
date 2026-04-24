import { Link } from 'react-router-dom';
import { BookOpenCheck, CalendarCheck2, FileText, ShieldCheck } from 'lucide-react';

import appIcon from '../../../page-icon.png';

const highlights = [
  {
    value: 'Tesis',
    label: 'Documentos, versiones y observaciones en un solo espacio',
    icon: FileText,
  },
  {
    value: 'Asesores',
    label: 'Acompañamiento académico conectado a tu avance',
    icon: BookOpenCheck,
  },
  {
    value: 'Pagos',
    label: 'Cotización y seguimiento sin perder contexto',
    icon: CalendarCheck2,
  },
];

export default function AuthLayout({
  children,
  eyebrow = 'AppThesis Gateway',
  title,
  accent,
  description,
}) {
  const currentYear = new Date().getFullYear();

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#eff6ff] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_70%_60%_at_15%_20%,rgba(191,219,254,0.82)_0%,transparent_55%),radial-gradient(ellipse_62%_68%_at_88%_78%,rgba(199,210,254,0.7)_0%,transparent_58%),radial-gradient(ellipse_52%_52%_at_52%_48%,rgba(224,242,254,0.78)_0%,transparent_70%)]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_42%_38%_at_91%_12%,rgba(15,23,42,0.12)_0%,transparent_62%),linear-gradient(135deg,rgba(255,255,255,0.62)_0%,rgba(239,246,255,0.35)_42%,rgba(219,234,254,0.45)_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col gap-8 lg:grid lg:grid-cols-[1.05fr_1px_0.95fr] lg:items-stretch lg:gap-0">
        <section className="flex flex-col justify-between gap-10 py-2 lg:py-10 lg:pr-12">
          <Link to="/" className="flex w-fit items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-[14px] border border-slate-950/10 bg-white/75 shadow-[0_14px_34px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl">
              <img src={appIcon} alt="AppThesis" className="h-10 w-10 object-contain" />
            </span>
            <span>
              <span className="block text-xl font-semibold tracking-[-0.01em] text-slate-950">
                AppThesis
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-700">
                Thesis Command Center
              </span>
            </span>
          </Link>

          <div className="max-w-xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-slate-950/10 bg-slate-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-[0_16px_36px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-xl">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-400 text-slate-950">
                <ShieldCheck className="h-3.5 w-3.5" />
              </span>
              {eyebrow}
            </div>

            <h1 className="max-w-2xl text-4xl font-semibold leading-[1.06] tracking-[-0.02em] text-slate-950 sm:text-5xl lg:text-[4rem]">
              {title}{' '}
              <span className="font-serif italic font-normal text-blue-500">
                {accent}
              </span>
            </h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-slate-600 sm:text-base">
              {description}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:max-w-3xl">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.value}
                  className="rounded-2xl border border-slate-950/10 bg-white/55 p-4 shadow-[0_16px_42px_rgba(15,23,42,0.09),inset_0_1px_0_rgba(255,255,255,0.86)] backdrop-blur-xl"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-blue-300 shadow-[0_10px_24px_rgba(15,23,42,0.18)]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-lg font-semibold tracking-[-0.01em] text-slate-950">
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <div className="hidden bg-gradient-to-b from-transparent via-slate-950/15 to-transparent lg:block" />

        <section className="flex items-center justify-center pb-14 lg:p-10">
          {children}
        </section>
      </div>

      <footer className="relative z-10 pb-1 text-center text-xs text-slate-400">
        © {currentYear} AppThesis. Plataforma de apoyo para organización,
        cotización y avance académico.
      </footer>
    </main>
  );
}

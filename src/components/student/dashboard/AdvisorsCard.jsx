import { ArrowRight, Users, ShieldCheck } from 'lucide-react';

import { Card } from '../../ui/card';

export default function AdvisorsCard({
  advisors = [],
  onOpenAdvisors,
}) {
  return (
    <Card className="relative overflow-hidden rounded-[32px] border border-white/70 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-900 p-7 text-white shadow-[0_25px_70px_rgba(15,23,42,0.28)] backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-900 " />

      <div className="relative z-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-blue-100 backdrop-blur">
              <Users className="h-3.5 w-3.5" />
              Equipo académico
            </div>

            <h3 className="mt-5 text-3xl font-black tracking-tight">
              Tus asesores conectados
            </h3>

            <p className="mt-3 text-sm leading-7 text-blue-100/75">
              Gestiona reuniones, avances académicos y coordinación de tesis
              desde un solo espacio centralizado.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:min-w-[260px]">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-100/60">
                Asesores
              </p>

              <p className="mt-2 text-3xl font-black">
                {String(advisors.length).padStart(2, '0')}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-100/60">
                Estado
              </p>

              <div className="mt-2 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />

                <span className="text-sm font-semibold text-emerald-200">
                  Activo
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 overflow-hidden">
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          {advisors.length > 0 ? (
            advisors.slice(0, 3).map((asesor) => (
              <div
                key={asesor.relacionId || asesor.id || asesor.name}
                className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-md transition duration-300 hover:bg-white/15"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-bold text-white">
                      {asesor.name}
                    </p>

                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-blue-100/60">
                      {asesor.estado || 'Activo'}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                    <Users className="h-4 w-4 text-cyan-200" />
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-black/10 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-blue-100/50">
                    Especialidad
                  </p>

                  <p className="mt-2 text-sm font-medium text-blue-50">
                    {asesor.thesisTitle || asesor.career || 'Asesor académico'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-3xl border border-dashed border-white/15 bg-white/5 p-8 text-center">
              <p className="text-lg font-semibold text-white">
                Aún no tienes asesores vinculados
              </p>

              <p className="mt-2 text-sm text-blue-100/65">
                Conecta un asesor para comenzar el seguimiento académico.
              </p>
            </div>
          )}
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAdvisors}
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition duration-300 hover:scale-[1.02]"
        >
          Administrar asesores
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}

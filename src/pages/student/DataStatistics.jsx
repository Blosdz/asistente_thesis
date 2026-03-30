import React from 'react';
import { Construction } from 'lucide-react';
import { Card } from '../../components/ui/card';

export default function DataStatistics() {
  return (
    <div className="relative flex min-h-[78vh] w-full items-center justify-center overflow-hidden px-4 py-12 text-slate-900">
      <div className="absolute inset-0 backdrop-blur-[16px]" />
      <div className="absolute inset-0 bg-white/40" />

      <Card className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center rounded-[32px] border border-white/70 bg-white/65 px-10 py-14 text-center shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-amber-100 text-amber-600 shadow-[0_18px_40px_rgba(245,158,11,0.18)]">
          <Construction className="h-12 w-12" />
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
          Estadísticas
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">
          Bajo construcción
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
          Esta sección estará disponible próximamente en el área de estadísticas.
        </p>
      </Card>
    </div>
  );
}

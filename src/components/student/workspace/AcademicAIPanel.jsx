import { MessageSquare, Sparkles } from 'lucide-react';

import { Button } from '../../ui/button';
import { Card } from '../../ui/card';

export default function AcademicAIPanel({
  suggestionCount,
  onOpenSuggestions,
}) {
  return (
    <div className="space-y-4">
      <Card className="rounded-[28px] border-none bg-white p-6 shadow-[0_24px_50px_-38px_rgba(15,23,42,0.35)]">
        <div className="flex items-center gap-3">
          <div className="ios-avatar-glass flex h-10 w-10 items-center justify-center rounded-full">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
              Academic AI
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate-950">
              Asistente académico
            </h3>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div className="max-w-[90%] rounded-[20px] rounded-tl-md bg-slate-100 px-4 py-3 text-sm leading-7 text-slate-700">
            Puedo ayudarte a resumir avances, detectar vacíos y preparar prompts para tu capítulo activo.
          </div>
          <div className="ml-auto max-w-[82%] rounded-[20px] rounded-tr-md border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700">
            Quiero una síntesis clara del documento actual.
          </div>
        </div>

        <div className="mt-5 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400">
          Ask AI Research Assistant...
        </div>
      </Card>

      <Button
        variant="outline"
        onClick={onOpenSuggestions}
        className="ios-secondary-button h-12 w-full justify-between rounded-xl px-4"
      >
        <span className="inline-flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Ver sugerencias del asesor
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
          {suggestionCount}
        </span>
      </Button>
    </div>
  );
}

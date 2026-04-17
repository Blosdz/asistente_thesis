import { Plus, ShieldCheck } from 'lucide-react';

import { Button } from '../../ui/button';
import { Select, SelectItem } from '../../ui/select';

export default function WorkspaceTopBar({
  thesesList,
  selectedThesisId,
  onSelectThesis,
  onOpenAccesses,
  onOpenCreate,
}) {
  return (
    <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
      <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">
            Thesis Workspace
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Mi tesis
          </h1>
        </div>

        <div className="w-full max-w-xl">
          <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
            Tesis activa
          </label>
          <Select
            className="h-12 w-full rounded-xl border border-slate-200/80 bg-white px-4 text-sm font-medium text-slate-900 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.28)]"
            value={selectedThesisId}
            onChange={(e) => onSelectThesis(e.target.value)}
          >
            {thesesList.map((thesis) => (
              <SelectItem key={thesis.id} value={thesis.id}>
                {thesis.titulo || 'Sin título'}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="outline"
          onClick={onOpenAccesses}
          disabled={!selectedThesisId}
          className="h-12 rounded-xl border-slate-200/80 bg-white px-4 text-slate-700 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.28)] hover:bg-slate-50"
        >
          <ShieldCheck className="h-4 w-4" />
          Gestionar accesos
        </Button>

        <Button
          onClick={onOpenCreate}
          className="h-12 rounded-xl bg-slate-950 px-5 text-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.7)] hover:bg-slate-900"
          title="Crear tesis"
        >
          <Plus className="h-4 w-4" />
          Crear tesis
        </Button>
      </div>
    </div>
  );
}

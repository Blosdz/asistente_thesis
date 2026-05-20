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
    <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
      <div className="flex w-full flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-0.5">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
            Thesis Workspace
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-slate-950">
            Mi tesis
          </h1>
        </div>

        <div className="w-full max-w-xl">
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
            Tesis activa
          </label>
          <Select
            className="h-10 w-full rounded-xl border border-slate-200/80 bg-white px-3 text-sm font-medium text-slate-900 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.28)]"
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

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          variant="outline"
          onClick={onOpenAccesses}
          disabled={!selectedThesisId}
          className="ios-secondary-button h-10 rounded-xl px-3 text-sm"
        >
          <ShieldCheck className="h-4 w-4" />
          Gestionar accesos
        </Button>

        <Button
          onClick={onOpenCreate}
          className="ios-accent-button h-10 rounded-xl px-4 text-sm"
          title="Crear tesis"
        >
          <Plus className="h-4 w-4" />
          Crear tesis
        </Button>
      </div>
    </div>
  );
}

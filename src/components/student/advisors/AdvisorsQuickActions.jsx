import { CalendarDays, Search, Users } from 'lucide-react';

const actions = [
  {
    id: 'browse',
    label: 'Buscar asesores',
    icon: Search,
  },
  {
    id: 'my-advisors',
    label: 'Mis asesores',
    icon: Users,
  },
  {
    id: 'meeting',
    label: 'Solicitar reunión',
    icon: CalendarDays,
  },
];

export default function AdvisorsQuickActions({
  activeSection,
  onChange,
  counts,
}) {
  return (
    <section className="grid gap-2 lg:grid-cols-3">
      {actions.map((action) => {
        const Icon = action.icon;
        const isActive = activeSection === action.id;

        return (
          <button
            key={action.id}
            type="button"
            onClick={() => onChange(action.id)}
            className={`group flex min-h-[20px] items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
              isActive
                ? 'border-blue-200 bg-blue-50/70 shadow-[0_14px_30px_-26px_rgba(37,99,235,0.35)]'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-[0_14px_30px_-28px_rgba(15,23,42,0.24)]'
            }`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/70 bg-white/78 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.88)] transition-colors group-hover:bg-white group-hover:text-sky-700">
                <Icon className="h-5 w-5" />
              </div>
              <p className="truncate text-sm font-semibold tracking-tight text-slate-950">
                {action.label}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {counts[action.id]}
            </span>
          </button>
        );
      })}
    </section>
  );
}

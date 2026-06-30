import { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  FilePenLine,
  MessageSquare,
  Plus,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import RelatedDocumentsPanel from './RelatedDocumentsPanel';

const actionItems = [
  { id: 'manual-edit', label: 'Edición manual', icon: FilePenLine },
  { id: 'cover-upload', label: 'Carátula', icon: Upload },
  { id: 'references', label: 'Referencias', icon: BookOpen },
];

export default function WorkspaceActionNavbar({
  activeActionSection,
  disabled = false,
  onSelectAction,
  documents = [],
  currentDocumentId = '',
  onSelectDocument = () => {},
  suggestionsCount = 0,
  onOpenSuggestions = () => {},
  thesesList = [],
  selectedThesisId = '',
  onSelectThesis = () => {},
  onOpenAccesses = () => {},
  onOpenCreate = () => {},
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const selectedThesis = thesesList.find((t) => t.id === selectedThesisId);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-slate-100 bg-white px-3 py-2 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.18)]">

      {/* Left: page title + action tab pills */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="hidden shrink-0 text-[13px] font-semibold tracking-tight text-slate-900 sm:block">
          Mi tesis
        </span>

        <div className="hidden h-4 w-px shrink-0 bg-slate-200 sm:block" aria-hidden="true" />

        <nav className="flex items-center gap-1" aria-label="Secciones del workspace">
          {actionItems.map(({ id, label, icon: Icon }) => {
            const active = activeActionSection === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectAction(id)}
                disabled={disabled}
                aria-pressed={active}
                className={[
                  'flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-all',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                  'disabled:cursor-not-allowed disabled:opacity-40',
                  active
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                ].join(' ')}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden md:inline">{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right: document selector + suggestions + thesis dropdown */}
      <div className="flex shrink-0 items-center gap-1.5">

        {/* Document version selector */}
        <div className="hidden w-64 md:block">
          <RelatedDocumentsPanel
            documents={documents}
            currentDocumentId={currentDocumentId}
            onSelectDocument={onSelectDocument}
          />
        </div>

        {/* Suggestions button */}
        <button
          type="button"
          onClick={onOpenSuggestions}
          disabled={disabled}
          aria-label={`Sugerencias${suggestionsCount > 0 ? ` (${suggestionsCount})` : ''}`}
          className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40"
        >
          <MessageSquare className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline">Sugerencias</span>
          {suggestionsCount > 0 && (
            <span className="ml-0.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-blue-700">
              {suggestionsCount}
            </span>
          )}
        </button>

        <div className="h-5 w-px bg-slate-200" aria-hidden="true" />

        {/* Thesis management dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Opciones de tesis"
            className={[
              'flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-medium transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
              menuOpen
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            ].join(' ')}
          >
            <span className="hidden max-w-[9rem] truncate md:inline">
              {selectedThesis?.titulo || 'Sin tesis'}
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0 transition-transform duration-150 ${menuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+6px)] z-50 w-64 origin-top-right rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5"
            >
              {/* Thesis selector */}
              <div className="px-2 pb-2 pt-1.5">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Seleccionar tesis
                </p>
                <div className="relative">
                  <select
                    className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 pl-2.5 pr-7 text-xs font-medium text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={selectedThesisId}
                    onChange={(e) => { onSelectThesis(e.target.value); closeMenu(); }}
                    aria-label="Tesis activa"
                  >
                    {thesesList.map((thesis) => (
                      <option key={thesis.id} value={thesis.id}>
                        {thesis.titulo || 'Sin título'}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="my-1 border-t border-slate-100" role="separator" />

              <button
                type="button"
                role="menuitem"
                onClick={() => { onOpenAccesses(); closeMenu(); }}
                disabled={!selectedThesisId}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ShieldCheck className="h-4 w-4 shrink-0 text-slate-500" />
                Gestionar accesos
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => { onOpenCreate(); closeMenu(); }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
              >
                <Plus className="h-4 w-4 shrink-0 text-slate-500" />
                Crear tesis
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

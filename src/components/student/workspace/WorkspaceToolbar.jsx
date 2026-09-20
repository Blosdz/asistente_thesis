import { Columns2, FileText, Maximize2, MessageSquare, Sparkles } from 'lucide-react';

import './WorkspaceToolbar.css';

export const VIEWS = [
  { id: 'split', label: 'Vista dividida', icon: Columns2 },
  { id: 'doc', label: 'Documento', icon: FileText },
  { id: 'chat', label: 'Chat con IA', icon: Sparkles },
];

export default function WorkspaceToolbar({
  view,
  onChangeView,
  documentName,
  suggestionsCount = 0,
  suggestionsSidebarOpen = false,
  onToggleSuggestionsSidebar = () => {},
  onOpenSuggestionsModal = () => {},
}) {
  return (
    <div className="wtb" role="group" aria-label="Herramientas del espacio de trabajo">
      <div className="wtb-switcher ios-segmented">
        {VIEWS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`ios-segmented-btn ${view === id ? 'is-active' : ''}`}
            onClick={() => onChangeView(id)}
            aria-pressed={view === id}
          >
            <Icon size={15} />
            {label}
            {id === 'doc' && suggestionsCount > 0 && (
              <span className="wtb-switcher-badge">{suggestionsCount} sugerencias</span>
            )}
          </button>
        ))}
      </div>

      {documentName && (
        <div className="wtb-doc-indicator">
          <FileText size={13} />
          <span className="wtb-doc-name">{documentName}</span>
        </div>
      )}

      <div className="wtb-actions">
        <button
          type="button"
          className={`wtb-suggestions-btn ${suggestionsSidebarOpen ? 'is-active' : ''}`}
          onClick={onToggleSuggestionsSidebar}
          aria-pressed={suggestionsSidebarOpen}
        >
          <MessageSquare size={14} />
          <span>Sugerencias activas</span>
          {suggestionsCount > 0 && <span className="wtb-badge">{suggestionsCount}</span>}
        </button>
        <button
          type="button"
          className="wtb-expand-btn"
          onClick={onOpenSuggestionsModal}
          title="Ver sugerencias en modal"
          aria-label="Ver sugerencias en modal"
        >
          <Maximize2 size={14} />
        </button>
      </div>
    </div>
  );
}

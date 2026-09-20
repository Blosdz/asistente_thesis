import { useEffect, useMemo, useState } from 'react';
import { Loader2, Maximize2, MessageSquare, X } from 'lucide-react';

import {
  getSuggestionId,
  getSuggestionValidationState,
} from '../../../lib/suggestionValidation';
import SuggestionCard from './SuggestionCard';
import './SuggestionsSidebar.css';

const FILTERS = [
  { id: 'todas', label: 'Todas' },
  { id: 'pendientes', label: 'Pendientes' },
  { id: 'aprobadas', label: 'Aprobadas' },
];

export default function SuggestionsSidebar({
  onClose,
  onOpenModal,
  thesisTitle,
  suggestions = [],
  loading,
  updatingSuggestionId,
  onSubmitSuggestion,
}) {
  const [filter, setFilter] = useState('todas');
  const [activeSuggestionId, setActiveSuggestionId] = useState(null);
  const [draftComment, setDraftComment] = useState('');

  useEffect(() => {
    setActiveSuggestionId(null);
    setDraftComment('');
  }, [suggestions]);

  const counts = useMemo(() => {
    let pendientes = 0;
    let aprobadas = 0;
    suggestions.forEach((item) => {
      const state = getSuggestionValidationState(item);
      if (state === 'pendiente' || state === 'rechazado') pendientes += 1;
      if (state === 'verificado') aprobadas += 1;
    });
    return { todas: suggestions.length, pendientes, aprobadas };
  }, [suggestions]);

  const filtered = useMemo(() => {
    if (filter === 'todas') return suggestions;
    return suggestions.filter((item) => {
      const state = getSuggestionValidationState(item);
      if (filter === 'pendientes') return state === 'pendiente' || state === 'rechazado';
      if (filter === 'aprobadas') return state === 'verificado';
      return true;
    });
  }, [suggestions, filter]);

  const handleOpenComposer = (suggestionId, previousComment = '') => {
    setActiveSuggestionId(suggestionId);
    setDraftComment(previousComment || '');
  };

  const handleCloseComposer = () => {
    setActiveSuggestionId(null);
    setDraftComment('');
  };

  const handleSubmit = async (suggestion) => {
    await onSubmitSuggestion(suggestion, draftComment);
    handleCloseComposer();
  };

  return (
    <aside className="waf-suggestions glass-panel">
      <header className="waf-suggestions-head">
        <div className="waf-suggestions-head-icon">
          <MessageSquare size={16} />
        </div>
        <div className="waf-suggestions-head-text">
          <h3>Sugerencias del Asesor</h3>
          <p>{thesisTitle || 'Retroalimentación sobre tu tesis'}</p>
        </div>
        <button
          type="button"
          className="app-icon-button waf-suggestions-close"
          onClick={onClose}
          aria-label="Cerrar panel de sugerencias"
        >
          <X size={15} />
        </button>
      </header>

      <div className="waf-suggestions-filters ios-segmented">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`ios-segmented-btn ${filter === f.id ? 'is-active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label} ({counts[f.id]})
          </button>
        ))}
      </div>

      <div className="waf-suggestions-list">
        {loading ? (
          <div className="waf-suggestions-loading">
            <Loader2 size={16} className="animate-spin" />
            Cargando sugerencias...
          </div>
        ) : filtered.length === 0 ? (
          <div className="waf-suggestions-empty">
            <MessageSquare size={20} />
            <p>Aún no hay sugerencias registradas</p>
            <span>
              Cuando un asesor deje observaciones o propuestas de mejora, aparecerán aquí.
            </span>
          </div>
        ) : (
          filtered.map((item, idx) => {
            const suggestionId = getSuggestionId(item) || `suggestion-${idx}`;
            return (
              <SuggestionCard
                key={suggestionId}
                suggestion={item}
                suggestionId={suggestionId}
                compact
                isComposerOpen={activeSuggestionId === suggestionId}
                draftComment={draftComment}
                onOpenComposer={handleOpenComposer}
                onCloseComposer={handleCloseComposer}
                onDraftChange={setDraftComment}
                onSubmit={handleSubmit}
                isSubmitting={updatingSuggestionId === suggestionId}
              />
            );
          })
        )}
      </div>

      <footer className="waf-suggestions-foot">
        <button type="button" className="waf-suggestions-modal-link" onClick={onOpenModal}>
          <Maximize2 size={13} /> Abrir en vista modal
        </button>
      </footer>
    </aside>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Loader2, MessageSquare } from 'lucide-react';

import Modal from '../../ui/modal';
import { getSuggestionId } from '../../../lib/suggestionValidation';
import SuggestionCard from './SuggestionCard';

export default function SuggestionsThreadModal({
  open,
  onClose,
  thesisTitle,
  suggestions,
  loading,
  updatingSuggestionId,
  onSubmitSuggestion,
}) {
  const [activeSuggestionId, setActiveSuggestionId] = useState(null);
  const [draftComment, setDraftComment] = useState('');

  useEffect(() => {
    if (!open) {
      setActiveSuggestionId(null);
      setDraftComment('');
    }
  }, [open]);

  const sortedSuggestions = useMemo(() => {
    return [...suggestions].sort((a, b) => {
      const first = new Date(a?.creado_en || a?.created_at || a?.r_creado_en || 0);
      const second = new Date(b?.creado_en || b?.created_at || b?.r_creado_en || 0);
      return first.getTime() - second.getTime();
    });
  }, [suggestions]);

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
    <Modal
      open={open}
      onClose={onClose}
      title="Sugerencias del asesor"
      subtitle={thesisTitle || 'Revisa el historial de feedback y responde cuando ya apliques una corrección.'}
      modalWidth="full"
      secondaryAction={{
        label: 'Cerrar',
        onClick: onClose,
      }}
    >
      <div className="space-y-4">
        {loading ? (
          <div className="flex min-h-[260px] items-center justify-center rounded-[24px] border border-slate-200/80 bg-white">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando sugerencias...
            </div>
          </div>
        ) : sortedSuggestions.length === 0 ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-500 shadow-[0_16px_30px_-26px_rgba(15,23,42,0.4)]">
              <MessageSquare className="h-5 w-5" />
            </div>
            <p className="mt-4 text-base font-medium text-slate-900">
              Aún no hay sugerencias registradas
            </p>
            <p className="mt-2 max-w-md text-sm leading-7 text-slate-500">
              Cuando un asesor deje observaciones o propuestas de mejora, aparecerán aquí en formato de conversación.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {sortedSuggestions.map((item, index) => {
              const suggestionId = getSuggestionId(item) || `suggestion-${index}`;

              return (
                <SuggestionCard
                  key={suggestionId}
                  suggestion={item}
                  suggestionId={suggestionId}
                  isComposerOpen={activeSuggestionId === suggestionId}
                  draftComment={draftComment}
                  onOpenComposer={handleOpenComposer}
                  onCloseComposer={handleCloseComposer}
                  onDraftChange={setDraftComment}
                  onSubmit={handleSubmit}
                  isSubmitting={updatingSuggestionId === suggestionId}
                />
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}

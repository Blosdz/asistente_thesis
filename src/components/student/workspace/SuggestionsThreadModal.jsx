import { useEffect, useMemo, useState } from 'react';
import { Loader2, MessageSquare, Send, UserRound } from 'lucide-react';

import Modal from '../../ui/modal';
import {
  canStudentSubmitSuggestion,
  getStudentSuggestionActionLabel,
  getSuggestionAdvisorName,
  getSuggestionId,
  getSuggestionStatusMeta,
  getSuggestionText,
  getSuggestionTypeLabel,
} from '../../../lib/suggestionValidation';

const formatDate = (value) => {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString();
};

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
              const statusMeta = getSuggestionStatusMeta(item);
              const canSubmit = canStudentSubmitSuggestion(item);
              const isComposerOpen = activeSuggestionId === suggestionId;

              return (
                <article
                  key={suggestionId}
                  className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_24px_48px_-38px_rgba(15,23,42,0.35)]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                        <UserRound className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {getSuggestionAdvisorName(item)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(item?.creado_en || item?.created_at || item?.r_creado_en)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                        {getSuggestionTypeLabel(item)}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-medium ${statusMeta.badgeClass}`}
                      >
                        {statusMeta.label}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="max-w-[90%] rounded-[22px] rounded-tl-md bg-slate-100 px-4 py-3 text-sm leading-7 text-slate-700">
                      {getSuggestionText(item)}
                    </div>

                    {item.comentario_asesor ? (
                      <div className="max-w-[90%] rounded-[22px] rounded-tl-md border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-950">
                        {item.comentario_asesor}
                      </div>
                    ) : null}

                    {item.comentario_estudiante ? (
                      <div className="flex justify-end">
                        <div className="max-w-[90%] rounded-[22px] rounded-tr-md bg-slate-900 px-4 py-3 text-sm leading-7 text-white">
                          {item.comentario_estudiante}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {item.nombre_documento ? (
                    <p className="mt-4 text-xs text-slate-400">
                      Documento relacionado: {item.nombre_documento}
                    </p>
                  ) : null}

                  <div className="mt-5">
                    {canSubmit ? (
                      isComposerOpen ? (
                        <div className="space-y-3 rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                          <textarea
                            rows="4"
                            value={draftComment}
                            onChange={(e) => setDraftComment(e.target.value)}
                            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-300"
                            placeholder="Cuéntale al asesor qué corregiste o dónde lo aplicaste."
                          />

                          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                              type="button"
                              onClick={handleCloseComposer}
                              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSubmit(item)}
                              disabled={updatingSuggestionId === suggestionId}
                              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white shadow-[0_16px_36px_-24px_rgba(15,23,42,0.7)] transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {updatingSuggestionId === suggestionId ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Enviando...
                                </>
                              ) : (
                                <>
                                  <Send className="h-4 w-4" />
                                  {getStudentSuggestionActionLabel(item)}
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenComposer(suggestionId, item.comentario_estudiante)
                          }
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-[0_14px_26px_-22px_rgba(15,23,42,0.35)] transition hover:bg-slate-50"
                        >
                          {getStudentSuggestionActionLabel(item)}
                        </button>
                      )
                    ) : (
                      <p className="text-sm text-slate-500">{statusMeta.hint}</p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}

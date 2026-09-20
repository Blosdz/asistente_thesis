import { Loader2, Send } from 'lucide-react';

import {
  canStudentSubmitSuggestion,
  getStudentSuggestionActionLabel,
  getSuggestionAdvisorName,
  getSuggestionStatusMeta,
  getSuggestionText,
  getSuggestionTypeLabel,
} from '../../../lib/suggestionValidation';
import { avatarGradientFrom, initialsFrom } from '../../../lib/avatarGradient';

const formatDate = (value) => {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString();
};

const ACCENT_BY_STATE = {
  pendiente: 'border-l-amber-400',
  marcado_por_estudiante: 'border-l-sky-400',
  verificado: 'border-l-emerald-400',
  rechazado: 'border-l-rose-400',
};

export default function SuggestionCard({
  suggestion,
  suggestionId,
  isComposerOpen,
  draftComment,
  onOpenComposer,
  onCloseComposer,
  onDraftChange,
  onSubmit,
  isSubmitting,
  compact = false,
}) {
  const statusMeta = getSuggestionStatusMeta(suggestion);
  const canSubmit = canStudentSubmitSuggestion(suggestion);
  const advisorName = getSuggestionAdvisorName(suggestion);
  const accentClass = ACCENT_BY_STATE[statusMeta.state] || 'border-l-slate-300';

  return (
    <article
      className={
        compact
          ? `rounded-2xl border border-white/80 border-l-[3px] ${accentClass} bg-white/70 p-3.5 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.35)]`
          : `rounded-[28px] border border-slate-200/80 border-l-4 ${accentClass} bg-white p-5 shadow-[0_24px_48px_-38px_rgba(15,23,42,0.35)]`
      }
    >
      <div className={`flex flex-col gap-3 ${compact ? '' : 'sm:flex-row sm:items-start sm:justify-between sm:gap-4'}`}>
        <div className="flex items-center gap-3">
          <div
            className={
              compact
                ? `flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr ${avatarGradientFrom(advisorName)} text-[11px] font-bold text-white ring-2 ring-white`
                : `flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr ${avatarGradientFrom(advisorName)} text-xs font-bold text-white ring-2 ring-white`
            }
          >
            {initialsFrom(advisorName)}
          </div>
          <div>
            <p className={compact ? 'text-xs font-semibold text-slate-950' : 'text-sm font-semibold text-slate-950'}>
              {advisorName}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">
              {formatDate(suggestion?.creado_en || suggestion?.created_at || suggestion?.r_creado_en)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={
              compact
                ? 'rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-500'
                : 'rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500'
            }
          >
            {getSuggestionTypeLabel(suggestion)}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusMeta.badgeClass}`}
          >
            {statusMeta.label}
          </span>
        </div>
      </div>

      <div className={compact ? 'mt-3 space-y-2' : 'mt-5 space-y-3'}>
        <div
          className={
            compact
              ? 'rounded-xl rounded-tl-md bg-slate-100 px-3 py-2 text-xs leading-relaxed text-slate-700'
              : 'max-w-[90%] rounded-[22px] rounded-tl-md bg-slate-100 px-4 py-3 text-sm leading-7 text-slate-700'
          }
        >
          {getSuggestionText(suggestion)}
        </div>

        {suggestion.comentario_asesor ? (
          <div
            className={
              compact
                ? 'rounded-xl rounded-tl-md border border-amber-100 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950'
                : 'max-w-[90%] rounded-[22px] rounded-tl-md border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-950'
            }
          >
            {suggestion.comentario_asesor}
          </div>
        ) : null}

        {suggestion.comentario_estudiante ? (
          <div className="flex justify-end">
            <div
              className={
                compact
                  ? 'max-w-[92%] rounded-xl rounded-tr-md border border-white/80 bg-[linear-gradient(180deg,rgba(232,242,255,0.96)_0%,rgba(214,233,255,0.84)_100%)] px-3 py-2 text-xs leading-relaxed text-slate-800'
                  : 'max-w-[90%] rounded-[22px] rounded-tr-md border border-white/80 bg-[linear-gradient(180deg,rgba(232,242,255,0.96)_0%,rgba(214,233,255,0.84)_100%)] px-4 py-3 text-sm leading-7 text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_14px_28px_rgba(125,168,214,0.16)]'
              }
            >
              {suggestion.comentario_estudiante}
            </div>
          </div>
        ) : null}
      </div>

      {suggestion.nombre_documento ? (
        <p className={compact ? 'mt-3 text-[11px] text-slate-400' : 'mt-4 text-xs text-slate-400'}>
          Documento relacionado: {suggestion.nombre_documento}
        </p>
      ) : null}

      <div className={compact ? 'mt-3' : 'mt-5'}>
        {canSubmit ? (
          isComposerOpen ? (
            <div className={compact ? 'space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3' : 'space-y-3 rounded-[22px] border border-slate-200 bg-slate-50 p-4'}>
              <textarea
                rows={compact ? 3 : 4}
                value={draftComment}
                onChange={(e) => onDraftChange(e.target.value)}
                className={
                  compact
                    ? 'w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-slate-300'
                    : 'w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-300'
                }
                placeholder="Cuéntale al asesor qué corregiste o dónde lo aplicaste."
              />

              <div className={`flex gap-2 ${compact ? 'flex-col' : 'flex-col sm:flex-row sm:justify-end'}`}>
                <button
                  type="button"
                  onClick={onCloseComposer}
                  className={
                    compact
                      ? 'inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50'
                      : 'inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50'
                  }
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => onSubmit(suggestion)}
                  disabled={isSubmitting}
                  className={
                    compact
                      ? 'ios-accent-button inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60'
                      : 'ios-accent-button inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60'
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className={compact ? 'h-3.5 w-3.5 animate-spin' : 'h-4 w-4 animate-spin'} />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
                      {getStudentSuggestionActionLabel(suggestion)}
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOpenComposer(suggestionId, suggestion.comentario_estudiante)}
              className={
                compact
                  ? 'inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50'
                  : 'inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-[0_14px_26px_-22px_rgba(15,23,42,0.35)] transition hover:bg-slate-50'
              }
            >
              {getStudentSuggestionActionLabel(suggestion)}
            </button>
          )
        ) : (
          <p className={compact ? 'text-xs text-slate-500' : 'text-sm text-slate-500'}>{statusMeta.hint}</p>
        )}
      </div>
    </article>
  );
}

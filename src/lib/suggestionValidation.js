export const getSuggestionValidationState = (item) =>
  (
    item?.estado_validacion ||
    item?.estado ||
    item?.estado_sugerencia ||
    item?.r_estado ||
    'pendiente'
  )
    .toString()
    .trim()
    .toLowerCase();

export const getSuggestionStatusMeta = (item) => {
  const state = getSuggestionValidationState(item);

  switch (state) {
    case 'marcado_por_estudiante':
      return {
        state,
        label: 'En revision',
        badgeClass: 'bg-sky-50 text-sky-700',
        hint: 'El estudiante indico que ya aplico la correccion.',
      };
    case 'verificado':
      return {
        state,
        label: 'Verificada',
        badgeClass: 'bg-emerald-50 text-emerald-700',
        hint: 'El asesor confirmo que la correccion es valida.',
      };
    case 'rechazado':
      return {
        state,
        label: 'Rechazada',
        badgeClass: 'bg-rose-50 text-rose-700',
        hint: 'El asesor pidio nuevos ajustes antes de aprobarla.',
      };
    default:
      return {
        state: 'pendiente',
        label: 'Pendiente',
        badgeClass: 'bg-amber-50 text-amber-700',
        hint: 'Aun no ha sido enviada nuevamente a revision.',
      };
  }
};

export const getSuggestionText = (item) =>
  item?.detalle ||
  item?.sugerencia ||
  item?.comentario ||
  item?.observacion ||
  item?.r_sugerencia ||
  'Sin detalle';

export const getSuggestionAdvisorName = (item) =>
  item?.asesor_nombre ||
  item?.nombre_asesor ||
  item?.asesor ||
  item?.r_nombre_asesor ||
  'Asesor';

export const getSuggestionTypeLabel = (item) =>
  item?.tipo_nombre || item?.tipo_codigo || item?.categoria || 'Observacion';

export const getSuggestionId = (item) => item?.id || item?.sugerencia_id || null;

export const canStudentSubmitSuggestion = (item) => {
  const state = getSuggestionValidationState(item);
  return state === 'pendiente' || state === 'rechazado';
};

export const getStudentSuggestionActionLabel = (item) =>
  getSuggestionValidationState(item) === 'rechazado'
    ? 'Volver a enviar'
    : 'Marcar como aplicada';

export const canAdvisorValidateSuggestion = (item) =>
  getSuggestionValidationState(item) === 'marcado_por_estudiante';

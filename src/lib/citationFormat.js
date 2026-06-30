// Shared, client-side citation formatting used to render reference metadata live
// in the editor. Keep the output in sync with the Python CitationService
// (thesis-doc-generator/app/services/citation_service.py), which produces the
// equivalent strings for the exported DOCX.

export const CITATION_STYLES = ['apa7', 'mla', 'vancouver', 'ieee', 'iso690'];

const normalizeStyle = (style) => (style || 'apa7').toLowerCase();

const firstAuthor = (reference) => reference?.authors?.[0] || null;

const initialsWithPeriods = (firstName) =>
  firstName
    ? firstName
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => `${part[0]}.`)
        .join(' ')
    : '';

const initialsNoPeriods = (firstName) =>
  firstName
    ? firstName
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
    : '';

// "12(3)" / "12" / "(3)" / ""
const volumeIssue = (reference) => {
  const volume = (reference?.volume || '').trim();
  const issue = (reference?.issue || '').trim();
  if (volume && issue) return `${volume}(${issue})`;
  if (volume) return volume;
  if (issue) return `(${issue})`;
  return '';
};

// "vol. 12, no. 3, pp. 45-67" (omits missing pieces)
const labeledLocator = (reference) => {
  const parts = [];
  const volume = (reference?.volume || '').trim();
  const issue = (reference?.issue || '').trim();
  const pages = (reference?.pages || '').trim();
  if (volume) parts.push(`vol. ${volume}`);
  if (issue) parts.push(`no. ${issue}`);
  if (pages) parts.push(`pp. ${pages}`);
  return parts.join(', ');
};

const appendIdentifier = (text, reference) => {
  if (reference?.doi) {
    return `${text} https://doi.org/${String(reference.doi).replace(/^https:\/\/doi\.org\//, '')}`;
  }
  if (reference?.url) return `${text} ${reference.url}`;
  return text;
};

const apa7 = (reference) => {
  const author = firstAuthor(reference);
  const lastName = author?.last_name || 'Sin autor';
  const initials = initialsWithPeriods(author?.first_name);
  const authorText = initials ? `${lastName}, ${initials}` : lastName;
  const year = reference?.year || 's. f.';
  const title = reference?.title || 'Sin título';
  const type = reference?.type;

  let result;
  if (type === 'book') {
    result = `${authorText} (${year}). ${title}. ${reference?.publisher || 'Editorial no especificada'}.`;
  } else if (type === 'article') {
    result = `${authorText} (${year}). ${title}. ${reference?.journal || 'Revista no especificada'}`;
    const vi = volumeIssue(reference);
    if (vi) result += `, ${vi}`;
    if (reference?.pages) result += `, ${String(reference.pages).trim()}`;
    result += '.';
  } else {
    result = `${authorText} (${year}). ${title}.`;
    if (type === 'web' && reference?.accessed_at) {
      result += ` Recuperado el ${reference.accessed_at}.`;
    }
  }
  return appendIdentifier(result, reference);
};

const mlaAuthors = (authors = []) => {
  if (!authors.length) return 'Sin autor';
  const primary = authors[0]?.first_name
    ? `${authors[0].last_name}, ${authors[0].first_name}`
    : authors[0]?.last_name || 'Sin autor';
  if (authors.length === 1) return primary;
  if (authors.length === 2) {
    const second = authors[1]?.first_name
      ? `${authors[1].first_name} ${authors[1].last_name}`
      : authors[1]?.last_name || '';
    return `${primary}, and ${second}`;
  }
  return `${primary}, et al.`;
};

const mla = (reference) => {
  const authors = mlaAuthors(reference?.authors || []);
  const prefix = authors.endsWith('.') ? authors : `${authors}.`;
  const year = reference?.year || 's. f.';
  const title = reference?.title || 'Sin título';
  const type = reference?.type;

  let result;
  if (type === 'book') {
    result = `${prefix} ${title}. ${reference?.publisher || 'Editorial no especificada'}, ${year}.`;
  } else if (type === 'article') {
    result = `${prefix} "${title}." ${reference?.journal || 'Revista no especificada'}`;
    if (reference?.volume) result += `, vol. ${String(reference.volume).trim()}`;
    if (reference?.issue) result += `, no. ${String(reference.issue).trim()}`;
    result += `, ${year}`;
    if (reference?.pages) result += `, pp. ${String(reference.pages).trim()}`;
    result += '.';
  } else {
    result = `${prefix} "${title}." ${year}.`;
    if (type === 'web' && reference?.accessed_at) {
      result += ` Accessed ${reference.accessed_at}.`;
    }
  }
  return appendIdentifier(result, reference);
};

const vancouver = (reference, index) => {
  const author = firstAuthor(reference);
  const lastName = author?.last_name || 'Sin autor';
  const initials = initialsNoPeriods(author?.first_name);
  const authorText = initials ? `${lastName} ${initials}` : lastName;
  const num = index != null ? `${index + 1}.` : '?.';
  const year = reference?.year || 's. f.';
  const title = reference?.title || 'Sin título';
  const type = reference?.type;

  let result;
  if (type === 'book') {
    result = `${num} ${authorText}. ${title}. ${reference?.publisher || 'Editorial no especificada'}; ${year}.`;
  } else if (type === 'article') {
    const vi = volumeIssue(reference);
    let tail = `${year}`;
    if (vi) {
      tail += `;${vi}`;
      if (reference?.pages) tail += `:${String(reference.pages).trim()}`;
    } else if (reference?.pages) {
      tail += `:${String(reference.pages).trim()}`;
    }
    result = `${num} ${authorText}. ${title}. ${reference?.journal || 'Revista no especificada'}. ${tail}.`;
  } else {
    result = `${num} ${authorText}. ${title} [Internet]. ${year}.`;
    if (type === 'web' && reference?.accessed_at) {
      result += ` [citado ${reference.accessed_at}].`;
    }
  }
  return appendIdentifier(result, reference);
};

const ieee = (reference, index) => {
  const author = firstAuthor(reference);
  const lastName = author?.last_name || 'Sin autor';
  const initials = initialsWithPeriods(author?.first_name);
  const authorText = initials ? `${initials} ${lastName}` : lastName;
  const num = index != null ? `[${index + 1}]` : '[?]';
  const year = reference?.year || 's. f.';
  const title = reference?.title || 'Sin título';
  const type = reference?.type;

  let result;
  if (type === 'book') {
    result = `${num} ${authorText}, ${title}. ${reference?.publisher || 'Editorial no especificada'}, ${year}.`;
  } else if (type === 'article') {
    result = `${num} ${authorText}, "${title}," ${reference?.journal || 'Revista no especificada'}`;
    const locator = labeledLocator(reference);
    if (locator) result += `, ${locator}`;
    result += `, ${year}.`;
  } else {
    result = `${num} ${authorText}, "${title}." ${year}.`;
  }
  return appendIdentifier(result, reference);
};

const iso690 = (reference) => {
  const author = firstAuthor(reference);
  const lastName = (author?.last_name || 'Sin autor').toUpperCase();
  const initials = initialsWithPeriods(author?.first_name);
  const authorText = initials ? `${lastName}, ${initials}` : lastName;
  const prefix = authorText.endsWith('.') ? authorText : `${authorText}.`;
  const year = reference?.year || 's. f.';
  const title = reference?.title || 'Sin título';
  const type = reference?.type;

  let result;
  if (type === 'book') {
    result = `${prefix} ${title}. ${reference?.publisher || 'Editorial no especificada'}, ${year}.`;
  } else if (type === 'article') {
    result = `${prefix} ${title}. ${reference?.journal || 'Revista no especificada'}, ${year}`;
    const locator = labeledLocator(reference);
    if (locator) result += `, ${locator}`;
    result += '.';
  } else {
    result = `${prefix} ${title} [en linea]. ${year}.`;
    if (type === 'web' && reference?.accessed_at) {
      result += ` [consulta: ${reference.accessed_at}].`;
    }
  }
  return appendIdentifier(result, reference);
};

// Full bibliography-entry string for a reference in the given style.
export const referenceLabel = (reference, style = 'apa7', index = null) => {
  switch (normalizeStyle(style)) {
    case 'mla':
      return mla(reference);
    case 'ieee':
      return ieee(reference, index);
    case 'vancouver':
      return vancouver(reference, index);
    case 'iso690':
      return iso690(reference);
    default:
      return apa7(reference);
  }
};

// In-text citation marker for a reference in the given style.
export const formatInlineCitation = (reference, style = 'apa7', index = null) => {
  switch (normalizeStyle(style)) {
    case 'ieee':
      return `[${index != null ? index + 1 : '?'}]`;
    case 'vancouver':
      return `(${index != null ? index + 1 : '?'})`;
    case 'mla':
      return `(${reference?.authors?.[0]?.last_name || 'Autor'})`;
    case 'iso690': {
      const lastName = (reference?.authors?.[0]?.last_name || 'Autor').toUpperCase();
      return `(${lastName}, ${reference?.year || 's. f.'})`;
    }
    default: {
      const lastName = reference?.authors?.[0]?.last_name || 'Autor';
      return `(${lastName}, ${reference?.year || 's. f.'})`;
    }
  }
};

export const CITATION_FORMAT_LABELS = {
  apa7: 'APA 7',
  mla: 'MLA',
  vancouver: 'Vancouver',
  ieee: 'IEEE',
  iso690: 'ISO 690',
};

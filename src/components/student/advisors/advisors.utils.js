export const fallbackAvatar =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBfY_M1vYqCVJM6C281-xl9p2WF-lRoXoF6XWzZ3OqCcsHuwSRxUQP-xUghy-u2Bub3dY-GFZgtO43We88a02lzg2ET9t9HPW_r-Z2C5pajAgGBthu0_JRhit-K_6qz0OOOJpruPijct0DLYYuXb47wLCaWCYr7D-u0FeS6Otbx5PaPL73ofhNRn8nat3vu10fB-1hEezuYn0ZumKHVMGzcrxLFAxbzHMp4yUlO4jQW9oHWW25bJh9WZflyp94rlf3CjlU01K_QO9u1';

export const DEFAULT_SLOT_DURATION_MINUTES = 45;

export const SLOT_VIEW_OPTIONS = [
  { value: 'this_week', label: 'Esta semana' },
  { value: 'next_week', label: 'Siguiente semana' },
  { value: 'this_month', label: 'Este mes' },
  { value: 'all', label: 'Todo lo disponible' },
];

const cleanText = (value, fallback = '') => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }

  return fallback;
};

const uniqueList = (values) => [...new Set(values.filter(Boolean))];

const getAdvisorName = (item) =>
  cleanText(
    item?.nombre_mostrar ||
      [item?.nombres, item?.apellidos].filter(Boolean).join(' '),
    'Asesor académico',
  );

const getPublicCode = (item) =>
  cleanText(
    item?.codigo_publico ||
      item?.codigo ||
      item?.codigo_asesor ||
      item?.slug ||
      null,
    null,
  );

const getUniversityName = (item) =>
  cleanText(
    item?.universidad_nombre || item?.universidad || item?.facultad_nombre,
    'Universidad no especificada',
  );

const getCareerName = (item) =>
  cleanText(
    item?.carrera || item?.especialidad_nombre || item?.rol,
    'Asesoría de tesis',
  );

const getBio = (item) =>
  cleanText(
    item?.biografia,
    'Perfil disponible para acompañamiento académico y revisión de tesis.',
  );

const getAvatar = (item) => cleanText(item?.foto_url, fallbackAvatar);

export const normalizeCatalogAdvisor = (item) => {
  const id = item?.asesor_id || item?.id;
  const name = getAdvisorName(item);
  const publicCode = getPublicCode(item);
  const career = getCareerName(item);
  const university = getUniversityName(item);
  const level = cleanText(item?.nivel_academico || item?.especialidad, null);
  const slug = cleanText(item?.slug, null);

  return {
    id,
    slug,
    publicCode,
    name,
    university,
    career,
    level,
    bio: getBio(item),
    avatar: getAvatar(item),
    tags: uniqueList([level, cleanText(item?.especialidad_nombre, null)]).slice(
      0,
      3,
    ),
    raw: item,
  };
};

export const normalizeMyAdvisor = (item) => {
  const id = item?.asesor_id || item?.id;
  const name = getAdvisorName(item);
  const publicCode = getPublicCode(item);
  const career = getCareerName(item);
  const university = getUniversityName(item);
  const status = cleanText(item?.estado, 'activo').toLowerCase();

  return {
    id,
    relacionId: item?.relacion_id || item?.relacionId || null,
    slug: cleanText(item?.slug, null),
    publicCode,
    name,
    university,
    career,
    level: cleanText(item?.nivel_academico || item?.especialidad, null),
    avatar: getAvatar(item),
    bio: getBio(item),
    estado: status,
    tieneTesis: Boolean(item?.tiene_tesis),
    thesisTitle: cleanText(item?.tesis_titulo, null),
    tags: uniqueList([
      cleanText(item?.carrera, null),
      item?.tiene_tesis ? 'Tesis vinculada' : null,
    ]).slice(0, 3),
    raw: item,
  };
};

export const getUniqueOptions = (items, key) =>
  uniqueList(items.map((item) => cleanText(item?.[key], null))).sort((a, b) =>
    a.localeCompare(b, 'es', { sensitivity: 'base' }),
  );

export const canScheduleRelation = (status) => {
  const normalized = cleanText(status, 'activo').toLowerCase();
  return ['activo', 'vinculado', 'aceptado'].includes(normalized);
};

export const getRelationStatusMeta = (status) => {
  const normalized = cleanText(status, 'activo').toLowerCase();

  if (['activo', 'vinculado', 'aceptado'].includes(normalized)) {
    return {
      label: 'Vinculado',
      tone: 'success',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    };
  }

  if (normalized === 'pendiente') {
    return {
      label: 'Pendiente',
      tone: 'warning',
      className: 'border-amber-200 bg-amber-50 text-amber-700',
    };
  }

  if (normalized === 'rechazado') {
    return {
      label: 'Rechazado',
      tone: 'danger',
      className: 'border-rose-200 bg-rose-50 text-rose-700',
    };
  }

  return {
    label: normalized.charAt(0).toUpperCase() + normalized.slice(1),
    tone: 'neutral',
    className: 'border-slate-200 bg-slate-100 text-slate-700',
  };
};

export const formatDateKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}`;
};

export const formatDayChip = (value) =>
  new Intl.DateTimeFormat('es-PE', {
    weekday: 'short',
    day: '2-digit',
  }).format(new Date(value));

export const formatFullDate = (value) =>
  new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(value));

export const formatTime = (value) =>
  new Intl.DateTimeFormat('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));

export const buildSlotKey = (slot) =>
  `${slot?.disponibilidad_id}-${slot?.inicio_bloque}`;

const startOfDay = (date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const endOfDay = (date) => {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
};

const getStartOfWeek = (date) => {
  const next = startOfDay(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  return next;
};

const getEndOfWeek = (date) => {
  const next = getStartOfWeek(date);
  next.setDate(next.getDate() + 6);
  return endOfDay(next);
};

const getEndOfMonth = (date) => {
  const next = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return endOfDay(next);
};

export const getSlotRange = (view) => {
  const today = new Date();
  const rangeStart = startOfDay(today);

  if (view === 'next_week') {
    const start = getStartOfWeek(today);
    start.setDate(start.getDate() + 7);
    return { start, end: getEndOfWeek(start) };
  }

  if (view === 'this_month') {
    return { start: rangeStart, end: getEndOfMonth(today) };
  }

  if (view === 'all') {
    return { start: null, end: null };
  }

  return { start: rangeStart, end: getEndOfWeek(today) };
};

export const getSlotDurationMinutes = (slot) => {
  const explicitDuration = Number(slot?.duracion_minutos || 0);
  if (Number.isFinite(explicitDuration) && explicitDuration > 0) {
    return explicitDuration;
  }

  const start = new Date(slot?.inicio_bloque);
  const end = new Date(slot?.fin_bloque);
  const computed = Math.round((end.getTime() - start.getTime()) / 60000);

  if (Number.isFinite(computed) && computed > 0) {
    return computed;
  }

  return DEFAULT_SLOT_DURATION_MINUTES;
};

export const getSlotEndDate = (slot) => {
  const rawEnd = new Date(slot?.fin_bloque);
  if (!Number.isNaN(rawEnd.getTime())) {
    return rawEnd;
  }

  const start = new Date(slot?.inicio_bloque);
  const durationMinutes = getSlotDurationMinutes(slot);

  if (Number.isNaN(start.getTime())) {
    return start;
  }

  return new Date(start.getTime() + durationMinutes * 60000);
};

export const formatDurationMinutes = (minutes) => {
  const normalized = Number(minutes || DEFAULT_SLOT_DURATION_MINUTES);
  return `${normalized} min`;
};

export const getSlotTimeRangeLabel = (slot) =>
  `${formatTime(slot?.inicio_bloque)} - ${formatTime(getSlotEndDate(slot))}`;

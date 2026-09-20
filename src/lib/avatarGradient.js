const AVATAR_GRADIENTS = [
  'from-amber-500 to-orange-400',
  'from-blue-600 to-indigo-500',
  'from-emerald-500 to-teal-400',
  'from-rose-500 to-pink-400',
  'from-sky-500 to-cyan-400',
];

const hashString = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const initialsFrom = (name) => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

export const avatarGradientFrom = (name) =>
  AVATAR_GRADIENTS[hashString(String(name || '')) % AVATAR_GRADIENTS.length];

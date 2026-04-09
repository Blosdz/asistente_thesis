export type StorySectionConfig = {
  id: string;
  label: string;
  shortLabel: string;
};

export const storySections: StorySectionConfig[] = [
  { id: 'hero', label: 'Inicio', shortLabel: 'Inicio' },
  { id: 'how-it-works', label: 'Flujo', shortLabel: 'Flujo' },
  { id: 'pricing-story', label: 'Precio', shortLabel: 'Precio' },
  { id: 'plans', label: 'Planes', shortLabel: 'Planes' },
  { id: 'ai-showcase', label: 'Asistente', shortLabel: 'IA' },
  { id: 'trust', label: 'Valor', shortLabel: 'Valor' },
  { id: 'final-cta', label: 'Cierre', shortLabel: 'Final' },
];

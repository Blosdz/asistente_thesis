export type StorySectionConfig = {
  id: string;
  label: string;
  shortLabel: string;
};

export const storySections: StorySectionConfig[] = [
  { id: 'hero', label: 'Inicio', shortLabel: 'Inicio' },
  { id: 'como-funciona', label: 'Cómo funciona', shortLabel: 'Flujo' },
  { id: 'planes', label: 'Planes', shortLabel: 'Planes' },
  { id: 'asesores', label: 'Asesores', shortLabel: 'Asesores' },
  { id: 'resultados', label: 'Resultados', shortLabel: 'Resultados' },
  { id: 'final-cta', label: 'Cierre', shortLabel: 'Final' },
];

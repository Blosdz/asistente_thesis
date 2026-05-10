import { Search, X } from 'lucide-react';

import { Select, SelectItem } from '../../ui/select';

export default function AdvisorFiltersBar({
  searchValue,
  onSearchChange,
  selectedUniversity,
  onUniversityChange,
  selectedSpecialty,
  onSpecialtyChange,
  selectedCareer,
  onCareerChange,
  selectedLevel,
  onLevelChange,
  universityOptions,
  specialtyOptions,
  careerOptions,
  resultCount,
  hasActiveFilters,
  onClearFilters,
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,0.95fr))_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={`Nombre o código · ${resultCount} resultado(s)`}
          className="h-[50px] w-full rounded-2xl border border-slate-200 bg-white px-11 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      <Select
        value={selectedUniversity}
        onChange={(event) => onUniversityChange(event.target.value)}
        className="h-[50px] rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-none"
      >
        <SelectItem value="">Todas las universidades</SelectItem>
        {universityOptions.map((option) => (
          <SelectItem key={option.id || option.nombre || option} value={option.id || option}>
            {option.nombre || option}
          </SelectItem>
        ))}
      </Select>

      <Select
        value={selectedSpecialty}
        onChange={(event) => onSpecialtyChange(event.target.value)}
        className="h-[50px] rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-none"
      >
        <SelectItem value="">Todas las especialidades</SelectItem>
        {specialtyOptions.map((option) => (
          <SelectItem key={option.id || option.nombre || option} value={option.id || option}>
            {option.nombre || option}
          </SelectItem>
        ))}
      </Select>

      <Select
        value={selectedCareer}
        onChange={(event) => onCareerChange(event.target.value)}
        className="h-[50px] rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-none"
      >
        <SelectItem value="">Todas las carreras</SelectItem>
        {careerOptions.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </Select>

      <Select
        value={selectedLevel}
        onChange={(event) => onLevelChange(event.target.value)}
        className="h-[50px] rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-none"
      >
        <SelectItem value="">Todos los niveles</SelectItem>
        <SelectItem value="pregrado">Pregrado</SelectItem>
        <SelectItem value="maestria">Maestría</SelectItem>
        <SelectItem value="doctorado">Doctorado</SelectItem>
      </Select>

      <div className="flex items-center">
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex h-[50px] items-center gap-1 rounded-2xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <X className="h-3.5 w-3.5" />
            Limpiar
          </button>
        ) : (
          <div className="h-[50px] w-full lg:w-0" />
        )}
      </div>
    </div>
  );
}

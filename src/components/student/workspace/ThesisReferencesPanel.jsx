import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Copy,
  Download,
  FileDown,
  Link2,
  Loader2,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import {
  actualizarReferenciaTesis,
  crearReferenciaTesis,
  eliminarReferenciaTesis,
  obtenerReferenciasTesis,
} from '../../../services/thesisService';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Select, SelectItem } from '../../ui/select';
import { formatInlineCitation, referenceLabel } from '../../../lib/citationFormat';

const emptyReference = {
  author: '',
  year: '',
  title: '',
  type: 'book',
  publisher: '',
  journal: '',
  volume: '',
  issue: '',
  pages: '',
  doi: '',
  url: '',
};

const referenceTypeLabel = {
  book: 'Libro',
  article: 'Artículo',
  web: 'Web',
};

const splitAuthor = (value) => {
  const clean = value.trim();
  if (!clean) return null;

  const parts = clean.split(/\s+/);
  if (parts.length === 1) {
    return { first_name: null, last_name: parts[0] };
  }

  return {
    first_name: parts.slice(0, -1).join(' '),
    last_name: parts.at(-1),
  };
};

const hydrateForm = (reference = null) => ({
  author:
    reference?.authors?.[0]
      ? [reference.authors[0].first_name, reference.authors[0].last_name]
          .filter(Boolean)
          .join(' ')
      : '',
  year: reference?.year ? String(reference.year) : '',
  title: reference?.title || '',
  type: reference?.type || 'book',
  publisher: reference?.publisher || '',
  journal: reference?.journal || '',
  volume: reference?.volume || '',
  issue: reference?.issue || '',
  pages: reference?.pages || '',
  doi: reference?.doi || '',
  url: reference?.url || '',
});

export default function ThesisReferencesPanel({
  tesisId,
  thesisId,
  thesis = null,
  activeFormat = null,
  availableFormats = [],
  onFormatChange = null,
  changingFormat = false,
  onBack,
  className = '',
}) {
  const resolvedTesisId = tesisId || thesisId;
  const activeStyle = activeFormat?.uname || thesis?.doc_thesis_format || 'apa7';
  const [references, setReferences] = useState([]);
  const [selectedReferenceId, setSelectedReferenceId] = useState('');
  const [referenceForm, setReferenceForm] = useState(emptyReference);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const loadReferences = useCallback(async () => {
    if (!resolvedTesisId) {
      setReferences([]);
      return;
    }

    try {
      setLoading(true);
      const data = await obtenerReferenciasTesis(resolvedTesisId);
      setReferences(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading thesis references:', error);
      toast.error('No se pudieron cargar las referencias');
      setReferences([]);
    } finally {
      setLoading(false);
    }
  }, [resolvedTesisId]);

  useEffect(() => {
    loadReferences();
  }, [loadReferences]);

  const orderedReferences = useMemo(
    () =>
      [...references].sort(
        (a, b) =>
          new Date(b?.created_at || b?.creado_en || 0).getTime() -
          new Date(a?.created_at || a?.creado_en || 0).getTime(),
      ),
    [references],
  );

  const filteredReferences = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return orderedReferences.filter((reference) => {
      if (typeFilter !== 'all' && reference?.type !== typeFilter) return false;
      if (!query) return true;

      const author = reference?.authors?.[0];
      const haystack = [
        author?.first_name,
        author?.last_name,
        reference?.title,
        reference?.publisher,
        reference?.journal,
        reference?.doi,
        reference?.url,
        reference?.year,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [orderedReferences, searchQuery, typeFilter]);

  const selectedReference = useMemo(
    () => references.find((item) => item.id === selectedReferenceId) || null,
    [references, selectedReferenceId],
  );

  const selectedReferenceIndex = useMemo(
    () => filteredReferences.findIndex((r) => r.id === selectedReferenceId),
    [filteredReferences, selectedReferenceId],
  );

  const selectedCount = filteredReferences.length;
  const totalCount = references.length;
  const bookCount = references.filter((item) => item?.type === 'book').length;
  const articleCount = references.filter((item) => item?.type === 'article').length;
  const webCount = references.filter((item) => item?.type === 'web').length;

  const selectReference = useCallback((reference) => {
    setSelectedReferenceId(reference.id);
    setReferenceForm(hydrateForm(reference));
  }, []);

  const createNewReference = () => {
    setSelectedReferenceId('');
    setReferenceForm(emptyReference);
  };

  const handleSaveReference = async () => {
    if (!resolvedTesisId) return;

    const author = splitAuthor(referenceForm.author);
    if (!author || !referenceForm.title.trim()) {
      toast.error('Autor y título son requeridos');
      return;
    }

    const payload = {
      authors: [author],
      year: referenceForm.year ? Number(referenceForm.year) : null,
      title: referenceForm.title.trim(),
      type: referenceForm.type,
      publisher: referenceForm.publisher.trim() || null,
      journal: referenceForm.journal.trim() || null,
      volume: referenceForm.volume.trim() || null,
      issue: referenceForm.issue.trim() || null,
      pages: referenceForm.pages.trim() || null,
      doi: referenceForm.doi.trim() || null,
      url: referenceForm.url.trim() || null,
      style: activeStyle.toUpperCase(),
    };

    try {
      setSaving(true);
      if (selectedReferenceId) {
        await actualizarReferenciaTesis(selectedReferenceId, payload);
        toast.success('Referencia actualizada');
      } else {
        await crearReferenciaTesis(resolvedTesisId, payload);
        toast.success('Referencia agregada');
      }
      await loadReferences();
      setSelectedReferenceId('');
      setReferenceForm(emptyReference);
    } catch (error) {
      console.error('Error saving reference:', error);
      toast.error(error?.message || 'No se pudo guardar la referencia');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReference = async (referenceId) => {
    if (!referenceId) return;

    try {
      setDeletingId(referenceId);
      await eliminarReferenciaTesis(referenceId);
      toast.success('Referencia eliminada');
      if (selectedReferenceId === referenceId) {
        setSelectedReferenceId('');
        setReferenceForm(emptyReference);
      }
      await loadReferences();
    } catch (error) {
      console.error('Error deleting reference:', error);
      toast.error(error?.message || 'No se pudo eliminar la referencia');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyBibliography = async () => {
    if (!selectedReference) {
      toast.error('Selecciona una referencia');
      return;
    }

    try {
      const refIdx = selectedReferenceIndex >= 0 ? selectedReferenceIndex : null;
      await navigator.clipboard.writeText(referenceLabel(selectedReference, activeStyle, refIdx));
      toast.success('Referencia copiada');
    } catch (error) {
      console.error('Error copying reference:', error);
      toast.error('No se pudo copiar la referencia');
    }
  };

  return (
    <Card
      className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-0 shadow-[0_20px_42px_-34px_rgba(15,23,42,0.35)] ${className}`}
    >
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 px-6 py-4">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              {onBack ? (
                <Button type="button" variant="outline" onClick={onBack} className="h-9 rounded-xl px-3 text-sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              ) : null}
              <h2 className="text-lg font-semibold text-slate-900">Gestor de Referencias</h2>
              {availableFormats.length > 0 && onFormatChange ? (
                <select
                  value={activeStyle}
                  disabled={changingFormat}
                  onChange={(e) => onFormatChange(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
                >
                  {availableFormats.map((f) => (
                    <option key={f.uname} value={f.uname}>{f.name}</option>
                  ))}
                </select>
              ) : (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {thesis?.doc_thesis_format || 'APA 7'}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500">{thesis?.titulo || 'Referencias de tesis'}</p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={createNewReference} className="h-9 rounded-xl px-3 text-sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Agregar</span>
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Buscar referencias..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <Select
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="book">Libros</SelectItem>
            <SelectItem value="article">Artículos</SelectItem>
            <SelectItem value="web">Web</SelectItem>
          </Select>

          <Button type="button" variant="outline" onClick={handleCopyBibliography} className="h-10 rounded-lg px-3 text-sm">
            <Copy className="h-4 w-4" />
            Copiar
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex min-h-0 flex-1 gap-4 overflow-hidden p-4">
        {/* Table Section */}
        <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white/50 overflow-hidden">
          {/* Table Toolbar */}
          <div className="flex flex-col gap-2 border-b border-slate-200 bg-white/50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Lista</p>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {selectedCount} / {totalCount}
              </span>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : filteredReferences.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-slate-500">No hay referencias para esta búsqueda</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th className="py-3 px-4 font-semibold text-slate-600">Fuente</th>
                    <th className="py-3 px-4 font-semibold text-slate-600">Tipo</th>
                    <th className="py-3 px-4 font-semibold text-slate-600">Año</th>
                    <th className="py-3 px-4 font-semibold text-slate-600">Cita</th>
                    <th className="py-3 px-4 font-semibold text-slate-600">Estado</th>
                    <th className="py-3 px-4 text-right font-semibold text-slate-600">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredReferences.map((reference, index) => {
                    const isSelected = reference.id === selectedReferenceId;
                    const isComplete = reference?.authors && reference?.year && reference?.title;

                    return (
                      <tr
                        key={reference.id}
                        onClick={() => selectReference(reference)}
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                      >
                        <td className="py-3 px-4">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900 text-xs">
                              {referenceLabel(reference, activeStyle, index)}
                            </p>
                            <p className="text-xs text-slate-500 line-clamp-1">
                              {reference?.publisher || reference?.journal || reference?.doi}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs font-medium text-slate-600">
                            {referenceTypeLabel[reference?.type] || 'Ref'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">
                          {reference?.year || '—'}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600 font-mono">
                          {formatInlineCitation(reference, activeStyle, index)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${
                            isComplete
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            <div className="w-1.5 h-1.5 rounded-full"></div>
                            {isComplete ? 'Completa' : 'Incompleta'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 hover:opacity-100 transition-opacity">
                            <button
                              className="p-1.5 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-100 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                selectReference(reference);
                              }}
                            >
                              <BookOpen className="h-4 w-4" />
                            </button>
                            <button
                              className="p-1.5 rounded-md text-slate-500 hover:text-red-600 hover:bg-red-100 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteReference(reference.id);
                              }}
                              disabled={deletingId === reference.id}
                            >
                              {deletingId === reference.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="border-t border-slate-200 bg-white/50 px-4 py-3 flex items-center justify-between text-xs">
            <p className="font-medium text-slate-600">
              Mostrando {selectedCount} de {totalCount}
            </p>
          </div>
        </section>

        {/* Side Panel */}
        <aside className="hidden lg:flex flex-col gap-4 min-w-0 lg:w-80">
          {/* Preview Card */}
          <div className="rounded-xl border border-slate-200 bg-white/50 p-4">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-3">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-900">Vista Previa</h3>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Formato</p>
                {availableFormats.length > 0 && onFormatChange ? (
                  <select
                    value={activeStyle}
                    disabled={changingFormat}
                    onChange={(e) => onFormatChange(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
                  >
                    {availableFormats.map((f) => (
                      <option key={f.uname} value={f.uname}>{f.name}</option>
                    ))}
                  </select>
                ) : (
                  <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {thesis?.doc_thesis_format || 'APA 7'}
                  </span>
                )}
              </div>

              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 min-h-[6rem] flex items-center">
                <p className="text-xs leading-relaxed text-slate-900 font-mono break-words">
                  {selectedReference
                    ? referenceLabel(selectedReference, activeStyle, selectedReferenceIndex >= 0 ? selectedReferenceIndex : null)
                    : 'Selecciona una referencia'}
                </p>
              </div>

              <button
                onClick={handleCopyBibliography}
                disabled={!selectedReference}
                className="w-full h-9 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Copy className="h-3.5 w-3.5" />
                Copiar
              </button>
            </div>
          </div>

          {/* Stats Card */}
          <div className="rounded-xl border border-slate-200 bg-white/50 p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Métricas</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                <p className="text-xs font-semibold text-slate-900">{totalCount}</p>
                <p className="text-xs text-slate-600">Total</p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                <p className="text-xs font-semibold text-slate-900">{bookCount}</p>
                <p className="text-xs text-slate-600">Libros</p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                <p className="text-xs font-semibold text-slate-900">{articleCount}</p>
                <p className="text-xs text-slate-600">Artículos</p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                <p className="text-xs font-semibold text-slate-900">{webCount}</p>
                <p className="text-xs text-slate-600">Web</p>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          {selectedReferenceId && (
            <div className="rounded-xl border border-slate-200 bg-white/50 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Editar</h4>
              <div className="space-y-2">
                <input
                  className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-900 outline-none transition focus:border-blue-300 focus:ring-1 focus:ring-blue-100"
                  value={referenceForm.author}
                  onChange={(event) => setReferenceForm((current) => ({ ...current, author: event.target.value }))}
                  placeholder="Autor"
                />
                <input
                  className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-900 outline-none transition focus:border-blue-300 focus:ring-1 focus:ring-blue-100"
                  value={referenceForm.title}
                  onChange={(event) => setReferenceForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Título"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-900 outline-none transition focus:border-blue-300 focus:ring-1 focus:ring-blue-100"
                    type="number"
                    value={referenceForm.year}
                    onChange={(event) => setReferenceForm((current) => ({ ...current, year: event.target.value }))}
                    placeholder="Año"
                  />
                  <Select
                    className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-900"
                    value={referenceForm.type}
                    onChange={(event) => setReferenceForm((current) => ({ ...current, type: event.target.value }))}
                  >
                    <SelectItem value="book">Libro</SelectItem>
                    <SelectItem value="article">Artículo</SelectItem>
                    <SelectItem value="web">Web</SelectItem>
                  </Select>
                </div>
                {referenceForm.type === 'article' ? (
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-900 outline-none transition focus:border-blue-300 focus:ring-1 focus:ring-blue-100"
                      value={referenceForm.volume}
                      onChange={(event) => setReferenceForm((current) => ({ ...current, volume: event.target.value }))}
                      placeholder="Volumen"
                    />
                    <input
                      className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-900 outline-none transition focus:border-blue-300 focus:ring-1 focus:ring-blue-100"
                      value={referenceForm.issue}
                      onChange={(event) => setReferenceForm((current) => ({ ...current, issue: event.target.value }))}
                      placeholder="Número"
                    />
                    <input
                      className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-900 outline-none transition focus:border-blue-300 focus:ring-1 focus:ring-blue-100"
                      value={referenceForm.pages}
                      onChange={(event) => setReferenceForm((current) => ({ ...current, pages: event.target.value }))}
                      placeholder="Páginas"
                    />
                  </div>
                ) : null}
                <Button
                  type="button"
                  onClick={handleSaveReference}
                  disabled={saving}
                  className="w-full h-8 rounded-lg text-xs"
                >
                  {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Guardar'}
                </Button>
                <button
                  type="button"
                  onClick={() => handleDeleteReference(selectedReferenceId)}
                  disabled={deletingId === selectedReferenceId}
                  className="w-full h-8 rounded-lg border border-red-200 bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deletingId === selectedReferenceId ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                  Eliminar
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </Card>
  );
}

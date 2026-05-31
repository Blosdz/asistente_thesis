import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Download,
  FilePlus2,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { buildApiUrl } from '../../../api/client';
import {
  actualizarSeccionIndiceTesis,
  crearReferenciaTesis,
  crearSeccionIndiceTesis,
  eliminarReferenciaTesis,
  eliminarSeccionIndiceTesis,
  generarDocumentoDocxTesis,
  obtenerIndiceTesis,
  obtenerReferenciasTesis,
} from '../../../services/thesisService';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Select, SelectItem } from '../../ui/select';

const emptySection = {
  title: '',
  subtitle: '',
  level: 1,
  order: 1,
  content: '',
};

const emptyReference = {
  author: '',
  year: '',
  title: '',
  type: 'book',
  publisher: '',
  journal: '',
  doi: '',
  url: '',
};

const inputClass =
  'h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100';

const textareaClass =
  'min-h-16 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100';

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

const referenceLabel = (reference) => {
  const author = reference?.authors?.[0];
  const name = author
    ? [author.last_name, author.first_name].filter(Boolean).join(', ')
    : 'Sin autor';
  return `${name} (${reference?.year || 's. f.'}). ${reference?.title || 'Sin título'}`;
};

export default function ThesisDocBuilderPanel({ tesisId, onGenerated, className = '' }) {
  const [activeTab, setActiveTab] = useState('index');
  const [sections, setSections] = useState([]);
  const [references, setReferences] = useState([]);
  const [sectionForm, setSectionForm] = useState(emptySection);
  const [referenceForm, setReferenceForm] = useState(emptyReference);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingSection, setSavingSection] = useState(false);
  const [savingReference, setSavingReference] = useState(false);
  const [generating, setGenerating] = useState(false);

  const orderedSections = useMemo(
    () =>
      [...sections].sort(
        (a, b) =>
          Number(a.order || 0) - Number(b.order || 0) ||
          new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime(),
      ),
    [sections],
  );

  const loadData = useCallback(async () => {
    if (!tesisId) {
      setSections([]);
      setReferences([]);
      return;
    }

    try {
      setLoading(true);
      const [indexData, referencesData] = await Promise.all([
        obtenerIndiceTesis(tesisId),
        obtenerReferenciasTesis(tesisId),
      ]);
      setSections(indexData || []);
      setReferences(referencesData || []);
      setSectionForm((current) => ({
        ...current,
        order: (indexData?.length || 0) + 1,
      }));
    } catch (error) {
      console.error('Error loading thesis builder data:', error);
      toast.error('No se pudo cargar la estructura documental');
    } finally {
      setLoading(false);
    }
  }, [tesisId]);

  useEffect(() => {
    setEditingSectionId(null);
    setSectionForm(emptySection);
    setReferenceForm(emptyReference);
    loadData();
  }, [loadData]);

  const handleSectionSubmit = async (event) => {
    event.preventDefault();
    if (!tesisId) return;
    if (!sectionForm.title.trim()) {
      toast.error('El título del índice es requerido');
      return;
    }

    const payload = {
      title: sectionForm.title.trim(),
      subtitle: sectionForm.subtitle.trim() || null,
      level: Number(sectionForm.level || 1),
      order: Number(sectionForm.order || orderedSections.length + 1),
      content: sectionForm.content.trim(),
    };

    try {
      setSavingSection(true);
      if (editingSectionId) {
        await actualizarSeccionIndiceTesis(tesisId, editingSectionId, payload);
        toast.success('Sección actualizada');
      } else {
        await crearSeccionIndiceTesis(tesisId, payload);
        toast.success('Sección agregada');
      }
      setEditingSectionId(null);
      setSectionForm({ ...emptySection, order: orderedSections.length + 2 });
      await loadData();
    } catch (error) {
      console.error('Error saving index section:', error);
      toast.error(error?.message || 'No se pudo guardar la sección');
    } finally {
      setSavingSection(false);
    }
  };

  const handleEditSection = (section) => {
    setActiveTab('index');
    setEditingSectionId(section.id);
    setSectionForm({
      title: section.title || '',
      subtitle: section.subtitle || '',
      level: section.level || 1,
      order: section.order || 1,
      content: section.content || '',
    });
  };

  const handleDeleteSection = async (sectionId) => {
    if (!tesisId || !sectionId) return;

    try {
      await eliminarSeccionIndiceTesis(tesisId, sectionId);
      toast.success('Sección eliminada');
      if (editingSectionId === sectionId) {
        setEditingSectionId(null);
        setSectionForm(emptySection);
      }
      await loadData();
    } catch (error) {
      console.error('Error deleting index section:', error);
      toast.error(error?.message || 'No se pudo eliminar la sección');
    }
  };

  const handleReferenceSubmit = async (event) => {
    event.preventDefault();
    if (!tesisId) return;

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
      doi: referenceForm.doi.trim() || null,
      url: referenceForm.url.trim() || null,
    };

    try {
      setSavingReference(true);
      await crearReferenciaTesis(tesisId, payload);
      toast.success('Referencia agregada');
      setReferenceForm(emptyReference);
      await loadData();
    } catch (error) {
      console.error('Error creating reference:', error);
      toast.error(error?.message || 'No se pudo guardar la referencia');
    } finally {
      setSavingReference(false);
    }
  };

  const handleDeleteReference = async (referenceId) => {
    if (!referenceId) return;

    try {
      await eliminarReferenciaTesis(referenceId);
      toast.success('Referencia eliminada');
      await loadData();
    } catch (error) {
      console.error('Error deleting reference:', error);
      toast.error(error?.message || 'No se pudo eliminar la referencia');
    }
  };

  const handleGenerateDocx = async () => {
    if (!tesisId) return;

    try {
      setGenerating(true);
      const document = await generarDocumentoDocxTesis(tesisId);
      toast.success('Documento DOCX generado y subido');
      await onGenerated?.();

      const uploadedUrl =
        document?.upload?.drive?.webViewLink ||
        document?.upload?.data?.url_archivo_drive ||
        document?.drive?.webViewLink ||
        null;

      if (uploadedUrl) {
        window.open(uploadedUrl, '_blank', 'noopener,noreferrer');
      } else if (document?.backend_download_url) {
        window.open(buildApiUrl(document.backend_download_url), '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error generating docx:', error);
      toast.error(error?.message || 'No se pudo generar el DOCX');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className={`flex min-h-0 flex-col rounded-2xl border-none p-4 shadow-[0_20px_42px_-34px_rgba(15,23,42,0.35)] ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
            Documento
          </p>
          <h3 className="truncate text-sm font-semibold text-slate-950">
            Estructura y bibliografía
          </h3>
        </div>
        <Button
          variant="outline"
          onClick={handleGenerateDocx}
          disabled={!tesisId || generating}
          className="h-9 shrink-0 rounded-lg px-3 text-xs"
          title="Generar DOCX"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setActiveTab('index')}
          className={`h-8 rounded-lg text-xs font-semibold transition ${
            activeTab === 'index'
              ? 'bg-white text-slate-950 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Índice
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('references')}
          className={`h-8 rounded-lg text-xs font-semibold transition ${
            activeTab === 'references'
              ? 'bg-white text-slate-950 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Referencias
        </button>
      </div>

      {loading ? (
        <div className="flex h-36 items-center justify-center text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : activeTab === 'index' ? (
        <div className="mt-3 min-h-0 space-y-3 overflow-y-auto pr-1">
          <form onSubmit={handleSectionSubmit} className="space-y-2">
            <div className="grid grid-cols-[minmax(0,1fr)_72px] gap-2">
              <input
                className={inputClass}
                value={sectionForm.title}
                onChange={(event) =>
                  setSectionForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Título"
              />
              <Select
                className={inputClass}
                value={String(sectionForm.level)}
                onChange={(event) =>
                  setSectionForm((current) => ({
                    ...current,
                    level: Number(event.target.value),
                  }))
                }
              >
                <SelectItem value="1">H1</SelectItem>
                <SelectItem value="2">H2</SelectItem>
                <SelectItem value="3">H3</SelectItem>
              </Select>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_72px] gap-2">
              <input
                className={inputClass}
                value={sectionForm.subtitle}
                onChange={(event) =>
                  setSectionForm((current) => ({
                    ...current,
                    subtitle: event.target.value,
                  }))
                }
                placeholder="Subtítulo"
              />
              <input
                className={inputClass}
                type="number"
                min="0"
                value={sectionForm.order}
                onChange={(event) =>
                  setSectionForm((current) => ({
                    ...current,
                    order: event.target.value,
                  }))
                }
                placeholder="Orden"
              />
            </div>
            <textarea
              className={textareaClass}
              value={sectionForm.content}
              onChange={(event) =>
                setSectionForm((current) => ({
                  ...current,
                  content: event.target.value,
                }))
              }
              placeholder="Contenido"
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={savingSection}
                className="h-9 flex-1 rounded-lg px-3 text-xs"
              >
                {savingSection ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingSectionId ? (
                  <Pencil className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {editingSectionId ? 'Guardar' : 'Agregar'}
              </Button>
              {editingSectionId ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingSectionId(null);
                    setSectionForm({ ...emptySection, order: orderedSections.length + 1 });
                  }}
                  className="h-9 rounded-lg px-3 text-xs"
                >
                  Cancelar
                </Button>
              ) : null}
            </div>
          </form>

          <div className="space-y-2">
            {orderedSections.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white/70 p-3 text-xs text-slate-500">
                Aún no hay capítulos.
              </div>
            ) : (
              orderedSections.map((section) => (
                <div
                  key={section.id}
                  className="flex items-start justify-between gap-2 rounded-xl border border-slate-200 bg-white/80 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-900">
                      {section.order}. {section.title}
                    </p>
                    {section.subtitle ? (
                      <p className="truncate text-xs text-slate-500">
                        {section.subtitle}
                      </p>
                    ) : null}
                    <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                      Heading {section.level}
                    </span>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => handleEditSection(section)}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                      title="Editar"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSection(section.id)}
                      className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="mt-3 min-h-0 space-y-3 overflow-y-auto pr-1">
          <form onSubmit={handleReferenceSubmit} className="space-y-2">
            <input
              className={inputClass}
              value={referenceForm.author}
              onChange={(event) =>
                setReferenceForm((current) => ({
                  ...current,
                  author: event.target.value,
                }))
              }
              placeholder="Autor"
            />
            <div className="grid grid-cols-[84px_minmax(0,1fr)] gap-2">
              <input
                className={inputClass}
                type="number"
                min="0"
                value={referenceForm.year}
                onChange={(event) =>
                  setReferenceForm((current) => ({
                    ...current,
                    year: event.target.value,
                  }))
                }
                placeholder="Año"
              />
              <input
                className={inputClass}
                value={referenceForm.title}
                onChange={(event) =>
                  setReferenceForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Título"
              />
            </div>
            <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-2">
              <Select
                className={inputClass}
                value={referenceForm.type}
                onChange={(event) =>
                  setReferenceForm((current) => ({
                    ...current,
                    type: event.target.value,
                  }))
                }
              >
                <SelectItem value="book">Libro</SelectItem>
                <SelectItem value="article">Artículo</SelectItem>
                <SelectItem value="web">Web</SelectItem>
              </Select>
              <input
                className={inputClass}
                value={referenceForm.publisher}
                onChange={(event) =>
                  setReferenceForm((current) => ({
                    ...current,
                    publisher: event.target.value,
                  }))
                }
                placeholder="Editorial"
              />
            </div>
            <input
              className={inputClass}
              value={referenceForm.journal}
              onChange={(event) =>
                setReferenceForm((current) => ({
                  ...current,
                  journal: event.target.value,
                }))
              }
              placeholder="Revista"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className={inputClass}
                value={referenceForm.doi}
                onChange={(event) =>
                  setReferenceForm((current) => ({
                    ...current,
                    doi: event.target.value,
                  }))
                }
                placeholder="DOI"
              />
              <input
                className={inputClass}
                value={referenceForm.url}
                onChange={(event) =>
                  setReferenceForm((current) => ({
                    ...current,
                    url: event.target.value,
                  }))
                }
                placeholder="URL"
              />
            </div>
            <Button
              type="submit"
              disabled={savingReference}
              className="h-9 w-full rounded-lg px-3 text-xs"
            >
              {savingReference ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FilePlus2 className="h-4 w-4" />
              )}
              Agregar referencia
            </Button>
          </form>

          <div className="space-y-2">
            {references.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white/70 p-3 text-xs text-slate-500">
                Aún no hay referencias.
              </div>
            ) : (
              references.map((reference) => (
                <div
                  key={reference.id}
                  className="flex items-start justify-between gap-2 rounded-xl border border-slate-200 bg-white/80 p-3"
                >
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-xs font-semibold text-slate-900">
                      {referenceLabel(reference)}
                    </p>
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                      <BookOpen className="h-3 w-3" />
                      {reference.type}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteReference(reference.id)}
                    className="shrink-0 rounded-lg p-2 text-rose-500 transition hover:bg-rose-50"
                    title="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

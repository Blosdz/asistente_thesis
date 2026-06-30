import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Bold,
  Bot,
  CirclePlus,
  Cloud,
  Download,
  Eye,
  FilePlus2,
  FileText,
  GripVertical,
  History,
  Italic,
  List,
  Loader2,
  Plus,
  Quote,
  RefreshCw,
  Save,
  Send,
  Sparkles,
  Trash2,
  Underline,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { buildApiUrl } from '../../../api/client';
import {
  actualizarRawDataDocumento,
  actualizarSeccionDocumentoWord,
  actualizarSeccionIndiceTesis,
  crearSeccionIndiceTesis,
  eliminarSeccionIndiceTesis,
  extraerIndiceDocumentoWord,
  extraerRawDataDocumento,
  generarDocumentoDocxTesis,
  obtenerPreviewDocumentoWord,
  obtenerRawDataDocumento,
  procesarDocumentoWord,
} from '../../../services/thesisService';

const toolbarButtons = [
  { id: 'bold', label: 'Negrita', icon: Bold },
  { id: 'italic', label: 'Cursiva', icon: Italic },
  { id: 'underline', label: 'Subrayado', icon: Underline },
];

const getDocumentName = (document) =>
  document?.nombre_archivo ||
  document?.nombre ||
  document?.file_name ||
  'Documento Word';

const getDocumentUrl = (document) =>
  document?.url_google_doc ||
  document?.url_archivo_drive ||
  document?.webViewLink ||
  null;

const getSectionId = (section) => section?.id || section?.section_id || '';

const getSectionTitle = (section) =>
  section?.heading || section?.title || section?.titulo || 'Seccion sin titulo';

const getSectionLevel = (section) => Number(section?.level || section?.nivel || 1);

const getSectionOrder = (section) =>
  Number(section?.order_index ?? section?.order ?? section?.orden ?? 0);

const getSectionContent = (section) =>
  section?.content || section?.contenido || '';

const getReferenceLabel = (reference) => {
  const authors = Array.isArray(reference?.authors) ? reference.authors : [];
  const authorNames = authors
    .map((author) =>
      [author?.last_name, author?.first_name].filter(Boolean).join(', '),
    )
    .filter(Boolean)
    .join('; ');
  const year = reference?.year || 's. f.';
  return `${authorNames || 'Sin autor'} (${year}). ${reference?.title || 'Sin titulo'}`;
};

const textToPreviewBlocks = (rawData) =>
  String(rawData || '')
    .split(/\n{2,}/)
    .map((text, index) => ({
      kind: index === 0 ? 'title' : 'paragraph',
      text: text.trim(),
      order_index: index,
    }))
    .filter((block) => block.text);

// ── Citation rendering helpers ───────────────────────────────────────────────

function formatInlineCitation(referenceId, references, inlineCitationConfig) {
  const refIndex = references.findIndex((r) => String(r.id) === String(referenceId));
  const ref = refIndex >= 0 ? references[refIndex] : null;
  if (!ref) return '[cita]';
  const mode = inlineCitationConfig?.mode || 'author_year';
  const authors = Array.isArray(ref.authors) ? ref.authors : [];
  if (mode === 'numeric') {
    const number = ref._order || refIndex + 1;
    return inlineCitationConfig?.templates?.single
      ? inlineCitationConfig.templates.single.replace('{number}', number)
      : `[${number}]`;
  }
  const tmpl =
    authors.length === 1
      ? inlineCitationConfig?.templates?.one_author
      : authors.length === 2
        ? inlineCitationConfig?.templates?.two_authors
        : inlineCitationConfig?.templates?.three_or_more_authors;
  const lastName = authors[0]?.last_name || 'Autor';
  const lastName2 = authors[1]?.last_name || '';
  const year = ref.year || 's. f.';
  return (tmpl || '({author_last}, {year})')
    .replace('{author_last}', lastName)
    .replace('{author_last_1}', lastName)
    .replace('{author_last_2}', lastName2)
    .replace('{year}', year)
    .replace('{title}', ref.title || '');
}

function renderParagraphText(text, references, activeFormat) {
  if (!text) return '';
  const inlineCitationConfig = activeFormat?.skeleton_json?.inline_citation;
  return text.replace(
    /\{\{cite:([^}]+)\}\}|\[cite:([^\]]+)\]/g,
    (_match, id1, id2) =>
      formatInlineCitation(id1 || id2, references, inlineCitationConfig),
  );
}

function applyHeadingNumbering(blocks) {
  const counters = [0, 0, 0, 0, 0, 0];
  return blocks.map((block) => {
    if (block.kind !== 'heading') return block;
    const lvl = Math.max(0, (block.level || 1) - 1);
    counters[lvl]++;
    counters.fill(0, lvl + 1);
    const prefix = counters
      .slice(0, lvl + 1)
      .filter(Boolean)
      .join('.');
    return { ...block, text: `${prefix}. ${block.text}` };
  });
}

function SectionNode({
  section,
  allSections,
  depth,
  activeSectionId,
  onSelectSection,
  onAddChild,
  onInsertSiblingAfter,
  onDeleteSection,
  addingId,
}) {
  const children = allSections.filter((s) => s.parent_id === section.id);
  const isActive = section.id === activeSectionId;
  const isAddingChild = addingId === section.id;
  const isAddingSibling = addingId === `sibling-${section.id}`;
  const isDeleting = addingId === `delete-${section.id}`;
  const canAddChild = section.level < 6;

  return (
    <div>
      <div
        className="group flex items-center gap-1"
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        <button
          type="button"
          onClick={() => onSelectSection(section)}
          className={[
            'flex min-w-0 flex-1 items-center gap-2 rounded-lg border p-2 text-left text-sm transition',
            isActive
              ? 'border-[#0066ff]/20 bg-[#0066ff]/10 text-[#0066ff] shadow-sm'
              : 'border-transparent text-[#424656] hover:bg-white/60',
          ].join(' ')}
        >
          <span className="shrink-0 rounded px-1 text-[9px] font-bold uppercase tracking-widest opacity-40">
            H{section.level}
          </span>
          <span className="min-w-0 flex-1 truncate font-medium">
            {section.title || section.heading || 'Sin título'}
          </span>
          {isActive && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#0066ff]" />}
        </button>

        {/* Action buttons — visible on hover */}
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            title={`Insertar ${section.level === 1 ? 'título' : 'subtítulo'} después (mismo nivel)`}
            disabled={!!addingId}
            onClick={(e) => { e.stopPropagation(); onInsertSiblingAfter(section); }}
            className="flex h-6 w-6 items-center justify-center rounded text-emerald-500/70 transition hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-40"
          >
            {isAddingSibling ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <CirclePlus className="h-3 w-3" />
            )}
          </button>
          {canAddChild && (
            <button
              type="button"
              title="Añadir subtítulo hijo"
              disabled={!!addingId}
              onClick={(e) => { e.stopPropagation(); onAddChild(section.id, section.level); }}
              className="flex h-6 w-6 items-center justify-center rounded text-[#0066ff]/60 transition hover:bg-[#0066ff]/10 hover:text-[#0066ff] disabled:opacity-40"
            >
              {isAddingChild ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Plus className="h-3 w-3" />
              )}
            </button>
          )}
          <button
            type="button"
            title="Eliminar sección"
            disabled={!!addingId}
            onClick={(e) => { e.stopPropagation(); onDeleteSection(section.id); }}
            className="flex h-6 w-6 items-center justify-center rounded text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
          >
            {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {children.map((child) => (
        <SectionNode
          key={child.id}
          section={child}
          allSections={allSections}
          depth={depth + 1}
          activeSectionId={activeSectionId}
          onSelectSection={onSelectSection}
          onAddChild={onAddChild}
          onInsertSiblingAfter={onInsertSiblingAfter}
          onDeleteSection={onDeleteSection}
          addingId={addingId}
        />
      ))}
    </div>
  );
}

export default function ThesisManualEditorPanel({
  thesisId,
  thesis = null,
  documents = [],
  currentVersion = null,
  documentId = '',
  editableDocument = null,
  hasThesisDocuments = false,
  onUploadEditableProgress,
  uploadingEditableProgress = false,
  onGenerated,
  onBack,
  availableFormats = [],
  activeFormat = null,
  onFormatChange = null,
  changingFormat = false,
  thesisIndex = [],
  onThesisIndexRefresh = null,
  className = '',
}) {
  const [sections, setSections] = useState([]);
  const [references, setReferences] = useState([]);
  const [rawData, setRawData] = useState('');
  const [previewBlocks, setPreviewBlocks] = useState([]);
  const [activeSectionId, setActiveSectionId] = useState('');
  const [draft, setDraft] = useState('');
  const activeSectionIdRef = useRef('');
  const textareaRef = useRef(null);
  const [citationOpen, setCitationOpen] = useState(false);
  const [citationCursor, setCitationCursor] = useState({ start: 0, end: 0 });
  const [selectedFormat, setSelectedFormat] = useState('H2 - Subtitulo 1');
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [sincronizando, setSincronizando] = useState(false);

  const activeDocument = editableDocument || currentVersion;

  const orderedSections = useMemo(
    () =>
      [...sections].sort(
        (a, b) =>
          getSectionOrder(a) - getSectionOrder(b) ||
          getSectionTitle(a).localeCompare(getSectionTitle(b)),
      ),
    [sections],
  );

  const activeSection = useMemo(
    () =>
      thesisIndex.find((s) => s.id === activeSectionId) ||
      orderedSections.find((section) => getSectionId(section) === activeSectionId) ||
      thesisIndex[0] ||
      orderedSections[0] ||
      null,
    [activeSectionId, orderedSections, thesisIndex],
  );

  const wordCount = useMemo(
    () => draft.trim().split(/\s+/).filter(Boolean).length,
    [draft],
  );

  const displayPreviewBlocks = useMemo(
    () =>
      previewBlocks.length > 0
        ? previewBlocks
        : textToPreviewBlocks(rawData || draft),
    [draft, previewBlocks, rawData],
  );

  const thesisDocumentsCount = useMemo(
    () =>
      documents.filter(
        (document) =>
          (document?.source || document?.tipo_documento_categoria || 'tesis') ===
          'tesis',
      ).length,
    [documents],
  );

  const loadDocumentContext = useCallback(async () => {
    if (!documentId) {
      setSections([]);
      setReferences([]);
      setRawData('');
      setPreviewBlocks([]);
      setActiveSectionId('');
      activeSectionIdRef.current = '';
      setDraft('');
      setLoadError('');
      return;
    }

    try {
      setLoading(true);
      setLoadError('');
      const [snapshotResult, previewResult] = await Promise.allSettled([
        obtenerRawDataDocumento(documentId),
        obtenerPreviewDocumentoWord(documentId),
      ]);

      if (snapshotResult.status === 'rejected') {
        throw snapshotResult.reason;
      }

      const snapshot = snapshotResult.value || {};
      const preview =
        previewResult.status === 'fulfilled' ? previewResult.value || {} : {};
      const nextSections = Array.isArray(snapshot.sections)
        ? snapshot.sections
        : Array.isArray(preview.sections)
          ? preview.sections
          : [];
      const nextReferences = Array.isArray(snapshot.references)
        ? snapshot.references
        : Array.isArray(preview.references)
          ? preview.references
          : [];
      const nextBlocks = Array.isArray(preview.blocks) ? preview.blocks : [];
      const nextRawData = snapshot.raw_data || '';

      setSections(nextSections);
      setReferences(nextReferences);
      setRawData(nextRawData);
      setPreviewBlocks(nextBlocks);

      // Use the ref to preserve selection across async calls without re-triggering the effect
      const currentId = activeSectionIdRef.current;
      const nextActiveSection =
        nextSections.find((section) => getSectionId(section) === currentId) ||
        nextSections[0] ||
        null;
      const nextActiveSectionId = getSectionId(nextActiveSection);
      setActiveSectionId(nextActiveSectionId);
      activeSectionIdRef.current = nextActiveSectionId;
      setDraft(nextActiveSection ? getSectionContent(nextActiveSection) : nextRawData);
    } catch (error) {
      console.error('Error loading Word editor context:', error);
      setLoadError(error?.message || 'No se pudo cargar el documento Word');
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    loadDocumentContext();
  }, [loadDocumentContext]);

  useEffect(() => {
    if (!activeSection) return;
    const content = getSectionContent(activeSection);
    // Only overwrite the draft when the section actually has content; avoids
    // clearing a draft that was already resolved via orderedSections title-match.
    if (content) setDraft(content);
  }, [activeSection]);

  const resolveDocSection = useCallback(
    (section) => {
      // Exact ID match against document sections
      const byId = orderedSections.find((s) => getSectionId(s) === getSectionId(section));
      if (byId) return byId;
      // Fallback: case-insensitive title match
      const heading = getSectionTitle(section).trim().toLowerCase();
      return orderedSections.find(
        (s) => (s.heading || s.title || '').trim().toLowerCase() === heading,
      ) || null;
    },
    [orderedSections],
  );

  const handleSelectSection = (section) => {
    const sectionId = getSectionId(section);
    setActiveSectionId(sectionId);
    activeSectionIdRef.current = sectionId;

    const directContent = getSectionContent(section);
    if (directContent) {
      setDraft(directContent);
      return;
    }
    // Section has no content (e.g. thesis-index section just after outline extraction):
    // resolve the matching document section and use its content.
    const docSection = resolveDocSection(section);
    setDraft(docSection ? getSectionContent(docSection) : '');
  };

  const handleInsertCitation = (reference) => {
    const token = `{{cite:${reference.id}}}`;
    setDraft((prev) =>
      prev.slice(0, citationCursor.start) + token + prev.slice(citationCursor.end),
    );
    setCitationOpen(false);
    setTimeout(() => {
      const el = textareaRef.current;
      if (!el) return;
      const pos = citationCursor.start + token.length;
      el.focus();
      el.setSelectionRange(pos, pos);
    }, 0);
  };

  const handleEditableProgressInput = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    await onUploadEditableProgress?.(file);
  };

  const handleProcessWord = async () => {
    if (!documentId) return;

    try {
      setProcessing(true);
      const snapshot = await procesarDocumentoWord(documentId);
      const nextSections = Array.isArray(snapshot?.sections) ? snapshot.sections : [];
      const nextReferences = Array.isArray(snapshot?.references) ? snapshot.references : [];
      setSections(nextSections);
      setReferences(nextReferences);
      setRawData(snapshot?.raw_data || '');
      const firstSection = nextSections[0] || null;
      setActiveSectionId(getSectionId(firstSection));
      setDraft(firstSection ? getSectionContent(firstSection) : snapshot?.raw_data || '');
      toast.success('Documento Word procesado');
      await loadDocumentContext();
    } catch (error) {
      console.error('Error processing Word document:', error);
      toast.error(error?.message || 'No se pudo procesar el Word');
    } finally {
      setProcessing(false);
    }
  };

  const handleSyncIndex = async () => {
    if (!documentId) return;
    try {
      setSincronizando(true);
      await extraerIndiceDocumentoWord(documentId, true);
      await onThesisIndexRefresh?.();
      toast.success('Índice sincronizado desde Word');
    } catch (error) {
      console.error('Error syncing index from Word:', error);
      toast.error(error?.message || 'No se pudo sincronizar el índice');
    } finally {
      setSincronizando(false);
    }
  };

  const handleExtractRawData = async () => {
    if (!documentId) return;

    try {
      setExtracting(true);
      const data = await extraerRawDataDocumento(documentId);
      setRawData(data?.raw_data || '');
      if (!activeSection) setDraft(data?.raw_data || '');
      toast.success('Texto extraido desde Word');
    } catch (error) {
      console.error('Error extracting raw data:', error);
      toast.error(error?.message || 'No se pudo extraer el texto del Word');
    } finally {
      setExtracting(false);
    }
  };

  const handleSave = async () => {
    if (!documentId) return;

    try {
      setSaving(true);
      if (activeSection) {
        // Resolve the actual document section (may differ from thesis-index section)
        const docSection = resolveDocSection(activeSection) || activeSection;
        const updated = await actualizarSeccionDocumentoWord(
          documentId,
          getSectionId(docSection),
          {
            content: draft,
            manual_override: true,
          },
        );
        setSections((current) =>
          current.map((section) =>
            getSectionId(section) === getSectionId(updated) ? updated : section,
          ),
        );
      } else {
        await actualizarRawDataDocumento(documentId, draft);
        setRawData(draft);
      }
      setLastSavedAt(new Date());
      toast.success('Cambios guardados');
      await loadDocumentContext();
    } catch (error) {
      console.error('Error saving Word edit:', error);
      toast.error(error?.message || 'No se pudo guardar el cambio');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = async (parentId, parentLevel) => {
    if (!thesisId) return;
    const markerKey = parentId ?? '__root__';
    try {
      setAddingId(markerKey);
      const siblingCount = parentId
        ? thesisIndex.filter((s) => s.parent_id === parentId).length
        : thesisIndex.filter((s) => !s.parent_id).length;
      const created = await crearSeccionIndiceTesis(thesisId, {
        title: parentId ? 'Nuevo subtítulo' : 'Nuevo título',
        level: parentId ? Math.min(parentLevel + 1, 6) : 1,
        order: siblingCount,
        parent_id: parentId ?? null,
        content: '',
      });
      await onThesisIndexRefresh?.();
      if (created?.id) setActiveSectionId(created.id);
    } catch (err) {
      toast.error(err?.message || 'No se pudo crear la sección');
    } finally {
      setAddingId(null);
    }
  };

  const handleInsertSiblingAfter = async (section) => {
    if (!thesisId) return;
    const markerKey = `sibling-${section.id}`;
    try {
      setAddingId(markerKey);
      const currentOrder = getSectionOrder(section);

      // Shift all siblings that come after the target section
      const siblings = thesisIndex.filter(
        (s) => s.parent_id === (section.parent_id ?? null) && s.id !== section.id,
      );
      const siblingsToShift = siblings
        .filter((s) => getSectionOrder(s) > currentOrder)
        .sort((a, b) => getSectionOrder(b) - getSectionOrder(a)); // descending to avoid conflicts

      for (const sibling of siblingsToShift) {
        await actualizarSeccionIndiceTesis(thesisId, sibling.id, {
          order: getSectionOrder(sibling) + 1,
        });
      }

      const created = await crearSeccionIndiceTesis(thesisId, {
        title: section.level === 1 ? 'Nuevo título' : 'Nuevo subtítulo',
        level: section.level,
        order: currentOrder + 1,
        parent_id: section.parent_id ?? null,
        content: '',
      });

      await onThesisIndexRefresh?.();
      if (created?.id) setActiveSectionId(created.id);
    } catch (err) {
      toast.error(err?.message || 'No se pudo insertar la sección');
    } finally {
      setAddingId(null);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!thesisId || !sectionId) return;
    try {
      setAddingId(`delete-${sectionId}`);
      await eliminarSeccionIndiceTesis(thesisId, sectionId);
      if (activeSectionId === sectionId) {
        setActiveSectionId('');
        setDraft('');
      }
      await onThesisIndexRefresh?.();
    } catch (err) {
      toast.error(err?.message || 'No se pudo eliminar la sección');
    } finally {
      setAddingId(null);
    }
  };

  const handleGenerateDocx = async () => {
    if (!thesisId) return;

    try {
      setGenerating(true);
      const document = await generarDocumentoDocxTesis(thesisId);
      toast.success('DOCX generado');
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
      console.error('Error generating DOCX:', error);
      toast.error(error?.message || 'No se pudo generar el DOCX');
    } finally {
      setGenerating(false);
    }
  };

  const zoomOut = () => setZoom((current) => Math.max(80, current - 10));
  const zoomIn = () => setZoom((current) => Math.min(120, current + 10));

  const documentUrl = getDocumentUrl(activeDocument);
  const hasStructuredData = orderedSections.length > 0 || thesisIndex.length > 0;

  return (
    <div
      className={`flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-2xl border border-white/60 bg-[#f0f7ff] text-[#191b24] shadow-[0_24px_60px_rgba(0,80,203,0.10)] ${className}`}
    >
      <header className="shrink-0 border-b border-white/60 bg-white/55 px-5 py-3 backdrop-blur-md">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="flex h-9 shrink-0 items-center gap-1 rounded-lg px-2 text-sm font-medium text-[#424656] transition hover:bg-[#0066ff]/10 hover:text-[#0066ff]"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </button>
            ) : null}
            <div className="hidden h-7 w-px bg-[#c2c6d8] sm:block" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-[#0066ff]/10 px-2 py-1 text-[10px] font-bold uppercase text-[#0066ff]">
                  Edicion Manual
                </span>
                {availableFormats.length > 0 && onFormatChange ? (
                  <select
                    value={activeFormat?.uname || ''}
                    onChange={(e) => onFormatChange(e.target.value)}
                    disabled={changingFormat}
                    className="h-7 rounded border border-[#c2c6d8]/70 bg-[#e1e2ee] px-2 text-[10px] font-bold text-[#424656] outline-none transition focus:border-[#0066ff] focus:ring-1 focus:ring-[#0066ff]/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {availableFormats.map((f) => (
                      <option key={f.uname} value={f.uname}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="rounded bg-[#e1e2ee] px-2 py-1 text-[10px] font-bold text-[#424656]">
                    {activeFormat?.name || thesis?.doc_thesis_format || 'APA 7'}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#727687]">
                  <Cloud className="h-3.5 w-3.5" />
                  {lastSavedAt
                    ? `Guardado ${lastSavedAt.toLocaleTimeString('es-PE', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}`
                    : activeDocument
                      ? getDocumentName(activeDocument)
                      : 'Sin Word editable'}
                </span>
              </div>
              <h2 className="mt-1 truncate text-lg font-semibold text-[#191b24]">
                {thesis?.titulo || 'Editor de tesis'}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleProcessWord}
              disabled={!documentId || processing}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#0066ff]/40 bg-white/50 px-4 text-sm font-semibold text-[#0066ff] backdrop-blur transition hover:bg-[#0066ff] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Procesar Word
            </button>
            <button
              type="button"
              onClick={handleGenerateDocx}
              disabled={!thesisId || generating}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#0066ff]/40 bg-white/50 px-4 text-sm font-semibold text-[#0066ff] backdrop-blur transition hover:bg-[#0066ff] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Exportar DOCX
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!documentId || saving}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0066ff] px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(0,102,255,0.22)] transition hover:bg-[#0050cb] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar cambios
            </button>
          </div>
        </div>
      </header>

      {!documentId ? (
        <div className="flex min-h-0 flex-1 items-center justify-center p-6">
          <div className="max-w-xl rounded-2xl border border-dashed border-[#0066ff]/30 bg-white/70 p-8 text-center shadow-[0_10px_30px_rgba(0,102,255,0.05)] backdrop-blur">
            <FileText className="mx-auto h-12 w-12 text-[#0066ff]" />
            <h3 className="mt-4 text-lg font-semibold text-[#191b24]">
              {hasThesisDocuments
                ? 'Selecciona o sube un Word editable'
                : 'Aun no hay avance Word editable'}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#424656]">
              La edicion manual trabaja sobre DOCX o DOCM porque el servicio
              `thesis-doc-generator` extrae secciones, referencias y preview
              desde Word.
            </p>
            {onUploadEditableProgress ? (
              <label
                className={`mt-5 inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#0066ff] px-4 text-sm font-semibold text-white transition hover:bg-[#0050cb] ${
                  uploadingEditableProgress ? 'pointer-events-none opacity-70' : ''
                }`}
              >
                {uploadingEditableProgress ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FilePlus2 className="h-4 w-4" />
                )}
                {uploadingEditableProgress ? 'Subiendo...' : 'Subir avance Word'}
                <input
                  type="file"
                  accept=".docx,.docm,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-word.document.macroEnabled.12"
                  className="hidden"
                  onChange={handleEditableProgressInput}
                  disabled={!thesisId || uploadingEditableProgress}
                />
              </label>
            ) : null}
          </div>
        </div>
      ) : (
        <main className="grid min-h-0 flex-1 gap-4 overflow-hidden p-4 xl:grid-cols-[minmax(280px,25%)_minmax(420px,1fr)_minmax(320px,30%)]">
          <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-[0_10px_30px_rgba(0,102,255,0.05)] backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/60 bg-white/35 p-4">
              <h3 className="flex items-center gap-2 text-base font-semibold text-[#191b24]">
                <List className="h-5 w-5 text-[#0066ff]" />
                Estructura Word
              </h3>
              <div className="flex items-center gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin text-[#0066ff]" /> : null}
                {documentId ? (
                  <button
                    type="button"
                    title="Sincronizar índice desde el Word (reemplaza el actual)"
                    disabled={sincronizando}
                    onClick={handleSyncIndex}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[#0066ff] transition hover:bg-[#0066ff]/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sincronizando ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                    Sincronizar
                  </button>
                ) : null}
              </div>
            </div>

            <div className="flex-1 space-y-1 overflow-y-auto p-3">
              {loadError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="mb-2 h-4 w-4" />
                  {loadError}
                </div>
              ) : !hasStructuredData ? (
                <div className="rounded-lg border border-dashed border-[#c2c6d8] bg-white/60 p-3 text-sm leading-6 text-[#424656]">
                  No hay secciones estructuradas. Procesa el Word para extraer
                  encabezados y contenido editable.
                </div>
              ) : thesisIndex.length > 0 ? (
                thesisIndex
                  .filter((s) => !s.parent_id)
                  .map((s) => (
                    <SectionNode
                      key={s.id}
                      section={s}
                      allSections={thesisIndex}
                      depth={0}
                      activeSectionId={activeSectionId}
                      onSelectSection={handleSelectSection}
                      onAddChild={(parentId, parentLevel) => handleAddSection(parentId, parentLevel)}
                      onInsertSiblingAfter={handleInsertSiblingAfter}
                      onDeleteSection={handleDeleteSection}
                      addingId={addingId}
                    />
                  ))
              ) : (
                orderedSections.map((section, index) => {
                  const sectionId = getSectionId(section);
                  const isActive = sectionId === getSectionId(activeSection);
                  const level = Math.max(1, getSectionLevel(section));

                  return (
                    <button
                      key={sectionId || `${getSectionTitle(section)}-${index}`}
                      type="button"
                      onClick={() => handleSelectSection(section)}
                      className={`group flex w-full items-center gap-2 rounded-lg border p-2 text-left transition ${
                        isActive
                          ? 'border-[#0066ff]/20 bg-[#0066ff]/10 text-[#0066ff] shadow-sm'
                          : 'border-transparent text-[#424656] hover:bg-white/60'
                      }`}
                      style={{ paddingLeft: `${8 + (level - 1) * 16}px` }}
                    >
                      <GripVertical className="h-4 w-4 shrink-0 text-[#c2c6d8] opacity-0 transition group-hover:opacity-100" />
                      <span className="w-8 shrink-0 text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        {getSectionTitle(section)}
                      </span>
                      {isActive ? (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#0066ff]" />
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>

            <div className="border-t border-white/60 bg-white/35 p-3 space-y-2">
              {thesisIndex.length > 0 ? (
                <button
                  type="button"
                  onClick={() => handleAddSection(null, 0)}
                  disabled={!!addingId}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#0066ff]/50 text-sm font-semibold text-[#0066ff] transition hover:bg-[#0066ff]/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {addingId === '__root__' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Añadir título
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleExtractRawData}
                  disabled={extracting}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#0066ff]/50 text-sm font-semibold text-[#0066ff] transition hover:bg-[#0066ff]/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {extracting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Extraer texto Word
                </button>
              )}
            </div>
          </aside>

          <section className="flex min-h-0 flex-col gap-4 overflow-hidden">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-[0_10px_30px_rgba(0,102,255,0.05)] backdrop-blur">
              <div className="flex flex-col gap-3 border-b border-white/60 bg-white/35 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={selectedFormat}
                    onChange={(event) => setSelectedFormat(event.target.value)}
                    className="h-9 rounded-md border border-[#c2c6d8]/70 bg-white/60 px-2 text-sm font-medium text-[#191b24] outline-none transition focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/20"
                  >
                    <option>H1 - Titulo Principal</option>
                    <option>H2 - Subtitulo 1</option>
                    <option>H3 - Subtitulo 2</option>
                    <option>Parrafo</option>
                  </select>
                  <div className="h-5 w-px bg-[#c2c6d8]/70" />
                  <div className="flex gap-1">
                    {toolbarButtons.map((item) => {
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          title={item.label}
                          className="flex h-8 w-8 items-center justify-center rounded text-[#424656] transition hover:bg-white/90 hover:text-[#191b24]"
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-5 w-px bg-[#c2c6d8]/70" />
                  <div className="relative">
                    <button
                      type="button"
                      disabled={references.length === 0}
                      onClick={() => {
                        const el = textareaRef.current;
                        setCitationCursor({
                          start: el?.selectionStart ?? draft.length,
                          end: el?.selectionEnd ?? draft.length,
                        });
                        setCitationOpen((o) => !o);
                      }}
                      className="inline-flex h-8 items-center gap-1 rounded px-2 text-xs font-semibold text-[#424656] transition hover:bg-white/90 hover:text-[#191b24] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Quote className="h-4 w-4" />
                      Citar
                    </button>
                    {citationOpen && references.length > 0 && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setCitationOpen(false)}
                        />
                        <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-xl border border-[#c2c6d8]/40 bg-white shadow-lg">
                          <p className="border-b border-[#c2c6d8]/20 px-3 py-2 text-[11px] font-bold uppercase text-[#727687]">
                            Insertar cita
                          </p>
                          <div className="max-h-48 overflow-y-auto py-1">
                            {references.map((ref) => (
                              <button
                                key={ref.id}
                                type="button"
                                onClick={() => handleInsertCitation(ref)}
                                className="w-full px-3 py-2 text-left text-xs text-[#424656] hover:bg-[#ecedfa]"
                              >
                                {getReferenceLabel(ref)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <span className="text-xs font-semibold text-[#727687]">
                  {wordCount} palabras
                </span>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto bg-white/60 p-6">
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase text-[#727687]">
                    {activeSection ? `Nivel ${getSectionLevel(activeSection)}` : 'Texto base'}
                  </p>
                  <h3 className="font-serif text-2xl font-bold text-[#191b24]">
                    {activeSection ? getSectionTitle(activeSection) : getDocumentName(activeDocument)}
                  </h3>
                </div>
                <textarea
                  ref={textareaRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  className="h-[calc(100%-4rem)] min-h-[320px] w-full resize-none border-none bg-transparent font-serif text-base leading-8 text-[#191b24] outline-none placeholder:text-[#727687]"
                  placeholder="Procesa o extrae texto desde el Word para editar aqui."
                  spellCheck="true"
                />
              </div>
            </div>

            <div className="flex h-[250px] shrink-0 flex-col overflow-hidden rounded-2xl border border-white/60 border-t-[#0066ff] border-t-4 bg-white/70 shadow-[0_10px_30px_rgba(0,102,255,0.05)] backdrop-blur">
              <div className="flex flex-col gap-2 border-b border-[#0066ff]/10 bg-[#0066ff]/5 p-3 md:flex-row md:items-center md:justify-between">
                <h3 className="flex items-center gap-2 text-sm font-bold text-[#0066ff]">
                  <Sparkles className="h-4 w-4" />
                  Asistente IA
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button className="rounded border border-[#c2c6d8]/40 bg-white px-2 py-1 text-[11px] font-semibold text-[#424656] transition hover:bg-[#ecedfa]">
                    Mejorar redaccion
                  </button>
                  <button className="rounded border border-[#c2c6d8]/40 bg-white px-2 py-1 text-[11px] font-semibold text-[#424656] transition hover:bg-[#ecedfa]">
                    Buscar referencias
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-white/50 p-4">
                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#0066ff]/20 text-[#0066ff]">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-lg rounded-tl-none border border-[#c2c6d8]/30 bg-white p-3 text-sm leading-6 text-[#424656] shadow-sm">
                    Puedo trabajar sobre la seccion activa del Word. Usa el
                    texto ya extraido para pedir mejora de tono, validacion de
                    citas o sugerencias por apartado.
                  </div>
                </div>
              </div>

              <div className="border-t border-white/60 bg-white/80 p-3">
                <div className="flex items-center gap-2 rounded-xl border border-[#c2c6d8]/40 bg-[#ecedfa] px-3 py-2 transition focus-within:border-[#0066ff] focus-within:ring-1 focus-within:ring-[#0066ff]">
                  <input
                    className="min-w-0 flex-1 border-none bg-transparent p-0 text-sm text-[#191b24] outline-none placeholder:text-[#727687]"
                    placeholder="Habla con la IA para mejorar esta seccion..."
                    type="text"
                  />
                  <button
                    type="button"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0066ff] text-white transition hover:bg-[#0050cb]"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-[0_10px_30px_rgba(0,102,255,0.05)] backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/60 bg-white/35 p-4">
              <h3 className="flex items-center gap-2 text-base font-semibold text-[#191b24]">
                <Eye className="h-5 w-5 text-[#0066ff]" />
                Preview Word
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={zoomOut}
                  className="rounded p-1 text-[#424656] transition hover:text-[#0066ff]"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm font-semibold text-[#424656]">
                  {zoom}%
                </span>
                <button
                  type="button"
                  onClick={zoomIn}
                  className="rounded p-1 text-[#424656] transition hover:text-[#0066ff]"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#e8f2ff]/50 p-4 md:p-6">
              <div
                className="mx-auto w-full max-w-[420px] origin-top border border-[#c2c6d8]/30 bg-white p-8 font-serif text-[11px] leading-[1.8] text-gray-800 shadow-md"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
              >
                {/* TOC from thesis index */}
                {thesisIndex.length > 0 && (
                  <div className="mb-6 border-b border-gray-200 pb-5">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Índice
                    </p>
                    {thesisIndex.map((section) => (
                      <div
                        key={section.id}
                        className="flex items-baseline justify-between gap-2 py-0.5"
                        style={{ paddingLeft: `${((section.level || 1) - 1) * 10}px` }}
                      >
                        <span className="truncate text-[10px] text-gray-700">
                          {section.title || section.heading}
                        </span>
                        <span className="shrink-0 text-[9px] text-gray-300">·····</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Content blocks */}
                {displayPreviewBlocks.length === 0 && thesisIndex.length === 0 ? (
                  <div className="flex min-h-[200px] items-center justify-center text-center text-xs text-gray-500">
                    Procesa el Word para generar la vista previa estructurada.
                  </div>
                ) : (
                  (() => {
                    const useNumbering =
                      activeFormat?.word_settings_json?.headings?.numbering === 'decimal';
                    const numberedBlocks = useNumbering
                      ? applyHeadingNumbering(displayPreviewBlocks)
                      : displayPreviewBlocks;

                    return numberedBlocks.map((block, index) => {
                      const isActiveBlock =
                        activeSection &&
                        block.section_id &&
                        String(block.section_id) === String(getSectionId(activeSection));

                      if (block.kind === 'title') {
                        return (
                          <h3
                            key={`${block.kind}-${index}`}
                            className="mb-5 text-center text-[13px] font-bold uppercase"
                          >
                            {block.text}
                          </h3>
                        );
                      }

                      if (block.kind === 'heading') {
                        const HeadingTag = block.level && block.level <= 2 ? 'h4' : 'h5';
                        return (
                          <HeadingTag
                            key={`${block.kind}-${index}`}
                            className={`mb-3 mt-5 font-bold ${isActiveBlock ? 'text-[#0066ff]' : ''}`}
                          >
                            {block.text}
                          </HeadingTag>
                        );
                      }

                      const renderedText = renderParagraphText(
                        block.text,
                        references,
                        activeFormat,
                      );

                      return (
                        <p
                          key={`${block.kind}-${index}`}
                          className={`mb-4 text-justify ${isActiveBlock ? 'bg-[#0066ff]/5' : ''}`}
                        >
                          {renderedText}
                        </p>
                      );
                    });
                  })()
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-white/60 bg-white/55 p-3 text-xs font-semibold text-[#424656]">
              {documentUrl ? (
                <a
                  href={documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-white/70 px-2 py-2 transition hover:text-[#0066ff]"
                >
                  <FileText className="h-3.5 w-3.5 text-[#0066ff]" />
                  Abrir Word
                </a>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-lg bg-white/70 px-2 py-2">
                  <FileText className="h-3.5 w-3.5 text-[#0066ff]" />
                  {getDocumentName(activeDocument)}
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-lg bg-white/70 px-2 py-2">
                <History className="h-3.5 w-3.5 text-[#0066ff]" />
                {thesisDocumentsCount} docs
              </span>
            </div>

            {references.length > 0 ? (
              <div className="max-h-36 overflow-y-auto border-t border-white/60 bg-white/45 p-3">
                <p className="mb-2 text-xs font-bold uppercase text-[#727687]">
                  Referencias extraidas
                </p>
                <div className="space-y-2">
                  {references.slice(0, 5).map((reference) => (
                    <p
                      key={reference.id || reference.title}
                      className="rounded-lg bg-white/70 px-2 py-2 text-xs leading-5 text-[#424656]"
                    >
                      {getReferenceLabel(reference)}
                    </p>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </main>
      )}
    </div>
  );
}

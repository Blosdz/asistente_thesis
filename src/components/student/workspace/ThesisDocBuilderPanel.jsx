import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Download,
  FilePlus2,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  Wand2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { buildApiUrl } from '../../../api/client';
import {
  actualizarSeccionIndiceTesis,
  actualizarRawDataDocumento,
  actualizarFormatoDocTesis,
  crearReferenciaTesis,
  crearSeccionIndiceTesis,
  eliminarReferenciaTesis,
  eliminarSeccionIndiceTesis,
  extraerRawDataDocumento,
  generarDocumentoDocxTesis,
  obtenerRawDataDocumento,
  obtenerIndiceTesis,
  obtenerReferenciasTesis,
  subirCaratulaTesis,
} from '../../../services/thesisService';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import Modal from '../../ui/modal';
import { Select, SelectItem } from '../../ui/select';
import ThesisPreviewPanel from './ThesisPreviewPanel';
import { referenceLabel } from '../../../lib/citationFormat';

const emptySection = {
  title: '',
  subtitle: '',
  subsections: [],
  level: 1,
  order: 1,
  content: '',
};

const emptySubsection = {
  title: '',
  content: '',
};

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

const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const PDF_MIME = 'application/pdf';

const DEFAULT_DOC_THESIS_FORMATS = [
  { uname: 'apa7', name: 'APA 7', citation_type: 'author_year' },
  { uname: 'mla', name: 'MLA', citation_type: 'author_year' },
  { uname: 'vancouver', name: 'Vancouver', citation_type: 'numeric' },
  { uname: 'ieee', name: 'IEEE', citation_type: 'numeric' },
  { uname: 'iso690', name: 'ISO 690', citation_type: 'author_year' },
];

const inputClass =
  'h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100';

const textareaClass =
  'w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100';

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

const normalizeCitationFormat = (value) => {
  const normalized = String(value || 'apa7').replace(/[-_\s]+/g, '').toLowerCase();
  if (!normalized) return 'apa7';
  if (normalized === 'vancouver') return 'vancouver';
  if (normalized === 'ieee') return 'ieee';
  if (normalized === 'mla') return 'mla';
  if (normalized === 'iso690' || normalized === 'iso') return 'iso690';
  return normalized;
};

const citationFormatFromThesis = (thesis) =>
  normalizeCitationFormat(
    thesis?.doc_thesis_format ||
      thesis?.citation_style ||
      thesis?.metadata?.doc_thesis_format ||
      thesis?.metadata?.citation_style ||
      thesis?.style,
  );

const citationFormatLabel = (format) =>
  ({
    apa7: 'APA 7',
    mla: 'MLA',
    vancouver: 'Vancouver',
    ieee: 'IEEE',
    iso690: 'ISO 690',
  })[format] || String(format || 'apa7').toUpperCase();

const citationTypeLabel = (citationType) =>
  citationType === 'numeric' ? 'Numérico' : 'Autor-año';

const inlineCitationLabel = (reference, format = 'apa7', number = 1) => {
  if (format === 'vancouver') return `(${number})`;
  if (format === 'ieee') return `[${number}]`;

  const authors = Array.isArray(reference?.authors) ? reference.authors : [];
  const lastNames = authors
    .map((author) => author?.last_name)
    .filter(Boolean);
  const authorText =
    lastNames.length === 0
      ? reference?.title || 'Sin autor'
      : lastNames.length === 1
        ? lastNames[0]
        : lastNames.length === 2
          ? `${lastNames[0]} & ${lastNames[1]}`
          : `${lastNames[0]} et al.`;

  // MLA in-text is (Author Page); without a per-citation page we show author only.
  if (format === 'mla') return `(${authorText})`;

  const formattedAuthor = format === 'iso690' ? authorText.toUpperCase() : authorText;
  return `(${formattedAuthor}, ${reference?.year || 's. f.'})`;
};

const renderCitationTokens = (text, refs, format) => {
  if (!text) return '';
  return text.replace(
    /\{\{cite:([^}]+)\}\}|\[cite:([^\]]+)\]/g,
    (_m, id1, id2) => {
      const refId = id1 || id2;
      const idx = refs.findIndex((r) => String(r.id) === String(refId));
      return inlineCitationLabel(idx >= 0 ? refs[idx] : {}, format, idx >= 0 ? idx + 1 : 1);
    },
  );
};

const normalizeSubsections = (section) => {
  if (Array.isArray(section?.subsections) && section.subsections.length > 0) {
    return section.subsections.map((subsection) => ({
      title: subsection?.title || '',
      content: subsection?.content || '',
    }));
  }

  if (section?.subtitle) {
    return [{ title: section.subtitle, content: '' }];
  }

  return [];
};

const getNextOrder = (sections) => {
  const orders = sections
    .map((section) => Number(section.order))
    .filter((order) => Number.isFinite(order));

  return orders.length > 0 ? Math.max(...orders) + 1 : 1;
};

const sectionToForm = (section) => ({
  title: section?.title || '',
  subtitle: section?.subtitle || '',
  subsections: normalizeSubsections(section),
  level: section?.level || 1,
  order: section?.order || 1,
  content: section?.content || '',
});

export default function ThesisDocBuilderPanel({
  tesisId,
  thesis = null,
  docThesisFormats = [],
  documentId,
  previewUrl = null,
  editableDocument = null,
  hasThesisDocuments = false,
  onUploadEditableProgress,
  uploadingEditableProgress = false,
  onGenerated,
  onThesisUpdated,
  onBack,
  className = '',
}) {
  const [activeTab, setActiveTab] = useState('index');
  const [sections, setSections] = useState([]);
  const [references, setReferences] = useState([]);
  const [sectionForm, setSectionForm] = useState(emptySection);
  const [referenceForm, setReferenceForm] = useState(emptyReference);
  const [selectedItem, setSelectedItem] = useState({ type: 'new-heading' });
  const [citationTarget, setCitationTarget] = useState({
    type: 'heading',
    field: 'content',
    index: null,
    start: null,
    end: null,
  });
  const [rawData, setRawData] = useState('');
  const [loadingRawData, setLoadingRawData] = useState(false);
  const [savingRawData, setSavingRawData] = useState(false);
  const [extractingRawData, setExtractingRawData] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingSection, setSavingSection] = useState(false);
  const [savingReference, setSavingReference] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverMetadata, setCoverMetadata] = useState(null);
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [formatModalMode, setFormatModalMode] = useState('save');

  const thesisCitationFormat = citationFormatFromThesis(thesis);
  const [selectedCitationFormat, setSelectedCitationFormat] =
    useState(thesisCitationFormat);
  const [pendingCitationFormat, setPendingCitationFormat] =
    useState(thesisCitationFormat);
  const citationLabel = citationFormatLabel(selectedCitationFormat);
  const coverFileName =
    coverMetadata?.cover_docx_original_name ||
    thesis?.metadata?.cover_docx_original_name ||
    null;
  const editableDocumentName =
    editableDocument?.nombre ||
    editableDocument?.nombre_archivo ||
    null;

  const formatOptions = useMemo(
    () =>
      (docThesisFormats?.length ? docThesisFormats : DEFAULT_DOC_THESIS_FORMATS)
        .map((format) => ({
          ...format,
          uname: normalizeCitationFormat(format.uname),
          name: format.name || citationFormatLabel(format.uname),
        }))
        .filter((format) => format.uname),
    [docThesisFormats],
  );
  const selectedFormatOption =
    formatOptions.find((format) => format.uname === selectedCitationFormat) ||
    formatOptions[0];
  const pendingFormatOption =
    formatOptions.find((format) => format.uname === pendingCitationFormat) ||
    selectedFormatOption;

  const orderedSections = useMemo(
    () =>
      [...sections].sort(
        (a, b) =>
          Number(a.order || 0) - Number(b.order || 0) ||
          new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime(),
      ),
    [sections],
  );

  const displaySections = useMemo(
    () =>
      orderedSections.map((section) =>
        editingSectionId === section.id
          ? {
              ...section,
              title: sectionForm.title,
              subtitle: sectionForm.subsections[0]?.title || sectionForm.subtitle || null,
              subsections: sectionForm.subsections,
              level: Number(sectionForm.level || section.level || 1),
              order: Number(sectionForm.order || section.order || 0),
              content: sectionForm.content,
            }
          : section,
      ),
    [editingSectionId, orderedSections, sectionForm],
  );

  const selectedSubsection =
    selectedItem?.type === 'subsection'
      ? sectionForm.subsections[selectedItem.index]
      : null;

  const selectedSectionNumber =
    sectionForm.order || getNextOrder(orderedSections);

  const selectedSubsectionNumber =
    selectedItem?.type === 'subsection'
      ? `${selectedSectionNumber}.${selectedItem.index + 1}`
      : null;

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
      const nextSections = indexData || [];
      setSections(nextSections);
      setReferences(referencesData || []);
      setSectionForm((current) => ({
        ...current,
        order: current.order || getNextOrder(nextSections),
      }));
    } catch (error) {
      console.error('Error loading thesis builder data:', error);
      toast.error('No se pudo cargar la estructura documental');
    } finally {
      setLoading(false);
    }
  }, [tesisId]);

  const loadRawData = useCallback(async () => {
    if (!documentId) {
      setRawData('');
      return;
    }

    try {
      setLoadingRawData(true);
      const data = await obtenerRawDataDocumento(documentId);
      setRawData(data?.raw_data || '');
    } catch (error) {
      console.error('Error loading raw data:', error);
      toast.error(error?.message || 'No se pudo cargar el texto base');
    } finally {
      setLoadingRawData(false);
    }
  }, [documentId]);

  useEffect(() => {
    setEditingSectionId(null);
    setSelectedItem({ type: 'new-heading' });
    setSectionForm(emptySection);
    setReferenceForm(emptyReference);
    loadData();
  }, [loadData]);

  useEffect(() => {
    setSelectedCitationFormat(thesisCitationFormat);
    if (!showFormatModal) {
      setPendingCitationFormat(thesisCitationFormat);
    }
  }, [showFormatModal, thesisCitationFormat]);

  useEffect(() => {
    if (activeTab === 'raw') {
      loadRawData();
    }
  }, [activeTab, loadRawData]);

  const handleAddHeading = () => {
    setActiveTab('index');
    setEditingSectionId(null);
    setSelectedItem({ type: 'new-heading' });
    setCitationTarget({
      type: 'heading',
      field: 'content',
      index: null,
      start: null,
      end: null,
    });
    setSectionForm({
      ...emptySection,
      order: getNextOrder(orderedSections),
    });
  };

  const handleSelectHeading = (section) => {
    setActiveTab('index');
    setEditingSectionId(section.id);
    setSelectedItem({ type: 'heading', sectionId: section.id });
    setCitationTarget({
      type: 'heading',
      field: 'content',
      index: null,
      start: null,
      end: null,
    });
    setSectionForm(sectionToForm(section));
  };

  const handleSelectSubsection = (section, index) => {
    setActiveTab('index');
    setEditingSectionId(section.id);
    setSelectedItem({ type: 'subsection', sectionId: section.id, index });
    setCitationTarget({
      type: 'subsection',
      field: 'content',
      index,
      start: null,
      end: null,
    });
    setSectionForm(sectionToForm(section));
  };

  const handleAddSubsection = () => {
    if (!editingSectionId) {
      toast.error('Guarda o selecciona un título antes de agregar subtítulos');
      return;
    }

    const nextIndex = sectionForm.subsections.length;
    setSectionForm((current) => ({
      ...current,
      subsections: [...current.subsections, { ...emptySubsection }],
    }));
    setSelectedItem({
      type: 'subsection',
      sectionId: editingSectionId,
      index: nextIndex,
    });
    setCitationTarget({
      type: 'subsection',
      field: 'content',
      index: nextIndex,
      start: null,
      end: null,
    });
  };

  const rememberCitationTarget = (target) => (event) => {
    const start =
      typeof event.target.selectionStart === 'number'
        ? event.target.selectionStart
        : null;
    const end =
      typeof event.target.selectionEnd === 'number'
        ? event.target.selectionEnd
        : start;

    setCitationTarget({
      ...target,
      start,
      end,
    });
  };

  const citationTargetProps = (target) => ({
    onClick: rememberCitationTarget(target),
    onFocus: rememberCitationTarget(target),
    onKeyUp: rememberCitationTarget(target),
    onSelect: rememberCitationTarget(target),
  });

  const insertAtSelection = (value, token, start, end) => {
    const text = value || '';
    const safeStart =
      typeof start === 'number' && start >= 0 ? Math.min(start, text.length) : text.length;
    const safeEnd =
      typeof end === 'number' && end >= safeStart
        ? Math.min(end, text.length)
        : safeStart;
    const before = text.slice(0, safeStart);
    const after = text.slice(safeEnd);
    const prefix = before && !/\s$/.test(before) ? ' ' : '';
    const suffix = after && !/^\s/.test(after) ? ' ' : '';

    return `${before}${prefix}${token}${suffix}${after}`;
  };

  const handleInsertCitation = (reference) => {
    const referenceIndex = references.findIndex((item) => item.id === reference.id);
    const referenceNumber = referenceIndex >= 0 ? referenceIndex + 1 : 1;
    const citationText = `{{cite:${reference.id}}}`;
    const citationDisplayLabel = inlineCitationLabel(
      reference,
      selectedCitationFormat,
      referenceNumber,
    );
    const target =
      selectedItem?.type === 'subsection'
        ? citationTarget?.type === 'subsection'
          ? citationTarget
          : {
              type: 'subsection',
              field: 'content',
              index: selectedItem.index,
              start: null,
              end: null,
            }
        : citationTarget?.type === 'heading'
          ? citationTarget
          : {
              type: 'heading',
              field: 'content',
              index: null,
              start: null,
              end: null,
            };

    if (target.type === 'subsection') {
      const index =
        typeof target.index === 'number' ? target.index : selectedItem?.index;
      if (typeof index !== 'number') return;

      setSectionForm((current) => ({
        ...current,
        subsections: current.subsections.map((subsection, subsectionIndex) =>
          subsectionIndex === index
            ? {
                ...subsection,
                [target.field === 'title' ? 'title' : 'content']: insertAtSelection(
                  subsection[target.field === 'title' ? 'title' : 'content'],
                  citationText,
                  target.start,
                  target.end,
                ),
              }
            : subsection,
        ),
      }));
      setCitationTarget({
        type: 'subsection',
        field: target.field === 'title' ? 'title' : 'content',
        index,
        start: null,
        end: null,
      });
    } else {
      const field = target.field === 'title' ? 'title' : 'content';
      setSectionForm((current) => ({
        ...current,
        [field]: insertAtSelection(current[field], citationText, target.start, target.end),
      }));
      setCitationTarget({
        type: 'heading',
        field,
        index: null,
        start: null,
        end: null,
      });
    }

    toast.success(`Cita ${citationLabel} ${citationDisplayLabel} insertada`);
  };

  const updateSelectedSubsection = (field, value) => {
    if (selectedItem?.type !== 'subsection') return;

    setSectionForm((current) => ({
      ...current,
      subsections: current.subsections.map((subsection, index) =>
        index === selectedItem.index ? { ...subsection, [field]: value } : subsection,
      ),
    }));
  };

  const buildSectionPayload = (form) => {
    const title = form.title.trim();
    const level = Number(form.level || 1);
    const order = Number(form.order);

    if (!title) {
      toast.error('El título es requerido');
      return null;
    }
    if (![1, 2, 3].includes(level)) {
      toast.error('Selecciona un nivel de título válido');
      return null;
    }
    if (Number.isNaN(order) || order < 0) {
      toast.error('El orden es requerido y debe ser mayor o igual a 0');
      return null;
    }

    const subsections = form.subsections
      .map((subsection) => ({
        title: subsection.title.trim(),
        content: subsection.content.trim(),
      }))
      .filter((subsection) => subsection.title);

    return {
      title,
      subtitle: subsections[0]?.title || null,
      subsections,
      level,
      order,
      content: form.content.trim(),
    };
  };

  const saveSection = async () => {
    if (!tesisId) return;

    const payload = buildSectionPayload(sectionForm);
    if (!payload) return;

    if (selectedItem?.type === 'subsection') {
      const subsection = sectionForm.subsections[selectedItem.index];
      if (!subsection?.title?.trim()) {
        toast.error('El título del subtítulo es requerido');
        return;
      }
    }

    try {
      setSavingSection(true);
      const savedSection = editingSectionId
        ? await actualizarSeccionIndiceTesis(tesisId, editingSectionId, payload)
        : await crearSeccionIndiceTesis(tesisId, payload);

      await loadData();
      const nextForm = sectionToForm(savedSection);
      setEditingSectionId(savedSection.id);
      setSectionForm(nextForm);
      setSelectedItem((current) => {
        if (current?.type === 'subsection' && nextForm.subsections.length > 0) {
          return {
            type: 'subsection',
            sectionId: savedSection.id,
            index: Math.min(current.index, nextForm.subsections.length - 1),
          };
        }

        return { type: 'heading', sectionId: savedSection.id };
      });
      toast.success(editingSectionId ? 'Título actualizado' : 'Título agregado');
    } catch (error) {
      console.error('Error saving index section:', error);
      toast.error(error?.message || 'No se pudo guardar el título');
    } finally {
      setSavingSection(false);
    }
  };

  const handleSaveSection = async (event) => {
    event?.preventDefault?.();
    await saveSection();
  };

  const handleCancelEditor = () => {
    if (editingSectionId) {
      const section = sections.find((item) => item.id === editingSectionId);
      if (section) {
        setSectionForm(sectionToForm(section));
        setSelectedItem({ type: 'heading', sectionId: section.id });
        return;
      }
    }

    handleAddHeading();
  };

  const handleDeleteSelected = async () => {
    if (!tesisId) return;

    if (selectedItem?.type === 'subsection') {
      const nextForm = {
        ...sectionForm,
        subsections: sectionForm.subsections.filter(
          (_, index) => index !== selectedItem.index,
        ),
      };
      const payload = buildSectionPayload(nextForm);
      if (!payload || !editingSectionId) return;

      try {
        setSavingSection(true);
        const savedSection = await actualizarSeccionIndiceTesis(
          tesisId,
          editingSectionId,
          payload,
        );
        await loadData();
        setSectionForm(sectionToForm(savedSection));
        setSelectedItem({ type: 'heading', sectionId: savedSection.id });
        toast.success('Subtítulo eliminado');
      } catch (error) {
        console.error('Error deleting subsection:', error);
        toast.error(error?.message || 'No se pudo eliminar el subtítulo');
      } finally {
        setSavingSection(false);
      }
      return;
    }

    if (!editingSectionId) {
      handleAddHeading();
      return;
    }

    try {
      setSavingSection(true);
      await eliminarSeccionIndiceTesis(tesisId, editingSectionId);
      await loadData();
      setEditingSectionId(null);
      setSelectedItem({ type: 'new-heading' });
      setSectionForm({
        ...emptySection,
        order: getNextOrder(orderedSections.filter((item) => item.id !== editingSectionId)),
      });
      toast.success('Título eliminado');
    } catch (error) {
      console.error('Error deleting index section:', error);
      toast.error(error?.message || 'No se pudo eliminar el título');
    } finally {
      setSavingSection(false);
    }
  };

  const saveReference = async () => {
    if (!tesisId) return;

    const author = splitAuthor(referenceForm.author);
    if (!author || !referenceForm.title.trim()) {
      toast.error('Autor y título son requeridos');
      return;
    }
    if (!referenceForm.type) {
      toast.error('El tipo de referencia es requerido');
      return;
    }
    if (referenceForm.type === 'book' && !referenceForm.publisher.trim()) {
      toast.error('La editorial es requerida para libros');
      return;
    }
    if (referenceForm.type === 'article' && !referenceForm.journal.trim()) {
      toast.error('La revista es requerida para artículos');
      return;
    }
    if (
      referenceForm.type === 'web' &&
      !referenceForm.url.trim() &&
      !referenceForm.doi.trim()
    ) {
      toast.error('La URL o DOI es requerida para referencias web');
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

  const handleReferenceSubmit = async (event) => {
    event?.preventDefault?.();
    await saveReference();
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

  const handleCoverUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !tesisId) return;

    const lowerName = file.name?.toLowerCase() || '';
    const isDocxFile = lowerName.endsWith('.docx');
    const isPdfFile = lowerName.endsWith('.pdf');
    const isSupportedMime =
      !file.type ||
      (isDocxFile && file.type === DOCX_MIME) ||
      (isPdfFile && file.type === PDF_MIME);
    if ((!isDocxFile && !isPdfFile) || !isSupportedMime) {
      toast.error('Sube una carátula en formato DOCX o PDF');
      return;
    }

    try {
      setUploadingCover(true);
      const data = await subirCaratulaTesis(tesisId, file);
      setCoverMetadata(data);
      onThesisUpdated?.({
        ...thesis,
        metadata: data?.metadata || {
          ...(thesis?.metadata || {}),
          cover_docx_original_name: data?.cover_docx_original_name,
          cover_docx_url: data?.cover_docx_url,
        },
      });
      toast.success('Carátula subida');
    } catch (error) {
      console.error('Error uploading cover:', error);
      toast.error(error?.message || 'No se pudo subir la carátula');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSaveRawData = async () => {
    if (!documentId) {
      toast.error('Selecciona un documento primero');
      return;
    }

    try {
      setSavingRawData(true);
      await actualizarRawDataDocumento(documentId, rawData);
      toast.success('Texto base guardado');
    } catch (error) {
      console.error('Error saving raw data:', error);
      toast.error(error?.message || 'No se pudo guardar el texto base');
    } finally {
      setSavingRawData(false);
    }
  };

  const handlePrimarySave = async () => {
    if (activeTab === 'references') {
      await saveReference();
      return;
    }

    if (activeTab === 'raw') {
      await handleSaveRawData();
      return;
    }

    await saveSection();
  };

  const activeModeLabel =
    {
      index: 'Índice',
      references: 'Referencias',
      raw: 'Texto base',
    }[activeTab] || 'Indice';

  const thesisTitle = thesis?.titulo || 'Documento de tesis';
  const hasPreview = Boolean(previewUrl);

  const handleExtractRawData = async () => {
    if (!documentId) {
      toast.error('Selecciona un documento primero');
      return;
    }

    try {
      setExtractingRawData(true);
      const data = await extraerRawDataDocumento(documentId);
      setRawData(data?.raw_data || '');
      toast.success('Texto base extraído');
    } catch (error) {
      console.error('Error extracting raw data:', error);
      toast.error(error?.message || 'No se pudo extraer el texto base');
    } finally {
      setExtractingRawData(false);
    }
  };

  const closeFormatModal = () => {
    if (generating) return;
    setShowFormatModal(false);
    setPendingCitationFormat(selectedCitationFormat);
    setFormatModalMode('save');
  };

  const handleOpenFormatModal = (mode = 'save') => {
    if (!tesisId) return;
    setPendingCitationFormat(selectedCitationFormat);
    setFormatModalMode(mode);
    setShowFormatModal(true);
  };

  const handleEditableProgressInput = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !onUploadEditableProgress) return;

    await onUploadEditableProgress(file);
    await loadData();
  };

  const handleConfirmFormatModal = async () => {
    if (!tesisId) return;

    const shouldGenerateDocx = formatModalMode === 'generate';

    try {
      setGenerating(true);
      const nextFormat = normalizeCitationFormat(pendingCitationFormat);

      if (nextFormat !== selectedCitationFormat) {
        const updatedThesis = await actualizarFormatoDocTesis(tesisId, nextFormat);
        setSelectedCitationFormat(nextFormat);
        onThesisUpdated?.(updatedThesis);
        toast.success('Formato de tesis actualizado');
      } else if (!shouldGenerateDocx) {
        toast.success('Formato de tesis listo');
      }

      if (!shouldGenerateDocx) {
        setShowFormatModal(false);
        return;
      }

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

      setShowFormatModal(false);
    } catch (error) {
      console.error('Error confirming document format:', error);
      toast.error(
        error?.message ||
          (shouldGenerateDocx
            ? 'No se pudo generar el DOCX'
            : 'No se pudo guardar el formato'),
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <Card
        className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-0 shadow-[0_20px_42px_-34px_rgba(15,23,42,0.35)] ${className}`}
      >
        <div className="border-b border-slate-200 bg-white/80 px-4 py-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {onBack ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="h-9 rounded-xl px-3 text-sm"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Volver
                  </Button>
                ) : null}
                <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700">
                  Edición manual
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                  {activeModeLabel}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <FileText className="h-3.5 w-3.5" />
                  Guardado en el workspace
                </span>
              </div>
              <h3 className="mt-2 truncate text-lg font-semibold text-slate-950">
                {thesisTitle}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700">
                <BookOpen className="h-4 w-4 text-slate-500" />
                {citationLabel}
              </span>
              <Button
                type="button"
                variant="outline"
                onClick={handlePrimarySave}
                disabled={savingSection || savingReference || savingRawData || generating}
                className="h-9 rounded-xl px-4 text-sm"
              >
                <Save className="h-4 w-4" />
                Guardar cambios
              </Button>
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(240px,0.9fr)_auto] xl:min-w-[700px]">
            <label
              className="inline-flex h-10 min-w-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              title={coverFileName || 'Subir carátula DOCX o PDF'}
            >
              {uploadingCover ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 shrink-0" />
              )}
              <span className="truncate">{coverFileName || 'Subir carátula DOCX o PDF'}</span>
              <input
                type="file"
                accept=".docx,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
                className="hidden"
                onChange={handleCoverUpload}
                disabled={!tesisId || uploadingCover}
              />
            </label>
            <div className="flex h-10 min-w-0 items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
              <span className="min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Formato
                </span>
                <span className="block truncate text-xs font-semibold text-slate-800">
                  {selectedFormatOption?.name || citationLabel}
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">
                {citationTypeLabel(selectedFormatOption?.citation_type)}
              </span>
              <button
                type="button"
                onClick={() => handleOpenFormatModal('save')}
                disabled={!tesisId || generating}
                className="shrink-0 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cambiar
              </button>
            </div>
            <Button
              variant="outline"
              onClick={() => handleOpenFormatModal('generate')}
              disabled={!tesisId || generating}
              className="h-10 rounded-lg px-3 text-xs"
              title="Generar DOCX"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Generar DOCX</span>
            </Button>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
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
            <button
              type="button"
              onClick={() => setActiveTab('raw')}
              className={`h-8 rounded-lg text-xs font-semibold transition ${
                activeTab === 'raw'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Texto base
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 p-3">
          {loading ? (
            <div className="flex h-full min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/70 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <div className="grid min-h-0 h-full gap-3 xl:grid-cols-[minmax(280px,0.95fr)_minmax(0,1.35fr)_minmax(320px,0.95fr)]">
              <aside className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white/80">
                <div className="flex items-center justify-between gap-2 border-b border-slate-200 p-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Estructura
                    </p>
                    <p className="truncate text-xs font-bold text-slate-900">
                      {displaySections.length} títulos
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddHeading}
                      className="h-8 rounded-lg px-2 text-[11px]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Título
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddSubsection}
                      disabled={!editingSectionId}
                      className="h-8 rounded-lg px-2 text-[11px]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Subtítulo
                    </Button>
                  </div>
                </div>
                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
                  {displaySections.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                      Aún no hay títulos.
                    </div>
                  ) : (
                    displaySections.map((section) => {
                      const subsections = normalizeSubsections(section);
                      const headingSelected =
                        selectedItem?.type === 'heading' &&
                        selectedItem.sectionId === section.id;

                      return (
                        <div key={section.id} className="space-y-1">
                          <button
                            type="button"
                            onClick={() => handleSelectHeading(section)}
                            className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                              headingSelected
                                ? 'border-blue-200 bg-blue-50 text-blue-950'
                                : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="min-w-0 truncate text-xs font-black">
                                {section.order}. {section.title || 'Título sin texto'}
                              </span>
                              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                                H{section.level}
                              </span>
                            </div>
                            {section.content ? (
                              <p className="mt-1 line-clamp-2 text-[11px] text-slate-500">
                                {section.content}
                              </p>
                            ) : null}
                          </button>

                          {subsections.length > 0 ? (
                            <div className="space-y-1 border-l border-slate-200 pl-3">
                              {subsections.map((subsection, index) => {
                                const subtitleSelected =
                                  selectedItem?.type === 'subsection' &&
                                  selectedItem.sectionId === section.id &&
                                  selectedItem.index === index;

                                return (
                                  <button
                                    key={`${section.id}-sub-${index}`}
                                    type="button"
                                    onClick={() => handleSelectSubsection(section, index)}
                                    className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                                      subtitleSelected
                                        ? 'border-blue-200 bg-blue-50 text-blue-950'
                                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white'
                                    }`}
                                  >
                                    <p className="truncate text-[11px] font-bold">
                                      {section.order}.{index + 1}{' '}
                                      {subsection.title || 'Subtítulo sin texto'}
                                    </p>
                                    {subsection.content ? (
                                      <p className="mt-1 line-clamp-2 text-[11px] text-slate-500">
                                        {subsection.content}
                                      </p>
                                    ) : null}
                                  </button>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="border-t border-slate-200 bg-slate-50/60 p-3 text-[11px] text-slate-500">
                  Selecciona un título o subtítulo para editar su estructura y contenido.
                </div>
              </aside>

              <section className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white/80">
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      {selectedItem?.type === 'subsection' ? 'Subtítulo' : activeModeLabel}
                    </p>
                    <h4 className="truncate text-sm font-black text-slate-950">
                      {selectedItem?.type === 'subsection'
                        ? selectedSubsectionNumber
                        : activeTab === 'references'
                          ? 'Gestión de referencias'
                          : activeTab === 'raw'
                            ? 'Texto base del documento'
                            : `${selectedSectionNumber}. ${sectionForm.title || 'Nuevo título'}`}
                    </h4>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {activeTab === 'index' ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddSubsection}
                          disabled={!editingSectionId}
                          className="h-8 rounded-lg px-2 text-[11px]"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Subtítulo
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleDeleteSelected}
                          disabled={savingSection}
                          className="h-8 rounded-lg px-2 text-[11px] text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Eliminar
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-3">
                  {activeTab === 'index' ? (
                    <form onSubmit={handleSaveSection} className="space-y-3">
                      {selectedItem?.type === 'subsection' ? (
                        <>
                          <div className="grid gap-2 sm:grid-cols-[88px_minmax(0,1fr)]">
                            <div className="flex h-[58px] items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-700">
                              {selectedSubsectionNumber}
                            </div>
                            <label className="grid gap-1">
                              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                Título del subtítulo
                              </span>
                              <input
                                className={inputClass}
                                required
                                value={selectedSubsection?.title || ''}
                                {...citationTargetProps({
                                  type: 'subsection',
                                  field: 'title',
                                  index: selectedItem.index,
                                })}
                                onChange={(event) =>
                                  updateSelectedSubsection('title', event.target.value)
                                }
                                placeholder="Ej. Marco teórico"
                              />
                            </label>
                          </div>
                          <label className="grid gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                              Contenido
                            </span>
                            <textarea
                              className={`${textareaClass} min-h-[260px] leading-6`}
                              value={selectedSubsection?.content || ''}
                              {...citationTargetProps({
                                type: 'subsection',
                                field: 'content',
                                index: selectedItem.index,
                              })}
                              onChange={(event) =>
                                updateSelectedSubsection('content', event.target.value)
                              }
                              placeholder="Desarrolla el contenido de este subtítulo"
                            />
                          </label>
                        </>
                      ) : (
                        <>
                          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_88px_88px]">
                            <label className="grid gap-1">
                              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                Título
                              </span>
                              <input
                                className={inputClass}
                                required
                                value={sectionForm.title}
                                {...citationTargetProps({
                                  type: 'heading',
                                  field: 'title',
                                  index: null,
                                })}
                                onChange={(event) =>
                                  setSectionForm((current) => ({
                                    ...current,
                                    title: event.target.value,
                                  }))
                                }
                                placeholder="Ej. Introducción"
                              />
                            </label>
                            <label className="grid gap-1">
                              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                Nivel
                              </span>
                              <Select
                                className={inputClass}
                                required
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
                            </label>
                            <label className="grid gap-1">
                              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                Orden
                              </span>
                              <input
                                className={inputClass}
                                type="number"
                                min="0"
                                required
                                value={sectionForm.order}
                                onChange={(event) =>
                                  setSectionForm((current) => ({
                                    ...current,
                                    order: event.target.value,
                                  }))
                                }
                                placeholder="Orden"
                              />
                            </label>
                          </div>
                          <label className="grid gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                              Contenido
                            </span>
                            <textarea
                              className={`${textareaClass} min-h-[260px] leading-6`}
                              value={sectionForm.content}
                              {...citationTargetProps({
                                type: 'heading',
                                field: 'content',
                                index: null,
                              })}
                              onChange={(event) =>
                                setSectionForm((current) => ({
                                  ...current,
                                  content: event.target.value,
                                }))
                              }
                              placeholder="Desarrolla el contenido de este título"
                            />
                          </label>
                          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2">
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
                                Subtítulos
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddSubsection}
                                disabled={!editingSectionId}
                                className="h-8 rounded-lg px-2 text-[11px]"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Agregar
                              </Button>
                            </div>
                            {sectionForm.subsections.length > 0 ? (
                              <div className="space-y-1">
                                {sectionForm.subsections.map((subsection, index) => {
                                  const number = `${selectedSectionNumber}.${index + 1}`;

                                  return (
                                    <button
                                      key={`draft-subsection-${index}`}
                                      type="button"
                                      onClick={() => {
                                        setSelectedItem({
                                          type: 'subsection',
                                          sectionId: editingSectionId,
                                          index,
                                        });
                                        setCitationTarget({
                                          type: 'subsection',
                                          field: 'content',
                                          index,
                                          start: null,
                                          end: null,
                                        });
                                      }}
                                      className="flex w-full items-start gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-blue-200 hover:bg-blue-50"
                                    >
                                      <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-black text-slate-700">
                                        {number}
                                      </span>
                                      <span className="min-w-0 flex-1">
                                        <span className="block truncate text-xs font-bold text-slate-900">
                                          {subsection.title || 'Subtítulo sin texto'}
                                        </span>
                                        {subsection.content ? (
                                          <span className="mt-1 line-clamp-2 text-[11px] text-slate-500">
                                            {renderCitationTokens(subsection.content, references, selectedCitationFormat)}
                                          </span>
                                        ) : null}
                                      </span>
                                      <Pencil className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-400" />
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="rounded-lg border border-dashed border-slate-200 bg-white/70 px-3 py-2 text-[11px] font-medium text-slate-500">
                                Sin subtítulos.
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {references.length > 0 ? (
                        <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-2">
                          <p className="mb-2 text-[11px] font-bold text-blue-900">
                            Citas disponibles para insertar
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {references.map((reference, index) => (
                              <button
                                key={`cite-${reference.id}`}
                                type="button"
                                onClick={() => handleInsertCitation(reference)}
                                className="rounded-lg bg-white px-2 py-1 text-[10px] font-semibold text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-100"
                                title={`Insertar cita ${citationLabel} ${inlineCitationLabel(
                                  reference,
                                  selectedCitationFormat,
                                  index + 1,
                                )}`}
                              >
                                {inlineCitationLabel(reference, selectedCitationFormat, index + 1)} ·{' '}
                                {referenceLabel(reference, selectedCitationFormat, index)}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      <div className="flex gap-2 border-t border-slate-200 pt-3">
                        <Button
                          type="submit"
                          disabled={savingSection}
                          className="h-9 flex-1 rounded-lg px-3 text-xs"
                        >
                          {savingSection ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Guardar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancelEditor}
                          className="h-9 rounded-lg px-3 text-xs"
                        >
                          <Pencil className="h-4 w-4" />
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  ) : activeTab === 'references' ? (
                    <div className="space-y-3">
                      <form onSubmit={handleReferenceSubmit} className="space-y-2">
                        <label className="grid gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                            Autor
                          </span>
                          <input
                            className={inputClass}
                            required
                            value={referenceForm.author}
                            onChange={(event) =>
                              setReferenceForm((current) => ({
                                ...current,
                                author: event.target.value,
                              }))
                            }
                            placeholder="Apellido Nombre"
                          />
                        </label>
                        <div className="grid grid-cols-[84px_minmax(0,1fr)] gap-2">
                          <label className="grid gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                              Año
                            </span>
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
                              placeholder="2026"
                            />
                          </label>
                          <label className="grid gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                              Título
                            </span>
                            <input
                              className={inputClass}
                              required
                              value={referenceForm.title}
                              onChange={(event) =>
                                setReferenceForm((current) => ({
                                  ...current,
                                  title: event.target.value,
                                }))
                              }
                              placeholder="Título de la fuente"
                            />
                          </label>
                        </div>
                        <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-2">
                          <label className="grid gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                              Tipo
                            </span>
                            <Select
                              className={inputClass}
                              required
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
                          </label>
                          <label className="grid gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                              Editorial
                            </span>
                            <input
                              className={inputClass}
                              required={referenceForm.type === 'book'}
                              value={referenceForm.publisher}
                              onChange={(event) =>
                                setReferenceForm((current) => ({
                                  ...current,
                                  publisher: event.target.value,
                                }))
                              }
                              placeholder={referenceForm.type === 'book' ? 'Editorial requerida' : 'Editorial'}
                            />
                          </label>
                        </div>
                        <label className="grid gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                            Revista
                          </span>
                          <input
                            className={inputClass}
                            required={referenceForm.type === 'article'}
                            value={referenceForm.journal}
                            onChange={(event) =>
                              setReferenceForm((current) => ({
                                ...current,
                                journal: event.target.value,
                              }))
                            }
                            placeholder={referenceForm.type === 'article' ? 'Revista requerida' : 'Revista'}
                          />
                        </label>
                        {referenceForm.type === 'article' ? (
                          <div className="grid grid-cols-3 gap-2">
                            <label className="grid gap-1">
                              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                Volumen
                              </span>
                              <input
                                className={inputClass}
                                value={referenceForm.volume}
                                onChange={(event) =>
                                  setReferenceForm((current) => ({
                                    ...current,
                                    volume: event.target.value,
                                  }))
                                }
                                placeholder="Vol."
                              />
                            </label>
                            <label className="grid gap-1">
                              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                Número
                              </span>
                              <input
                                className={inputClass}
                                value={referenceForm.issue}
                                onChange={(event) =>
                                  setReferenceForm((current) => ({
                                    ...current,
                                    issue: event.target.value,
                                  }))
                                }
                                placeholder="No."
                              />
                            </label>
                            <label className="grid gap-1">
                              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                Páginas
                              </span>
                              <input
                                className={inputClass}
                                value={referenceForm.pages}
                                onChange={(event) =>
                                  setReferenceForm((current) => ({
                                    ...current,
                                    pages: event.target.value,
                                  }))
                                }
                                placeholder="45-67"
                              />
                            </label>
                          </div>
                        ) : null}
                        <div className="grid grid-cols-2 gap-2">
                          <label className="grid gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                              DOI
                            </span>
                            <input
                              className={inputClass}
                              value={referenceForm.doi}
                              onChange={(event) =>
                                setReferenceForm((current) => ({
                                  ...current,
                                  doi: event.target.value,
                                }))
                              }
                              placeholder="10.xxxx/xxxxx"
                            />
                          </label>
                          <label className="grid gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                              URL
                            </span>
                            <input
                              className={inputClass}
                              required={referenceForm.type === 'web' && !referenceForm.doi.trim()}
                              value={referenceForm.url}
                              onChange={(event) =>
                                setReferenceForm((current) => ({
                                  ...current,
                                  url: event.target.value,
                                }))
                              }
                              placeholder={referenceForm.type === 'web' ? 'URL o DOI requerido' : 'URL'}
                            />
                          </label>
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
                          references.map((reference, index) => (
                            <div
                              key={reference.id}
                              className="flex items-start justify-between gap-2 rounded-xl border border-slate-200 bg-white/80 p-3"
                            >
                              <div className="min-w-0">
                                <p className="line-clamp-2 text-xs font-semibold text-slate-900">
                                  {referenceLabel(reference, selectedCitationFormat, index)}
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
                  ) : (
                    <div className="space-y-3">
                      {!documentId ? (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
                          <p className="font-semibold text-slate-700">
                            {hasThesisDocuments
                              ? 'Hay documentos subidos, pero para edición manual necesitas un DOCX o DOCM.'
                              : 'Aún no hay avance editable subido.'}
                          </p>
                          <p className="mt-1">
                            La generación DOCX desde el índice sigue disponible; el texto base se habilita cuando exista un avance Word.
                          </p>
                          {onUploadEditableProgress ? (
                            <label
                              className={`mt-3 inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white transition hover:bg-slate-800 ${
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
                                disabled={!tesisId || uploadingEditableProgress}
                              />
                            </label>
                          ) : null}
                        </div>
                      ) : loadingRawData ? (
                        <div className="flex h-36 items-center justify-center text-slate-400">
                          <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                      ) : (
                        <>
                          <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
                            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-700">
                              <FileText className="h-3.5 w-3.5" />
                              Texto base del documento
                            </div>
                            <textarea
                              className="min-h-64 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                              value={rawData}
                              onChange={(event) => setRawData(event.target.value)}
                              placeholder="Texto base extraído o pegado manualmente"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              onClick={handleSaveRawData}
                              disabled={savingRawData}
                              className="h-9 flex-1 rounded-lg px-3 text-xs"
                            >
                              {savingRawData ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                              Guardar texto
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleExtractRawData}
                              disabled={extractingRawData}
                              className="h-9 flex-1 rounded-lg px-3 text-xs"
                            >
                              {extractingRawData ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Wand2 className="h-4 w-4" />
                              )}
                              Extraer DOCX
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </section>

              <aside className="flex min-h-0 flex-col gap-3">
                <ThesisPreviewPanel
                  selectedThesis={thesis}
                  currentVersion={editableDocument}
                  previewUrl={previewUrl}
                  className="flex-1"
                />
                <Card className="rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-none">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                          Documento
                        </p>
                        <p className="text-sm font-semibold text-slate-950">
                          {editableDocumentName || 'Sin avance editable'}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                        {activeModeLabel}
                      </span>
                    </div>
                    <p className="text-xs leading-6 text-slate-500">
                      {hasPreview
                        ? 'La vista previa activa se muestra a la derecha mientras trabajas el índice, las referencias o el texto base.'
                        : 'Sube o vincula un documento para mostrar la vista previa en este panel.'}
                    </p>
                  </div>
                </Card>
              </aside>
            </div>
          )}
        </div>
      </Card>

    <Modal
      open={showFormatModal}
      onClose={closeFormatModal}
      title="Formato de tesis"
      subtitle={
        formatModalMode === 'generate'
          ? 'Confirma el formato antes de crear el DOCX'
          : 'Escoge el formato que usará tu tesis'
      }
      modalWidth="lg"
      primaryAction={{
        label:
          formatModalMode === 'generate'
            ? generating
              ? 'Generando DOCX...'
              : 'Confirmar y generar'
            : generating
              ? 'Guardando...'
              : 'Guardar formato',
        onClick: handleConfirmFormatModal,
        disabled: !tesisId || generating,
      }}
      secondaryAction={{
        label: 'Cancelar',
        onClick: closeFormatModal,
        disabled: generating,
      }}
      contentClassName="gap-5 p-5 text-left sm:p-6"
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold text-slate-900">
            {formatModalMode === 'generate'
              ? 'Se guardará el formato seleccionado en la tesis y se usará para generar este DOCX.'
              : 'Se guardará el formato seleccionado en la tesis para usarlo en citas, bibliografía y generación DOCX.'}
          </p>
          <p className="mt-1 text-[11px] font-medium text-slate-500">
            Formato actual: {selectedFormatOption?.name || citationLabel}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {formatOptions.map((format) => {
            const selected = pendingCitationFormat === format.uname;

            return (
              <button
                key={format.uname}
                type="button"
                onClick={() => setPendingCitationFormat(format.uname)}
                disabled={generating}
                className={`flex min-h-[92px] w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                  selected
                    ? 'border-blue-300 bg-blue-50 text-blue-950 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                } disabled:cursor-not-allowed disabled:opacity-70`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    selected
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-slate-300 bg-white'
                  }`}
                  aria-hidden="true"
                >
                  {selected ? (
                    <span className="h-2 w-2 rounded-full bg-white" />
                  ) : null}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-black">
                    {format.name || citationFormatLabel(format.uname)}
                  </span>
                  <span className="mt-2 inline-flex rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">
                    {citationTypeLabel(format.citation_type)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs font-semibold text-blue-900">
          {formatModalMode === 'generate'
            ? `Se generará con ${pendingFormatOption?.name || citationFormatLabel(pendingCitationFormat)}.`
            : `Se guardará ${pendingFormatOption?.name || citationFormatLabel(pendingCitationFormat)} como formato de la tesis.`}
        </div>
      </div>
    </Modal>
    </>
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import AccessManagementModal from '../../components/student/workspace/AccessManagementModal';
import SuggestionsThreadModal from '../../components/student/workspace/SuggestionsThreadModal';
import AcademicAIChatPanel from '../../components/student/workspace/AcademicAIChatPanel';
import ThesisPreviewPanel from '../../components/student/workspace/ThesisPreviewPanel';
import WorkspaceActionNavbar from '../../components/student/workspace/WorkspaceActionNavbar';
import ThesisDocBuilderPanel from '../../components/student/workspace/ThesisDocBuilderPanel';
import ThesisCoverUploadPanel from '../../components/student/workspace/ThesisCoverUploadPanel';
import ThesisManualEditorPanel from '../../components/student/workspace/ThesisManualEditorPanel';
import ThesisReferencesPanel from '../../components/student/workspace/ThesisReferencesPanel';
import PaymentGatewayModal from '../../components/student/workspace/PaymentGatewayModal';
import {
  actualizarFormatoDocTesis,
  cotizarTesisPlan,
  crearTesisConPlan,
  extraerIndiceDocumentoWord,
  obtenerIndiceTesis,
  obtenerMisTesis,
  obtenerSugerenciasMiTesis,
  obtenerTiposTesisActivos,
  obtenerTodosDocumentosMiTesis,
  marcarSugerenciaAplicadaEstudiante,
  procesarDocumentoWord,
  subirDocumentoAGoogleDrive,
} from '../../services/thesisService';
import { catalogosApi } from '../../api/catalogos.api';
import {
  asignarMiTesisAAsesor,
  obtenerMisAsesores,
  obtenerMisTesisConAsesores,
} from '../../services/advisorService';
import { obtenerPlanesDisponibles } from '../../services/pagosService';
import { obtenerPerfilEstudiante } from '../../services/studentService';
import {
  getSuggestionAdvisorName,
  getSuggestionId,
  getSuggestionStatusMeta,
  getSuggestionText,
} from '../../lib/suggestionValidation';
import QuotationModal from '../../components/student/workspace/QuotationModal.jsx';

const NIVELES_ACADEMICOS = [
  { value: 'PREGRADO', label: 'Pregrado' },
  { value: 'MAESTRIA', label: 'Maestria' },
  { value: 'ESPECIALIDAD', label: 'Especialidad' },
  { value: 'DOCTORADO', label: 'Doctorado' },
];

const initialCreateForm = {
  titulo: '',
  descripcion: '',
  plan_id: '',
  tipo_tesis_id: '',
  nivel_academico: 'PREGRADO',
  requiere_analisis_estadistico: true,
  doc_thesis_format_uname: '',
};

const WORD_MIME_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-word.document.macroEnabled.12',
]);

const isThesisDocument = (document) =>
  (document?.source || document?.tipo_documento_categoria || 'tesis') ===
  'tesis';

const isWordDocument = (document) => {
  const filename = String(
    document?.nombre_archivo || document?.nombre || document?.file_name || '',
  ).toLowerCase();
  const mimeType = String(
    document?.tipo_mime || document?.mimeType || '',
  ).toLowerCase();

  return (
    filename.endsWith('.docx') ||
    filename.endsWith('.docm') ||
    WORD_MIME_TYPES.has(mimeType)
  );
};

const isEditableThesisDocument = (document) =>
  isThesisDocument(document) &&
  isWordDocument(document) &&
  Boolean(document?.ruta_storage);

export default function MyThesisWorkspace() {
  const navigate = useNavigate();
  const [thesesList, setThesesList] = useState([]);
  const [selectedThesisId, setSelectedThesisId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const [sugerencias, setSugerencias] = useState([]);
  const [loadingSugerencias, setLoadingSugerencias] = useState(false);
  const [updatingSuggestionId, setUpdatingSuggestionId] = useState(null);
  const [misAsesores, setMisAsesores] = useState([]);
  const [tesisConAsesores, setTesisConAsesores] = useState([]);
  const [assigningAdvisor, setAssigningAdvisor] = useState(false);
  const [activeActionSection, setActiveActionSection] = useState(null);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [uploadingEditableProgress, setUploadingEditableProgress] =
    useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [quoteData, setQuoteData] = useState(null);
  const [quoteError, setQuoteError] = useState('');
  const [quoting, setQuoting] = useState(false);
  const [planesDisponibles, setPlanesDisponibles] = useState([]);
  const [tiposTesis, setTiposTesis] = useState([]);
  const [perfilEstudiante, setPerfilEstudiante] = useState(null);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createdPaymentSummary, setCreatedPaymentSummary] = useState(null);
  const [availableFormats, setAvailableFormats] = useState([]);
  const [thesisIndex, setThesisIndex] = useState([]);
  const [changingFormat, setChangingFormat] = useState(false);

  const buildPreviewUrl = useCallback((url) => {
    if (!url) return null;

    const lowerUrl = url.toLowerCase();
    if (
      lowerUrl.endsWith('.doc') ||
      lowerUrl.endsWith('.docx') ||
      lowerUrl.endsWith('.docm')
    ) {
      return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;
    }

    const driveUcMatch = url.match(/drive\.google\.com\/uc\?id=([^&]+)/);
    if (driveUcMatch) {
      return `https://drive.google.com/file/d/${driveUcMatch[1]}/preview`;
    }

    if (url.includes('/view')) {
      return url.replace('/view', '/preview');
    }

    return url;
  }, []);

  const fetchTheses = async () => {
    try {
      setLoading(true);
      const theses = await obtenerMisTesis();
      setThesesList(theses || []);

      if (theses && theses.length > 0) {
        if (
          !selectedThesisId ||
          !theses.find((item) => item.id === selectedThesisId)
        ) {
          setSelectedThesisId(theses[0].id);
        }
      } else {
        setSelectedThesisId('');
      }
    } catch (error) {
      console.error('Error fetching theses:', error);
      toast.error('No se pudieron cargar las tesis.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMisAsesores = useCallback(async () => {
    try {
      const [asesores, asignaciones] = await Promise.all([
        obtenerMisAsesores(),
        obtenerMisTesisConAsesores(),
      ]);

      setMisAsesores(asesores || []);
      setTesisConAsesores(asignaciones || []);
    } catch (error) {
      console.error('Error fetching advisors:', error);
      setMisAsesores([]);
      setTesisConAsesores([]);
    }
  }, []);

  const fetchDocuments = useCallback(
    async (thesisId) => {
      try {
        setLoading(true);
        const docs = await obtenerTodosDocumentosMiTesis(thesisId);
        setDocuments(docs || []);

        if (docs && docs.length > 0) {
          const latestInfo =
            docs.find(
              (doc) =>
                (doc.source || doc.tipo_documento_categoria || 'tesis') ===
                'tesis',
            ) || docs[0];
          setCurrentVersion(latestInfo);

          const previewSource =
            latestInfo.url_google_doc || latestInfo.url_archivo_drive;
          setPreviewUrl(buildPreviewUrl(previewSource));
        } else {
          setCurrentVersion(null);
          setPreviewUrl(null);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast.error('No se pudieron cargar los documentos.');
      } finally {
        setLoading(false);
      }
    },
    [buildPreviewUrl],
  );

  const cargarSugerencias = useCallback(async (thesisId) => {
    if (!thesisId) {
      setSugerencias([]);
      return;
    }

    try {
      setLoadingSugerencias(true);
      const data = await obtenerSugerenciasMiTesis(thesisId);
      setSugerencias(data || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      toast.error('No se pudieron cargar las sugerencias.');
      setSugerencias([]);
    } finally {
      setLoadingSugerencias(false);
    }
  }, []);

  const cargarCatalogosCreacion = useCallback(async () => {
    setLoadingCatalogs(true);

    const [planesResult, tiposResult, perfilResult] = await Promise.allSettled([
      obtenerPlanesDisponibles(),
      obtenerTiposTesisActivos(),
      obtenerPerfilEstudiante(),
    ]);

    if (planesResult.status === 'fulfilled') {
      setPlanesDisponibles(planesResult.value || []);
    } else {
      console.error('Error loading available plans:', planesResult.reason);
      setPlanesDisponibles([]);
    }

    if (tiposResult.status === 'fulfilled') {
      setTiposTesis(tiposResult.value || []);
    } else {
      console.error('Error loading thesis types:', tiposResult.reason);
      setTiposTesis([]);
    }

    if (perfilResult.status === 'fulfilled') {
      setPerfilEstudiante(perfilResult.value || null);
    } else {
      console.error('Error loading student profile:', perfilResult.reason);
      setPerfilEstudiante(null);
    }

    if (
      planesResult.status === 'rejected' ||
      tiposResult.status === 'rejected'
    ) {
      toast.error('No se pudieron cargar todos los catálogos de creación.');
    }

    setLoadingCatalogs(false);
  }, []);

  const cargarFormatos = useCallback(async () => {
    try {
      const result = await catalogosApi.obtenerFormatosTesis();
      setAvailableFormats(result?.data || result || []);
    } catch (error) {
      console.error('Error loading formats:', error);
    }
  }, []);

  const cargarThesisIndex = useCallback(async (thesisId) => {
    if (!thesisId) {
      setThesisIndex([]);
      return;
    }
    try {
      const data = await obtenerIndiceTesis(thesisId);
      setThesisIndex(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading thesis index:', error);
      setThesisIndex([]);
    }
  }, []);

  const handleFormatChange = useCallback(
    async (formatUname) => {
      if (!selectedThesisId || !formatUname || changingFormat) return;
      try {
        setChangingFormat(true);
        await actualizarFormatoDocTesis(selectedThesisId, formatUname);
        toast.success('Formato actualizado');
        await Promise.all([
          fetchTheses(),
          cargarThesisIndex(selectedThesisId),
        ]);
      } catch (error) {
        console.error('Error updating format:', error);
        toast.error(error?.message || 'No se pudo actualizar el formato');
      } finally {
        setChangingFormat(false);
      }
    },
    [selectedThesisId, changingFormat, cargarThesisIndex],
  );

  const resetCreateFlow = useCallback(() => {
    setCreateForm(initialCreateForm);
    setQuoteData(null);
    setQuoteError('');
    setQuoting(false);
  }, []);

  const closeCreateModal = useCallback(() => {
    if (creating) return;
    setShowCreateModal(false);
    resetCreateFlow();
  }, [creating, resetCreateFlow]);

  const openCreateModal = useCallback(() => {
    setShowCreateModal(true);
    cargarCatalogosCreacion();
  }, [cargarCatalogosCreacion]);

  useEffect(() => {
    fetchTheses();
    fetchMisAsesores();
    cargarCatalogosCreacion();
    cargarFormatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedThesisId) {
      fetchDocuments(selectedThesisId);
    } else {
      setDocuments([]);
      setCurrentVersion(null);
      setPreviewUrl(null);
    }
  }, [selectedThesisId, fetchDocuments]);

  useEffect(() => {
    if (selectedThesisId) {
      cargarSugerencias(selectedThesisId);
    } else {
      setSugerencias([]);
    }
  }, [selectedThesisId, cargarSugerencias]);

  useEffect(() => {
    cargarThesisIndex(selectedThesisId);
  }, [selectedThesisId, cargarThesisIndex]);

  useEffect(() => {
    if (!showCreateModal) return;

    if (
      !createForm.plan_id ||
      !createForm.tipo_tesis_id ||
      !createForm.nivel_academico
    ) {
      setQuoteData(null);
      setQuoteError('');
      setQuoting(false);
      return;
    }

    let ignore = false;

    const cotizar = async () => {
      try {
        setQuoting(true);
        setQuoteError('');
        const data = await cotizarTesisPlan({
          plan_id: createForm.plan_id,
          tipo_tesis_id: createForm.tipo_tesis_id,
          nivel_academico: createForm.nivel_academico,
          requiere_analisis_estadistico:
            createForm.requiere_analisis_estadistico,
        });

        if (!ignore) {
          setQuoteData(data);
        }
      } catch (error) {
        console.error('Error quoting thesis plan:', error);
        if (!ignore) {
          setQuoteData(null);
          setQuoteError(error.message || 'No se pudo calcular la cotización.');
        }
      } finally {
        if (!ignore) {
          setQuoting(false);
        }
      }
    };

    cotizar();

    return () => {
      ignore = true;
    };
  }, [
    createForm.plan_id,
    createForm.tipo_tesis_id,
    createForm.nivel_academico,
    createForm.requiere_analisis_estadistico,
    showCreateModal,
  ]);

  const handleCreateThesis = async () => {
    if (!createForm.titulo.trim()) {
      toast.error('El título es requerido');
      return;
    }

    if (
      !createForm.plan_id ||
      !createForm.tipo_tesis_id ||
      !createForm.nivel_academico
    ) {
      toast.error('Selecciona plan, tipo de tesis y nivel académico');
      return;
    }

    if (quoting) {
      toast.error('Espera a que termine la cotización');
      return;
    }

    if (!quoteData) {
      toast.error('Completa la cotización antes de crear la tesis');
      return;
    }

    try {
      setCreating(true);
      const newThesis = await crearTesisConPlan({
        titulo: createForm.titulo.trim(),
        descripcion: createForm.descripcion.trim() || null,
        plan_id: createForm.plan_id,
        tipo_tesis_id: createForm.tipo_tesis_id,
        nivel_academico: createForm.nivel_academico,
        requiere_analisis_estadistico: createForm.requiere_analisis_estadistico,
        universidad_id: perfilEstudiante?.universidad_id || null,
        programa_id: null,
        estado_tesis: 'pendiente_pago',
      });

      const createdId = newThesis?.tesis_id || newThesis?.id;
      if (createdId && createForm.doc_thesis_format_uname) {
        try {
          await actualizarFormatoDocTesis(createdId, createForm.doc_thesis_format_uname);
        } catch (fmtErr) {
          console.error('Format update after creation failed:', fmtErr);
        }
      }

      toast.success('Tesis creada y pago generado');
      setShowCreateModal(false);
      resetCreateFlow();

      await fetchTheses();
      if (createdId) {
        setSelectedThesisId(createdId);
      }

      setCreatedPaymentSummary(newThesis);
    } catch (error) {
      console.error('Create thesis with plan error:', error);
      toast.error(error.message || 'Error al crear la tesis con cotización');
    } finally {
      setCreating(false);
    }
  };

  const handleAsignarAsesor = async (advisorId) => {
    if (!selectedThesisId) {
      toast.error('Selecciona una tesis primero');
      return;
    }

    if (!advisorId) {
      toast.error('Selecciona un asesor');
      return;
    }

    try {
      setAssigningAdvisor(true);
      await asignarMiTesisAAsesor(selectedThesisId, advisorId, 'principal');
      toast.success('Acceso otorgado al asesor');
      await fetchMisAsesores();
    } catch (error) {
      console.error('Error assigning advisor:', error);
      toast.error(error.message || 'No se pudo asignar la tesis al asesor');
    } finally {
      setAssigningAdvisor(false);
    }
  };

  const handleSubmitAppliedSuggestion = async (suggestion, comment) => {
    const suggestionId = getSuggestionId(suggestion);

    if (!suggestionId) {
      toast.error('No se pudo identificar la sugerencia');
      return;
    }

    try {
      setUpdatingSuggestionId(suggestionId);
      await marcarSugerenciaAplicadaEstudiante(
        suggestionId,
        comment.trim() || null,
      );
      toast.success('Sugerencia enviada a revisión del asesor');
      await cargarSugerencias(selectedThesisId);
    } catch (error) {
      console.error('Error updating suggestion:', error);
      toast.error('No se pudo actualizar la sugerencia');
      throw error;
    } finally {
      setUpdatingSuggestionId(null);
    }
  };

  const seleccionarVersion = useCallback(
    (doc) => {
      setCurrentVersion(doc);
      const previewSource = doc?.url_google_doc || doc?.url_archivo_drive;
      setPreviewUrl(buildPreviewUrl(previewSource));
    },
    [buildPreviewUrl],
  );

  const editableVersion = useMemo(
    () =>
      // Edit the version the user selected when it is editable; otherwise fall
      // back to the most recent editable thesis document.
      (currentVersion && isEditableThesisDocument(currentVersion)
        ? currentVersion
        : null) ||
      documents.find(isEditableThesisDocument) ||
      null,
    [documents, currentVersion],
  );

  const hasThesisDocuments = useMemo(
    () => documents.some(isThesisDocument),
    [documents],
  );

  const handleGeneratedDocx = useCallback(async () => {
    if (selectedThesisId) {
      await fetchDocuments(selectedThesisId);
    }
  }, [fetchDocuments, selectedThesisId]);

  const handleUploadEditableProgress = useCallback(
    async (file) => {
      if (!file) return;
      if (!selectedThesisId) {
        toast.error('Selecciona una tesis primero');
        return;
      }

      try {
        setUploadingEditableProgress(true);
        const uploadedDocument = await subirDocumentoAGoogleDrive({
          tesisId: selectedThesisId,
          file,
          modo: 'tesis',
        });
        const extraction = uploadedDocument?.reference_extraction;
        if (extraction?.ok && Number(extraction.created_count || 0) > 0) {
          toast.success(
            `Avance subido: ${extraction.created_count} referencia(s) importada(s)`,
          );
        } else if (extraction?.ok) {
          toast.success(
            'Avance editable subido. No se encontraron referencias nuevas.',
          );
        } else if (extraction?.error) {
          toast.success('Avance editable subido');
          toast.error(
            `No se pudieron importar referencias: ${extraction.error}`,
          );
        } else {
          toast.success('Avance editable subido');
        }

        await fetchDocuments(selectedThesisId);

        const newDocId =
          uploadedDocument?.document?.id ||
          uploadedDocument?.id ||
          uploadedDocument?.documento_id;

        if (newDocId) {
          try {
            await procesarDocumentoWord(newDocId);
            toast.success('Estructura del Word extraída automáticamente');
          } catch (processError) {
            console.warn('Auto-process failed (non-blocking):', processError);
          }

          try {
            await extraerIndiceDocumentoWord(newDocId);
            await cargarThesisIndex(selectedThesisId);
          } catch (outlineError) {
            console.warn('Auto-outline failed (non-blocking):', outlineError);
          }
        }
      } catch (error) {
        console.error('Error uploading editable progress:', error);
        toast.error(error?.message || 'No se pudo subir el avance editable');
      } finally {
        setUploadingEditableProgress(false);
      }
    },
    [fetchDocuments, selectedThesisId],
  );

  const handleThesisUpdated = useCallback((updatedThesis) => {
    if (!updatedThesis?.id) return;

    setThesesList((current) =>
      current.map((item) =>
        item.id === updatedThesis.id ? { ...item, ...updatedThesis } : item,
      ),
    );
  }, []);

  const selectedThesis = useMemo(
    () => thesesList.find((item) => item.id === selectedThesisId),
    [thesesList, selectedThesisId],
  );

  const activeFormat = useMemo(() => {
    const formatUname = selectedThesis?.doc_thesis_format || selectedThesis?.metadata?.doc_thesis_format;
    return availableFormats.find((f) => f.uname === formatUname) || null;
  }, [selectedThesis, availableFormats]);

  const sugerenciasVisibles = useMemo(
    () =>
      sugerencias.filter(
        (item) => !item?.tesis_id || item.tesis_id === selectedThesisId,
      ),
    [selectedThesisId, sugerencias],
  );

  const feedbackReciente = useMemo(() => {
    return [...sugerenciasVisibles]
      .sort((a, b) => {
        const aTime = new Date(
          a?.actualizado_en || a?.creado_en || a?.created_at || 0,
        ).getTime();
        const bTime = new Date(
          b?.actualizado_en || b?.creado_en || b?.created_at || 0,
        ).getTime();
        return (
          (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime)
        );
      })
      .slice(0, 3);
  }, [sugerenciasVisibles]);

  const asesoresDeTesis = useMemo(
    () => tesisConAsesores.filter((item) => item.tesis_id === selectedThesisId),
    [selectedThesisId, tesisConAsesores],
  );

  const asesoresDisponiblesParaAsignar = useMemo(
    () =>
      misAsesores.filter(
        (advisor) =>
          !asesoresDeTesis.some(
            (assigned) => assigned.asesor_id === advisor.asesor_id,
          ),
      ),
    [asesoresDeTesis, misAsesores],
  );

  const canSubmitCreateThesis = Boolean(
    createForm.titulo.trim() &&
    createForm.plan_id &&
    createForm.tipo_tesis_id &&
    createForm.nivel_academico &&
    quoteData &&
    !quoting &&
    !creating,
  );

  const closePaymentSummaryModal = useCallback(() => {
    setCreatedPaymentSummary(null);
  }, []);

  const handleGoToPayments = useCallback(() => {
    const pagoId = createdPaymentSummary?.pago_id;
    setCreatedPaymentSummary(null);
    navigate('/student/payments', {
      state: { pagoId, autoOpenVoucher: true },
    });
  }, [createdPaymentSummary?.pago_id, navigate]);

  const renderDefaultWorkspaceLayout = () => (
    <div className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
      <section className="flex min-h-0 flex-col">
        {activeActionSection === 'cover-upload' ? (
          <ThesisCoverUploadPanel
            thesisId={selectedThesisId}
            thesis={selectedThesis}
            onBack={() => setActiveActionSection(null)}
            onThesisUpdated={handleThesisUpdated}
            className="flex-1"
          />
        ) : activeActionSection === 'doc-builder' ? (
          <ThesisDocBuilderPanel
            tesisId={selectedThesisId}
            thesis={selectedThesis}
            documentId={editableVersion?.id}
            editableDocument={editableVersion}
            previewUrl={previewUrl}
            hasThesisDocuments={hasThesisDocuments}
            onUploadEditableProgress={handleUploadEditableProgress}
            uploadingEditableProgress={uploadingEditableProgress}
            onGenerated={handleGeneratedDocx}
            onThesisUpdated={handleThesisUpdated}
            onBack={() => setActiveActionSection(null)}
            className="flex-1"
          />
        ) : (
          <ThesisPreviewPanel
            selectedThesis={selectedThesis}
            currentVersion={currentVersion}
            previewUrl={previewUrl}
            className="flex-1"
          />
        )}
      </section>

      <aside className="flex min-h-0 flex-col">
        <AcademicAIChatPanel
          tesisId={selectedThesisId}
          documentId={editableVersion?.id}
          className="flex-1"
        />
      </aside>
    </div>
  );

  const renderWorkspaceContent = () => {
    switch (activeActionSection) {
      case 'manual-edit':
        return (
          <section className="flex min-h-0 w-full flex-1">
            <ThesisManualEditorPanel
              thesisId={selectedThesisId}
              thesis={selectedThesis}
              documents={documents}
              currentVersion={currentVersion}
              documentId={editableVersion?.id}
              editableDocument={editableVersion}
              hasThesisDocuments={hasThesisDocuments}
              onUploadEditableProgress={handleUploadEditableProgress}
              uploadingEditableProgress={uploadingEditableProgress}
              onGenerated={handleGeneratedDocx}
              onBack={() => setActiveActionSection(null)}
              availableFormats={availableFormats}
              activeFormat={activeFormat}
              onFormatChange={handleFormatChange}
              changingFormat={changingFormat}
              thesisIndex={thesisIndex}
              onThesisIndexRefresh={() => cargarThesisIndex(selectedThesisId)}
              className="flex-1"
            />
          </section>
        );

      case 'references':
        return (
          <section className="flex min-h-0 w-full flex-1">
            <ThesisReferencesPanel
              thesisId={selectedThesisId}
              thesis={selectedThesis}
              activeFormat={activeFormat}
              availableFormats={availableFormats}
              onFormatChange={handleFormatChange}
              changingFormat={changingFormat}
              documents={documents}
              onBack={() => setActiveActionSection(null)}
              className="flex-1"
            />
          </section>
        );

      default:
        return renderDefaultWorkspaceLayout();
    }
  };

  if (!loading && thesesList.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-10">
        <Card className="w-full max-w-xl rounded-[32px] border-none p-12 text-center shadow-[0_36px_90px_-58px_rgba(15,23,42,0.4)]">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-600">
            <FileText className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Aún no tienes una tesis
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-500">
            Crea tu primera tesis para empezar a organizar documentos, accesos y
            sugerencias en un solo workspace.
          </p>
          <Button
            onClick={openCreateModal}
            className="ios-accent-button mx-auto mt-8 h-12 rounded-xl px-6"
          >
            Crear nueva tesis
          </Button>
        </Card>

        <QuotationModal
          open={showCreateModal}
          onClose={closeCreateModal}
          form={createForm}
          onFormChange={setCreateForm}
          nivelesAcademicos={NIVELES_ACADEMICOS}
          planesDisponibles={planesDisponibles}
          tiposTesis={tiposTesis}
          availableFormats={availableFormats}
          perfilEstudiante={perfilEstudiante}
          loadingCatalogs={loadingCatalogs}
          onReloadCatalogs={cargarCatalogosCreacion}
          quoteData={quoteData}
          quoteError={quoteError}
          quoting={quoting}
          creating={creating}
          canSubmit={canSubmitCreateThesis}
          onSubmit={handleCreateThesis}
        />

        <PaymentGatewayModal
          open={!!createdPaymentSummary}
          paymentSummary={createdPaymentSummary}
          onClose={closePaymentSummaryModal}
          onProceed={handleGoToPayments}
        />
      </div>
    );
  }

  return (
    <div className="my-thesis-workspace relative flex h-[calc(100dvh-6rem)] w-full overflow-hidden px-0 pb-2 text-slate-900">
      <div className="mx-auto flex min-h-0 w-full max-w-[1760px] flex-1 flex-col gap-2">
        <WorkspaceActionNavbar
          activeActionSection={activeActionSection}
          disabled={!selectedThesisId}
          onSelectAction={setActiveActionSection}
          documents={documents}
          currentDocumentId={currentVersion?.id}
          onSelectDocument={seleccionarVersion}
          suggestionsCount={sugerenciasVisibles.length}
          onOpenSuggestions={() => setShowSuggestionsModal(true)}
          thesesList={thesesList}
          selectedThesisId={selectedThesisId}
          onSelectThesis={setSelectedThesisId}
          onOpenAccesses={() => setShowAccessModal(true)}
          onOpenCreate={openCreateModal}
        />

        {renderWorkspaceContent()}
      </div>

      <AccessManagementModal
        open={showAccessModal}
        onClose={() => setShowAccessModal(false)}
        thesisTitle={selectedThesis?.titulo}
        assignedAdvisors={asesoresDeTesis}
        availableAdvisors={asesoresDisponiblesParaAsignar}
        assigningAdvisor={assigningAdvisor}
        onAssignAdvisor={handleAsignarAsesor}
      />

      <SuggestionsThreadModal
        open={showSuggestionsModal}
        onClose={() => setShowSuggestionsModal(false)}
        thesisTitle={selectedThesis?.titulo}
        suggestions={sugerenciasVisibles}
        loading={loadingSugerencias}
        updatingSuggestionId={updatingSuggestionId}
        onSubmitSuggestion={handleSubmitAppliedSuggestion}
      />

      <QuotationModal
        open={showCreateModal}
        onClose={closeCreateModal}
        form={createForm}
        onFormChange={setCreateForm}
        nivelesAcademicos={NIVELES_ACADEMICOS}
        planesDisponibles={planesDisponibles}
        tiposTesis={tiposTesis}
        availableFormats={availableFormats}
        perfilEstudiante={perfilEstudiante}
        loadingCatalogs={loadingCatalogs}
        onReloadCatalogs={cargarCatalogosCreacion}
        quoteData={quoteData}
        quoteError={quoteError}
        quoting={quoting}
        creating={creating}
        canSubmit={canSubmitCreateThesis}
        onSubmit={handleCreateThesis}
      />
      <PaymentGatewayModal
        open={!!createdPaymentSummary}
        paymentSummary={createdPaymentSummary}
        onClose={closePaymentSummaryModal}
        onProceed={handleGoToPayments}
      />
    </div>
  );
}

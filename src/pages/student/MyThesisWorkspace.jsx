import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Select, SelectItem } from '../../components/ui/select';
import Modal from '../../components/ui/modal';
import WorkspaceTopBar from '../../components/student/workspace/WorkspaceTopBar';
import AccessManagementModal from '../../components/student/workspace/AccessManagementModal';
import SuggestionsThreadModal from '../../components/student/workspace/SuggestionsThreadModal';
import RelatedDocumentsPanel from '../../components/student/workspace/RelatedDocumentsPanel';
import AcademicAIChatPanel from '../../components/student/workspace/AcademicAIChatPanel';
import ThesisPreviewPanel from '../../components/student/workspace/ThesisPreviewPanel';
import ThesisDocBuilderPanel from '../../components/student/workspace/ThesisDocBuilderPanel';
import PaymentGatewayModal from '../../components/student/workspace/PaymentGatewayModal';
import {
  cotizarTesisPlan,
  crearTesisConPlan,
  obtenerMisTesis,
  obtenerSugerenciasMiTesis,
  obtenerTiposTesisActivos,
  obtenerTodosDocumentosMiTesis,
  marcarSugerenciaAplicadaEstudiante,
} from '../../services/thesisService';
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
};

const formatCurrency = (value, currency = 'PEN') =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: currency || 'PEN',
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString();
};

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
  const [showManualEditModal, setShowManualEditModal] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);

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

  const buildPreviewUrl = useCallback((url) => {
    if (!url) return null;

    const lowerUrl = url.toLowerCase();
    if (lowerUrl.endsWith('.doc') || lowerUrl.endsWith('.docx')) {
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

      toast.success('Tesis creada y pago generado');
      setShowCreateModal(false);
      resetCreateFlow();

      await fetchTheses();
      if (newThesis?.tesis_id || newThesis?.id) {
        setSelectedThesisId(newThesis?.tesis_id || newThesis?.id);
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

  const handleGeneratedDocx = useCallback(async () => {
    if (selectedThesisId) {
      await fetchDocuments(selectedThesisId);
    }
  }, [fetchDocuments, selectedThesisId]);

  const selectedThesis = useMemo(
    () => thesesList.find((item) => item.id === selectedThesisId),
    [thesesList, selectedThesisId],
  );

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
        return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
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

  const selectedPlanMeta = useMemo(
    () => planesDisponibles.find((plan) => plan.id === createForm.plan_id),
    [createForm.plan_id, planesDisponibles],
  );

  const selectedTipoMeta = useMemo(
    () => tiposTesis.find((tipo) => tipo.id === createForm.tipo_tesis_id),
    [createForm.tipo_tesis_id, tiposTesis],
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

  const createThesisModal = (
    <Modal
      open={showCreateModal}
      onClose={closeCreateModal}
      title="Crear tesis con cotización"
      subtitle="Completa tus datos, revisa el precio y luego genera el pago pendiente."
      modalWidth="xl"
      primaryAction={{
        label: creating ? 'Creando...' : 'Crear tesis y generar pago',
        onClick: handleCreateThesis,
        disabled: creating,
      }}
      secondaryAction={{
        label: 'Cancelar',
        onClick: closeCreateModal,
        disabled: creating,
      }}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <section className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Título de la tesis
              </label>
              <input
                type="text"
                value={createForm.titulo}
                onChange={(e) =>
                  setCreateForm((current) => ({
                    ...current,
                    titulo: e.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                placeholder="Ej: Impacto de la inteligencia artificial en procesos académicos"
                autoFocus
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Descripción
              </label>
              <textarea
                value={createForm.descripcion}
                onChange={(e) =>
                  setCreateForm((current) => ({
                    ...current,
                    descripcion: e.target.value,
                  }))
                }
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                placeholder="Breve contexto del problema de investigación"
                rows="4"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Plan
              </label>
              <Select
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm"
                value={createForm.plan_id}
                onChange={(e) =>
                  setCreateForm((current) => ({
                    ...current,
                    plan_id: e.target.value,
                  }))
                }
              >
                <SelectItem value="">
                  {loadingCatalogs
                    ? 'Cargando planes...'
                    : 'Selecciona un plan'}
                </SelectItem>
                {planesDisponibles.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.nombre}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Tipo de tesis
              </label>
              <Select
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm"
                value={createForm.tipo_tesis_id}
                onChange={(e) =>
                  setCreateForm((current) => ({
                    ...current,
                    tipo_tesis_id: e.target.value,
                  }))
                }
              >
                <SelectItem value="">
                  {loadingCatalogs
                    ? 'Cargando tipos...'
                    : 'Selecciona un tipo de tesis'}
                </SelectItem>
                {tiposTesis.map((tipo) => (
                  <SelectItem key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Nivel académico
              </label>
              <Select
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm"
                value={createForm.nivel_academico}
                onChange={(e) =>
                  setCreateForm((current) => ({
                    ...current,
                    nivel_academico: e.target.value,
                  }))
                }
              >
                {NIVELES_ACADEMICOS.map((nivel) => (
                  <SelectItem key={nivel.value} value={nivel.value}>
                    {nivel.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Análisis estadístico
              </label>
              <Select
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm"
                value={createForm.requiere_analisis_estadistico ? 'si' : 'no'}
                onChange={(e) =>
                  setCreateForm((current) => ({
                    ...current,
                    requiere_analisis_estadistico: e.target.value === 'si',
                  }))
                }
              >
                <SelectItem value="si">Sí, lo requiere</SelectItem>
                <SelectItem value="no">No, no lo requiere</SelectItem>
              </Select>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">
              Datos usados al crear
            </p>
            <p className="mt-2">
              Estudiante autenticado:{' '}
              <span className="font-medium text-slate-700">
                Se tomará desde tu sesión activa
              </span>
            </p>
            <p className="mt-2">
              Universidad del perfil:{' '}
              <span className="font-medium text-slate-700">
                {perfilEstudiante?.universidad_id
                  ? 'Se enviará la universidad registrada'
                  : 'No registrada, se enviará como null'}
              </span>
            </p>
            <p className="mt-1">
              Programa académico: no aplica en esta versión.
            </p>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
              Cotización
            </p>
            <h3 className="mt-2 text-xl font-black tracking-tight text-slate-900">
              Resumen del plan
            </h3>

            {loadingCatalogs ? (
              <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando catálogos...
              </div>
            ) : !planesDisponibles.length || !tiposTesis.length ? (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <p className="font-semibold">
                  No se pudieron cargar todos los catálogos.
                </p>
                <p className="mt-1">
                  Reintenta la carga para mostrar planes y tipos de tesis.
                </p>
                <Button
                  onClick={cargarCatalogosCreacion}
                  className="mt-4 h-10 rounded-xl px-4"
                >
                  Reintentar
                </Button>
              </div>
            ) : quoting ? (
              <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Calculando cotización...
              </div>
            ) : quoteError ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {quoteError}
              </div>
            ) : quoteData ? (
              <div className="mt-6 space-y-3 text-sm">
                <div className="rounded-2xl border border-white bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Configuración
                  </p>
                  <p className="mt-2 font-semibold text-slate-900">
                    {quoteData.plan_nombre ||
                      selectedPlanMeta?.nombre ||
                      'Plan'}
                  </p>
                  <p className="text-slate-500">
                    {quoteData.tipo_tesis_nombre ||
                      selectedTipoMeta?.nombre ||
                      'Tipo de tesis'}
                  </p>
                  <p className="text-slate-500">
                    Nivel:{' '}
                    {quoteData.nivel_academico || createForm.nivel_academico}
                  </p>
                </div>

                <div className="space-y-3 rounded-2xl border border-white bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Precio base</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(quoteData.precio_base, quoteData.moneda)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">
                      Recargo por nivel ({quoteData.porcentaje_nivel}%)
                    </span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(
                        quoteData.monto_ajuste_nivel,
                        quoteData.moneda,
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">
                      Descuento por no análisis
                    </span>
                    <span className="font-semibold text-emerald-700">
                      -{' '}
                      {formatCurrency(
                        quoteData.descuento_analisis_estadistico,
                        quoteData.moneda,
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
                    <span className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
                      Total
                    </span>
                    <span className="text-2xl font-black tracking-tight text-slate-900">
                      {formatCurrency(quoteData.precio_total, quoteData.moneda)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white/80 p-4 text-sm text-slate-500">
                Selecciona plan, tipo de tesis y nivel académico para calcular
                el precio final.
              </div>
            )}
          </div>
        </aside>
      </div>
    </Modal>
  );

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

        {createThesisModal}
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
      <div className="mx-auto flex min-h-0 w-full max-w-[1760px] flex-1 flex-col gap-3">
        <div className="shrink-0">
          <WorkspaceTopBar
            thesesList={thesesList}
            selectedThesisId={selectedThesisId}
            onSelectThesis={setSelectedThesisId}
            onOpenManualEdit={() => setShowManualEditModal(true)}
            onOpenAccesses={() => setShowAccessModal(true)}
            onOpenCreate={openCreateModal}
          />
        </div>

        <div className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
          <section className="flex min-h-0 flex-col gap-2">
            <RelatedDocumentsPanel
              documents={documents}
              currentDocumentId={currentVersion?.id}
              onSelectDocument={seleccionarVersion}
            />

            <ThesisPreviewPanel
              selectedThesis={selectedThesis}
              currentVersion={currentVersion}
              previewUrl={previewUrl}
              className="flex-1"
            />
          </section>

          <aside className="flex min-h-0 flex-col gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSuggestionsModal(true)}
              className="ios-secondary-button h-11 w-full justify-between rounded-xl px-3 text-sm"
            >
              <span className="inline-flex min-w-0 items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="truncate">Ver sugerencias del asesor</span>
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                {sugerenciasVisibles.length}
              </span>
            </Button>

            <AcademicAIChatPanel
              tesisId={selectedThesisId}
              documentId={currentVersion?.id}
              className="flex-1"
            />
          </aside>
        </div>
      </div>

      <Modal
        open={showManualEditModal}
        onClose={() => setShowManualEditModal(false)}
        title="Edición manual"
        subtitle={selectedThesis?.titulo || 'Documento de tesis'}
        modalWidth="lg"
        contentClassName="gap-4 p-4 text-left sm:p-6"
      >
        <ThesisDocBuilderPanel
          tesisId={selectedThesisId}
          onGenerated={handleGeneratedDocx}
          className="h-[min(74dvh,760px)] border border-slate-200 shadow-none"
        />
      </Modal>

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

      {createThesisModal}
      <PaymentGatewayModal
        open={!!createdPaymentSummary}
        paymentSummary={createdPaymentSummary}
        onClose={closePaymentSummaryModal}
        onProceed={handleGoToPayments}
      />
    </div>
  );
}

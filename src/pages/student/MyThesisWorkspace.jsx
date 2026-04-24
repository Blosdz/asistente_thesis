import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Select, SelectItem } from '../../components/ui/select';
import Modal from '../../components/ui/modal';
import WorkspaceTopBar from '../../components/student/workspace/WorkspaceTopBar';
import AccessManagementModal from '../../components/student/workspace/AccessManagementModal';
import SuggestionsThreadModal from '../../components/student/workspace/SuggestionsThreadModal';
import RelatedDocumentsPanel from '../../components/student/workspace/RelatedDocumentsPanel';
import AcademicAIPanel from '../../components/student/workspace/AcademicAIPanel';
import ThesisPreviewPanel from '../../components/student/workspace/ThesisPreviewPanel';
import PaymentGatewayModal from '../../components/student/workspace/PaymentGatewayModal';
import {
  cotizarTesisPlan,
  crearTesisConPlan,
  obtenerDocumentosMiTesis,
  obtenerMisTesis,
  obtenerSugerenciasMiTesis,
  obtenerTiposTesisActivos,
  marcarSugerenciaAplicadaEstudiante,
} from '../../services/thesisService';
import {
  asignarMiTesisAAsesor,
  obtenerMisAsesores,
  obtenerMisTesisConAsesores,
} from '../../services/advisorService';
import { obtenerPlanesDisponibles } from '../../services/pagosService';
import { obtenerPerfilEstudiante } from '../../services/studentService';
import { getSuggestionId } from '../../lib/suggestionValidation';

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
        const docs = await obtenerDocumentosMiTesis(thesisId);
        setDocuments(docs || []);

        if (docs && docs.length > 0) {
          const latestInfo = docs[0];
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
    try {
      setLoadingCatalogs(true);
      const [planes, tipos, perfil] = await Promise.all([
        obtenerPlanesDisponibles(),
        obtenerTiposTesisActivos(),
        obtenerPerfilEstudiante().catch(() => null),
      ]);

      setPlanesDisponibles(planes || []);
      setTiposTesis(tipos || []);
      setPerfilEstudiante(perfil || null);
    } catch (error) {
      console.error('Error loading thesis creation catalogs:', error);
      toast.error('No se pudieron cargar los catálogos de creación.');
      setPlanesDisponibles([]);
      setTiposTesis([]);
      setPerfilEstudiante(null);
    } finally {
      setLoadingCatalogs(false);
    }
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
  }, []);

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
  }, [createForm, showCreateModal]);

  const handleCreateThesis = async () => {
    if (!createForm.titulo.trim()) {
      toast.error('El título es requerido');
      return;
    }

    if (!perfilEstudiante?.estudiante_id) {
      toast.error('Completa tu perfil de estudiante antes de crear la tesis');
      return;
    }

    if (!quoteData) {
      toast.error('Completa la cotización antes de crear la tesis');
      return;
    }

    try {
      setCreating(true);
      const newThesis = await crearTesisConPlan({
        estudiante_id: perfilEstudiante.estudiante_id,
        titulo: createForm.titulo.trim(),
        descripcion: createForm.descripcion.trim() || null,
        plan_id: createForm.plan_id,
        tipo_tesis_id: createForm.tipo_tesis_id,
        nivel_academico: createForm.nivel_academico,
        requiere_analisis_estadistico: createForm.requiere_analisis_estadistico,
        universidad_id: perfilEstudiante?.universidad_id || null,
        programa_id: null,
        estado_tesis: 'borrador',
      });

      toast.success('Tesis creada en borrador');
      setShowCreateModal(false);
      resetCreateFlow();

      await fetchTheses();
      if (newThesis?.tesis_id) {
        setSelectedThesisId(newThesis.tesis_id);
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

  const canSubmitCreateFlow =
    !creating &&
    !quoting &&
    !loadingCatalogs &&
    !!perfilEstudiante?.estudiante_id &&
    !!createForm.titulo.trim() &&
    !!createForm.plan_id &&
    !!createForm.tipo_tesis_id &&
    !!createForm.nivel_academico &&
    !!quoteData;

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
        disabled: !canSubmitCreateFlow,
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
              Estudiante del perfil:{' '}
              <span className="font-medium text-slate-700">
                {perfilEstudiante?.estudiante_id
                  ? 'Se enviará el estudiante registrado'
                  : 'No disponible, primero completa tu perfil'}
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
        <Card className="w-full max-w-xl rounded-[32px] border-none bg-white p-12 text-center shadow-[0_36px_90px_-58px_rgba(15,23,42,0.4)]">
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
    <div className="relative w-full px-4 pb-10 pt-2 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-[1760px] flex-col gap-8">
        <WorkspaceTopBar
          thesesList={thesesList}
          selectedThesisId={selectedThesisId}
          onSelectThesis={setSelectedThesisId}
          onOpenAccesses={() => setShowAccessModal(true)}
          onOpenCreate={openCreateModal}
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
          <ThesisPreviewPanel
            selectedThesis={selectedThesis}
            currentVersion={currentVersion}
            previewUrl={previewUrl}
          />

          <aside className="space-y-6">
            <AcademicAIPanel
              suggestionCount={sugerenciasVisibles.length}
              onOpenSuggestions={() => setShowSuggestionsModal(true)}
            />

            <Card className="rounded-[28px] border-none bg-white p-6 shadow-[0_24px_50px_-38px_rgba(15,23,42,0.35)]">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                Estado del workspace
              </p>
              <div className="mt-5 space-y-4">
                <div className="rounded-[18px] bg-slate-50 px-4 py-4">
                  <p className="text-sm font-medium text-slate-900">
                    Documento activo
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {currentVersion?.nombre ||
                      currentVersion?.nombre_archivo ||
                      'Sin documento seleccionado'}
                  </p>
                </div>
                <div className="rounded-[18px] bg-slate-50 px-4 py-4">
                  <p className="text-sm font-medium text-slate-900">
                    Feedback pendiente
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {sugerenciasVisibles.length > 0
                      ? `${sugerenciasVisibles.length} sugerencia(s) en historial`
                      : 'Sin sugerencias registradas'}
                  </p>
                </div>
              </div>
            </Card>
            <RelatedDocumentsPanel
              documents={documents}
              currentDocumentId={currentVersion?.id}
              onSelectDocument={seleccionarVersion}
            />
          </aside>
        </div>
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

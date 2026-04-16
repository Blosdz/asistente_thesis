import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Loader2, Plus, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Select, SelectItem } from '../../components/ui/select';
import Modal from '../../components/ui/modal';
import {
  obtenerMisTesis,
  cotizarTesisPlan,
  crearTesisConPlan,
  obtenerDocumentosMiTesis,
  obtenerTiposTesisActivos,
  obtenerSugerenciasMiTesis,
  marcarSugerenciaAplicadaEstudiante,
} from '../../services/thesisService';
import {
  asignarMiTesisAAsesor,
  obtenerMisAsesores,
  obtenerMisTesisConAsesores,
} from '../../services/advisorService';
import { obtenerPlanesDisponibles } from '../../services/pagosService';
import { obtenerPerfilEstudiante } from '../../services/studentService';
import { toast } from 'react-hot-toast';
import {
  canStudentSubmitSuggestion,
  getStudentSuggestionActionLabel,
  getSuggestionAdvisorName,
  getSuggestionId,
  getSuggestionStatusMeta,
  getSuggestionText,
  getSuggestionTypeLabel,
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

const MyThesisWorkspace = () => {
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
  const [asesorAsignadoId, setAsesorAsignadoId] = useState('');
  const [assigningAdvisor, setAssigningAdvisor] = useState(false);
  const [applyModal, setApplyModal] = useState({
    open: false,
    suggestion: null,
    comment: '',
  });
  const [submittingAppliedSuggestion, setSubmittingAppliedSuggestion] =
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
          !theses.find((t) => t.id === selectedThesisId)
        ) {
          setSelectedThesisId(theses[0].id);
        }
      } else {
        setSelectedThesisId('');
      }
    } catch (err) {
      console.error('Error fetching theses:', err);
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
    } catch (err) {
      console.error('Error fetching advisors:', err);
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
      } catch (err) {
        console.error('Error fetching documents:', err);
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
    } catch (err) {
      console.error('Error fetching suggestions:', err);
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
          setQuoteError(
            error.message || 'No se pudo calcular la cotización.',
          );
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
        requiere_analisis_estadistico:
          createForm.requiere_analisis_estadistico,
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
    } catch (err) {
      console.error('Create thesis with plan error:', err);
      toast.error(err.message || 'Error al crear la tesis con cotización');
    } finally {
      setCreating(false);
    }
  };

  const handleAsignarAsesor = async () => {
    if (!selectedThesisId) {
      toast.error('Selecciona una tesis primero');
      return;
    }

    if (!asesorAsignadoId) {
      toast.error('Selecciona un asesor');
      return;
    }

    try {
      setAssigningAdvisor(true);
      await asignarMiTesisAAsesor(selectedThesisId, asesorAsignadoId, 'principal');
      toast.success('Permiso de tesis otorgado al asesor');
      setAsesorAsignadoId('');
      await fetchMisAsesores();
    } catch (err) {
      console.error('Error asignando tesis al asesor:', err);
      toast.error(err.message || 'No se pudo asignar la tesis al asesor');
    } finally {
      setAssigningAdvisor(false);
    }
  };

  const selectedThesis = useMemo(
    () => thesesList.find((t) => t.id === selectedThesisId),
    [thesesList, selectedThesisId],
  );

  const sugerenciasVisibles = useMemo(
    () =>
      sugerencias.filter(
        (item) => !item?.tesis_id || item.tesis_id === selectedThesisId,
      ),
    [sugerencias, selectedThesisId],
  );

  const asesoresDeTesis = useMemo(
    () =>
      tesisConAsesores.filter((item) => item.tesis_id === selectedThesisId),
    [tesisConAsesores, selectedThesisId],
  );

  const asesoresDisponiblesParaAsignar = useMemo(
    () =>
      misAsesores.filter(
        (asesor) =>
          !asesoresDeTesis.some(
            (asignado) => asignado.asesor_id === asesor.asesor_id,
          ),
      ),
    [misAsesores, asesoresDeTesis],
  );

  const seleccionarVersion = useCallback(
    (doc) => {
      setCurrentVersion(doc);
      const previewSource = doc?.url_google_doc || doc?.url_archivo_drive;
      setPreviewUrl(buildPreviewUrl(previewSource));
    },
    [buildPreviewUrl],
  );

  const getSuggestionDate = (item) =>
    item?.creado_en || item?.created_at || item?.r_creado_en;

  const openApplyModal = (item) => {
    setApplyModal({
      open: true,
      suggestion: item,
      comment: '',
    });
  };

  const closeApplyModal = () => {
    setApplyModal({
      open: false,
      suggestion: null,
      comment: '',
    });
  };

  const handleSubmitAppliedSuggestion = async () => {
    if (submittingAppliedSuggestion) return;

    const suggestionId = getSuggestionId(applyModal.suggestion);
    if (!suggestionId) {
      toast.error('No se pudo identificar la sugerencia');
      return;
    }

    try {
      setUpdatingSuggestionId(suggestionId);
      setSubmittingAppliedSuggestion(true);
      await marcarSugerenciaAplicadaEstudiante(
        suggestionId,
        applyModal.comment.trim() || null,
      );
      toast.success('Sugerencia enviada a validacion del asesor');
      closeApplyModal();
      await cargarSugerencias(selectedThesisId);
    } catch (error) {
      console.error('Error updating suggestion:', error);
      toast.error('No se pudo actualizar la sugerencia');
    } finally {
      setUpdatingSuggestionId(null);
      setSubmittingAppliedSuggestion(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString();
  };

  const selectedPlanMeta = useMemo(
    () => planesDisponibles.find((plan) => plan.id === createForm.plan_id),
    [createForm.plan_id, planesDisponibles],
  );

  const selectedTipoMeta = useMemo(
    () => tiposTesis.find((tipo) => tipo.id === createForm.tipo_tesis_id),
    [createForm.tipo_tesis_id, tiposTesis],
  );

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
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
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
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100 resize-none"
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
                  {loadingCatalogs ? 'Cargando planes...' : 'Selecciona un plan'}
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
                value={
                  createForm.requiere_analisis_estadistico ? 'si' : 'no'
                }
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
            <p className="font-semibold text-slate-800">Datos usados al crear</p>
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
            <p className="mt-1">Programa académico: no aplica en esta versión.</p>
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
                    {quoteData.plan_nombre || selectedPlanMeta?.nombre || 'Plan'}
                  </p>
                  <p className="text-slate-500">
                    {quoteData.tipo_tesis_nombre ||
                      selectedTipoMeta?.nombre ||
                      'Tipo de tesis'}
                  </p>
                  <p className="text-slate-500">
                    Nivel: {quoteData.nivel_academico || createForm.nivel_academico}
                  </p>
                </div>

                <div className="rounded-2xl border border-white bg-white p-4 space-y-3">
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
                  <div className="border-t border-slate-200 pt-3 flex items-center justify-between gap-3">
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

  const paymentSummaryModal = (
    <Modal
      open={!!createdPaymentSummary}
      onClose={() => setCreatedPaymentSummary(null)}
      title="Tesis creada con pago pendiente"
      subtitle="Tu cotización ya quedó congelada y el siguiente paso es subir el voucher."
      primaryAction={{
        label: 'Ir a Pagos',
        onClick: () => {
          const pagoId = createdPaymentSummary?.pago_id;
          setCreatedPaymentSummary(null);
          navigate('/student/payments', {
            state: { pagoId, autoOpenVoucher: true },
          });
        },
      }}
      secondaryAction={{
        label: 'Luego',
        onClick: () => setCreatedPaymentSummary(null),
      }}
    >
      {createdPaymentSummary && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Tesis
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              Estado: {createdPaymentSummary.estado_tesis}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              ID: {createdPaymentSummary.tesis_id}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Pago pendiente
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {formatCurrency(
                createdPaymentSummary.precio_total,
                createdPaymentSummary.moneda,
              )}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Estado: {createdPaymentSummary.estado_pago}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Pago ID: {createdPaymentSummary.pago_id}
            </p>
          </div>
        </div>
      )}
    </Modal>
  );

  if (!loading && thesesList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-700">
        <Card className="max-w-lg w-full p-12 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-ios-blue">
            <FileText size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Aún no tienes una tesis
          </h2>
          <p className="text-gray-500 mb-8">
            Para comenzar a gestionar tus documentos y versiones, crea tu
            primera tesis.
          </p>
          <button
            onClick={openCreateModal}
            className="bg-ios-blue text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-ios-blue/20 hover:scale-105 transition-transform active:scale-95 flex items-center gap-2 mx-auto"
          >
            <Plus size={20} />
            Crear Nueva Tesis
          </button>
        </Card>
        {createThesisModal}
        {paymentSummaryModal}
      </div>
    );
  }

  return (
    <div className="relative w-full px-4 sm:px-6 lg:px-10 animate-in fade-in duration-700 text-slate-900">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-full md:max-w-md">
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Tesis activa
            </label>
            <Select
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm"
              value={selectedThesisId}
              onChange={(e) => setSelectedThesisId(e.target.value)}
            >
              {thesesList.map((thesis) => (
                <SelectItem key={thesis.id} value={thesis.id}>
                  {thesis.titulo || 'Sin título'}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={openCreateModal}
              className="gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
              title="Crear Nueva Tesis"
            >
              <Plus size={18} />
              Crear tesis
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8 items-start">
          <aside className="col-span-12 lg:col-span-3 space-y-8">
            <Card className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Permisos
                  </p>
                  <h3 className="font-headline text-xl font-bold tracking-tight">
                    Asesores con acceso
                  </h3>
                </div>
                <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-600">
                  {asesoresDeTesis.length} activos
                </span>
              </div>

              <div className="space-y-3">
                {asesoresDeTesis.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                    Esta tesis aún no tiene asesores asignados.
                  </div>
                ) : (
                  asesoresDeTesis.map((item) => (
                    <div
                      key={item.asesor_tesis_id || `${item.tesis_id}-${item.asesor_id}`}
                      className="rounded-2xl border border-white/80 bg-white/70 p-4"
                    >
                      <p className="text-sm font-bold text-slate-900">
                        {item.asesor_nombre || 'Asesor'}
                      </p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                        Rol: {item.rol || 'principal'}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-5 space-y-3">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Dar permiso a un asesor
                </label>
                <Select
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm"
                  value={asesorAsignadoId}
                  onChange={(e) => setAsesorAsignadoId(e.target.value)}
                >
                  <SelectItem value="">Selecciona un asesor</SelectItem>
                  {asesoresDisponiblesParaAsignar.map((asesor) => (
                    <SelectItem
                      key={asesor.asesor_id || asesor.relacion_id}
                      value={asesor.asesor_id}
                    >
                      {asesor.nombre_mostrar || 'Asesor'}
                    </SelectItem>
                  ))}
                </Select>

                <Button
                  onClick={handleAsignarAsesor}
                  disabled={
                    assigningAdvisor ||
                    !selectedThesisId ||
                    !asesorAsignadoId
                  }
                  className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-white hover:bg-blue-700"
                >
                  {assigningAdvisor ? 'Otorgando permiso...' : 'Dar permiso'}
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Advisor Feedback
                  </p>
                  <h3 className="font-headline text-xl font-bold tracking-tight">
                    Notas del asesor
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                  {sugerenciasVisibles.length} notas
                </span>
              </div>

              {loadingSugerencias ? (
                <p className="text-sm text-slate-500">
                  Cargando sugerencias...
                </p>
              ) : sugerenciasVisibles.length === 0 ? (
                <div className="border border-dashed border-slate-200 rounded-xl p-4 text-sm text-slate-500">
                  No hay sugerencias registradas para esta tesis.
                </div>
              ) : (
                <div className="space-y-3">
                  {sugerenciasVisibles.map((item, idx) => {
                    const statusMeta = getSuggestionStatusMeta(item);
                    const suggestionId = getSuggestionId(item);
                    const canSubmit = canStudentSubmitSuggestion(item);

                    return (
                      <article
                        key={suggestionId || `${selectedThesisId}-${idx}`}
                        className="bg-white/70 border border-white/80 rounded-2xl p-4 hover:border-blue-100 transition"
                      >
                        <div className="flex gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                            {getSuggestionAdvisorName(item).charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate">
                                  {getSuggestionAdvisorName(item)}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  {formatDate(getSuggestionDate(item))}
                                </p>
                              </div>
                              <span className="shrink-0 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700">
                                {getSuggestionTypeLabel(item)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {getSuggestionText(item)}
                        </p>
                        {item.nombre_documento && (
                          <p className="text-[11px] text-slate-500 mt-2">
                            Documento: {item.nombre_documento}
                          </p>
                        )}
                        {item.comentario_estudiante && (
                          <div className="mt-3 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-700">
                              Tu comentario
                            </p>
                            <p className="mt-1 text-xs text-sky-900 leading-relaxed">
                              {item.comentario_estudiante}
                            </p>
                          </div>
                        )}
                        {item.comentario_asesor && (
                          <div className="mt-3 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-rose-700">
                              Comentario del asesor
                            </p>
                            <p className="mt-1 text-xs text-rose-900 leading-relaxed">
                              {item.comentario_asesor}
                            </p>
                          </div>
                        )}
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusMeta.badgeClass}`}
                          >
                            {statusMeta.label}
                          </span>
                          {canSubmit ? (
                            <button
                              type="button"
                              onClick={() => openApplyModal(item)}
                              disabled={updatingSuggestionId === suggestionId}
                              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white shadow-sm transition hover:bg-emerald-700 shadow-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {updatingSuggestionId === suggestionId
                                ? 'Enviando...'
                                : getStudentSuggestionActionLabel(item)}
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-500">
                              {statusMeta.hint}
                            </span>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="font-headline text-xl font-bold tracking-tight mb-4">
                Version History
              </h3>
              <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                {documents.slice(0, 4).map((doc, idx) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => seleccionarVersion(doc)}
                    className={`relative w-full rounded-2xl p-3 text-left transition ${
                      currentVersion?.id === doc.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`absolute -left-[20px] top-1 w-3 h-3 rounded-full ${
                        currentVersion?.id === doc.id
                          ? 'bg-blue-600 border-4 border-white'
                          : idx === 0
                            ? 'bg-blue-400 border-4 border-white'
                            : 'bg-slate-300'
                      }`}
                    />
                    {currentVersion?.id === doc.id ? (
                      <p className="text-[10px] font-bold text-blue-600">
                        VERSIÓN SELECCIONADA
                      </p>
                    ) : idx === 0 ? (
                      <p className="text-[10px] font-bold text-blue-600">
                        CURRENT VERSION
                      </p>
                    ) : null}
                    <p className="text-sm font-medium">
                      {doc.nombre || doc.nombre_archivo}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {formatDate(doc.created_at || doc.creado_en)}
                    </p>
                  </button>
                ))}
                {documents.length === 0 && (
                  <p className="text-xs text-slate-400">
                    Sin versiones disponibles.
                  </p>
                )}
              </div>
            </Card>
          </aside>

          <section className="col-span-12 lg:col-span-6">
            <Card className="overflow-hidden flex flex-col min-h-[870px] shadow-[0_0_40px_rgba(18,74,240,0.08)]">
              <div className="px-8 py-4 border-b border-slate-200/40 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-headline text-lg font-bold">
                      {selectedThesis?.titulo || 'Selecciona una tesis'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {selectedThesis?.descripcion ||
                        'Elige una tesis para ver la vista previa'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>100%</span>
                </div>
              </div>

              <div className="flex-1 bg-slate-50/70 p-12 overflow-y-auto">
                {previewUrl ? (
                  <iframe
                    src={previewUrl}
                    className="w-full min-h-[1000px] rounded-2xl border border-slate-200"
                    title="Thesis Preview"
                    allow="fullscreen"
                  />
                ) : (
                  <div className="max-w-2xl mx-auto shadow-2xl p-16 min-h-[1000px] text-slate-800">
                    <h2 className="text-3xl font-bold mb-8 text-center">
                      Vista previa no disponible
                    </h2>
                    <p className="text-sm text-slate-500 text-center max-w-lg mx-auto">
                      Selecciona o sube un documento para visualizarlo aquí.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </section>

          <aside className="col-span-12 lg:col-span-3">
            <Card className="flex flex-col h-[400px] overflow-hidden">
              <div className="p-4 border-b border-slate-200/40 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
                <h3 className="font-headline text-sm font-bold">Academic AI</h3>
              </div>
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <div className="p-3 rounded-lg rounded-tl-none">
                  <p className="text-xs">
                    ¿Quieres un resumen ejecutivo o sugerencias de citas para tu
                    capítulo activo?
                  </p>
                </div>
                <div className="p-3 rounded-lg rounded-tr-none ml-auto max-w-[80%] border border-blue-100">
                  <p className="text-xs text-slate-800">
                    Dame citas de 2024-2025.
                  </p>
                </div>
              </div>
              <div className="p-4">
                <div className="relative">
                  <input
                    className="w-full border-0 rounded-full py-2 px-4 pr-10 text-xs focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400"
                    placeholder="Ask AI Research Assistant..."
                    type="text"
                  />
                  <button className="absolute right-2 top-1.5 text-blue-600">
                    <Sparkles size={16} />
                  </button>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </div>

      <Modal
        open={applyModal.open}
        onClose={closeApplyModal}
        title="Enviar correccion"
        subtitle="Avisa al asesor que ya aplicaste esta sugerencia en tu tesis."
        primaryAction={{
          label: submittingAppliedSuggestion ? 'Enviando...' : 'Enviar a revision',
          onClick: handleSubmitAppliedSuggestion,
        }}
        secondaryAction={{
          label: 'Cancelar',
          onClick: closeApplyModal,
        }}
      >
        <div className="space-y-4 text-left">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Sugerencia
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              {getSuggestionText(applyModal.suggestion)}
            </p>
          </div>
          {applyModal.suggestion?.comentario_asesor && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-700">
                Observacion actual del asesor
              </p>
              <p className="mt-2 text-sm leading-relaxed text-rose-900">
                {applyModal.suggestion.comentario_asesor}
              </p>
            </div>
          )}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Comentario para el asesor
            </label>
            <textarea
              rows="4"
              value={applyModal.comment}
              onChange={(e) =>
                setApplyModal((current) => ({
                  ...current,
                  comment: e.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100 resize-none"
              placeholder="Opcional: indica que partes corregiste o en que documento lo aplicaste."
            />
          </div>
        </div>
      </Modal>
      {createThesisModal}
      {paymentSummaryModal}
    </div>
  );
};

export default MyThesisWorkspace;

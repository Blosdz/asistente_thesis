import { useEffect, useMemo, useState, useCallback } from 'react';
import { FileText, Upload, Plus, X, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../../components/ui/card';
import { Select, SelectItem } from '../../components/ui/select';
import Modal from '../../components/ui/modal';
import {
  obtenerMisTesis,
  crearMiTesis,
  obtenerDocumentosMiTesis,
  subirDocumentoAGoogleDrive,
  obtenerSugerenciasMiTesis,
} from '../../services/thesisService';
import {
  asignarMiTesisAAsesor,
  obtenerMisAsesores,
  obtenerMisTesisConAsesores,
} from '../../services/advisorService';
import { toast } from 'react-hot-toast';

const MyThesisWorkspace = () => {
  const [thesesList, setThesesList] = useState([]);
  const [selectedThesisId, setSelectedThesisId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [sugerencias, setSugerencias] = useState([]);
  const [loadingSugerencias, setLoadingSugerencias] = useState(false);
  const [misAsesores, setMisAsesores] = useState([]);
  const [tesisConAsesores, setTesisConAsesores] = useState([]);
  const [asesorAsignadoId, setAsesorAsignadoId] = useState('');
  const [assigningAdvisor, setAssigningAdvisor] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newThesisTitle, setNewThesisTitle] = useState('');
  const [newThesisDesc, setNewThesisDesc] = useState('');
  const [creating, setCreating] = useState(false);

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

  useEffect(() => {
    fetchTheses();
    fetchMisAsesores();
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
    const loadSugerencias = async () => {
      if (!selectedThesisId) {
        setSugerencias([]);
        return;
      }

      try {
        setLoadingSugerencias(true);
        const data = await obtenerSugerenciasMiTesis(selectedThesisId);
        setSugerencias(data || []);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        toast.error('No se pudieron cargar las sugerencias.');
        setSugerencias([]);
      } finally {
        setLoadingSugerencias(false);
      }
    };

    loadSugerencias();
  }, [selectedThesisId]);

  const handleCreateThesis = async () => {
    if (!newThesisTitle.trim()) return toast.error('El título es requerido');

    try {
      setCreating(true);
      const newThesis = await crearMiTesis({
        titulo: newThesisTitle,
        descripcion: newThesisDesc,
        universidad_id: null,
      });

      toast.success('Tesis creada con éxito');
      setShowCreateModal(false);
      setNewThesisTitle('');
      setNewThesisDesc('');

      await fetchTheses();
      if (newThesis && newThesis.id) {
        setSelectedThesisId(newThesis.id);
      }
    } catch (err) {
      console.error('Create error:', err);
      toast.error(err.message || 'Error al crear la tesis');
    } finally {
      setCreating(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!selectedThesisId) return toast.error('Selecciona una tesis primero');

    try {
      setUploading(true);
      const loadingToast = toast.loading('Subiendo documento...');

      await subirDocumentoAGoogleDrive({
        tesisId: selectedThesisId,
        file,
      });

      toast.dismiss(loadingToast);
      toast.success('Documento subido con éxito');
      fetchDocuments(selectedThesisId);
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(
        err.message || 'Error al subir el documento. Inténtalo de nuevo.',
      );
    } finally {
      setUploading(false);
      e.target.value = null;
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

  const getSuggestionText = (item) =>
    item?.sugerencia ||
    item?.comentario ||
    item?.observacion ||
    item?.r_sugerencia ||
    'Sin detalle';

  const getAdvisorName = (item) =>
    item?.nombre_asesor || item?.asesor || item?.r_nombre_asesor || 'Asesor';

  const getSuggestionDate = (item) =>
    item?.creado_en || item?.created_at || item?.r_creado_en;

  const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString();
  };

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
            onClick={() => setShowCreateModal(true)}
            className="bg-ios-blue text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-ios-blue/20 hover:scale-105 transition-transform active:scale-95 flex items-center gap-2 mx-auto"
          >
            <Plus size={20} />
            Crear Nueva Tesis
          </button>
        </Card>

        <Modal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Crear Nueva Tesis"
          subtitle="Configura el título y una breve descripción para comenzar."
          primaryAction={{
            label: creating ? 'Creando...' : 'Crear tesis',
            onClick: handleCreateThesis,
          }}
          secondaryAction={{
            label: 'Cancelar',
            onClick: () => setShowCreateModal(false),
          }}
        >
          <div className="space-y-4 text-left">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Título de la tesis
              </label>
              <input
                type="text"
                value={newThesisTitle}
                onChange={(e) => setNewThesisTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                placeholder="Ej: Análisis del impacto..."
                autoFocus
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Descripción
              </label>
              <textarea
                value={newThesisDesc}
                onChange={(e) => setNewThesisDesc(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100 resize-none"
                placeholder="Breve descripción de la investigación"
                rows="4"
              />
            </div>
          </div>
        </Modal>
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
              onClick={() => setShowCreateModal(true)}
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
                  {sugerencias.length} notas
                </span>
              </div>

              {loadingSugerencias ? (
                <p className="text-sm text-slate-500">
                  Cargando sugerencias...
                </p>
              ) : sugerencias.length === 0 ? (
                <div className="border border-dashed border-slate-200 rounded-xl p-4 text-sm text-slate-500">
                  No hay sugerencias registradas para esta tesis.
                </div>
              ) : (
                <div className="space-y-3">
                  {sugerencias.map((item, idx) => (
                    <article
                      key={
                        item.id ||
                        item.sugerencia_id ||
                        `${selectedThesisId}-${idx}`
                      }
                      className="bg-white/70 border border-white/80 rounded-2xl p-4 hover:border-blue-100 transition"
                    >
                      <div className="flex gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          {getAdvisorName(item).charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {getAdvisorName(item)}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {formatDate(getSuggestionDate(item))}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {getSuggestionText(item)}
                      </p>
                      {(item.nombre_documento || item.documento_tesis_id) && (
                        <p className="text-[11px] text-slate-500 mt-2">
                          Documento:{' '}
                          {item.nombre_documento || item.documento_tesis_id}
                        </p>
                      )}
                    </article>
                  ))}
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
        open={showCreateModal && thesesList.length > 0}
        onClose={() => setShowCreateModal(false)}
        title="Crear Nueva Tesis"
        subtitle="Configura el título y una breve descripción para comenzar."
        primaryAction={{
          label: creating ? 'Creando...' : 'Crear tesis',
          onClick: handleCreateThesis,
        }}
        secondaryAction={{
          label: 'Cancelar',
          onClick: () => setShowCreateModal(false),
        }}
      >
        <div className="space-y-4 text-left">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Título de la tesis
            </label>
            <input
              type="text"
              value={newThesisTitle}
              onChange={(e) => setNewThesisTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              placeholder="Ej: Análisis del impacto..."
              autoFocus
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Descripción
            </label>
            <textarea
              value={newThesisDesc}
              onChange={(e) => setNewThesisDesc(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100 resize-none"
              placeholder="Breve descripción de la investigación"
              rows="4"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyThesisWorkspace;

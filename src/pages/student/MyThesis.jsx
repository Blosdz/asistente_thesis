import { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Upload,
  History,
  ExternalLink,
  Info,
  Plus,
  Sparkles,
  X,
} from 'lucide-react';
import {
  obtenerMisTesis,
  crearMiTesis,
  obtenerDocumentosMiTesis,
  subirDocumentoAGoogleDrive,
  obtenerSugerenciasMiTesis,
} from '../../services/thesisService';
import { toast } from 'react-hot-toast';

const MyThesis = () => {
  const [thesesList, setThesesList] = useState([]);
  const [selectedThesisId, setSelectedThesisId] = useState('');

  const [currentVersion, setCurrentVersion] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newThesisTitle, setNewThesisTitle] = useState('');
  const [newThesisDesc, setNewThesisDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [sugerencias, setSugerencias] = useState([]);
  const [loadingSugerencias, setLoadingSugerencias] = useState(false);

  const buildPreviewUrl = useCallback((url, fileName = '') => {
    if (!url) return null;
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'doc' || ext === 'docx') {
      return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    }

    const driveUcMatch = url.match(/drive\.google\.com\/uc\?id=([^&]+)/);
    if (driveUcMatch) {
      return `https://drive.google.com/file/d/${driveUcMatch[1]}/preview`;
    }

    if (url.includes('drive.google.com')) {
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
        // If we don't have one selected or the selected one isn't in the list
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

  const fetchDocuments = useCallback(
    async (thesisId) => {
      try {
        setLoading(true);
        const docs = await obtenerDocumentosMiTesis(thesisId);
        setDocuments(docs || []);

        if (docs && docs.length > 0) {
          const latestInfo = docs[0];
          setCurrentVersion(latestInfo);

          const previewUrl = buildPreviewUrl(
            latestInfo.url_google_doc || latestInfo.url_archivo_drive,
            latestInfo.nombre_archivo || latestInfo.nombre,
          );
          setPreviewUrl(previewUrl);
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
    const fetchSugerencias = async () => {
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

    fetchSugerencias();
  }, [selectedThesisId]);

  const handleCreateThesis = async (e) => {
    e.preventDefault();
    if (!newThesisTitle.trim()) return toast.error('El título es requerido');

    try {
      setCreating(true);
      // Asumiendo que universidad_id puede ser nulo o hay un default en el backend si no se pasa, o pasamos hardcoded si es proto.
      const newThesis = await crearMiTesis({
        titulo: newThesisTitle,
        descripcion: newThesisDesc,
        universidad_id: null, // Ajustar según backend si es requerido
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

  const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString();
  };

  const selectedThesis = thesesList.find((t) => t.id === selectedThesisId);
  const totalTheses = thesesList.length;
  const totalDocuments = documents.length;
  const totalSuggestions = sugerencias.length;

  const getSuggestionText = (item) =>
    item?.sugerencia || item?.comentario || item?.observacion || 'Sin detalle';

  const getAdvisorName = (item) =>
    item?.nombre_asesor || item?.asesor || item?.r_nombre_asesor || 'Asesor';

  const getSuggestionStatus = (item) => {
    const estado = (item?.estado || item?.estado_sugerencia || item?.r_estado || '')
      .toString()
      .toLowerCase();

    if (estado.includes('resuelto') || estado.includes('aprob')) {
      return { label: 'Resuelto', tone: 'success' };
    }
    if (estado.includes('rechaz')) {
      return { label: 'Rechazado', tone: 'danger' };
    }
    return { label: 'Action required', tone: 'warning' };
  };

  if (!loading && thesesList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-700">
        <div className="glass-card max-w-lg w-full p-12 text-center">
          <div className="w-20 h-20 bg-ios-blue/10 rounded-full flex items-center justify-center mx-auto mb-6 text-ios-blue">
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
        </div>

        {/* Modal Creating Empty State */}
        {showCreateModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
            <div className="glass-card p-8 max-w-md w-full relative animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-white/20 rounded-full transition-colors"
                title="Cerrar"
              >
                <X size={24} />
              </button>
              <h3 className="text-2xl font-bold mb-6 text-gray-900 pr-8">
                Crear Nueva Tesis
              </h3>
              <form onSubmit={handleCreateThesis} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Título de la Tesis
                  </label>
                  <input
                    type="text"
                    value={newThesisTitle}
                    onChange={(e) => setNewThesisTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ios-blue outline-none transition-all"
                    placeholder="Ej: Análisis del impacto..."
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Descripción (Opcional)
                  </label>
                  <textarea
                    value={newThesisDesc}
                    onChange={(e) => setNewThesisDesc(e.target.value)}
                    className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ios-blue outline-none transition-all resize-none"
                    placeholder="Breve descripción de la investigación"
                    rows="3"
                  />
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full py-3 bg-ios-blue text-white rounded-xl font-bold shadow-lg shadow-ios-blue/20 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creando...' : 'Crear Tesis'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full px-4 sm:px-6 lg:px-10 py-12 animate-in fade-in duration-700 text-slate-900">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,#dde1ff_0%,#f7f9fb_45%),radial-gradient(circle_at_bottom_left,#e1e0ff_0%,#f7f9fb_45%)]" />
      <div className="max-w-[1600px] mx-auto flex flex-col gap-8">
        <header className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-500">
                Mi tesis
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
                ThesisFlow - Student Workspace
              </h1>
              <p className="text-slate-600 max-w-2xl text-sm sm:text-base mt-2">
                Gestiona tu progreso, versiones y feedback en un solo espacio.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/80 border border-white/90 text-blue-600 font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
                title="Crear Nueva Tesis"
              >
                <Plus size={18} />
                Crear tesis
              </button>
              <button
                onClick={() => setShowSuggestionsModal(true)}
                disabled={!selectedThesisId}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-full font-semibold shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${
                  totalSuggestions > 0
                    ? 'bg-amber-500 text-white hover:shadow-md hover:-translate-y-0.5'
                    : 'bg-white/80 border border-white/90 text-slate-700 hover:shadow-md hover:-translate-y-0.5'
                }`}
                title="Mis Sugerencias"
              >
                Mis sugerencias
                <span className="inline-flex min-w-6 h-6 px-2 items-center justify-center rounded-full text-xs font-extrabold bg-white/90 text-amber-600">
                  {totalSuggestions}
                </span>
              </button>
            </div>
          </div>
        </header>

        {totalSuggestions > 0 && (
          <div className="rounded-2xl p-4 border border-amber-200 bg-amber-50/60 text-amber-800 text-sm font-medium">
            Tienes {totalSuggestions} sugerencia(s) pendiente(s) de revision.
          </div>
        )}

        <div className="grid grid-cols-12 gap-8 items-start">
          <aside className="col-span-12 lg:col-span-3 space-y-6">
            <section className="rounded-2xl p-6 border border-white/70 bg-white/35 backdrop-blur-2xl shadow-[0_0_30px_rgba(18,74,240,0.06)]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Documentos
                  </p>
                  <h3 className="text-xl font-bold tracking-tight text-slate-900">Project Files</h3>
                </div>
                <button
                  onClick={() => document.getElementById('thesis-upload')?.click()}
                  className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition"
                  title="Subir nuevo documento"
                >
                  <Upload size={18} />
                </button>
              </div>
              <div className="space-y-2">
                {documents.slice(0, 6).map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 p-3 rounded-xl transition bg-white/40 border border-white/60 hover:border-blue-100"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-semibold truncate text-slate-800">
                        {doc.nombre || doc.nombre_archivo}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {formatDate(doc.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                {documents.length === 0 && (
                  <p className="text-xs text-slate-400">Sin archivos cargados.</p>
                )}
              </div>
            </section>

            <section className="rounded-2xl p-6 border border-white/70 bg-white/35 backdrop-blur-2xl shadow-[0_0_30px_rgba(18,74,240,0.06)]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Feedback del asesor
                  </p>
                  <h3 className="text-xl font-bold tracking-tight text-slate-900">
                    Advisor Feedback
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                  {totalSuggestions} notas
                </span>
              </div>

              {loadingSugerencias ? (
                <p className="text-sm text-slate-500">Cargando sugerencias...</p>
              ) : totalSuggestions === 0 ? (
                <div className="border border-dashed border-slate-200 rounded-xl p-4 text-sm text-slate-500 bg-white/50">
                  No hay sugerencias registradas para esta tesis.
                </div>
              ) : (
                <div className="space-y-3">
                  {sugerencias.map((item, idx) => {
                    const status = getSuggestionStatus(item);
                    const toneMap = {
                      success: 'bg-emerald-50 text-emerald-700',
                      danger: 'bg-rose-50 text-rose-700',
                      warning: 'bg-amber-50 text-amber-800',
                    };
                    const badgeClass = toneMap[status.tone] || toneMap.warning;

                    return (
                      <article
                        key={item.id || item.sugerencia_id || `${selectedThesisId}-${idx}`}
                        className="bg-white/70 border border-white/80 rounded-2xl p-4 hover:border-blue-100 transition"
                      >
                        <div className="flex gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                            {getAdvisorName(item).charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-bold text-slate-900 truncate">
                                  {getAdvisorName(item)}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  {formatDate(item.creado_en || item.created_at || item.r_creado_en)}
                                </p>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${badgeClass}`}>
                                {status.label}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {getSuggestionText(item)}
                        </p>
                        {(item.nombre_documento || item.documento_tesis_id) && (
                          <p className="text-[11px] text-slate-500 mt-2">
                            Documento: {item.nombre_documento || item.documento_tesis_id}
                          </p>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </aside>

          <section className="col-span-12 lg:col-span-6">
            <div className="rounded-2xl overflow-hidden border border-white/60 bg-white/30 backdrop-blur-2xl shadow-[0_0_40px_rgba(18,74,240,0.08)] min-h-[870px] flex flex-col">
              <div className="px-8 py-4 border-b border-slate-200/60 flex justify-between items-center bg-white/40">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">
                      {selectedThesis?.titulo || 'Tu tesis'}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {selectedThesis?.descripcion || 'Seccion principal'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>100%</span>
                </div>
              </div>
              <div className="flex-1 bg-slate-50/60 p-8 overflow-y-auto">
                {previewUrl ? (
                  <iframe
                    src={previewUrl}
                    className="w-full min-h-[700px] rounded-2xl border border-slate-200 bg-white"
                    title="Thesis Preview"
                    allow="fullscreen"
                  />
                ) : (
                  <div className="bg-white max-w-2xl mx-auto shadow-2xl p-12 min-h-[600px] text-slate-800 rounded-2xl">
                    <h2 className="text-2xl font-bold mb-4 text-center">
                      Vista previa no disponible
                    </h2>
                    <p className="text-sm text-slate-500 text-center">
                      Sube o selecciona un documento para visualizarlo aqui.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
          <aside className="col-span-12 lg:col-span-3 space-y-8">
            <section className="rounded-2xl p-6 border border-white/60 bg-white/30 backdrop-blur-2xl">
              <h3 className="text-lg font-bold tracking-tight mb-4">Subir documento</h3>
              <p className="text-sm text-slate-500 mb-4">
                Sube la version principal de tu tesis para mantener el historial actualizado.
              </p>
              <label
                className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-semibold text-sm text-white shadow-lg transition-all ${
                  uploading || !selectedThesisId
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-400 hover:scale-105 active:scale-95'
                }`}
              >
                <Upload size={18} />
                {uploading ? 'Subiendo...' : 'Seleccionar archivo'}
                <input
                  type="file"
                  id="thesis-upload"
                  onChange={handleUpload}
                  disabled={uploading || !selectedThesisId}
                  className="hidden"
                  accept="*/*"
                />
              </label>
            </section>

            <section className="rounded-2xl p-6 border border-white/60 bg-white/30 backdrop-blur-2xl">
              <h3 className="text-lg font-bold tracking-tight mb-4">Version History</h3>
              <div className="relative pl-6 space-y-6 before:absolute before:left-[10px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                {documents.slice(0, 3).map((doc, idx) => (
                  <div key={doc.id} className="relative">
                    <div
                      className={`absolute -left-[18px] top-1 w-3 h-3 rounded-full ${
                        idx === 0 ? 'bg-blue-500 border-4 border-white' : 'bg-slate-300'
                      }`}
                    />
                    {idx === 0 && (
                      <p className="text-[10px] font-bold text-blue-500">
                        CURRENT VERSION
                      </p>
                    )}
                    <p className="text-sm font-medium">
                      {doc.nombre || doc.nombre_archivo}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {formatDate(doc.created_at)}
                    </p>
                  </div>
                ))}
                {documents.length === 0 && (
                  <p className="text-xs text-slate-400">Sin versiones todavia.</p>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* Modal Creating over active layout */}
      {showCreateModal && thesesList.length > 0 && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
          <div className="glass-card p-8 max-w-md w-full relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-white/20 rounded-full transition-colors"
              title="Cerrar"
            >
              <X size={24} />
            </button>
            <h3 className="text-2xl font-bold mb-6 text-gray-900 pr-8">
              Crear Nueva Tesis
            </h3>
            <form onSubmit={handleCreateThesis} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Título de la Tesis
                </label>
                <input
                  type="text"
                  value={newThesisTitle}
                  onChange={(e) => setNewThesisTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ios-blue outline-none transition-all"
                  placeholder="Ej: Análisis del impacto..."
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Descripción (Opcional)
                </label>
                <textarea
                  value={newThesisDesc}
                  onChange={(e) => setNewThesisDesc(e.target.value)}
                  className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ios-blue outline-none transition-all resize-none"
                  placeholder="Breve descripción de la investigación"
                  rows="3"
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full py-3 bg-ios-blue text-white rounded-xl font-bold shadow-lg shadow-ios-blue/20 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creando...' : 'Crear Tesis'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showPreviewModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
          <div className="glass-card w-full max-w-6xl h-[85vh] flex flex-col p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowPreviewModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-white/20 rounded-full transition-colors"
              title="Cerrar"
            >
              <X size={24} />
            </button>
            <div className="mb-6 pr-10">
              <h3 className="text-2xl font-bold text-gray-900">
                {selectedThesis?.titulo || 'Detalle de la tesis'}
              </h3>
              <p className="text-sm text-gray-500 max-w-3xl">
                {selectedThesis?.descripcion ||
                  'Agrega una descripción para contextualizar tu investigación.'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
              <aside className="lg:col-span-1 flex flex-col gap-4 overflow-hidden">
                <div className="glass-card p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                    Información
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Estado</span>
                      <span className="font-semibold text-gray-700">
                        {selectedThesis?.estado || 'En progreso'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Creado</span>
                      <span className="font-semibold text-gray-700">
                        {formatDate(selectedThesis?.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Actualizado</span>
                      <span className="font-semibold text-gray-700">
                        {formatDate(selectedThesis?.updated_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-4">
                  <label
                    className={`
                      bg-ios-blue text-white px-4 py-3 rounded-2xl font-bold shadow-lg shadow-ios-blue/20
                      flex items-center justify-center gap-2 hover:scale-105 transition-transform active:scale-95 cursor-pointer
                      ${uploading ? 'opacity-50 pointer-events-none' : ''}
                    `}
                  >
                    <Upload size={18} />
                    {uploading ? 'Subiendo...' : 'Subir archivo'}
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-400 mt-2">
                    Sube cualquier archivo asociado a la tesis.
                  </p>
                </div>

                <div className="glass-card p-4 flex-1 overflow-hidden">
                  <h4 className="text-sm font-bold flex items-center gap-2 mb-4">
                    <History size={18} className="text-ios-blue" />
                    Documentos de la tesis
                  </h4>
                  <div className="space-y-3 overflow-y-auto max-h-[320px] pr-1">
                    {documents.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => {
                          setCurrentVersion(doc);
                          const preview = buildPreviewUrl(
                            doc.url_google_doc || doc.url_archivo_drive,
                            doc.nombre_archivo || doc.nombre,
                          );
                          setPreviewUrl(preview);
                        }}
                        className={`w-full text-left p-3 rounded-2xl border transition-all ${
                          currentVersion?.id === doc.id
                            ? 'bg-ios-blue/5 border-ios-blue/20 shadow-sm'
                            : 'bg-white/60 border-transparent hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText
                              size={16}
                              className={
                                doc.url_google_doc || doc.url_archivo_drive
                                  ? 'text-ios-blue'
                                  : 'text-gray-400'
                              }
                            />
                            <span className="text-xs font-bold text-gray-700 truncate max-w-[160px]">
                              {doc.nombre || doc.nombre_archivo}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400">
                            {formatDate(doc.created_at)}
                          </span>
                        </div>
                        {(doc.tipo || doc.tipo_documento || doc.estado) && (
                          <div className="flex items-center justify-between mt-2">
                            {doc.tipo || doc.tipo_documento ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-gray-100 text-gray-600">
                                {doc.tipo || doc.tipo_documento}
                              </span>
                            ) : (
                              <span />
                            )}
                            {doc.estado && (
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  doc.estado === 'Aprobado'
                                    ? 'bg-green-100 text-green-700'
                                    : doc.estado === 'Observado'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {doc.estado}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    ))}

                    {documents.length === 0 && (
                      <p className="text-center text-xs text-gray-400 py-4">
                        Esta tesis aún no tiene versiones.
                      </p>
                    )}
                  </div>
                </div>
              </aside>

              <section className="lg:col-span-2 glass-card p-6 flex flex-col overflow-hidden">
                <h4 className="text-sm font-bold text-gray-700 mb-4">
                  Previsualizador de la tesis
                </h4>
                {previewUrl ? (
                  <iframe
                    src={previewUrl}
                    className="w-full flex-1 min-h-[520px] rounded-[24px] border border-gray-200 shadow-inner bg-white"
                    title="Document Preview"
                    allow="fullscreen"
                  />
                ) : (
                  <div className="flex-1 border-2 border-dashed border-gray-200 rounded-[32px] flex flex-col items-center justify-center text-center p-12 bg-gray-50/50">
                    <div className="w-16 h-16 bg-gray-200/50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                      <Info size={32} />
                    </div>
                    <h4 className="text-lg font-bold text-gray-700 mb-2">
                      Vista previa no disponible
                    </h4>
                    <p className="text-sm text-gray-500 max-w-sm">
                      Selecciona un documento del historial que contenga enlace
                      a Drive para verlo aquí.
                    </p>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      )}

      {showSuggestionsModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
          <div className="glass-card w-full max-w-2xl max-h-[85vh] flex flex-col p-6 relative animate-in zoom-in-95 duration-200 overflow-hidden">
            <button
              onClick={() => setShowSuggestionsModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-white/20 rounded-full transition-colors"
              title="Cerrar"
            >
              <X size={24} />
            </button>

            <div className="mb-5 pr-10">
              <h3 className="text-2xl font-bold text-gray-900">
                Mis Sugerencias
              </h3>
              <p className="text-sm text-gray-500">
                Comentarios enviados por tu asesor para mejorar tu tesis.
              </p>
            </div>

            <div className="overflow-y-auto pr-1 space-y-3">
              {loadingSugerencias ? (
                <p className="text-sm text-gray-500">Cargando sugerencias...</p>
              ) : sugerencias.length === 0 ? (
                <div className="border border-dashed border-gray-300 rounded-2xl p-6 text-center text-sm text-gray-500 bg-white/40">
                  No tienes sugerencias registradas para esta tesis.
                </div>
              ) : (
                sugerencias.map((item, idx) => (
                  <article
                    key={
                      item.id ||
                      item.sugerencia_id ||
                      `${selectedThesisId}-${idx}`
                    }
                    className="bg-white/70 border border-white/80 rounded-2xl p-4"
                  >
                    <p className="text-sm text-gray-800 leading-relaxed">
                      {getSuggestionText(item)}
                    </p>
                    <div className="mt-3 text-xs text-gray-500 flex flex-wrap gap-3">
                      <span>
                        Fecha: {formatDate(item.creado_en || item.created_at)}
                      </span>
                      {(item.nombre_documento || item.documento_tesis_id) && (
                        <span>
                          Documento:{' '}
                          {item.nombre_documento || item.documento_tesis_id}
                        </span>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyThesis;

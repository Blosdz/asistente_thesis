import { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Upload,
  History,
  ExternalLink,
  Info,
  Plus,
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

  const getSuggestionText = (item) =>
    item?.sugerencia || item?.comentario || item?.observacion || 'Sin detalle';

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mis Tesis</h2>
          <p className="text-sm text-gray-500">
            Gestiona tus tesis, versiones y previsualizaciones.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-white/70 backdrop-blur-xl border border-white/80 text-ios-blue rounded-2xl font-bold shadow-sm hover:scale-105 transition-transform active:scale-95"
          title="Crear Nueva Tesis"
        >
          <Plus size={20} />
          Crear Tesis
        </button>

        <button
          onClick={() => setShowSuggestionsModal(true)}
          disabled={!selectedThesisId}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold shadow-sm transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
            sugerencias.length > 0
              ? 'bg-amber-500 text-white hover:scale-105'
              : 'bg-white/70 backdrop-blur-xl border border-white/80 text-slate-700 hover:scale-105'
          }`}
          title="Mis Sugerencias"
        >
          Mis Sugerencias
          <span className="inline-flex min-w-6 h-6 px-2 items-center justify-center rounded-full text-xs font-extrabold bg-white/90 text-amber-600">
            {sugerencias.length}
          </span>
        </button>
      </div>

      {sugerencias.length > 0 && (
        <div className="glass-card p-4 border border-amber-200 bg-amber-50/60 text-amber-800 text-sm font-medium">
          Tienes {sugerencias.length} sugerencia(s) pendiente(s) de revisión.
        </div>
      )}

      <div className="glass-card p-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Última actualización</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/50">
              {thesesList.map((thesis) => (
                <tr
                  key={thesis.id}
                  className="hover:bg-white/60 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="w-10 h-10 bg-ios-blue/10 text-ios-blue rounded-full flex items-center justify-center">
                        <FileText size={18} />
                      </span>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {thesis.titulo || 'Sin título'}
                        </p>
                        <p className="text-xs text-gray-400">ID {thesis.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-600 max-w-[280px]">
                    <p className="line-clamp-2">
                      {thesis.descripcion || 'Sin descripción registrada.'}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                      {thesis.estado || 'En progreso'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-500">
                    {formatDate(thesis.updated_at || thesis.created_at)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedThesisId(thesis.id);
                        setShowPreviewModal(true);
                      }}
                      className="inline-flex items-center gap-2 text-ios-blue font-semibold hover:text-blue-700"
                    >
                      Ver detalles
                      <ExternalLink size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <section className="glass-card p-8 min-h-[520px] flex flex-col">
        <h3 className="text-lg font-bold mb-6">Previsualización de la tesis</h3>
        {previewUrl ? (
          <iframe
            src={previewUrl}
            className="w-full flex-1 min-h-[560px] rounded-[24px] border border-gray-200 shadow-inner bg-white"
            title="Thesis Preview"
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
              Selecciona un documento del historial que contenga enlace a Drive
              para verlo aquí.
            </p>
          </div>
        )}
      </section>

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

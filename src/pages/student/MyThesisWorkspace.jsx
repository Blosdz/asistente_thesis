import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  FileText,
  Upload,
  Info,
  Plus,
  X,
  Sparkles,
  MessageSquare,
  ClipboardList,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Select, SelectItem } from '../../components/ui/select';
import {
  obtenerMisTesis,
  crearMiTesis,
  obtenerDocumentosMiTesis,
  subirDocumentoAGoogleDrive,
} from '../../services/thesisService';
import { toast } from 'react-hot-toast';

const MyThesisWorkspace = () => {
  const [thesesList, setThesesList] = useState([]);
  const [selectedThesisId, setSelectedThesisId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

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
        if (!selectedThesisId || !theses.find((t) => t.id === selectedThesisId)) {
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

  const fetchDocuments = useCallback(async (thesisId) => {
    try {
      setLoading(true);
      const docs = await obtenerDocumentosMiTesis(thesisId);
      setDocuments(docs || []);

      if (docs && docs.length > 0) {
        const latestInfo = docs[0];
        setCurrentVersion(latestInfo);

        const previewSource = latestInfo.url_google_doc || latestInfo.url_archivo_drive;
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
  }, [buildPreviewUrl]);

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

  const handleCreateThesis = async (e) => {
    e.preventDefault();
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
      toast.error(err.message || 'Error al subir el documento. Inténtalo de nuevo.');
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const selectedThesis = useMemo(
    () => thesesList.find((t) => t.id === selectedThesisId),
    [thesesList, selectedThesisId],
  );

  const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString();
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
            Para comenzar a gestionar tus documentos y versiones, crea tu primera tesis.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-ios-blue text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-ios-blue/20 hover:scale-105 transition-transform active:scale-95 flex items-center gap-2 mx-auto"
          >
            <Plus size={20} />
            Crear Nueva Tesis
          </button>
        </div>

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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workspace de Tesis</h2>
          <p className="text-sm text-gray-500">
            Vista inspirada en Editorial Scholar para revisar y gestionar tu tesis.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setShowCreateModal(true)}
          className="gap-2 text-ios-blue bg-white/70 border-white/80"
          title="Crear Nueva Tesis"
        >
          <Plus size={20} />
          Crear Tesis
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)_360px] 2xl:grid-cols-[300px_minmax(0,1fr)_400px] gap-6">
        <aside className="glass-card p-4 flex flex-col gap-4 max-h-[calc(100vh-220px)] min-h-[520px]">
          <Button
            onClick={() => setShowCreateModal(true)}
            className="w-full gap-2"
          >
            <Plus size={18} />
            Nueva Tesis
          </Button>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 px-2">
              Manuscritos
            </h3>
            {thesesList.map((thesis) => {
              const isActive = thesis.id === selectedThesisId;
              return (
                <button
                  key={thesis.id}
                  onClick={() => setSelectedThesisId(thesis.id)}
                  className={`w-full text-left rounded-xl p-3 transition-all border ${
                    isActive
                      ? 'bg-white text-ios-blue border-ios-blue/20 shadow-sm'
                      : 'bg-white/60 text-gray-700 border-transparent hover:bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        isActive ? 'bg-ios-blue/10 text-ios-blue' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <FileText size={16} />
                    </span>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold truncate">
                        {thesis.titulo || 'Sin título'}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Actualizado {formatDate(thesis.updated_at || thesis.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

  <main className="glass-card p-8 flex flex-col gap-6 min-h-[620px]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-ios-blue font-bold">
                {selectedThesis?.codigo || 'Capítulo activo'}
              </p>
              <h1 className="text-2xl font-extrabold text-gray-900">
                {selectedThesis?.titulo || 'Selecciona una tesis'}
              </h1>
              <p className="text-sm text-gray-500 max-w-xl">
                {selectedThesis?.descripcion || 'Selecciona una tesis para ver los detalles y documentos.'}
              </p>
            </div>
            {/* <label
              className={`bg-ios-blue text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-ios-blue/20 flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 cursor-pointer ${
                uploading ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <Upload size={18} />
              {uploading ? 'Subiendo...' : 'Subir archivo'}
              <input
                type="file"
                accept=""
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
            </label> */}
          </div>

          <div className="flex-1 flex flex-col">
            {previewUrl ? (
              <iframe
                src={previewUrl}
                className="w-full flex-1 min-h-[620px] rounded-[24px] border border-gray-200 shadow-inner bg-white"
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
                  Selecciona un documento del historial que contenga enlace a Drive para verlo aquí.
                </p>
              </div>
            )}
          </div>

          {documents.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Elegir documento</span>
                <Select
                  value={currentVersion?.id || documents[0].id}
                  onChange={(e) => {
                    const doc = documents.find((d) => d.id === e.target.value);
                    if (doc) {
                      setCurrentVersion(doc);
                      const previewSource = doc.url_google_doc || doc.url_archivo_drive;
                      setPreviewUrl(buildPreviewUrl(previewSource));
                    }
                  }}
                  className="py-2 px-3 text-sm font-semibold"
                >
                  {documents.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.nombre || doc.nombre_archivo}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2">
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => {
                      setCurrentVersion(doc);
                      const previewSource = doc.url_google_doc || doc.url_archivo_drive;
                      setPreviewUrl(buildPreviewUrl(previewSource));
                    }}
                    className={`min-w-[220px] p-4 rounded-2xl border text-left transition-all shrink-0 ${
                      currentVersion?.id === doc.id
                        ? 'bg-ios-blue/5 border-ios-blue/20'
                        : 'bg-white/70 border-white/80 hover:bg-white'
                    }`}
                  >
                    <p className="text-xs font-semibold text-gray-500">Documento</p>
                    <p className="text-sm font-bold text-gray-800 truncate">{doc.nombre || doc.nombre_archivo}</p>
                    <p className="text-[10px] text-gray-400 mt-2">
                      {formatDate(doc.created_at)} {doc.tipo || doc.tipo_documento ? `· ${doc.tipo || doc.tipo_documento}` : ''}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>

  <aside className="glass-card p-6 flex flex-col gap-6 max-h-[calc(100vh-220px)] min-h-[520px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-full bg-ios-blue/10 flex items-center justify-center text-ios-blue">
                <Sparkles size={18} />
              </span>
              <div>
                <p className="text-sm font-bold">Editorial Assistant</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Activo</p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="bg-white/80 p-4 rounded-2xl shadow-sm">
              <p className="text-sm text-gray-700">
                He revisado tu capítulo actual. ¿Deseas un resumen ejecutivo o sugerencias de citas?
              </p>
              <p className="text-[10px] text-gray-400 mt-3">10:42 AM</p>
            </div>
            <div className="bg-ios-blue text-white p-4 rounded-2xl shadow-sm">
              <p className="text-sm">Resume la teoría principal y señala vacíos en el marco teórico.</p>
              <p className="text-[10px] text-white/70 mt-3">10:45 AM</p>
            </div>
            <div className="bg-white/80 p-4 rounded-2xl shadow-sm space-y-2">
              <p className="text-sm font-bold text-gray-800">Resumen rápido:</p>
              <p className="text-sm text-gray-600">
                La tesis propone un modelo híbrido que reduce la entropía del entrenamiento al combinar kernels cuánticos con capas clásicas.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-ios-blue/10 text-ios-blue text-[10px] font-bold rounded-full">
                  Concepto: Decoherencia
                </span>
                <span className="px-2 py-1 bg-ios-blue/10 text-ios-blue text-[10px] font-bold rounded-full">
                  Gap: Sterling (2024)
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold bg-white/80 hover:bg-white transition-colors">
              <ClipboardList size={14} className="text-ios-blue" />
              Resumir
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold bg-white/80 hover:bg-white transition-colors">
              <MessageSquare size={14} className="text-ios-blue" />
              Citas
            </button>
          </div>

          <div className="relative">
            <textarea
              className="w-full bg-white/80 border border-white/80 rounded-xl p-3 text-sm focus:ring-2 focus:ring-ios-blue/20 resize-none h-24"
              placeholder="Pregunta al asistente..."
            />
            <button className="absolute bottom-3 right-3 p-2 bg-ios-blue text-white rounded-lg hover:scale-105 transition-transform">
              <Sparkles size={16} />
            </button>
          </div>
        </aside>
      </div>

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
    </div>
  );
};

export default MyThesisWorkspace;

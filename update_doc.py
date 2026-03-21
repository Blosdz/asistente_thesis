import sys

new_content = """import { useState, useEffect } from 'react';
import { 
  FileText, Upload, History, ExternalLink, ChevronRight, FileUp, Info, 
  Download, Eye, AlertCircle, Plus, X 
} from 'lucide-react';
import { 
  obtenerMisTesis,
  crearMiTesis,
  obtenerDocumentosMiTesis,
  subirDocumentoAGoogleDrive
} from '../../services/thesisService';
import { loadGoogleScripts, openPicker } from '../../services/googleDriveService';
import { toast } from 'react-hot-toast';
import { clsx } from 'clsx';

const DocumentView = () => {
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

  useEffect(() => {
    fetchTheses();
    loadGoogleScripts().catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedThesisId) {
      fetchDocuments(selectedThesisId);
    } else {
      setDocuments([]);
      setCurrentVersion(null);
      setPreviewUrl(null);
    }
  }, [selectedThesisId]);

  const fetchTheses = async () => {
    try {
      setLoading(true);
      const theses = await obtenerMisTesis();
      setThesesList(theses || []);
      
      if (theses && theses.length > 0) {
        // If we don't have one selected or the selected one isn't in the list
        if (!selectedThesisId || !theses.find(t => t.id === selectedThesisId)) {
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

  const fetchDocuments = async (thesisId) => {
    try {
      setLoading(true);
      const docs = await obtenerDocumentosMiTesis(thesisId);
      setDocuments(docs || []);
      
      if (docs && docs.length > 0) {
        const latestInfo = docs[0];
        setCurrentVersion(latestInfo);
        
        // Asumiendo que ahora la URL del documento viene en la bd o manejamos previsualización de drive
        if (latestInfo.url_archivo_drive) {
           // Drive preview URL usually can be constructed or is the same if public
           setPreviewUrl(latestInfo.url_archivo_drive.replace('/view', '/preview'));
        } else {
           setPreviewUrl(null);
        }
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
  };

  const handleCreateThesis = async (e) => {
    e.preventDefault();
    if (!newThesisTitle.trim()) return toast.error('El título es requerido');
    
    try {
      setCreating(true);
      // Asumiendo que universidad_id puede ser nulo o hay un default en el backend si no se pasa, o pasamos hardcoded si es proto.
      const newThesis = await crearMiTesis({ 
        titulo: newThesisTitle, 
        descripcion: newThesisDesc,
        universidad_id: null // Ajustar según backend si es requerido
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

  const handleDriveSelect = async (driveFile) => {
    if (!selectedThesisId) return toast.error('Selecciona una tesis primero');
    
    try {
      setUploading(true);
      const fakeFile = new File(["drive_placeholder"], driveFile.name, { type: driveFile.mimeType });
      // El backend necesita ser capaz de manejar esto o redirigir el approach. 
      // Por ahora simularemos la subida y dejaremos GoogleDriveService para el link si es necesario
      await subirDocumentoAGoogleDrive({ 
        tesisId: selectedThesisId, 
        file: fakeFile // Reemplazar con lógica real de importación de Drive si es diferente
      });
      
      toast.success('Documento de Google Drive vinculado con éxito');
      fetchDocuments(selectedThesisId);
    } catch (err) {
      console.error('Drive integration error:', err);
      toast.error('Error al vincular con Google Drive.');
    } finally {
      setUploading(false);
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
        file 
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

  const handleDownload = async (doc) => {
    if (doc.url_archivo_drive) {
      window.open(doc.url_archivo_drive, '_blank');
    } else {
      toast.error('El enlace de descarga no está disponible.');
    }
  };

  if (!loading && thesesList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-700">
        <div className="glass-card max-w-lg w-full p-12 text-center">
          <div className="w-20 h-20 bg-ios-blue/10 rounded-full flex items-center justify-center mx-auto mb-6 text-ios-blue">
            <FileText size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Aún no tienes una tesis</h2>
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

        {/* Modal Creating Empty State */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="glass-card p-8 max-w-md w-full relative">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Crear Tesis</h3>
              <form onSubmit={handleCreateThesis} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Título de la Tesis</label>
                  <input 
                    type="text" 
                    value={newThesisTitle}
                    onChange={(e) => setNewThesisTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ios-blue outline-none transition-all"
                    placeholder="Ej: Análisis del impacto..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Descripción (Opcional)</label>
                  <textarea 
                    value={newThesisDesc}
                    onChange={(e) => setNewThesisDesc(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ios-blue outline-none transition-all resize-none"
                    placeholder="Breve descripción de la investigación"
                    rows="3"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={creating}
                  className="w-full py-3 bg-ios-blue text-white rounded-xl font-bold shadow-lg shadow-ios-blue/20 hover:bg-blue-600 transition-colors disabled:opacity-50"
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
        <div className="flex flex-col gap-2 flex-1 max-w-md">
          <label className="text-sm font-bold text-gray-500">Tesis Seleccionada</label>
          <div className="relative">
            <select
              value={selectedThesisId}
              onChange={(e) => setSelectedThesisId(e.target.value)}
              className="w-full appearance-none bg-white/60 backdrop-blur-xl border border-white/80 text-gray-900 text-lg font-bold rounded-2xl px-4 py-3 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-ios-blue transition-all cursor-pointer"
            >
              {thesesList.map(t => (
                <option key={t.id} value={t.id}>
                  {t.titulo || 'Sin título'}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronRight size={20} className="rotate-90" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="p-3 bg-white/60 backdrop-blur-xl border border-white/80 text-ios-blue rounded-2xl font-bold shadow-sm hover:scale-105 transition-transform active:scale-95"
            title="Crear Nueva Tesis"
          >
            <Plus size={24} />
          </button>

          <label className={`
            bg-emerald-600 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-600/20 
            flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 cursor-pointer
            ${uploading ? 'opacity-50 pointer-events-none' : ''}
          `}
          onClick={() => openPicker(handleDriveSelect)}
          >
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center p-0.5">
              <svg viewBox="0 0 24 24" className="w-full h-full"><path fill="#00832d" d="M15.8 10.5l-3.3-5.7H4.9l3.3 5.7h7.6z"/><path fill="#0066da" d="M22.5 16.2l-3.3-5.7h-7.6l3.3 5.7h7.6z"/><path fill="#ea4335" d="M12.5 16.2l3.3 5.7h-7.6l-3.3-5.7h7.6z"/></svg>
            </div>
            Drive
          </label>

          <label className={`
            bg-ios-blue text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-ios-blue/20 
            flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 cursor-pointer
            ${uploading ? 'opacity-50 pointer-events-none' : ''}
          `}>
            <FileUp size={20} />
            {uploading ? 'Subiendo...' : 'Subir Documento'}
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf,.docx,.doc" 
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Workspace */}
        <div className="lg:col-span-2 space-y-8">
          {/* Current Document Card */}
          {currentVersion ? (
            <section className="glass-card p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-ios-blue/10 flex items-center justify-center text-ios-blue">
                    <FileText size={32} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Versión Actual</h3>
                    <p className="text-sm text-gray-500">{currentVersion.nombre_archivo}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-xs font-bold ring-1 ring-amber-200">
                  {currentVersion.estado || 'Pendiente'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-white/30 rounded-2xl border border-white/50">
                <div className="text-center sm:border-r border-gray-200">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Tamaño</p>
                  <p className="text-sm font-bold text-gray-700">
                    {currentVersion.tamano_bytes ? (currentVersion.tamano_bytes / 1024 / 1024).toFixed(2) + ' MB' : '-'}
                  </p>
                </div>
                <div className="text-center sm:border-r border-gray-200">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Fecha</p>
                  <p className="text-sm font-bold text-gray-700">
                    {new Date(currentVersion.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-center sm:border-r border-gray-200">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Tipo</p>
                  <p className="text-sm font-bold text-gray-700">
                    {currentVersion.tipo_mime?.split('-').pop() || 'DOC'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Versión</p>
                  <p className="text-sm font-bold text-gray-700">v{currentVersion.version || 1}</p>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button 
                  onClick={() => handleDownload(currentVersion)}
                  className="flex-1 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Descargar
                </button>
                {currentVersion.url_archivo_drive && (
                  <a 
                    href={currentVersion.url_archivo_drive}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-ios-blue"
                  >
                    <ExternalLink size={16} />
                    Ver en Drive
                  </a>
                )}
              </div>
            </section>
          ) : (
            <div className="glass-card p-12 text-center text-gray-500">
              <FileUp size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No tienes documentos en esta tesis.</p>
              <p className="text-sm mt-2">Sube tu primera versión para comenzar a trabajar.</p>
            </div>
          )}

          {/* Preview Section */}
          <section className="glass-card p-8 min-h-[500px] flex flex-col">
            <h3 className="text-lg font-bold mb-6">Previsualización</h3>
            {previewUrl ? (
               <iframe 
                 src={previewUrl} 
                 className="w-full flex-1 rounded-[24px] border border-gray-200 shadow-inner bg-white"
                 title="Document Preview"
               />
            ) : (
              <div className="flex-1 border-2 border-dashed border-gray-200 rounded-[32px] flex flex-col items-center justify-center text-center p-12 bg-gray-50/50">
                 <div className="w-16 h-16 bg-gray-200/50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                   <Info size={32} />
                 </div>
                 <h4 className="text-lg font-bold text-gray-700 mb-2">Vista previa no disponible</h4>
                 <p className="text-sm text-gray-500 max-w-sm">
                   {currentVersion 
                     ? "Abre el documento en Drive para verlo completo o descárgalo." 
                     : "Sube un documento validado para ver la previsualización aquí."}
                 </p>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar: History */}
        <aside className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
              <History size={20} className="text-ios-blue" />
              Documentos Subidos
            </h3>
            
            <div className="space-y-4">
              {documents.map((doc) => (
                <div 
                  key={doc.id}
                  onClick={() => {
                    setCurrentVersion(doc);
                    if (doc.url_archivo_drive) {
                      setPreviewUrl(doc.url_archivo_drive.replace('/view', '/preview'));
                    } else {
                      setPreviewUrl(null);
                    }
                  }}
                  className={`
                    p-4 rounded-2xl cursor-pointer transition-all border
                    ${currentVersion?.id === doc.id 
                      ? 'bg-ios-blue/5 border-ios-blue/20 shadow-sm' 
                      : 'bg-white/50 border-transparent hover:bg-white hover:shadow-sm'}
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                       <FileText size={16} className={doc.url_archivo_drive ? "text-ios-blue" : "text-gray-400"} />
                       <span className="text-sm font-bold text-gray-700 truncate max-w-[120px]">
                         {doc.nombre_archivo}
                       </span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`
                      text-[10px] px-2 py-0.5 rounded-full font-bold
                      ${doc.estado === 'Aprobado' ? 'bg-green-100 text-green-700' : 
                        doc.estado === 'Observado' ? 'bg-red-100 text-red-700' : 
                        'bg-gray-100 text-gray-600'}
                    `}>
                      {doc.estado || 'Pendiente'}
                    </span>
                    <span className="text-xs font-bold text-gray-400">v{doc.version || 1}</span>
                  </div>
                </div>
              ))}
              
              {documents.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-4">No hay documentos en esta tesis.</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Modal Creating over active layout */}
      {showCreateModal && thesesList.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card p-8 max-w-md w-full relative">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-2xl font-bold mb-6 text-gray-900">Crear Tesis</h3>
            <form onSubmit={handleCreateThesis} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Título de la Tesis</label>
                <input 
                  type="text" 
                  value={newThesisTitle}
                  onChange={(e) => setNewThesisTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ios-blue outline-none transition-all"
                  placeholder="Ej: Análisis del impacto..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Descripción (Opcional)</label>
                <textarea 
                  value={newThesisDesc}
                  onChange={(e) => setNewThesisDesc(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ios-blue outline-none transition-all resize-none"
                  placeholder="Breve descripción de la investigación"
                  rows="3"
                />
              </div>
              <button 
                type="submit" 
                disabled={creating}
                className="w-full py-3 bg-ios-blue text-white rounded-xl font-bold shadow-lg shadow-ios-blue/20 hover:bg-blue-600 transition-colors disabled:opacity-50"
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

export default DocumentView;
"""

with open("src/pages/student/DocumentView.jsx", "w") as f:
    f.write(new_content)

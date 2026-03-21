import { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  obtenerMisTesis,
  subirDocumentoAGoogleDrive,
  obtenerDocumentosComplementarios,
} from '../../services/thesisService';
import { toast } from 'react-hot-toast';

const AdditionalDocuments = () => {
  const [thesesList, setThesesList] = useState([]);
  const [selectedThesisId, setSelectedThesisId] = useState('');

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [docType, setDocType] = useState('reglamento');

  const docTypes = [
    { value: 'reglamento', label: 'Reglamento' },
    { value: 'instrumento', label: 'Instrumentos' },
    { value: 'rubrica', label: 'Rúbrica' },
    { value: 'criterios', label: 'Criterios' },
    { value: 'formatoAPA', label: 'Formato APA' },
    { value: 'Vancouver', label: 'Vancouver' },
    { value: 'fuente', label: 'Fuentes / Referencias' },
  ];

  useEffect(() => {
    fetchTheses();
  }, []);

  useEffect(() => {
    if (selectedThesisId) {
      fetchDocuments(selectedThesisId);
    } else {
      setDocuments([]);
    }
  }, [selectedThesisId]);

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

  const fetchDocuments = async (thesisId) => {
    try {
      setLoading(true);
      const docs = await obtenerDocumentosComplementarios(thesisId);
      setDocuments(docs || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      toast.error('No se pudieron cargar los documentos.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!selectedThesisId) {
      return toast.error('Selecciona o crea una tesis primero.');
    }

    try {
      setUploading(true);
      toast.loading('Subiendo documento...', { id: 'upload' });

      await subirDocumentoAGoogleDrive({
        tesisId: selectedThesisId,
        file,
        modo: 'estudiante_documento',
        tipoDocumento: docType,
      });

      toast.success('Documento subido correctamente a tu Drive', {
        id: 'upload',
      });
      await fetchDocuments(selectedThesisId);

      // Reset the file input
      e.target.value = null;
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Error al subir documento: ' + err.message, { id: 'upload' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center py-10 px-6 animate-fade-in relative z-10 text-slate-900">
      <div className="w-full max-w-[1200px] flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Documentos de Apoyo
            </h1>
            <p className="text-slate-600 mt-2 max-w-xl text-sm leading-relaxed">
              Sube tu reglamento, tus fuentes, tu información, referencias e
              instrumentos.
            </p>
          </div>

          {thesesList.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-600">
                Tesis actual:
              </span>
              <select
                className="glass-card appearance-none py-2 pl-4 pr-10 rounded-xl text-sm font-bold text-ios-blue border-none focus:ring-2 focus:ring-ios-blue shadow-sm outline-none cursor-pointer"
                value={selectedThesisId}
                onChange={(e) => setSelectedThesisId(e.target.value)}
              >
                {thesesList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.titulo || 'Sin título'}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-ios-blue border-t-transparent shadow-md"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="glass-card rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col items-center justify-center min-h-[300px] text-center border border-white/50">
                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <Upload className="w-10 h-10 text-ios-blue" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Subir nuevo documento
                </h3>
                <p className="text-slate-600 mb-8 max-w-sm text-sm">
                  Selecciona el tipo de documento que deseas subir y adjunta el
                  archivo.
                </p>

                <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
                  <select
                    className="glass-card appearance-none py-3 px-6 rounded-xl text-sm font-bold text-slate-800 border-none focus:ring-2 focus:ring-ios-blue shadow-sm outline-none cursor-pointer w-full md:w-auto"
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                  >
                    {docTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>

                  <div className="relative w-full md:w-auto">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={handleUpload}
                      disabled={uploading || !selectedThesisId}
                      accept=".pdf,.doc,.docx"
                    />
                    <label
                      htmlFor="file-upload"
                      className={`inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all w-full md:w-auto cursor-pointer ${
                        uploading || !selectedThesisId
                          ? 'bg-slate-400 cursor-not-allowed'
                          : 'bg-ios-blue hover:bg-blue-600 hover:scale-[1.02] shadow-blue-500/30'
                      }`}
                    >
                      {uploading ? 'Subiendo...' : 'Seleccionar Archivo'}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="glass-card rounded-3xl p-6 shadow-lg border border-white/60 flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <FileText className="text-ios-blue w-5 h-5" /> Documentos
                  Subidos
                </h3>
                {documents.length > 0 ? (
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-white/40 border border-white/60 p-4 rounded-2xl hover:bg-white/60 transition-colors shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-slate-800 uppercase tracking-wider">
                            {doc.tipo_documento}
                          </span>
                        </div>
                        <p
                          className="text-xs text-slate-500 mb-3 truncate"
                          title={doc.nombre_archivo}
                        >
                          {doc.nombre_archivo}
                        </p>
                        {doc.url_archivo_drive && (
                          <a
                            href={doc.url_archivo_drive}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-ios-blue hover:text-blue-700 bg-blue-500/10 px-3 py-1.5 rounded-lg transition-colors w-full justify-center"
                          >
                            <ExternalLink size={14} /> Abrir en Drive
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-8">
                    No has subido documentos adicionales aún.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdditionalDocuments;

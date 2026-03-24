import { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Upload,
  ExternalLink,
  File,
  FileSpreadsheet,
  FileArchive,
  Image,
  Presentation,
} from 'lucide-react';
import { Select, SelectItem } from '../../components/ui/select';
import {
  obtenerMisTesis,
  subirDocumentoAGoogleDrive,
  obtenerDocumentosMiTesis,
} from '../../services/thesisService';
import { toast } from 'react-hot-toast';

const AdditionalDocuments = () => {
  const [thesesList, setThesesList] = useState([]);
  const [selectedThesisId, setSelectedThesisId] = useState('');

  const [documents, setDocuments] = useState([]);
  const [thesisPreviewUrl, setThesisPreviewUrl] = useState(null);
  const [thesisPreviewLoading, setThesisPreviewLoading] = useState(false);
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

  const getFileExtension = (doc) => {
    const name = (doc?.nombre || '').toLowerCase();
    const parts = name.split('.');
    if (parts.length > 1) return parts.pop();

    const mime = (doc?.tipo || '').toLowerCase();
    if (mime.includes('pdf')) return 'pdf';
    if (mime.includes('word')) return 'doc';
    if (mime.includes('sheet') || mime.includes('excel')) return 'xls';
    if (mime.includes('presentation') || mime.includes('powerpoint'))
      return 'ppt';
    if (mime.includes('image')) return 'img';
    if (mime.includes('zip') || mime.includes('rar') || mime.includes('7z'))
      return 'zip';
    return 'file';
  };

  const getDocumentTypeLabel = (doc) => {
    const ext = getFileExtension(doc);
    const labels = {
      pdf: 'PDF',
      doc: 'Word',
      docx: 'Word',
      xls: 'Excel',
      xlsx: 'Excel',
      csv: 'CSV',
      ppt: 'PowerPoint',
      pptx: 'PowerPoint',
      txt: 'Texto',
      img: 'Imagen',
      jpg: 'Imagen',
      jpeg: 'Imagen',
      png: 'Imagen',
      zip: 'Comprimido',
      rar: 'Comprimido',
      '7z': 'Comprimido',
    };
    return labels[ext] || (doc?.tipo ? String(doc.tipo) : 'Archivo');
  };

  const getDocumentIcon = (doc) => {
    const ext = getFileExtension(doc);

    if (ext === 'pdf') {
      return (
        <FileText className="w-7 h-7 text-red-500" strokeWidth={2.2} />
      );
    }

    if (['doc', 'docx'].includes(ext)) {
      return (
        <FileText className="w-7 h-7 text-blue-600" strokeWidth={2.2} />
      );
    }

    if (['xls', 'xlsx', 'csv'].includes(ext)) {
      return (
        <FileSpreadsheet
          className="w-7 h-7 text-emerald-600"
          strokeWidth={2.2}
        />
      );
    }

    if (['ppt', 'pptx'].includes(ext)) {
      return (
        <Presentation className="w-7 h-7 text-orange-500" strokeWidth={2.2} />
      );
    }

    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'img'].includes(ext)) {
      return <Image className="w-7 h-7 text-purple-500" strokeWidth={2.2} />;
    }

    if (['zip', 'rar', '7z'].includes(ext)) {
      return (
        <FileArchive className="w-7 h-7 text-amber-600" strokeWidth={2.2} />
      );
    }

    return <File className="w-7 h-7 text-slate-500" strokeWidth={2.2} />;
  };

  const buildPreviewUrl = (url) => {
    if (!url) return null;

    const lowerUrl = url.toLowerCase();
    if (lowerUrl.endsWith('.doc') || lowerUrl.endsWith('.docx')) {
      return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
        url,
      )}`;
    }

    const driveUcMatch = url.match(/drive\.google\.com\/uc\?id=([^&]+)/);
    if (driveUcMatch) {
      return `https://drive.google.com/file/d/${driveUcMatch[1]}/preview`;
    }

    if (url.includes('/view')) {
      return url.replace('/view', '/preview');
    }

    return url;
  };

  const fetchTheses = useCallback(async () => {
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
  }, [selectedThesisId]);

  const fetchDocuments = useCallback(async (thesisId) => {
    try {
      setLoading(true);
      const docs = await obtenerDocumentosMiTesis(thesisId);
      setDocuments(docs || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      toast.error('No se pudieron cargar los documentos.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchThesisPreview = useCallback(async (thesisId) => {
    if (!thesisId) {
      setThesisPreviewUrl(null);
      return;
    }

    try {
      setThesisPreviewLoading(true);
      const docs = await obtenerDocumentosMiTesis(thesisId);
      if (docs && docs.length > 0) {
        const latest = docs[0];
        const previewSource =
          latest.url_google_doc || latest.url_archivo_drive;
        if (previewSource) {
          setThesisPreviewUrl(buildPreviewUrl(previewSource));
        } else {
          setThesisPreviewUrl(null);
        }
      } else {
        setThesisPreviewUrl(null);
      }
    } catch (err) {
      console.error('Error fetching thesis preview:', err);
      setThesisPreviewUrl(null);
    } finally {
      setThesisPreviewLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTheses();
  }, [fetchTheses]);

  useEffect(() => {
    if (selectedThesisId) {
      fetchDocuments(selectedThesisId);
      fetchThesisPreview(selectedThesisId);
    } else {
      setDocuments([]);
      setThesisPreviewUrl(null);
    }
  }, [selectedThesisId, fetchDocuments, fetchThesisPreview]);

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
    <div className="w-full flex-1 flex flex-col py-10 px-0 sm:px-2 animate-fade-in relative z-10 text-slate-900 h-full">
      <div className="w-full flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Documentos de Apoyo
            </h1>
            <p className="text-slate-600 mt-2 max-w-xl text-sm leading-relaxed">
              Sube tu reglamento, tus fuentes, tu información, referencias e
              instrumentos.
            </p>
          </div>

        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-ios-blue border-t-transparent shadow-md"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-8">
              <div className="glass-card rounded-3xl p-6 shadow-lg border border-white/60 flex flex-col gap-6 h-[650px]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {thesesList.length > 0 && (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-semibold text-slate-600">
                        Tesis actual:
                      </span>
                      <Select
                        className="py-2 pl-4 pr-10 text-sm font-bold text-ios-blue"
                        value={selectedThesisId}
                        onChange={(e) => setSelectedThesisId(e.target.value)}
                      >
                        {thesesList.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.titulo || 'Sin título'}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                  )}
                </div>

                {/* quitamos vista previa aqui solo mostramos los files como [icon] document_name */}
                <div className="glass-card rounded-3xl p-5 shadow-inner border border-white/70 flex-1">
                  {documents.length === 0 ? (
                    <div className="h-full min-h-[220px] flex items-center justify-center text-slate-500 text-sm">
                      Aún no has subido documentos para esta tesis.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                      {documents.map((doc) => {
                        const fileName = doc.nombre || 'Documento sin nombre';
                        const fileUrl = doc.url_google_doc || doc.url_archivo_drive;

                        return (
                          <div
                            key={doc.id}
                            className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm hover:shadow-md transition-all flex flex-col gap-3"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                {getDocumentIcon(doc)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-800 leading-tight line-clamp-2 break-words">
                                  {fileName}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                  {getDocumentTypeLabel(doc)}
                                </p>
                              </div>
                            </div>

                            {fileUrl ? (
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-ios-blue hover:text-blue-700 rounded-lg border border-blue-200 bg-blue-50/70 px-3 py-2 mt-auto"
                              >
                                Abrir
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400 mt-auto">Sin URL</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="glass-card rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col items-center justify-center min-h-[360px] text-center border border-white/50 xl:sticky xl:top-24">
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

                <div className="flex flex-col items-center gap-4 w-full">
                  <Select
                    className="py-3 px-6 text-sm font-bold text-slate-800 w-full"
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                  >
                    {docTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </Select>

                  <div className="relative w-full">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={handleUpload}
                      disabled={uploading || !selectedThesisId}
                      accept="*/*"
                    />
                    <label
                      htmlFor="file-upload"
                      className={`inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all w-full cursor-pointer ${
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
          </div>
        )}
      </div>
    </div>
  );
};

export default AdditionalDocuments;

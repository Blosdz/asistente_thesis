import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ClipboardList,
  Database,
  ExternalLink,
  FileText,
  Sparkles,
  Upload,
} from 'lucide-react';
import { Select, SelectItem } from '../../components/ui/select';
import { Card } from '../../components/ui/card';
import {
  obtenerDocumentosMiTesis,
  obtenerMisTesis,
  subirDocumentoAGoogleDrive,
} from '../../services/thesisService';
import { toast } from 'react-hot-toast';

const docTypes = [
  { value: 'referencias', label: 'Referencias', icon: FileText },
  { value: 'datasets', label: 'Datasets', icon: Database },
  { value: 'metodologia', label: 'Activos metodologicos', icon: ClipboardList },
  { value: 'borradores', label: 'Borradores', icon: Sparkles },
];

const AdditionalDocuments = () => {
  const [thesesList, setThesesList] = useState([]);
  const [selectedThesisId, setSelectedThesisId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState(docTypes[0].value);

  const fetchTheses = useCallback(async () => {
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

  useEffect(() => {
    fetchTheses();
  }, [fetchTheses]);

  useEffect(() => {
    if (selectedThesisId) {
      fetchDocuments(selectedThesisId);
    } else {
      setDocuments([]);
    }
  }, [selectedThesisId, fetchDocuments]);

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

      e.target.value = null;
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Error al subir documento: ' + err.message, { id: 'upload' });
    } finally {
      setUploading(false);
    }
  };

  const docTypeCounts = useMemo(() => {
    const counts = docTypes.reduce((acc, type) => {
      acc[type.value] = 0;
      return acc;
    }, {});

    documents.forEach((doc) => {
      const key = doc.tipo || doc.tipo_documento || '';
      if (counts[key] !== undefined) {
        counts[key] += 1;
      }
    });

    return counts;
  }, [documents]);

  const getDocumentTypeLabel = useCallback((doc) => {
    const key = doc.tipo || doc.tipo_documento;
    const match = docTypes.find((type) => type.value === key);
    return match ? match.label : 'Documento';
  }, []);

  const getDocumentName = (doc) =>
    doc.nombre || doc.nombre_archivo || 'Documento sin nombre';

  const getDocumentIcon = useCallback((doc) => {
    const fileName = getDocumentName(doc);
    const ext = fileName.split('.').pop()?.toLowerCase();
    const iconClass = 'w-5 h-5 text-slate-600';

    if (['csv', 'xls', 'xlsx'].includes(ext)) {
      return <Database className={iconClass} />;
    }

    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
      return <Sparkles className={iconClass} />;
    }

    return <FileText className={iconClass} />;
  }, []);

  const processingProgress = useMemo(() => {
    if (!documents.length) return 0;
    return Math.min(100, 40 + documents.length * 12);
  }, [documents.length]);

  return (
    <div className="relative w-full flex-1 px-4 sm:px-6 lg:px-10 py-12 animate-fade-in text-slate-900">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-300 border-t-transparent shadow-lg shadow-blue-200/40"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <aside className="lg:col-span-4 flex flex-col gap-6">
              <Card className="p-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.35em] text-blue-500 mb-4">
                  Thesis Selection
                </h3>
                {thesesList.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-semibold text-slate-500">
                      Proyecto activo
                    </span>
                    <Select
                      className="py-3 pl-4 pr-10 text-sm font-semibold text-slate-900 border border-slate-200 rounded-2xl shadow-sm"
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
                ) : (
                  <p className="text-sm text-slate-500">
                    No tienes tesis registradas aun.
                  </p>
                )}
              </Card>

              <Card className="p-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.35em] text-blue-500 mb-6">
                  Helper Document Categories
                </h3>
                <div className="flex flex-col gap-3">
                  {docTypes.map((type) => {
                    const Icon = type.icon;
                    const isActive = docType === type.value;

                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setDocType(type.value)}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                          isActive
                            ? 'border-blue-200 text-slate-900 shadow-lg shadow-blue-100/60'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                              isActive
                                ? 'border-blue-100 text-blue-500'
                                : 'border-slate-200 text-slate-400'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </span>
                          <span className="text-sm font-semibold">
                            {type.label}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full ${
                            isActive
                              ? 'text-blue-600'
                              : 'text-slate-500'
                          }`}
                        >
                          {docTypeCounts[type.value] || 0}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <span className="w-10 h-10 rounded-2xl flex items-center justify-center text-blue-500 shadow-sm">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <span className="text-blue-600 font-semibold block mb-1">
                      Tip de organizacion
                    </span>
                    Mantener tus referencias ordenadas acelera el proceso de revision
                    y sintesis al final de cada iteracion.
                  </p>
                </div>
              </Card>
            </aside>

            <article className="lg:col-span-8 flex flex-col gap-8">
              <Card className="p-10">
                <div className="group relative mb-12">
                  <div className="relative border-2 border-dashed border-slate-200 rounded-3xl p-12 sm:p-14 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 border border-blue-100 group-hover:scale-105 transition-transform duration-500">
                      <Upload className="w-9 h-9 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      Suelta para comenzar la carga
                    </h3>
                    <p className="text-slate-500 text-sm mb-6">
                      Varios formatos disponibles, organiza por categoria en segundos.
                    </p>
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
                      className={`inline-flex items-center justify-center gap-2 px-10 py-3 rounded-full font-semibold text-sm text-white shadow-lg transition-all duration-300 cursor-pointer ${
                        uploading || !selectedThesisId
                          ? 'bg-slate-300 cursor-not-allowed'
                          : 'bg-gradient-to-br from-blue-500 to-indigo-500 hover:scale-105 active:scale-95'
                      }`}
                    >
                      {uploading ? 'Subiendo...' : 'Seleccionar archivos'}
                    </label>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900">
                      Documentos subidos
                    </h3>
                    <span className="text-xs font-bold text-blue-600 px-3 py-1 rounded-full uppercase tracking-tight border border-blue-100">
                      Cola: {documents.length} archivos
                    </span>
                  </div>

                  {documents.length === 0 ? (
                    <div className="min-h-[200px] flex items-center justify-center text-slate-500 text-sm border border-dashed border-slate-200 rounded-2xl">
                      Aun no has subido documentos para esta tesis.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {documents.map((doc) => {
                        const fileName = getDocumentName(doc);
                        const fileUrl = doc.url_google_doc || doc.url_archivo_drive;

                        return (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-blue-200 transition-colors"
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-100 shrink-0">
                                {getDocumentIcon(doc)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">
                                  {fileName}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {getDocumentTypeLabel(doc)}
                                </p>
                              </div>
                            </div>
                            {fileUrl ? (
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-slate-700 rounded-full border border-slate-200 px-3 py-2 hover:border-blue-200 hover:text-blue-600 transition-colors"
                              >
                                Abrir
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400">Sin URL</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-8 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <span className="text-xs font-bold text-blue-500 uppercase tracking-[0.3em] mb-2 block">
                    Synthesizing Status
                  </span>
                  <h2 className="text-5xl font-bold tracking-tight text-slate-900">
                    {processingProgress}%
                  </h2>
                  <p className="text-slate-600 mt-2 text-sm">
                    El asistente analiza temas clave segun los ultimos documentos.
                  </p>
                </div>
                <div className="w-full md:w-1/3 h-24 rounded-2xl border border-slate-200 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <Sparkles className="w-12 h-12 text-blue-500" />
                  </div>
                  <div className="relative flex flex-col items-center">
                    <span className="text-xs font-bold text-slate-800">
                      {Math.max(documents.length * 8, 0)} insights
                    </span>
                    <span className="text-[10px] text-blue-500 font-bold uppercase tracking-tight mt-1">
                      Hoy
                    </span>
                  </div>
                </div>
              </Card>
            </article>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdditionalDocuments;

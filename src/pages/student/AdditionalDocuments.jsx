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
  obtenerDocumentosComplementarios,
  obtenerMisTesis,
  subirDocumentoAGoogleDrive,
} from '../../services/thesisService';
import { toast } from 'react-hot-toast';

const docTypes = [
  { value: 'reglamento', label: 'Reglamento', icon: FileText },
  { value: 'instrumento', label: 'Instrumento', icon: ClipboardList },
  { value: 'rubrica', label: 'Rúbrica', icon: Sparkles },
  { value: 'criterios', label: 'Criterios', icon: ClipboardList },
  { value: 'formatoAPA', label: 'Formato APA', icon: FileText },
  { value: 'Vancouver', label: 'Vancouver', icon: FileText },
  { value: 'fuente', label: 'Fuente', icon: Database },
];

const allDocumentsFilter = {
  value: 'todos',
  label: 'Todos los documentos',
  icon: FileText,
};

const AdditionalDocuments = () => {
  const [thesesList, setThesesList] = useState([]);
  const [selectedThesisId, setSelectedThesisId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState(docTypes[0].value);
  const [activeFilter, setActiveFilter] = useState('todos');

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
      const docs = await obtenerDocumentosComplementarios(thesisId);
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

  const filteredDocuments = useMemo(() => {
    if (activeFilter === 'todos') return documents;
    return documents.filter(
      (doc) => (doc.tipo || doc.tipo_documento || '') === activeFilter,
    );
  }, [documents, activeFilter]);

  const helperFilterOptions = useMemo(
    () => [
      {
        ...allDocumentsFilter,
        count: documents.length,
      },
      ...docTypes.map((type) => ({
        ...type,
        count: docTypeCounts[type.value] || 0,
      })),
    ],
    [docTypeCounts, documents.length],
  );

  const activeFilterMeta = useMemo(
    () =>
      helperFilterOptions.find((option) => option.value === activeFilter) ||
      helperFilterOptions[0],
    [activeFilter, helperFilterOptions],
  );

  const highlightedHelperTypes = useMemo(
    () =>
      helperFilterOptions
        .filter((option) => option.value !== 'todos' && option.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 4),
    [helperFilterOptions],
  );

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
    const iconClass = 'w-5 h-5 text-slate-100';

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
    <div className="documents-page relative w-full flex-1 px-4 py-4 text-slate-900 animate-fade-in sm:px-5 lg:px-8 lg:py-3">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        {loading ? (
          <div className="flex flex-1 items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-300 border-t-transparent shadow-lg shadow-blue-200/40"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <aside className="flex flex-col gap-3 lg:col-span-4">
              <Card className="p-4 sm:p-5">
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-blue-500">
                  Thesis Selection
                </h3>
                {thesesList.length > 0 ? (
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[11px] font-semibold text-slate-500">
                      Proyecto activo
                    </span>
                    <Select
                      className="rounded-xl border border-slate-200 py-2.5 pl-3.5 pr-9 text-sm font-semibold text-slate-900 shadow-sm disabled:opacity-60"
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

              <Card className="p-4 sm:p-5">
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-blue-500">
                  Helper Document Categories
                </h3>
                <div className="space-y-3">
                  <div className=" rounded-xl p-3.5">
                    <div className=" bg-gradient-to-br from-blue-50 via-white to-slate-50  items-center border border-slate-200 text-black justify-between gap-3 mb-2.5 p-4 rounded-xl">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black">
                          Filtro activo
                        </p>
                        <p className="mt-0.5 truncate text-sm font-semibold text-black">
                          {activeFilterMeta?.label || allDocumentsFilter.label}
                        </p>
                      </div>
                      <span className="rounded-full border border-white/20 bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-black">
                        {activeFilterMeta?.count || 0}
                      </span>
                    </div>

                    <Select
                      //className="documents-dark-select w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold shadow-sm"
                      className="bg-sky-400/10 border border-cyan-200 text-black rounded-xl  w-full px-3.5 py-2.5 text-sm"
                      value={activeFilter}
                      onChange={(e) => setActiveFilter(e.target.value)}
                    >
                      {helperFilterOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label} ({option.count})
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  <div className=" bg-gradient-to-br from-blue-100 via-white to-blue-100 rounded-xl p-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black">
                        Vista rápida
                      </p>
                      <span className="text-[11px] font-medium text-black">
                        {documents.length} archivo(s)
                      </span>
                    </div>

                    {highlightedHelperTypes.length > 0 ? (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {highlightedHelperTypes.map((type) => {
                          const Icon = type.icon;

                          return (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() => setActiveFilter(type.value)}
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition ${
                                activeFilter === type.value
                                  ? 'border-white/40 bg-white/18 text-black'
                                  : 'border-white/15 bg-white/8 text-black hover:border-white/35 hover:bg-white/14 hover:text-slate-400'
                              }`}
                            >
                              <Icon className="h-3 w-3" />
                              <span>{type.label}</span>
                              <span className="rounded-full bg-white/12 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                {type.count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-black">
                        Cuando subas documentos aparecerán aquí las categorías más usadas.
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </aside>

            <article className="flex flex-col gap-4 lg:col-span-8">
              <Card className="p-4 sm:p-6 lg:p-6">
                <div className="group relative mb-5">
                  <div className=" bg-gradient-to-br from-blue-50 via-white to-slate-50   relative flex flex-col items-center justify-center rounded-[24px] p-6 text-center sm:p-8 border-slate-200">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 text-black transition-transform duration-500 group-hover:scale-105">
                      <Upload className="h-6 w-6 text-black" />
                    </div>
                    <h3 className="mb-1.5 text-lg font-bold text-black">
                      Suelta para comenzar la carga
                    </h3>
                    <p className="mb-4 max-w-xl text-sm text-black">
                      Sube reglamentos, instrumentos, rúbricas y demás
                      documentos de apoyo.
                    </p>
                    <div className="mb-4 w-full max-w-sm text-left">
                      <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-black">
                        Tipo de documento
                      </label>
                      <Select
                        //className="documents-dark-select w-full rounded-xl py-2.5 pl-3.5 pr-9 text-sm font-semibold shadow-sm"

                        className="bg-sky-400/10 border border-cyan-200 text-black rounded-xl  w-full px-3.5 py-2.5 text-sm"
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                      >
                        {docTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
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
                      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${
                        uploading || !selectedThesisId
                          ? 'cursor-not-allowed rounded-full bg-slate-200 text-slate-400 shadow-none'
                          : 'ios-accent-button cursor-pointer hover:scale-105 active:scale-95'
                      }`}
                    >
                      {uploading ? 'Subiendo...' : 'Seleccionar archivos'}
                    </label>
                  </div>
                </div>

                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">
                      Documentos subidos
                    </h3>
                    <span className="rounded-full border border-blue-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-tight text-blue-600">
                      {activeFilter === 'todos'
                        ? `Total: ${documents.length} archivos`
                        : `${getDocumentTypeLabel({ tipo: activeFilter })}: ${filteredDocuments.length}`}
                    </span>
                  </div>

                  {filteredDocuments.length === 0 ? (
                    <div className="bg-sky-400/15 min-h-[200px] flex items-center justify-center rounded-2xl px-6 text-center text-sm text-black">
                      {activeFilter === 'todos'
                        ? 'Aún no has subido documentos para esta tesis.'
                        : 'No hay documentos en esta categoría todavía.'}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {filteredDocuments.map((doc) => {
                        const fileName = getDocumentName(doc);
                        const fileUrl =
                          doc.url_google_doc || doc.url_archivo_drive;

                        return (
                          <div
                            key={doc.id}
                            className="bg-sky-400/10 flex items-center justify-between rounded-xl p-3 transition-colors"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                                {getDocumentIcon(doc)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-black truncate">
                                  {fileName}
                                </p>
                                <p className="text-xs text-black">
                                  {getDocumentTypeLabel(doc)}
                                </p>
                              </div>
                            </div>
                            {fileUrl ? (
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-black transition-colors hover:border-white/35"
                              >
                                Abrir
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <span className="text-xs text-black">
                                Sin URL
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
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

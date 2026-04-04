import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileText,
  Download,
  Upload,
  Search,
  ChevronRight,
  User,
  Clock,
  Info,
  MessageSquare,
  Send,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Select, SelectItem } from '../../components/ui/select';
import { toast } from 'react-hot-toast';
import Modal from '../../components/ui/modal';

import {
  getTesisAsesor,
  obtenerSugerenciasAsesor,
  obtenerDocumentosTesisAsignada,
  registrarSugerenciaAsesor,
  listarTiposSugerenciaAsesor,
  validarAplicacionSugerenciaAsesor,
} from '../../services/advisorService';
import { subirDocumentoAGoogleDrive } from '../../services/thesisService';
import {
  canAdvisorValidateSuggestion,
  getSuggestionId,
  getSuggestionStatusMeta,
} from '../../lib/suggestionValidation';

const normalizeSuggestionTone = (codigo = '', nombre = '') => {
  const raw = `${codigo} ${nombre}`.toLowerCase();

  if (
    raw.includes('critic') ||
    raw.includes('urgen') ||
    raw.includes('observ')
  ) {
    return {
      rail: 'bg-red-500',
      chip: 'text-red-700 bg-red-100',
    };
  }

  if (
    raw.includes('aprob') ||
    raw.includes('ok') ||
    raw.includes('valid')
  ) {
    return {
      rail: 'bg-emerald-500',
      chip: 'text-emerald-700 bg-emerald-100',
    };
  }

  return {
    rail: 'bg-blue-500',
    chip: 'text-blue-700 bg-blue-100',
  };
};

export default function AdvisorThesisReview() {
  const [thesisList, setThesisList] = useState([]);
  const [selectedThesisId, setSelectedThesisId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [currentVersion, setCurrentVersion] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [suggestionText, setSuggestionText] = useState('');
  const [sendingSuggestion, setSendingSuggestion] = useState(false);
  const [suggestionTypeId, setSuggestionTypeId] = useState('');
  const [suggestionTypes, setSuggestionTypes] = useState([]);
  const [suggestionsList, setSuggestionsList] = useState([]);
  const [validationModal, setValidationModal] = useState({
    open: false,
    suggestion: null,
    approved: true,
    comment: '',
  });
  const [submittingValidation, setSubmittingValidation] = useState(false);

  const buildPreviewUrl = useCallback((url) => {
    if (!url) return null;

    const lowerUrl = url.toLowerCase();
    if (lowerUrl.endsWith('.doc') || lowerUrl.endsWith('.docx')) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    }

    const driveUcMatch = url.match(/drive\.google\.com\/uc\?id=([^&]+)/);
    if (driveUcMatch) {
      return `https://drive.google.com/file/d/${driveUcMatch[1]}/preview`;
    }

    if (url.includes('/view')) {
      return url.replace('/view', '/preview');
    }

    if (url.includes('/edit')) {
      return url.replace('/edit', '/preview');
    }

    return url;
  }, []);

  const fetchTheses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTesisAsesor();
      setThesisList(data || []);
      if (data && data.length > 0 && !selectedThesisId) {
        setSelectedThesisId(data[0].tesis_id || data[0].id);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar las tesis asignadas');
    } finally {
      setLoading(false);
    }
  }, [selectedThesisId]);

  const loadSuggestionTypes = useCallback(async () => {
    try {
      const data = await listarTiposSugerenciaAsesor();
      setSuggestionTypes(data || []);
      setSuggestionTypeId((current) => current || data?.[0]?.id || '');
    } catch (error) {
      console.error('Error al cargar tipos de sugerencia:', error);
      toast.error('No se pudieron cargar los tipos de observacion');
      setSuggestionTypes([]);
    }
  }, []);

  const loadSuggestions = useCallback(async (tesisId) => {
    try {
      const data = await obtenerSugerenciasAsesor(tesisId);
      setSuggestionsList(data || []);
    } catch (error) {
      console.error('Error al cargar sugerencias:', error);
      setSuggestionsList([]);
    }
  }, []);

  const loadDocuments = useCallback(async (tesisId) => {
    try {
      const data = await obtenerDocumentosTesisAsignada(tesisId);
      setDocuments(data || []);
    } catch (error) {
      console.error('Error al cargar documentos:', error);
      toast.error('No se pudieron cargar los documentos de la tesis');
      setDocuments([]);
    }
  }, []);

  useEffect(() => {
    fetchTheses();
    loadSuggestionTypes();
  }, [fetchTheses, loadSuggestionTypes]);

  useEffect(() => {
    if (selectedThesisId) {
      loadSuggestions(selectedThesisId);
      loadDocuments(selectedThesisId);
    } else {
      setSuggestionsList([]);
      setDocuments([]);
    }
  }, [selectedThesisId, loadDocuments, loadSuggestions]);

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
      toast.success('Documento subido con exito');
      await loadDocuments(selectedThesisId);
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err.message || 'Error al subir el documento.');
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const currentThesis = useMemo(
    () => thesisList.find((t) => (t.tesis_id || t.id) === selectedThesisId),
    [thesisList, selectedThesisId],
  );

  const pendingAdvisorValidations = useMemo(
    () => suggestionsList.filter((item) => canAdvisorValidateSuggestion(item)).length,
    [suggestionsList],
  );

  const handleSubmitSuggestion = async (e) => {
    e.preventDefault();
    if (!currentThesis) return;
    if (!suggestionText.trim()) {
      toast.error('Escribe una sugerencia antes de enviar');
      return;
    }
    if (!suggestionTypeId) {
      toast.error('Selecciona un tipo de observacion');
      return;
    }

    const tesisId = currentThesis.tesis_id || currentThesis.id;
    if (!tesisId) {
      toast.error('No se pudo identificar la tesis');
      return;
    }

    try {
      setSendingSuggestion(true);

      await registrarSugerenciaAsesor({
        tesisId,
        documentoTesisId:
          currentVersion?.id || currentVersion?.documento_id || null,
        tipoSugerenciaId: suggestionTypeId,
        detalle: suggestionText.trim(),
      });

      toast.success('Sugerencia enviada con exito');
      setSuggestionText('');
      await loadSuggestions(tesisId);
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'No se pudo enviar la sugerencia');
    } finally {
      setSendingSuggestion(false);
    }
  };

  const openValidationModal = (suggestion, approved) => {
    setValidationModal({
      open: true,
      suggestion,
      approved,
      comment: approved ? '' : suggestion?.comentario_asesor || '',
    });
  };

  const closeValidationModal = () => {
    setValidationModal({
      open: false,
      suggestion: null,
      approved: true,
      comment: '',
    });
  };

  const handleSubmitValidation = async () => {
    if (submittingValidation) return;

    const suggestionId = getSuggestionId(validationModal.suggestion);
    if (!suggestionId) {
      toast.error('No se pudo identificar la sugerencia');
      return;
    }

    if (!validationModal.approved && !validationModal.comment.trim()) {
      toast.error('Agrega un comentario para explicar el rechazo');
      return;
    }

    try {
      setSubmittingValidation(true);
      await validarAplicacionSugerenciaAsesor({
        sugerenciaId: suggestionId,
        aprobado: validationModal.approved,
        comentarioAsesor: validationModal.comment.trim() || null,
      });

      toast.success(
        validationModal.approved
          ? 'Aplicacion validada correctamente'
          : 'Aplicacion rechazada con observaciones',
      );

      closeValidationModal();
      await loadSuggestions(selectedThesisId);
    } catch (error) {
      console.error('Error validating suggestion:', error);
      toast.error(error?.message || 'No se pudo validar la sugerencia');
    } finally {
      setSubmittingValidation(false);
    }
  };

  const filteredThesis = thesisList.filter(
    (t) =>
      (
        `${t.estudiante_nombres || ''} ${t.estudiante_apellidos || ''}`
          .trim()
          .toLowerCase() || ''
      ).includes(searchTerm.toLowerCase()) ||
      (t.titulo?.toLowerCase() || '').includes(searchTerm.toLowerCase()),
  );

  const nombreEstudianteActual = currentThesis
    ? `${currentThesis.estudiante_nombres || ''} ${currentThesis.estudiante_apellidos || ''}`.trim()
    : '';

  useEffect(() => {
    if (documents.length > 0) {
      const firstDoc = documents[0];
      setCurrentVersion(firstDoc);
      setPreviewUrl(
        buildPreviewUrl(
          firstDoc.url_archivo_drive ||
            firstDoc.url_google_doc ||
            firstDoc.url,
        ),
      );
    } else {
      setCurrentVersion(null);
      setPreviewUrl(null);
    }
  }, [documents, buildPreviewUrl]);

  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('revision') || s.includes('progreso')) {
      return 'bg-blue-100 text-blue-700';
    }
    if (s.includes('completado') || s.includes('aprobado')) {
      return 'bg-emerald-100 text-emerald-700';
    }
    if (s.includes('pendiente')) return 'bg-amber-100 text-amber-700';
    return 'bg-slate-100 text-slate-700';
  };

  const formatDate = (value) => {
    if (!value) return 'Sin fecha';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <p className="text-gray-500 font-medium">
          Cargando dashboard del asesor...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-100px)] py-6 flex gap-4 animate-fade-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1600px] mx-auto px-4 lg:px-6">
      <aside className="hidden lg:flex flex-col w-[320px] bg-white/60 border border-slate-200/60 rounded-3xl p-5 shadow-sm h-full overflow-y-auto custom-scrollbar flex-shrink-0">
        <div className="mb-6">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Tesis Asignadas
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
            {thesisList.length} Proyectos
          </p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            className="pl-9 bg-white border-none shadow-sm text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-ios-blue"
            placeholder="Buscar por estudiante o titulo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3">
          {filteredThesis.map((t) => {
            const tid = t.tesis_id || t.id;
            return (
              <button
                key={tid}
                onClick={() => setSelectedThesisId(tid)}
                className={`flex flex-col gap-2 p-4 rounded-2xl text-left transition-all w-full ${
                  selectedThesisId === tid
                    ? 'bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] border-l-4 border-ios-blue'
                    : 'hover:bg-slate-100/50'
                }`}
              >
                <div className="flex justify-between items-start w-full gap-2">
                  <span className="text-sm font-bold text-slate-900 truncate">
                    {`${t.estudiante_nombres || ''} ${t.estudiante_apellidos || ''}`.trim() ||
                      'Estudiante anonimo'}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${getStatusColor(t.estado)}`}
                  >
                    {t.estado || 'Activo'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {t.titulo || 'Sin titulo'}
                </p>
                {t.tesis_descripcion && (
                  <p className="text-[10px] text-ios-blue flex items-center gap-1 mt-1 truncate">
                    <FileText className="w-3 h-3 flex-shrink-0" />
                    {t.tesis_descripcion}
                  </p>
                )}
              </button>
            );
          })}

          {filteredThesis.length === 0 && (
            <p className="text-center text-sm text-slate-500 py-4">
              No se encontraron resultados
            </p>
          )}
        </div>
      </aside>

      <section className="flex-1 bg-white/60 border border-slate-200/60 rounded-3xl h-full flex flex-col p-6 shadow-[0_12px_40px_rgba(0,88,188,0.06)] overflow-hidden">
        {currentThesis ? (
          <>
            <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4 flex-shrink-0">
              <div>
                <nav className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">
                  <span>Proyectos</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-ios-blue">Revision de Documento</span>
                </nav>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 leading-tight mb-2">
                  {currentThesis.titulo || 'Tesis seleccionada'}
                </h1>
                <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4 text-slate-400" />
                    {nombreEstudianteActual || 'Estudiante asignado'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {formatDate(
                      currentThesis.updated_at || currentThesis.creado_en,
                    )}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {currentVersion?.url_archivo_drive && (
                  <a
                    href={currentVersion.url_archivo_drive}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold shadow-sm transition-all text-xs flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Drive
                  </a>
                )}

                <label
                  className={`px-4 py-2 bg-ios-blue text-white rounded-xl font-bold shadow-sm shadow-blue-500/30 transition-all text-xs flex items-center gap-2 cursor-pointer hover:bg-blue-600 ${
                    uploading ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <Upload size={14} />
                  {uploading ? 'Subiendo...' : 'Actualizar Docs'}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0 bg-slate-50 rounded-[2rem] border border-slate-200 overflow-hidden relative shadow-inner">
              {previewUrl ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full bg-white"
                  title="Document Preview"
                  allow="fullscreen"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-400 mb-4 shadow-sm border border-slate-100">
                    <Info size={32} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-700 mb-2">
                    Vista previa no disponible
                  </h4>
                  <p className="text-sm text-slate-500 max-w-sm">
                    El estudiante aun no ha subido un documento valido o no
                    contiene un enlace a Drive compatible.
                  </p>
                </div>
              )}
            </div>

            {documents.length > 0 && (
              <div className="mt-6 flex flex-col gap-3 flex-shrink-0">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Documentos y Revisiones
                </span>
                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                  {documents.map((doc) => (
                    <button
                      key={doc.id || doc.documento_id}
                      onClick={() => {
                        setCurrentVersion(doc);
                        setPreviewUrl(
                          buildPreviewUrl(
                            doc.url_archivo_drive ||
                              doc.url_google_doc ||
                              doc.url,
                          ),
                        );
                      }}
                      className={`min-w-[240px] p-4 rounded-2xl border text-left transition-all shrink-0 ${
                        currentVersion?.id === doc.id ||
                        currentVersion?.documento_id === doc.documento_id
                          ? 'bg-ios-blue/5 border-ios-blue/30 shadow-sm'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <FileText
                          size={16}
                          className={
                            currentVersion?.id === doc.id ||
                            currentVersion?.documento_id === doc.documento_id
                              ? 'text-ios-blue'
                              : 'text-slate-400'
                          }
                        />
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {doc.nombre || doc.nombre_archivo}
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2 font-medium">
                        {formatDate(
                          doc.created_at || doc.fecha_subida || doc.creado_en,
                        )}{' '}
                        {doc.tipo || doc.tipo_documento || doc.tipo_mime
                          ? `· ${doc.tipo || doc.tipo_documento || doc.tipo_mime}`
                          : ''}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6 border border-slate-100">
              <FileText size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              No tienes tesis seleccionada
            </h3>
            <p className="text-slate-500 max-w-sm">
              Selecciona una tesis de la lista izquierda para comenzar la
              revision de documentos.
            </p>
          </div>
        )}
      </section>

      {currentThesis && (
        <aside className="hidden xl:flex w-[340px] bg-white/60 backdrop-blur-xl rounded-3xl p-6 flex-col shadow-sm border border-slate-200/60 h-full flex-shrink-0">
          <div className="mb-6 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Sugerencias del Asesor
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {pendingAdvisorValidations} pendiente(s) por validar
              </p>
            </div>
            <span className="rounded-full bg-sky-50 px-2 py-1 text-[10px] font-bold text-sky-700">
              {suggestionsList.length} total
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto mb-6 pr-2 custom-scrollbar">
            {suggestionsList.length > 0 ? (
              suggestionsList.map((sug, idx) => {
                const tipoNombre =
                  sug.tipo_nombre || sug.tipo_codigo || 'Observacion';
                const detalle =
                  sug.detalle || sug.sugerencia || sug.comentario || 'Sin detalle';
                const tone = normalizeSuggestionTone(
                  sug.tipo_codigo,
                  sug.tipo_nombre,
                );
                const statusMeta = getSuggestionStatusMeta(sug);
                const canValidate = canAdvisorValidateSuggestion(sug);

                return (
                  <div
                    key={sug.id || idx}
                    className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group"
                  >
                    <div
                      className={`absolute top-0 left-0 w-1 h-full ${tone.rail}`}
                    />
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${tone.chip}`}
                      >
                        {tipoNombre}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatDate(sug.creado_en || sug.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed break-words">
                      {detalle}
                    </p>
                    {sug.comentario_estudiante && (
                      <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                          Comentario del estudiante
                        </p>
                        <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                          {sug.comentario_estudiante}
                        </p>
                      </div>
                    )}
                    {sug.comentario_asesor && (
                      <div className="mt-3 rounded-xl bg-rose-50 border border-rose-100 px-3 py-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-rose-600">
                          Ultima observacion del asesor
                        </p>
                        <p className="mt-1 text-xs text-rose-700 leading-relaxed">
                          {sug.comentario_asesor}
                        </p>
                      </div>
                    )}
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusMeta.badgeClass}`}
                      >
                        {statusMeta.label}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {statusMeta.hint}
                      </span>
                    </div>
                    {canValidate && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => openValidationModal(sug, true)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white transition hover:bg-emerald-700"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Verificar
                        </button>
                        <button
                          type="button"
                          onClick={() => openValidationModal(sug, false)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-[11px] font-bold text-white transition hover:bg-rose-700"
                        >
                          <XCircle className="h-4 w-4" />
                          Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 px-4">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">
                  Aun no hay sugerencias para esta tesis.
                </p>
              </div>
            )}
          </div>

          <div className="mt-auto space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex-shrink-0">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase px-1">
                Nueva sugerencia
              </label>
              <textarea
                className="w-full bg-white border border-slate-200 outline-none rounded-xl text-sm p-3 focus:ring-2 focus:ring-ios-blue transition-all placeholder:text-slate-400 resize-none hover:border-slate-300"
                placeholder="Escribe tu comentario aqui..."
                rows="3"
                value={suggestionText}
                onChange={(e) => setSuggestionText(e.target.value)}
                disabled={sendingSuggestion}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase px-1">
                Tipo de observacion
              </label>
              <Select
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900"
                value={suggestionTypeId}
                onChange={(e) => setSuggestionTypeId(e.target.value)}
                disabled={sendingSuggestion || suggestionTypes.length === 0}
              >
                <SelectItem value="">Selecciona un tipo</SelectItem>
                {suggestionTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.nombre}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <button
              type="button"
              onClick={handleSubmitSuggestion}
              disabled={
                sendingSuggestion || !suggestionText.trim() || !suggestionTypeId
              }
              className="w-full bg-ios-blue text-white font-bold py-3 rounded-xl shadow-sm shadow-blue-500/30 hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-ios-blue transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {sendingSuggestion ? 'Publicando...' : 'Publicar sugerencia'}
            </button>
          </div>
        </aside>
      )}

      <Modal
        open={validationModal.open}
        onClose={closeValidationModal}
        title={
          validationModal.approved
            ? 'Validar correccion'
            : 'Rechazar correccion'
        }
        subtitle={
          validationModal.approved
            ? 'Confirma si la observacion ya fue atendida correctamente.'
            : 'Explica al estudiante que aun falta corregir.'
        }
        primaryAction={{
          label: submittingValidation
            ? 'Guardando...'
            : validationModal.approved
              ? 'Confirmar validacion'
              : 'Registrar rechazo',
          onClick: handleSubmitValidation,
        }}
        secondaryAction={{
          label: 'Cancelar',
          onClick: closeValidationModal,
        }}
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Sugerencia
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              {validationModal.suggestion?.detalle ||
                validationModal.suggestion?.sugerencia ||
                'Sin detalle'}
            </p>
          </div>
          {validationModal.suggestion?.comentario_estudiante && (
            <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-700">
                Comentario del estudiante
              </p>
              <p className="mt-2 text-sm leading-relaxed text-sky-900">
                {validationModal.suggestion.comentario_estudiante}
              </p>
            </div>
          )}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Comentario del asesor
            </label>
            <textarea
              rows="4"
              value={validationModal.comment}
              onChange={(e) =>
                setValidationModal((current) => ({
                  ...current,
                  comment: e.target.value,
                }))
              }
              placeholder={
                validationModal.approved
                  ? 'Opcional: agrega una nota final para el estudiante.'
                  : 'Indica con claridad que falta corregir.'
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

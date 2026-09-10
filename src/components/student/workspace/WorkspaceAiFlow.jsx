import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Columns2,
  Download,
  FilePenLine,
  FileText,
  MessageSquare,
  Sparkles,
  Upload,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const DOC_ACTIONS = [
  { id: 'manual-edit', label: 'Edición manual', icon: FilePenLine },
  { id: 'cover-upload', label: 'Carátula', icon: Upload },
  { id: 'references', label: 'Referencias', icon: BookOpen },
];

import AcademicAIChatPanel from './AcademicAIChatPanel';
import RelatedDocumentsPanel from './RelatedDocumentsPanel';
import {
  downloadEditableDocument,
  getDocumentPreview,
} from '../../../api/docGenerator.api';
import { deepseekApi } from '../../../api/deepseek.api';
import './WorkspaceAiFlow.css';

const VIEWS = [
  { id: 'split', label: 'Vista dividida', icon: Columns2 },
  { id: 'doc', label: 'Documento', icon: FileText },
  { id: 'chat', label: 'Chat con IA', icon: Sparkles },
];

function timeAgo(value) {
  if (!value) return '';
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Math.max(0, Date.now() - then);
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(then).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
}

const docName = (doc) =>
  doc?.nombre || doc?.nombre_archivo || doc?.file_name || 'Documento';

export default function WorkspaceAiFlow({
  selectedThesis,
  tesisId,
  documents = [],
  currentVersion,
  editableVersion,
  onSelectDocument = () => {},
  onOpenAction = () => {},
  activeActionSection = null,
  actionPanel = null,
  thesesList = [],
  selectedThesisId = '',
  onSelectThesis = () => {},
  suggestionsCount = 0,
  onOpenSuggestions = () => {},
  onOpenAccesses = () => {},
  onOpenCreate = () => {},
}) {
  const [view, setView] = useState('split');
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [history, setHistory] = useState([]);

  const previewDocId = editableVersion?.id || null;

  useEffect(() => {
    let ignore = false;
    if (!previewDocId) {
      setPreviewHtml('');
      return undefined;
    }
    setPreviewLoading(true);
    getDocumentPreview(previewDocId)
      .then((res) => {
        if (!ignore) setPreviewHtml(res?.preview_html || res?.data?.preview_html || '');
      })
      .catch(() => {
        if (!ignore) setPreviewHtml('');
      })
      .finally(() => {
        if (!ignore) setPreviewLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [previewDocId]);

  useEffect(() => {
    let ignore = false;
    if (!tesisId) {
      setHistory([]);
      return undefined;
    }
    deepseekApi
      .getHistory(tesisId)
      .then((res) => {
        if (ignore) return;
        const msgs = res?.data || res || [];
        setHistory(
          msgs
            .filter((m) => m?.role === 'user' && m?.content)
            .slice(-30)
            .reverse(),
        );
      })
      .catch(() => {
        if (!ignore) setHistory([]);
      });
    return () => {
      ignore = true;
    };
  }, [tesisId]);

  const uploadedDocs = useMemo(
    () =>
      [...documents].sort((a, b) => {
        const at = new Date(a?.creado_en || a?.created_at || 0).getTime();
        const bt = new Date(b?.creado_en || b?.created_at || 0).getTime();
        return (Number.isNaN(bt) ? 0 : bt) - (Number.isNaN(at) ? 0 : at);
      }),
    [documents],
  );

  const openHistory = useCallback(() => setView('chat'), []);

  const downloadDocument = useCallback(async () => {
    if (!previewDocId || downloading) return;

    try {
      setDownloading(true);
      const blob = await downloadEditableDocument(previewDocId);
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = docName(editableVersion || currentVersion);
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error?.message || 'No se pudo descargar el DOCX');
    } finally {
      setDownloading(false);
    }
  }, [currentVersion, downloading, editableVersion, previewDocId]);

  const showDoc = view === 'split' || view === 'doc' || Boolean(activeActionSection);
  const showChat = (view === 'split' || view === 'chat') && !activeActionSection;

  return (
    <div className="waf">
      <div className="waf-switcher">
        {VIEWS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={view === id ? 'is-active' : ''}
            onClick={() => setView(id)}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      <div className={`waf-body view-${view} ${activeActionSection ? 'has-action' : ''}`}>
        <div className="waf-rail">
          <div className="waf-rail-controls">
            {thesesList.length > 0 && (
              <select
                className="waf-select"
                value={selectedThesisId}
                onChange={(e) => onSelectThesis(e.target.value)}
                aria-label="Tesis activa"
              >
                {thesesList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.titulo || 'Sin título'}
                  </option>
                ))}
              </select>
            )}

            <RelatedDocumentsPanel
              documents={documents}
              currentDocumentId={currentVersion?.id}
              onSelectDocument={onSelectDocument}
            />

            <div className="waf-rail-btns">
              <button
                type="button"
                className="waf-rail-btn"
                onClick={onOpenSuggestions}
              >
                <MessageSquare size={14} /> Sugerencias
                {suggestionsCount > 0 && (
                  <span className="waf-rail-badge">{suggestionsCount}</span>
                )}
              </button>
              <button type="button" className="waf-rail-btn" onClick={onOpenAccesses}>
                Accesos
              </button>
              <button type="button" className="waf-rail-btn" onClick={onOpenCreate}>
                Nueva tesis
              </button>
            </div>
          </div>

          <div>
            <h4>
              <FileText size={13} /> Documentos subidos
            </h4>
            <div className="waf-rail-list">
              {uploadedDocs.length === 0 ? (
                <p className="waf-rail-empty">
                  Aún no hay documentos. Sube un avance en Word para verlo aquí.
                </p>
              ) : (
                uploadedDocs.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    className={`waf-rail-item ${
                      doc.id === currentVersion?.id ? 'is-active' : ''
                    }`}
                    onClick={() => onSelectDocument(doc)}
                  >
                    <FileText size={15} className="waf-ico" />
                    <span className="waf-txt">{docName(doc)}</span>
                    <span className="waf-time">
                      {timeAgo(doc.creado_en || doc.created_at)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div>
            <h4>
              <MessageSquare size={13} /> Historial de consultas
            </h4>
            <div className="waf-rail-list">
              {history.length === 0 ? (
                <p className="waf-rail-empty">
                  Tus preguntas al asistente aparecerán aquí.
                </p>
              ) : (
                history.map((msg, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="waf-rail-item"
                    onClick={openHistory}
                    title={msg.content}
                  >
                    <MessageSquare size={15} className="waf-ico" />
                    <span className="waf-txt">{msg.content}</span>
                    <span className="waf-time">
                      {timeAgo(msg.created_at || msg.creado_en)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {showDoc && (
          <div className="waf-doc">
            <div className="waf-doc-head">
              <div className="waf-w">
                <span className="waf-doc-badge">W</span>
                <div style={{ minWidth: 0 }}>
                  <div className="waf-doc-title">
                    {currentVersion
                      ? docName(currentVersion)
                      : selectedThesis?.titulo || 'Documento de tesis'}
                  </div>
                  <div className="waf-doc-sub">
                    {previewLoading
                      ? 'Cargando vista previa…'
                      : previewHtml
                        ? 'Vista previa Word'
                        : 'Sin vista previa estructurada'}
                  </div>
                </div>
              </div>
              <div className="waf-doc-actions">
                <button
                  type="button"
                  className={`waf-doc-act ${!activeActionSection ? 'is-active' : ''}`}
                  onClick={() => onOpenAction(null)}
                >
                  <FileText size={14} />
                  <span>Documento</span>
                </button>
                {DOC_ACTIONS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    className={`waf-doc-act ${activeActionSection === id ? 'is-active' : ''}`}
                    onClick={() => onOpenAction(activeActionSection === id ? null : id)}
                  >
                    <Icon size={14} />
                    <span>{label}</span>
                  </button>
                ))}
                {!activeActionSection && previewDocId && (
                  <button
                    type="button"
                    className="waf-doc-dl"
                    onClick={downloadDocument}
                    disabled={downloading}
                  >
                    <Download size={14} /> {downloading ? 'Descargando…' : '.docx'}
                  </button>
                )}
              </div>
            </div>

            {activeActionSection ? (
              <div className="waf-doc-panel">{actionPanel}</div>
            ) : previewHtml ? (
              <iframe
                className="waf-doc-frame"
                srcDoc={previewHtml}
                title="Vista previa DOCX servida por Python"
                sandbox=""
              />
            ) : (
              <div className="waf-doc-placeholder">
                <span className="waf-ph-ico">
                  <FileText size={22} />
                </span>
                <p style={{ fontWeight: 600, color: '#475569' }}>
                  {previewLoading ? 'Cargando…' : 'Vista previa no disponible'}
                </p>
                <p style={{ maxWidth: 320, fontSize: 13 }}>
                  Selecciona un documento de tesis en Word para verlo aquí.
                </p>
              </div>
            )}
          </div>
        )}

        {showChat && (
          <div className="waf-chat">
            <AcademicAIChatPanel
              tesisId={tesisId}
              documentId={editableVersion?.id}
              className="flex-1"
            />
          </div>
        )}
      </div>
    </div>
  );
}

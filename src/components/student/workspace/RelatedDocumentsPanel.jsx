import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronDown, FileText } from 'lucide-react';

const formatDate = (value) => {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString();
};

const formatFileSize = (document) => {
  const bytes =
    document?.tamano_bytes ??
    document?.tamanoBytes ??
    document?.size_bytes ??
    document?.archivo_tamano ??
    document?.size ??
    null;

  if (!bytes || Number.isNaN(Number(bytes))) {
    return '—';
  }

  const value = Number(bytes);
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;

  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDocumentType = (document) => {
  const value =
    document?.tipo_documento_nombre ||
    document?.tipo_documento ||
    document?.tipo_documento_categoria ||
    document?.categoria ||
    document?.source ||
    'Documento';

  return String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function RelatedDocumentsPanel({
  documents,
  currentDocumentId,
  onSelectDocument,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentDocument = useMemo(
    () =>
      documents.find((document) => document.id === currentDocumentId) ||
      documents[0] ||
      null,
    [currentDocumentId, documents],
  );

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  const currentDocumentName =
    currentDocument?.nombre ||
    currentDocument?.nombre_archivo ||
    null;
  const currentDocumentType = currentDocument
    ? formatDocumentType(currentDocument)
    : null;

  return (
    <div ref={dropdownRef} className="relative z-20">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        disabled={documents.length === 0}
        className="flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-2.5 text-left transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        title={currentDocumentName || 'Sin documentos de tesis'}
      >
        <span className="flex min-w-0 items-center gap-2">
          <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="min-w-0">
            <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-0.5">
              Versión del documento
            </span>
            <span className="block truncate text-xs font-semibold text-slate-800">
              {currentDocumentName || 'Sin documentos'}
            </span>
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-1.5">
          {currentDocumentType && (
            <span className="hidden max-w-20 truncate rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 sm:inline">
              {currentDocumentType}
            </span>
          )}
          <ChevronDown
            className={`h-3.5 w-3.5 text-slate-400 transition ${isOpen ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.45)]">
          {documents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
              No hay documentos vinculados todavía.
            </div>
          ) : (
            documents.map((doc) => {
              const documentName = doc.nombre || doc.nombre_archivo || 'Documento';
              const isActive = currentDocumentId === doc.id;

              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => {
                    onSelectDocument(doc);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition ${
                    isActive
                      ? 'bg-sky-50 text-slate-950'
                      : 'text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      {documentName}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{formatDocumentType(doc)}</span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(doc.created_at || doc.creado_en)}
                      </span>
                      <span>{formatFileSize(doc)}</span>
                    </span>
                  </span>
                  {isActive ? (
                    <span className="shrink-0 rounded-full bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-700">
                      Actual
                    </span>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}

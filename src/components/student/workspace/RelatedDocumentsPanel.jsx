import { CalendarDays, ExternalLink, FileText } from 'lucide-react';

import { Card } from '../../ui/card';

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

export default function RelatedDocumentsPanel({
  documents,
  currentDocumentId,
  onSelectDocument,
}) {
  return (
    <Card className="rounded-[28px] border-none bg-white p-6 shadow-[0_24px_50px_-38px_rgba(15,23,42,0.35)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
            Documentos
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">
            Documentos relacionados
          </h3>
        </div>
        <span className="rounded-full border border-white/70 bg-white/72 px-3 py-1 text-xs font-medium text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.88)]">
          {documents.length}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {documents.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            No hay documentos vinculados todavía.
          </div>
        ) : (
          documents.map((doc) => {
            const documentName = doc.nombre || doc.nombre_archivo || 'Documento';
            const documentUrl = doc.url_google_doc || doc.url_archivo_drive;
            const isActive = currentDocumentId === doc.id;

            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => onSelectDocument(doc)}
                className={`w-full rounded-[20px] px-4 py-4 text-left transition ${
                  isActive
                    ? 'border border-white/80 bg-[linear-gradient(180deg,rgba(232,242,255,0.96)_0%,rgba(214,233,255,0.86)_100%)] text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_18px_36px_rgba(125,168,214,0.18)]'
                    : 'bg-slate-50 text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl ${
                        isActive
                          ? 'border border-white/80 bg-white/76 text-sky-700'
                          : 'bg-white text-slate-600 shadow-[0_12px_26px_-24px_rgba(15,23,42,0.5)]'
                      }`}
                    >
                      <FileText className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {documentName}
                      </p>
                      <div
                        className={`mt-2 flex flex-wrap items-center gap-3 text-xs ${
                          isActive ? 'text-slate-500' : 'text-slate-500'
                        }`}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDate(doc.created_at || doc.creado_en)}
                        </span>
                        <span>{formatFileSize(doc)}</span>
                      </div>
                    </div>
                  </div>

                  {documentUrl ? (
                    <a
                      href={documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition ${
                        isActive
                          ? 'border border-white/80 bg-white/78 text-sky-700 hover:bg-white'
                          : 'bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                      }`}
                      title="Abrir documento"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>
              </button>
            );
          })
        )}
      </div>
    </Card>
  );
}

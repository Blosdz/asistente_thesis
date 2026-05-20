import { ExternalLink, FileText } from 'lucide-react';

import { Card } from '../../ui/card';

export default function ThesisPreviewPanel({
  selectedThesis,
  currentVersion,
  previewUrl,
  className = '',
}) {
  const documentUrl =
    currentVersion?.url_google_doc || currentVersion?.url_archivo_drive || null;

  return (
    <Card
      className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border-none bg-white p-0 shadow-[0_24px_54px_-44px_rgba(15,23,42,0.42)] ${className}`}
    >
      <div className="flex flex-col gap-2 border-b border-slate-200/80 px-3 py-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-slate-950 lg:text-base">
            {selectedThesis?.titulo || 'Selecciona una tesis'}
          </h2>
          <p className="truncate text-xs text-slate-500">
            {currentVersion?.nombre || currentVersion?.nombre_archivo || selectedThesis?.descripcion || 'El documento seleccionado se mostrará aquí.'}
          </p>
        </div>

        {documentUrl ? (
          <a
            href={documentUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-[0_12px_26px_-22px_rgba(15,23,42,0.4)] transition hover:bg-slate-50"
          >
            <ExternalLink className="h-4 w-4" />
            Abrir documento
          </a>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 bg-slate-50/70 p-2">
        {previewUrl ? (
          <div className="h-full overflow-hidden rounded-xl border border-slate-200 bg-white">
            <iframe
              src={previewUrl}
              className="h-full w-full"
              title="Vista previa de tesis"
              allow="fullscreen"
            />
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <FileText className="h-6 w-6" />
            </div>
            <p className="mt-5 text-lg font-medium text-slate-900">
              Vista previa no disponible
            </p>
            <p className="mt-2 max-w-md text-sm leading-7 text-slate-500">
              Selecciona un documento relacionado para verlo en grande desde este workspace.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

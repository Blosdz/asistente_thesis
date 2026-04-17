import { ExternalLink, FileText } from 'lucide-react';

import { Card } from '../../ui/card';

export default function ThesisPreviewPanel({
  selectedThesis,
  currentVersion,
  previewUrl,
}) {
  const documentUrl =
    currentVersion?.url_google_doc || currentVersion?.url_archivo_drive || null;

  return (
    <Card className="flex min-h-[920px] flex-col overflow-hidden rounded-[32px] border-none bg-white p-0 shadow-[0_36px_80px_-56px_rgba(15,23,42,0.42)]">
      <div className="flex flex-col gap-4 border-b border-slate-200/80 px-6 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
            Vista previa
          </p>
          <h2 className="mt-2 truncate text-xl font-semibold text-slate-950">
            {selectedThesis?.titulo || 'Selecciona una tesis'}
          </h2>
          <p className="mt-1 truncate text-sm text-slate-500">
            {currentVersion?.nombre || currentVersion?.nombre_archivo || selectedThesis?.descripcion || 'El documento seleccionado se mostrará aquí.'}
          </p>
        </div>

        {documentUrl ? (
          <a
            href={documentUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.4)] transition hover:bg-slate-50"
          >
            <ExternalLink className="h-4 w-4" />
            Abrir documento
          </a>
        ) : null}
      </div>

      <div className="flex-1 bg-slate-50/70 p-4 lg:p-6">
        {previewUrl ? (
          <div className="h-full min-h-[820px] overflow-hidden rounded-[28px] border border-slate-200 bg-white">
            <iframe
              src={previewUrl}
              className="h-[calc(100vh-220px)] min-h-[820px] w-full"
              title="Vista previa de tesis"
              allow="fullscreen"
            />
          </div>
        ) : (
          <div className="flex h-full min-h-[820px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-white px-8 text-center">
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

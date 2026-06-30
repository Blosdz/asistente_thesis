import { useCallback, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, FileText, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { subirCaratulaTesis } from '../../../services/thesisService';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';

const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const PDF_MIME = 'application/pdf';

const ACCEPTED = '.docx,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf';

function isValidCoverFile(file) {
  const name = (file.name || '').toLowerCase();
  const isDocx = name.endsWith('.docx');
  const isPdf = name.endsWith('.pdf');
  const mimeOk =
    !file.type ||
    (isDocx && file.type === DOCX_MIME) ||
    (isPdf && file.type === PDF_MIME);
  return (isDocx || isPdf) && mimeOk;
}

export default function ThesisCoverUploadPanel({
  thesisId,
  thesis,
  onBack,
  onThesisUpdated,
  className = '',
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverMeta, setCoverMeta] = useState(null);

  const currentCoverName =
    coverMeta?.cover_docx_original_name ||
    thesis?.metadata?.cover_docx_original_name ||
    null;

  const currentCoverUrl =
    coverMeta?.cover_docx_url ||
    thesis?.metadata?.cover_docx_url ||
    null;

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;
      if (!thesisId) { toast.error('Selecciona una tesis primero'); return; }
      if (!isValidCoverFile(file)) {
        toast.error('Formato no válido. Sube un archivo DOCX o PDF.');
        return;
      }

      try {
        setUploading(true);
        const data = await subirCaratulaTesis(thesisId, file);
        setCoverMeta(data);
        onThesisUpdated?.({
          ...thesis,
          metadata: {
            ...(thesis?.metadata || {}),
            cover_docx_original_name: data?.cover_docx_original_name,
            cover_docx_url: data?.cover_docx_url,
          },
        });
        toast.success('Carátula subida correctamente');
      } catch (err) {
        console.error('Cover upload error:', err);
        toast.error(err?.message || 'No se pudo subir la carátula');
      } finally {
        setUploading(false);
      }
    },
    [thesisId, thesis, onThesisUpdated],
  );

  const handleInputChange = (e) => {
    handleFile(e.target.files?.[0]);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  return (
    <Card
      className={`flex flex-col rounded-2xl border border-slate-200 bg-white shadow-[0_20px_42px_-34px_rgba(15,23,42,0.35)] ${className}`}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 px-5 py-3.5">
        <Button
          variant="ghost"
          onClick={onBack}
          className="h-8 gap-1.5 rounded-lg px-2 text-xs text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver
        </Button>

        <div className="h-4 w-px bg-slate-200" />

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Workspace
          </p>
          <h2 className="text-sm font-semibold text-slate-900">Carátula de tesis</h2>
        </div>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5">

        {/* Current cover banner */}
        {currentCoverName && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-emerald-800">Carátula actual</p>
              <p className="truncate text-xs text-emerald-700">{currentCoverName}</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => inputRef.current?.click()}
              disabled={uploading || !thesisId}
              className="ml-auto h-7 shrink-0 rounded-lg px-2.5 text-xs text-emerald-700 hover:bg-emerald-100"
            >
              Reemplazar
            </Button>
          </div>
        )}

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && !uploading && inputRef.current?.click()}
          aria-label="Zona de carga de carátula"
          className={[
            'flex flex-1 cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-10 text-center transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
            uploading
              ? 'cursor-wait border-slate-200 bg-slate-50'
              : dragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-slate-200 bg-slate-50 hover:border-slate-400 hover:bg-white',
          ].join(' ')}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            onChange={handleInputChange}
            disabled={uploading || !thesisId}
          />

          {uploading ? (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
              <div>
                <p className="text-sm font-semibold text-slate-700">Subiendo carátula…</p>
                <p className="mt-1 text-xs text-slate-400">Esto puede tomar unos segundos</p>
              </div>
            </>
          ) : (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                <Upload className="h-7 w-7 text-slate-500" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {currentCoverName ? 'Subir nueva carátula' : 'Sube tu carátula de tesis'}
                </p>
                <p className="mt-1.5 text-xs text-slate-500">
                  Arrastra un archivo aquí o haz clic para seleccionar
                </p>
              </div>

              {/* Accepted formats */}
              <div className="flex items-center gap-2">
                {[
                  { label: 'DOCX', icon: FileText, color: 'text-blue-600 bg-blue-50 ring-blue-200' },
                  { label: 'PDF', icon: FileText, color: 'text-red-600 bg-red-50 ring-red-200' },
                ].map(({ label, icon: Icon, color }) => (
                  <span
                    key={label}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold ring-1 ${color}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </span>
                ))}
              </div>

              {!thesisId && (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                  Selecciona una tesis para habilitar la carga
                </p>
              )}
            </>
          )}
        </div>

        {/* Info box */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold text-slate-700">¿Para qué sirve la carátula?</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            La carátula se inserta al inicio del documento final generado (.docx).
            Debe contener la portada oficial de tu universidad con nombre de la
            investigación, autor, fecha y demás datos requeridos por tu institución.
          </p>
        </div>
      </div>
    </Card>
  );
}

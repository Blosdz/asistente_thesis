import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowUpDown,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Copy,
  FileText,
  Globe,
  GraduationCap,
  Hash,
  Layers,
  Link as LinkIcon,
  Loader2,
  Plus,
  Presentation,
  Quote,
  Search,
  Trash2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '../../ui/button';
import { referenceTypes } from './ReferenceForm';
import ReferenceFormModal from './ReferenceFormModal';
import { bibliographyApi, downloadBibliographyFile } from '../../../api/bibliography.api';

const styles = { APA7: 'APA 7', VANCOUVER: 'Vancouver', IEEE: 'IEEE', ISO690: 'ISO 690 · autor-fecha', MLA: 'MLA 9' };

const TYPE_ICONS = {
  article: FileText,
  book: BookOpen,
  chapter: Layers,
  thesis: GraduationCap,
  web: Globe,
  report: ClipboardList,
  conference: Presentation,
};

const compactSelect =
  'h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-400 disabled:cursor-not-allowed disabled:opacity-60';
const toolbarSelect =
  'h-8 shrink-0 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-400 disabled:cursor-not-allowed disabled:opacity-60';

function ReviewStatusBadge({ status }) {
  const complete = status === 'complete';
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        complete ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${complete ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      {complete ? 'Completa' : 'Necesita revisión'}
    </span>
  );
}

function ReferenceCard({ reference, isActive, busy, documentId, onEdit, onCopy, onRemove }) {
  const Icon = TYPE_ICONS[reference.type] || FileText;
  const authorLine = reference.authors.map((a) => [a.last_name, a.first_name].filter(Boolean).join(', ')).join('; ');
  const source = reference.journal || reference.publisher || reference.institution;

  return (
    <article
      className={`mb-3 rounded-2xl border bg-white p-4 transition-shadow sm:p-5 ${
        isActive ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200 hover:shadow-[0_12px_28px_-20px_rgba(15,23,42,0.4)]'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-1.5 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
            <span>{referenceTypes[reference.type]}</span>
            <span className="text-slate-300">·</span>
            <span className="font-medium normal-case tracking-normal text-slate-500">{reference.year || 's. f.'}</span>
          </div>
          <h3 className="mt-1.5 font-semibold leading-snug text-slate-900">{reference.title}</h3>
          {authorLine && <p className="mt-1 text-sm text-slate-600">{authorLine}</p>}
          {source && <p className="mt-0.5 text-xs text-slate-500">{source}</p>}
        </div>
        <ReviewStatusBadge status={reference.review_status} />
      </div>

      {(reference.doi || reference.url) && (
        <div className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
          {reference.doi && (
            <p className="flex items-center gap-1.5">
              <Hash size={12} className="shrink-0 text-slate-400" />
              <span className="truncate">DOI: {reference.doi}</span>
              <span
                className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                  reference.doi_status === 'found' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {reference.doi_status === 'found' ? 'Metadatos en Crossref' : 'Sin consulta al proveedor'}
              </span>
            </p>
          )}
          {reference.url && (
            <p className="flex items-center gap-1.5">
              <LinkIcon size={12} className="shrink-0 text-slate-400" />
              <span className="truncate">{reference.url}</span>
            </p>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-xs">
        <span className="mr-auto inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 font-medium text-slate-500">
          <Quote size={12} />
          {documentId ? `${reference.citation_count || 0} citas vinculadas en este documento` : 'Sin documento objetivo'}
        </span>
        <button
          type="button"
          className="rounded-lg px-2 py-1 font-semibold text-blue-700 transition hover:bg-blue-50"
          onClick={() => onEdit(reference)}
        >
          Editar
        </button>
        <button
          type="button"
          aria-label={`Copiar ${reference.title}`}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          onClick={() => onCopy(reference.formatted)}
        >
          <Copy size={15} />
        </button>
        <button
          type="button"
          aria-label={`Eliminar ${reference.title}`}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
          disabled={busy}
          onClick={() => onRemove(reference)}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </article>
  );
}

export default function ThesisReferencesPanel({ thesisId, tesisId, thesis, document: targetDocument, onUploadEditableProgress, onBack, onUpdated, className = '' }) {
  const id = thesisId || tesisId;
  const documentId = targetDocument?.id;
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [editor, setEditor] = useState(undefined);
  const [dirty, setDirty] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState(false);
  const [page, setPage] = useState(1);
  const [guide, setGuide] = useState(false);
  const [operation, setOperation] = useState(null);
  const generation = useRef(0);
  const upload = useRef();
  const progress = useRef();
  const load = useCallback(async () => {
    const token = ++generation.current;
    setLoading(true);
    try { const data = await bibliographyApi.workspace(id, documentId); if (generation.current === token) { setWorkspace(data); setError(''); } }
    catch (err) { if (generation.current === token) setError(err.message); }
    finally { if (generation.current === token) setLoading(false); }
  }, [id, documentId]);
  useEffect(() => { setWorkspace(null); setEditor(undefined); setDirty(false); setOperation(null); setPage(1); load(); return () => { generation.current += 1; }; }, [load]);
  useEffect(() => { const warn = e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } }; window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn); }, [dirty]);
  useEffect(() => { if (!workspace?.pending_operation) return; const timer = setTimeout(load, 1800); return () => clearTimeout(timer); }, [workspace, load]);
  useEffect(() => { setPage(1); }, [query, filter, sort]);
  const canLeave = () => !dirty || window.confirm('Tienes cambios sin guardar. ¿Descartarlos?');
  const openEditor = value => { if (canLeave()) { setEditor(value); setDirty(false); } };
  const waitOperation = async result => {
    if (!result?.operation_id) return result;
    let state = result;
    while (['queued', 'running'].includes(state.status)) { setOperation(state); await new Promise(resolve => setTimeout(resolve, 1200)); state = await bibliographyApi.operation(id, result.operation_id); }
    setOperation(state);
    if (state.status === 'failed' || (state.status === 'partial' && state.error)) throw new Error(state.error || 'No se pudo completar la operación');
    if (state.status === 'partial') toast('Guardado en biblioteca; Word pendiente de actualizar');
    return state;
  };
  const run = async action => { setBusy(true); setError(''); try { const result = await waitOperation(await action()); await load(); onUpdated?.(); return result; } catch (err) { setError(err.message); throw err; } finally { setBusy(false); } };
  const handle = action => { run(action).catch(() => {}); };
  const revision = workspace?.document?.revision;
  const editable = !!workspace?.document?.editable;
  const style = workspace?.style || String(thesis?.doc_thesis_format || 'APA7').toUpperCase();
  const preview = useCallback(reference => bibliographyApi.preview(id, { reference, style }), [id, style]);
  const references = workspace?.references || [];
  let filtered = references.filter(r => (filter === 'all' || r.type === filter) && [r.title, r.year, r.doi, r.journal, r.publisher, r.institution, ...(r.authors || []).flatMap(a => [a.first_name, a.last_name])].join(' ').toLowerCase().includes(query.toLowerCase()));
  if (sort) filtered = [...filtered].sort((a, b) => (a.authors?.[0]?.last_name || a.title).localeCompare(b.authors?.[0]?.last_name || b.title));
  const pages = Math.max(1, Math.ceil(filtered.length / 20));
  const currentPage = Math.min(page, pages);
  const copy = async text => { try { await navigator.clipboard.writeText(text); toast.success('Copiado'); } catch { toast.error('No se pudo copiar'); } };
  const sync = () => bibliographyApi.sync(id, documentId, { expected_revision: revision });
  const removeReference = reference => { if (window.confirm('¿Eliminar esta referencia de la biblioteca?')) handle(() => bibliographyApi.remove(id, reference.id)); };
  const hasActiveFilters = query.trim() !== '' || filter !== 'all';
  const clearFilters = () => { setQuery(''); setFilter('all'); };

  return (
    <div className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white ${className}`}>
      <header className="border-b border-slate-100 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {onBack && (
              <Button
                variant="ghost"
                aria-label="Volver al workspace"
                onClick={() => { if (canLeave()) onBack(); }}
                className="mt-0.5 h-8 w-8 shrink-0 rounded-lg !px-0 !py-0 text-slate-500 hover:text-slate-900"
              >
                <ArrowLeft size={16} />
              </Button>
            )}
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <BookOpen size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Workspace</p>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-900">Referencias</h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{references.length} fuentes</span>
              </div>
              <p className="mt-0.5 truncate text-xs text-slate-500">{targetDocument?.nombre_archivo || 'Biblioteca de la tesis · sin documento seleccionado'}</p>
            </div>
          </div>

          <label className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Norma bibliográfica</span>
            <select
              aria-label="Norma bibliográfica"
              className={compactSelect}
              disabled={busy || !workspace}
              value={style}
              onChange={e => handle(() => bibliographyApi.style(id, { style: e.target.value, document_id: editable ? documentId : null, expected_revision: revision, sync_document: editable }))}
            >
              {Object.entries(styles).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span role="status" className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium ${busy ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-500'}`}>
            {busy && <Loader2 size={12} className="animate-spin" />}
            {busy ? operation?.stage || 'Procesando…' : workspace?.document?.sync_label || 'Guardado en biblioteca'}
          </span>
          {workspace?.document?.style && workspace.document.style !== style && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-700">
              <AlertTriangle size={12} /> El documento conserva {styles[workspace.document.style]}
            </span>
          )}
          <button type="button" className="ml-auto font-semibold text-blue-700 hover:text-blue-800" onClick={() => setGuide(!guide)}>
            {guide ? 'Ocultar guía' : 'Cómo preparar las referencias en Word'}
          </button>
        </div>
      </header>

      {guide && (
        <section className="max-h-72 overflow-auto border-b border-slate-100 bg-blue-50/70 p-5 text-sm text-slate-700">
          <h3 className="font-semibold text-slate-900">Cómo preparar las referencias en Word</h3>
          <ul className="my-3 list-disc space-y-1 pl-5">
            <li>Usa un encabezado independiente: Referencias, Bibliografía, References o Bibliography.</li>
            <li>Escribe una referencia por párrafo; evita imágenes o capturas.</li>
            <li>Conserva DOI y URL completos e incluye autor, fecha, título y publicación.</li>
            <li>También se reconocen las fuentes del gestor bibliográfico de Word. No necesitas escribir XML ni metadatos.</li>
          </ul>
          <p>Ejemplos ilustrativos: Pérez, Ana (2024). Aprendizaje colaborativo. Revista de Educación. · Rojas, Luis (2023). Métodos de investigación. Editorial Universitaria. · Díaz, Rosa (2022). Educación digital [Tesis de maestría, Universidad de Ejemplo].</p>
          <Button variant="outline" className="mt-3" onClick={() => downloadBibliographyFile(id, 'plantilla', 'plantilla-referencias.docx').catch(e => setError(e.message))}>Descargar plantilla DOCX</Button>
          <p className="mt-2 text-xs text-slate-500">Las citas escritas como texto libre no se convierten automáticamente. La regeneración manual en Word depende de los estilos instalados.</p>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50/60 p-3">
        <label className="relative w-56 shrink-0">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            aria-label="Buscar referencias"
            className="h-8 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-2 text-xs text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            placeholder="Buscar autores, título, DOI o año…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </label>
        <select aria-label="Filtrar por tipo" value={filter} onChange={e => setFilter(e.target.value)} className={toolbarSelect}>
          <option value="all">Todos los tipos</option>
          {Object.entries(referenceTypes).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
        <Button size="sm" variant="outline" onClick={() => setSort(!sort)} aria-pressed={sort} className={sort ? '!border-blue-300 !bg-blue-50 !text-blue-700' : ''}>
          <ArrowUpDown size={13} />Ordenar A–Z
        </Button>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" disabled={!references.length} onClick={() => copy(workspace.bibliography.join('\n\n'))}><Copy size={13} />Copiar bibliografía</Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => upload.current.click()}>Importar DOCX</Button>
          <Button size="sm" disabled={busy} onClick={() => openEditor(null)}><Plus size={14} />Nueva referencia</Button>
        </div>
      </div>

      <input ref={upload} hidden type="file" accept=".docx" onChange={e => { const file = e.target.files[0]; e.target.value = ''; if (file) handle(() => bibliographyApi.import(id, file)); }} />
      <input ref={progress} hidden type="file" accept=".docx" onChange={e => { const file = e.target.files[0]; e.target.value = ''; if (file) handle(async () => { await onUploadEditableProgress(file); }); }} />

      {error && (
        <div role="alert" className="mx-4 mt-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button className="shrink-0 font-semibold underline" onClick={load}>Recargar</button>
        </div>
      )}
      {operation?.warnings?.length > 0 && (
        <div className="mx-4 mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{operation.warnings.join(' · ')}</span>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <section className="min-w-0 flex-1 overflow-y-auto bg-slate-50/60 p-4">
          {loading && (
            <div className="flex items-center justify-center gap-2 p-8 text-sm text-slate-500">
              <Loader2 size={16} className="animate-spin" /> Cargando biblioteca…
            </div>
          )}

          {!loading && !references.length && (
            <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 px-6 py-12 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                <BookOpen className="text-blue-600" size={28} />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Reúne las fuentes de tu investigación</h3>
                <p className="my-3 text-sm text-slate-500">
                  {editable
                    ? 'Extrae las referencias del avance actual, importa un Word bibliográfico o agrega una fuente.'
                    : 'Sube un avance, procesa una bibliografía independiente o ingresa tu primera referencia.'}
                </p>
              </div>
              <div className="flex w-full max-w-xs flex-col gap-2">
                {editable ? (
                  <Button disabled={busy} onClick={() => handle(() => bibliographyApi.extract(id, documentId, { expected_revision: revision }))}>Extraer del archivo actual</Button>
                ) : onUploadEditableProgress && (
                  <Button disabled={busy} onClick={() => progress.current.click()}>Subir documento de avance</Button>
                )}
                <Button variant="outline" onClick={() => upload.current.click()}>Subir para procesar referencias</Button>
                <Button variant="outline" onClick={() => openEditor(null)}>Agregar referencia manualmente</Button>
              </div>
            </div>
          )}

          {!loading && !!references.length && !filtered.length && (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <Search size={28} className="text-slate-300" />
              <p className="text-sm text-slate-500">No hay resultados para esta búsqueda.</p>
              {hasActiveFilters && (
                <button type="button" className="text-xs font-semibold text-blue-700 hover:text-blue-800" onClick={clearFilters}>Limpiar filtros</button>
              )}
            </div>
          )}

          {filtered.slice((currentPage - 1) * 20, currentPage * 20).map(reference => (
            <ReferenceCard
              key={reference.id}
              reference={reference}
              isActive={editor?.id === reference.id}
              busy={busy}
              documentId={documentId}
              onEdit={openEditor}
              onCopy={copy}
              onRemove={removeReference}
            />
          ))}
        </section>

      </div>

      <ReferenceFormModal
        open={editor !== undefined}
        reference={editor}
        onDirtyChange={setDirty}
        onCancel={() => openEditor(undefined)}
        saving={busy}
        documentEditable={editable}
        onPreview={preview}
        onResolveDoi={doi => bibliographyApi.doi(id, doi)}
        onSave={async reference => { await run(() => bibliographyApi.save(id, editor?.id, { reference, expected_version: editor?.version, document_id: editable ? documentId : null, sync_document: editable, expected_revision: revision })); setDirty(false); setEditor(undefined); }}
      />

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-4 text-xs text-slate-500">
        <span>{filtered.length} resultados · {workspace?.citation_count || 0} citas vinculadas</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Página anterior"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="min-w-[3.5rem] text-center font-medium text-slate-600">{currentPage} / {pages}</span>
          <button
            type="button"
            aria-label="Página siguiente"
            disabled={currentPage === pages}
            onClick={() => setPage(currentPage + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight size={15} />
          </button>
        </div>
        <div className="flex gap-2">
          {editable && <Button variant="outline" disabled={busy} onClick={() => handle(sync)}>Actualizar Word</Button>}
          <Button
            variant="outline"
            disabled={busy || !references.length}
            onClick={() => handle(async () => {
              if (editable) {
                const result = await waitOperation(await sync());
                if (result.status !== 'succeeded') throw new Error('Word pendiente de actualizar');
                await downloadBibliographyFile(id, null, targetDocument.nombre_archivo || 'tesis.docx', documentId);
              } else {
                const result = await waitOperation(await bibliographyApi.export(id));
                await downloadBibliographyFile(id, `operaciones/${result.operation_id}/archivo`, 'bibliografia.docx');
              }
            })}
          >
            {editable ? 'Descargar Word actualizado' : 'Exportar bibliografía Word'}
          </Button>
        </div>
      </footer>
    </div>
  );
}

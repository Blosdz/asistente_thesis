import { forwardRef, useEffect, useState } from 'react';
import { Button } from '../../ui/button';

export const referenceTypes = { article: 'Artículo', book: 'Libro', chapter: 'Capítulo de libro', thesis: 'Tesis', web: 'Sitio web', report: 'Informe', conference: 'Ponencia de congreso' };

const fields = { title: 'Título', year: 'Año (opcional)', journal: 'Revista', publisher: 'Editorial', institution: 'Institución', repository: 'Repositorio', degree: 'Grado', container_title: 'Libro contenedor', conference: 'Congreso', proceedings: 'Actas', volume: 'Volumen', issue: 'Número', pages: 'Páginas', edition: 'Edición', doi: 'DOI', url: 'URL', accessed_at: 'Fecha de consulta' };

const PUBLICATION_FIELDS = {
  article: ['journal'],
  thesis: ['degree', 'institution', 'repository'],
  chapter: ['container_title', 'publisher'],
  conference: ['conference', 'proceedings', 'publisher'],
};
const DEFAULT_PUBLICATION_FIELDS = ['publisher', 'institution'];

export const newReference = () => ({ type: 'article', title: '', year: '', authors: [{ first_name: '', last_name: '', corporate: false }] });

const inputClass = 'mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100';
const legendClass = 'mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400';
const gridClass = 'grid grid-cols-1 gap-3 sm:grid-cols-2';

const ReferenceForm = forwardRef(function ReferenceForm(
  { reference, onSave, onPreview, onResolveDoi, saving, onDirtyChange, formId = 'reference-form' },
  ref,
) {
  const [form, setForm] = useState(reference || newReference());
  const [preview, setPreview] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [doiStatus, setDoiStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(reference || newReference());
    setProposal(null);
    setError('');
    onDirtyChange?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  const update = (patch) => { setForm((f) => ({ ...f, ...patch })); onDirtyChange?.(true); };

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      if (!form.title?.trim() || !form.authors?.some((a) => a.last_name?.trim())) return;
      try {
        const result = await onPreview?.({ ...form, year: form.year === '' ? null : Number(form.year) });
        if (active) setPreview(result);
      } catch {
        if (active) setPreview(null);
      }
    }, 400);
    return () => { active = false; clearTimeout(timer); };
  }, [form, onPreview]);

  const authorChange = (index, patch) => update({ authors: form.authors.map((a, i) => (i === index ? { ...a, ...patch } : a)) });
  const reorderAuthor = (index, direction) => {
    const authors = [...form.authors];
    [authors[index], authors[index + direction]] = [authors[index + direction], authors[index]];
    update({ authors });
  };

  const field = (key, { half = false } = {}) => (
    <label key={key} className={`block text-xs font-medium text-slate-600 ${half ? '' : 'sm:col-span-2'}`}>
      {fields[key]}
      <input
        className={inputClass}
        value={form[key] ?? ''}
        type={key === 'year' ? 'number' : key === 'accessed_at' ? 'date' : 'text'}
        min={key === 'year' ? 0 : undefined}
        max={key === 'year' ? 3000 : undefined}
        required={key === 'title'}
        onChange={(e) => update({ [key]: e.target.value })}
      />
    </label>
  );

  const publicationFields = PUBLICATION_FIELDS[form.type] || DEFAULT_PUBLICATION_FIELDS;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await onSave({
        ...form,
        authors: form.authors.map((a) => ({ ...a, first_name: a.corporate ? null : a.first_name?.trim() || null, last_name: a.last_name.trim() })),
        year: form.year === '' || form.year == null ? null : Number(form.year),
        accessed_at: form.accessed_at || null,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form ref={ref} id={formId} className="space-y-6" onSubmit={handleSubmit}>
      <fieldset className="space-y-3" disabled={saving}>
        <legend className={legendClass}>Identificación</legend>
        <div className={gridClass}>
          <label className="block text-xs font-medium text-slate-600">
            Tipo
            <select className={inputClass} value={form.type} onChange={(e) => update({ type: e.target.value })}>
              {Object.entries(referenceTypes).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </label>
          {field('year', { half: true })}
          {field('title')}
        </div>
      </fieldset>

      <fieldset className="space-y-3" disabled={saving}>
        <legend className={legendClass}>Autores · en orden de publicación</legend>
        {form.authors.map((author, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-3">
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input type="checkbox" checked={!!author.corporate} onChange={(e) => authorChange(i, { corporate: e.target.checked })} />
              Autor institucional
            </label>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {!author.corporate && (
                <label className="block text-xs text-slate-600">
                  Nombres
                  <input className={inputClass} value={author.first_name || ''} onChange={(e) => authorChange(i, { first_name: e.target.value })} />
                </label>
              )}
              <label className={`block text-xs text-slate-600 ${author.corporate ? 'sm:col-span-2' : ''}`}>
                {author.corporate ? 'Institución autora' : 'Apellidos completos'}
                <input required className={inputClass} value={author.last_name || ''} onChange={(e) => authorChange(i, { last_name: e.target.value })} />
              </label>
            </div>
            <div className="mt-2 flex gap-3 text-xs text-slate-500">
              <button type="button" disabled={!i} className="disabled:opacity-40" onClick={() => reorderAuthor(i, -1)}>Subir</button>
              <button type="button" disabled={i === form.authors.length - 1} className="disabled:opacity-40" onClick={() => reorderAuthor(i, 1)}>Bajar</button>
              <button type="button" className="text-red-600 disabled:opacity-40" disabled={form.authors.length === 1} onClick={() => update({ authors: form.authors.filter((_, n) => n !== i) })}>Quitar</button>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => update({ authors: [...form.authors, { first_name: '', last_name: '', corporate: false }] })}>Añadir autor</Button>
      </fieldset>

      <fieldset className="space-y-3" disabled={saving}>
        <legend className={legendClass}>Publicación</legend>
        <div className={gridClass}>
          {publicationFields.map((key) => field(key, { half: true }))}
          {form.type === 'chapter' && (
            <label className="block text-xs text-slate-600 sm:col-span-2">
              Editores (uno por línea)
              <textarea className={inputClass} value={(form.editors || []).join('\n')} onChange={(e) => update({ editors: e.target.value.split('\n') })} />
            </label>
          )}
          {['volume', 'issue', 'pages', 'edition'].map((key) => field(key, { half: true }))}
        </div>
      </fieldset>

      <fieldset className="space-y-3" disabled={saving}>
        <legend className={legendClass}>Identificadores y consulta</legend>
        <div className={gridClass}>
          {field('doi', { half: true })}
          <div className="flex flex-col">
            <span className="mb-1 block text-xs font-medium text-transparent select-none">DOI</span>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={!form.doi?.trim() || doiStatus === 'Consultando…'}
              onClick={async () => {
                setDoiStatus('Consultando…');
                setProposal(null);
                try {
                  const result = await onResolveDoi(form.doi);
                  setDoiStatus(result.message);
                  setProposal(result.proposal);
                } catch (err) {
                  setDoiStatus(err.message);
                }
              }}
            >
              Consultar DOI
            </Button>
          </div>
          {field('url', { half: true })}
          {field('accessed_at', { half: true })}
        </div>
        {doiStatus && <p role="status" className="text-xs text-slate-600">{doiStatus}</p>}
        {proposal && (
          <div className="rounded-lg bg-blue-50 p-3 text-xs">
            <p className="font-semibold">Revisar datos de Crossref</p>
            <pre className="my-2 whitespace-pre-wrap break-words">{JSON.stringify(proposal, null, 2)}</pre>
            <Button type="button" onClick={() => { update(proposal); setProposal(null); }}>Aplicar propuesta</Button>
          </div>
        )}
      </fieldset>

      <section className="rounded-xl bg-slate-50 p-4 text-sm">
        <h4 className="mb-2 font-semibold text-slate-900">Vista previa</h4>
        <p className="text-slate-700">{preview?.bibliography || 'Completa el título y el autor para previsualizar.'}</p>
        {preview?.parenthetical && <p className="mt-3 text-slate-500">{preview.parenthetical} · {preview.narrative}</p>}
      </section>

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </form>
  );
});

export default ReferenceForm;

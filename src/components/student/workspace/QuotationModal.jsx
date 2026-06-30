import { Loader2 } from 'lucide-react';

import { Button } from '../../ui/button';
import { Select, SelectItem } from '../../ui/select';
import Modal from '../../ui/modal';

const formatCurrency = (value, currency = 'PEN') =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: currency || 'PEN',
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

export default function QuotationModal({
  open,
  onClose,

  form,
  onFormChange,

  nivelesAcademicos = [],
  planesDisponibles = [],
  tiposTesis = [],
  availableFormats = [],
  perfilEstudiante,

  loadingCatalogs,
  onReloadCatalogs,

  quoteData,
  quoteError,
  quoting,

  creating,
  canSubmit,
  onSubmit,
}) {
  const selectedPlanMeta = planesDisponibles.find(
    (plan) => plan.id === form.plan_id,
  );

  const selectedTipoMeta = tiposTesis.find(
    (tipo) => tipo.id === form.tipo_tesis_id,
  );

  const updateForm = (field, value) => {
    onFormChange((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Crear tesis con cotización"
      subtitle="Completa tus datos, revisa el precio y luego genera el pago pendiente."
      modalWidth="xl"
      primaryAction={{
        label: creating ? 'Creando...' : 'Crear tesis y generar pago',
        onClick: onSubmit,
        disabled: !canSubmit,
      }}
      secondaryAction={{
        label: 'Cancelar',
        onClick: onClose,
        disabled: creating,
      }}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <section className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Título de la tesis *
              </label>
              <input
                type="text"
                required
                value={form.titulo}
                onChange={(e) => updateForm('titulo', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                placeholder="Ej: Impacto de la inteligencia artificial en procesos académicos"
                autoFocus
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Descripción
              </label>
              <textarea
                value={form.descripcion}
                onChange={(e) => updateForm('descripcion', e.target.value)}
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                placeholder="Breve contexto del problema de investigación"
                rows="4"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Plan *
              </label>
              <Select
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm"
                value={form.plan_id}
                onChange={(e) => updateForm('plan_id', e.target.value)}
              >
                <SelectItem value="">
                  {loadingCatalogs
                    ? 'Cargando planes...'
                    : 'Selecciona un plan'}
                </SelectItem>

                {planesDisponibles.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.nombre}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Tipo de tesis *
              </label>
              <Select
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm"
                value={form.tipo_tesis_id}
                onChange={(e) => updateForm('tipo_tesis_id', e.target.value)}
              >
                <SelectItem value="">
                  {loadingCatalogs
                    ? 'Cargando tipos...'
                    : 'Selecciona un tipo de tesis'}
                </SelectItem>

                {tiposTesis.map((tipo) => (
                  <SelectItem key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Nivel académico *
              </label>
              <Select
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm"
                value={form.nivel_academico}
                onChange={(e) => updateForm('nivel_academico', e.target.value)}
              >
                {nivelesAcademicos.map((nivel) => (
                  <SelectItem key={nivel.value} value={nivel.value}>
                    {nivel.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Análisis estadístico
              </label>
              <Select
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm"
                value={form.requiere_analisis_estadistico ? 'si' : 'no'}
                onChange={(e) =>
                  updateForm(
                    'requiere_analisis_estadistico',
                    e.target.value === 'si',
                  )
                }
              >
                <SelectItem value="si">Sí, lo requiere</SelectItem>
                <SelectItem value="no">No, no lo requiere</SelectItem>
              </Select>
            </div>

            {availableFormats.length > 0 && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Formato de citas
                </label>
                <Select
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm"
                  value={form.doc_thesis_format_uname || ''}
                  onChange={(e) =>
                    updateForm('doc_thesis_format_uname', e.target.value)
                  }
                >
                  <SelectItem value="">Automático (según tipo de tesis)</SelectItem>
                  {availableFormats.map((fmt) => (
                    <SelectItem key={fmt.id ?? fmt.uname} value={fmt.uname}>
                      {fmt.name}
                    </SelectItem>
                  ))}
                </Select>
                <p className="mt-1.5 text-[11px] text-slate-400">
                  Define el estilo de bibliografía del documento. Si no seleccionas uno, se asignará automáticamente.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">
              Datos usados al crear
            </p>

            <p className="mt-2">
              Estudiante autenticado:{' '}
              <span className="font-medium text-slate-700">
                Se tomará desde tu sesión activa
              </span>
            </p>

            <p className="mt-2">
              Universidad del perfil:{' '}
              <span className="font-medium text-slate-700">
                {perfilEstudiante?.universidad_id
                  ? 'Se enviará la universidad registrada'
                  : 'No registrada, se enviará como null'}
              </span>
            </p>

            <p className="mt-1">
              Programa académico: no aplica en esta versión.
            </p>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
              Cotización
            </p>

            <h3 className="mt-2 text-xl font-black tracking-tight text-slate-900">
              Resumen del plan
            </h3>

            {loadingCatalogs ? (
              <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando catálogos...
              </div>
            ) : !planesDisponibles.length || !tiposTesis.length ? (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <p className="font-semibold">
                  No se pudieron cargar todos los catálogos.
                </p>

                <p className="mt-1">
                  Reintenta la carga para mostrar planes y tipos de tesis.
                </p>

                <Button
                  onClick={onReloadCatalogs}
                  className="mt-4 h-10 rounded-xl px-4"
                >
                  Reintentar
                </Button>
              </div>
            ) : quoting ? (
              <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Calculando cotización...
              </div>
            ) : quoteError ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {quoteError}
              </div>
            ) : quoteData ? (
              <div className="mt-6 space-y-3 text-sm">
                <div className="rounded-2xl border border-white bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Configuración
                  </p>

                  <p className="mt-2 font-semibold text-slate-900">
                    {quoteData.plan_nombre ||
                      selectedPlanMeta?.nombre ||
                      'Plan'}
                  </p>

                  <p className="text-slate-500">
                    {quoteData.tipo_tesis_nombre ||
                      selectedTipoMeta?.nombre ||
                      'Tipo de tesis'}
                  </p>

                  <p className="text-slate-500">
                    Nivel:{' '}
                    {quoteData.nivel_academico || form.nivel_academico}
                  </p>
                </div>

                <div className="space-y-3 rounded-2xl border border-white bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Precio base</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(quoteData.precio_base, quoteData.moneda)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">
                      Recargo por nivel ({quoteData.porcentaje_nivel}%)
                    </span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(
                        quoteData.monto_ajuste_nivel,
                        quoteData.moneda,
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">
                      Descuento por no análisis
                    </span>
                    <span className="font-semibold text-emerald-700">
                      -{' '}
                      {formatCurrency(
                        quoteData.descuento_analisis_estadistico,
                        quoteData.moneda,
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
                    <span className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
                      Total
                    </span>
                    <span className="text-2xl font-black tracking-tight text-slate-900">
                      {formatCurrency(quoteData.precio_total, quoteData.moneda)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white/80 p-4 text-sm text-slate-500">
                Selecciona plan, tipo de tesis y nivel académico para calcular
                el precio final.
              </div>
            )}
          </div>
        </aside>
      </div>
    </Modal>
  );
}

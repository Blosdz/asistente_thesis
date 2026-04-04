import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { CheckCircle2, Clock3, Loader2, Search, XCircle } from 'lucide-react';
import { Card } from '../../components/ui/card';
import {
  obtenerHistorialValidacionesCitaAsesor,
  responderReservaCita,
} from '../../services/advisorService';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'payment_pending', label: 'Pago pendiente' },
  { value: 'confirmed', label: 'Confirmadas' },
  { value: 'rejected', label: 'Rechazadas' },
];

const statusStyles = {
  pending: 'bg-amber-100 text-amber-700',
  payment_pending: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
  paid: 'bg-violet-100 text-violet-700',
  cancelled: 'bg-slate-200 text-slate-700',
};

const formatDateTime = (value) => {
  if (!value) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

const formatStatusLabel = (value) => {
  if (!value) return 'sin estado';
  return value.replaceAll('_', ' ');
};

export default function AdvisorReservations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [actingId, setActingId] = useState(null);

  const loadItems = async (status = statusFilter) => {
    try {
      setLoading(true);
      const data = await obtenerHistorialValidacionesCitaAsesor(
        status === 'all' ? null : status,
      );
      setItems(data || []);
    } catch (error) {
      console.error(error);
      toast.error(
        error.message || 'No se pudo cargar el historial de validaciones',
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems(statusFilter);
  }, [statusFilter]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) =>
      [
        item.estudiante_nombre,
        item.tesis_titulo,
        item.motivo,
        item.status,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [items, search]);

  const counters = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.total += 1;
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      },
      { total: 0, pending: 0, payment_pending: 0, confirmed: 0, rejected: 0 },
    );
  }, [items]);

  const handleAction = async (validationCitaId, accion) => {
    try {
      setActingId(validationCitaId);
      const result = await responderReservaCita(validationCitaId, accion);
      toast.success(
        result?.mensaje ||
          (accion === 'aceptar'
            ? 'Solicitud aceptada correctamente'
            : 'Solicitud rechazada correctamente'),
      );
      await loadItems(statusFilter);
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'No se pudo procesar la solicitud');
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col py-10 px-6 text-slate-900 gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
          Validación de citas
        </h1>
        <p className="text-slate-600">
          Revisa solicitudes pendientes, acepta o rechaza, y mantén un historial
          completo de tus reservas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total
          </p>
          <p className="mt-2 text-3xl font-black text-slate-900">
            {counters.total}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Pendientes
          </p>
          <p className="mt-2 text-3xl font-black text-amber-600">
            {counters.pending}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Pago pendiente
          </p>
          <p className="mt-2 text-3xl font-black text-blue-600">
            {counters.payment_pending}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Confirmadas
          </p>
          <p className="mt-2 text-3xl font-black text-emerald-600">
            {counters.confirmed}
          </p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200/70 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por estudiante, tesis o motivo"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatusFilter(option.value)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  statusFilter === option.value
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Estudiante</th>
                <th className="px-6 py-4">Reserva</th>
                <th className="px-6 py-4">Motivo</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">IDs</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 text-sm">
              {loading && (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Cargando validaciones...
                    </span>
                  </td>
                </tr>
              )}

              {!loading && filteredItems.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-slate-500">
                    No hay solicitudes para este filtro.
                  </td>
                </tr>
              )}

              {!loading &&
                filteredItems.map((item) => (
                  <tr key={item.validation_cita_id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-5 align-top">
                      <p className="font-semibold text-slate-900">
                        {item.estudiante_nombre || 'Estudiante'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.tesis_titulo || 'Sin tesis asociada'}
                      </p>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="space-y-1">
                        <p className="font-medium text-slate-800">
                          {formatDateTime(item.start_at)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDateTime(item.end_at)}
                        </p>
                        <p className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <Clock3 className="w-3.5 h-3.5" />
                          {item.duration_minutes} min
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <p className="font-medium text-slate-800">
                        {item.motivo || 'Sin motivo'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.modalidad || 'Sin modalidad'}
                      </p>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                          statusStyles[item.status] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {formatStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-5 align-top text-xs text-slate-500">
                      <p>Solicitud: {item.validation_cita_id}</p>
                      <p>Pago: {item.payment_id || '—'}</p>
                      <p>Reunión: {item.meeting_id || '—'}</p>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="flex justify-end gap-2">
                        {item.status === 'pending' ? (
                          <>
                            <button
                              type="button"
                              disabled={actingId === item.validation_cita_id}
                              onClick={() =>
                                handleAction(item.validation_cita_id, 'rechazar')
                              }
                              className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                            >
                              <XCircle className="w-4 h-4" />
                              Rechazar
                            </button>
                            <button
                              type="button"
                              disabled={actingId === item.validation_cita_id}
                              onClick={() =>
                                handleAction(item.validation_cita_id, 'aceptar')
                              }
                              className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Aceptar
                            </button>
                          </>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400">
                            Sin acciones
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

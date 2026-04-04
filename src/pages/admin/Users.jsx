import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, RefreshCw, Search, ShieldCheck, UserRound, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectItem } from '../../components/ui/select';
import { adminListarUsuarios } from '../../services/adminService';

const ROLE_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'admin', label: 'Admins' },
  { value: 'asesor', label: 'Asesores' },
  { value: 'estudiante', label: 'Estudiantes' },
];

const roleBadgeClass = (role) => {
  switch (role) {
    case 'admin':
      return 'bg-slate-900 text-white';
    case 'asesor':
      return 'bg-blue-50 text-blue-700';
    case 'estudiante':
      return 'bg-emerald-50 text-emerald-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getDisplayName = (item) => {
  const studentName =
    `${item.estudiante_nombres || ''} ${item.estudiante_apellidos || ''}`.trim();

  return (
    item.asesor_nombre_mostrar ||
    studentName ||
    (item.auth_usuario_id ? `Auth ${String(item.auth_usuario_id).slice(0, 8)}` : 'Usuario')
  );
};

const getSecondaryLine = (item) => {
  if (item.rol === 'estudiante') {
    return item.estudiante_carrera || 'Sin carrera registrada';
  }

  if (item.rol === 'asesor') {
    return item.asesor_email_publico || 'Sin email público';
  }

  return 'Acceso administrativo';
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminListarUsuarios();
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading admin users:', error);
      toast.error(error.message || 'No se pudieron cargar los usuarios');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((item) => {
      const matchesRole = roleFilter === 'all' || item.rol === roleFilter;
      if (!matchesRole) return false;

      if (!query) return true;

      return [
        getDisplayName(item),
        getSecondaryLine(item),
        item.rol,
        item.auth_usuario_id,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [users, roleFilter, search]);

  const counters = useMemo(() => {
    return users.reduce(
      (acc, item) => {
        acc.total += 1;
        acc[item.rol] = (acc[item.rol] || 0) + 1;
        if (item.verificado) acc.verificados += 1;
        return acc;
      },
      {
        total: 0,
        admin: 0,
        asesor: 0,
        estudiante: 0,
        verificados: 0,
      },
    );
  }, [users]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 py-10 text-slate-900">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
          Admin / Usuarios
        </p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Usuarios del sistema
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
              Revisa roles, estado de verificación y perfiles visibles de cada
              cuenta registrada.
            </p>
          </div>

          <button
            type="button"
            onClick={loadUsers}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="rounded-[26px] border border-white/80 bg-white/80 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Total
          </p>
          <p className="mt-3 text-3xl font-black text-slate-900">
            {counters.total}
          </p>
        </Card>
        <Card className="rounded-[26px] border border-white/80 bg-white/80 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Estudiantes
          </p>
          <p className="mt-3 text-3xl font-black text-emerald-600">
            {counters.estudiante}
          </p>
        </Card>
        <Card className="rounded-[26px] border border-white/80 bg-white/80 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Asesores
          </p>
          <p className="mt-3 text-3xl font-black text-blue-600">
            {counters.asesor}
          </p>
        </Card>
        <Card className="rounded-[26px] border border-white/80 bg-white/80 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Verificados
          </p>
          <p className="mt-3 text-3xl font-black text-slate-900">
            {counters.verificados}
          </p>
        </Card>
      </section>

      <Card className="overflow-hidden rounded-[32px] border border-white/80 bg-white/80 p-0 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 border-b border-slate-200/70 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, rol, carrera o auth ID"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm"
            />
          </div>

          <div className="w-full max-w-[240px]">
            <Select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900"
            >
              {ROLE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Auth ID</th>
                <th className="px-6 py-4">Creado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 text-sm">
              {loading && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cargando usuarios...
                    </span>
                  </td>
                </tr>
              )}

              {!loading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-slate-500">
                    No hay usuarios para este filtro.
                  </td>
                </tr>
              )}

              {!loading &&
                filteredUsers.map((item) => (
                  <tr key={item.usuario_id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-5 align-top">
                      <div className="flex items-start gap-3">
                        <div className="inline-flex rounded-2xl bg-slate-100 p-3 text-slate-700">
                          {item.rol === 'admin' ? (
                            <ShieldCheck className="h-4 w-4" />
                          ) : item.rol === 'asesor' ? (
                            <Users className="h-4 w-4" />
                          ) : (
                            <UserRound className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {getDisplayName(item)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {getSecondaryLine(item)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${roleBadgeClass(item.rol)}`}
                      >
                        {item.rol || 'sin rol'}
                      </span>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                          item.verificado
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {item.verificado ? 'Verificado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-5 align-top font-mono text-xs text-slate-500">
                      {item.auth_usuario_id || '—'}
                    </td>
                    <td className="px-6 py-5 align-top text-slate-600">
                      <p>{formatDate(item.creado_en)}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        Act. {formatDate(item.actualizado_en)}
                      </p>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminUsers;

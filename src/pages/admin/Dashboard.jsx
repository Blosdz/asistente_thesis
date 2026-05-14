import { Link } from 'react-router-dom';
import { CreditCard, ShieldCheck, Users } from 'lucide-react';
import { Card } from '../../components/ui/card';

const quickLinks = [
  {
    title: 'Usuarios',
    description:
      'Revisa cuentas, roles y perfiles visibles de estudiantes y asesores.',
    to: '/admin/users',
    icon: <Users className="h-6 w-6" strokeWidth={2.55} />,
    tone: 'border-blue-300 bg-blue-100 text-blue-800 shadow-blue-500/15',
  },
  {
    title: 'Pagos',
    description:
      'Consulta vouchers, abre el detalle del pago y registra verificaciones.',
    to: '/admin/payments',
    icon: <CreditCard className="h-6 w-6" strokeWidth={2.55} />,
    tone: 'border-emerald-300 bg-emerald-100 text-emerald-800 shadow-emerald-500/15',
  },
];

const AdminDashboard = () => {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 py-10 text-slate-900">
      <section className="rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
              Administración
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
              Centro de control
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              Gestiona usuarios, revisa pagos y mantén trazabilidad de las
              acciones administrativas desde un único espacio.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            <ShieldCheck className="h-5 w-5" strokeWidth={2.55} />
            Acceso administrativo
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {quickLinks.map((item) => (
          <Link key={item.to} to={item.to} className="group">
            <Card className="h-full rounded-[28px] border border-white/80 p-7 shadow-[0_18px_40px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,23,42,0.08)]">
              <div className="flex items-start justify-between gap-4">
                <div className={`inline-flex rounded-2xl border p-3 shadow-lg ${item.tone}`}>
                  {item.icon}
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 transition group-hover:text-slate-600">
                  Ir ahora
                </span>
              </div>

              <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                {item.description}
              </p>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
};

export default AdminDashboard;

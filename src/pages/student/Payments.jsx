import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  ExternalLink,
  FileText,
  GraduationCap,
  Plus,
  Wallet,
  Wifi,
  Sparkles,
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import Modal from '../../components/ui/modal';
import { supabase } from '../../lib/supabase';
import { iniciarPagoPlan, obtenerPlanesDisponibles } from '../../services/pagosService';

const paymentMethods = [
  {
    brand: 'VISA',
    number: '•••• •••• •••• 4291',
    holder: 'ARTHUR MORGAN',
    expiry: '12/26',
    gradient: true,
  },
  {
    brand: 'MASTERCARD',
    number: '•••• •••• •••• 8832',
    holder: 'ARTHUR MORGAN',
    expiry: '08/25',
    gradient: false,
  },
];

const activeInvoices = [
  {
    title: 'Fall Semester Tuition',
    code: 'Invoice #TF-2023-0042',
    amount: '$2,450.00',
    due: 'Due in 5 days',
    icon: FileText,
    breakdown: {
      services: [
        { label: 'Base Tuition Fee', value: '$2,200.00' },
        { label: 'Lab Facility Access', value: '$150.00' },
        { label: 'Library & Digital Resources', value: '$100.00' },
      ],
      taxes: [
        { label: 'Service Tax (5%)', value: '$122.50' },
        { label: 'Early Bird Discount', value: '-$122.50', highlight: true },
        { label: 'Total Due', value: '$2,450.00', total: true },
      ],
    },
  },
  {
    title: 'Thesis Review Fee',
    code: 'Invoice #TF-2023-0048',
    amount: '$350.00',
    due: 'Due Oct 30, 2023',
    icon: GraduationCap,
    description:
      'External examiner coordination and formal thesis committee review session for the preliminary draft. Includes detailed feedback report and virtual panel room booking.',
  },
];

const historyRows = [
  {
    id: '#TR-55201',
    desc: 'Library Access Pass (Annual)',
    date: 'Sep 12, 2023',
    amount: '$120.00',
    status: 'Completed',
  },
  {
    id: '#TR-55188',
    desc: 'Statistical Consultation',
    date: 'Aug 28, 2023',
    amount: '$45.00',
    status: 'Completed',
  },
  {
    id: '#TR-54902',
    desc: 'Publication Workshop Fee',
    date: 'Jul 05, 2023',
    amount: '$15.00',
    status: 'Completed',
  },
];

const Payments = () => {
  const [planes, setPlanes] = useState([]);
  const [loadingPlanes, setLoadingPlanes] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paying, setPaying] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [pagoInfo, setPagoInfo] = useState(null);

  useEffect(() => {
    const loadPlanes = async () => {
      try {
        const data = await obtenerPlanesDisponibles();
        setPlanes(data || []);
      } catch (error) {
        console.error(error);
        toast.error('No se pudieron cargar los planes');
      } finally {
        setLoadingPlanes(false);
      }
    };
    loadPlanes();
  }, []);

  const abrirPagoPlan = (plan) => {
    setSelectedPlan(plan);
    setPayModalOpen(true);
  };

  const confirmarPagoPlan = async () => {
    if (!selectedPlan) return;
    try {
      setPaying(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.id) throw new Error('Usuario no autenticado');

      const result = await iniciarPagoPlan({ pagadorId: user.id, planId: selectedPlan.id });
      setPagoInfo(result);
      toast.success('Nota de pago creada');
      setPayModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'No se pudo iniciar el pago');
    } finally {
      setPaying(false);
    }
  };

  return (
    <>
      <div className="relative min-h-screen mt-10 text-slate-900 overflow-hidden">
        <main className="relative z-10 px-6 sm:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <section className="lg:col-span-4 space-y-6">
              <Card className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold tracking-tight">Payment Methods</h2>
                  <Wallet className="text-primary" size={22} />
                </div>

                <div className="space-y-4 mb-8">
                  {paymentMethods.map((card) => (
                    <div
                      key={card.number}
                      className={`relative overflow-hidden p-6 rounded-xl shadow-lg transition-transform hover:scale-[1.02] ${
                        card.gradient ? 'bg-gradient-to-br from-primary to-blue-500 text-white' : 'bg-slate-900 text-white'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-8">
                        <Wifi size={26} />
                        <span className="font-bold text-lg italic">{card.brand}</span>
                      </div>
                    <div className="mb-6">
                      <p className="text-xs opacity-70 mb-1">Card Number</p>
                      <p className="text-lg tracking-[0.18em]">{card.number}</p>
                    </div>
                    <div className="flex justify-between items-end text-sm">
                      <div>
                        <p className="text-xs opacity-70 mb-1">Holder</p>
                        <p className="font-semibold">{card.holder}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs opacity-70 mb-1">Expiry</p>
                        <p className="font-semibold">{card.expiry}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border border-dashed border-slate-300 hover:bg-white/50 transition-colors text-slate-600 font-medium">
                <Plus size={18} />
                Add Method
              </button>
            </Card>

            <Card className="p-8">
              <p className="text-sm font-medium text-blue-700 mb-1">Outstanding Balance</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight">$1,240</span>
                <span className="text-sm text-slate-500 font-medium">USD</span>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex justify-between text-xs font-medium text-slate-600">
                  <span>Next Due Date</span>
                  <span className="text-red-600 font-bold">Oct 15, 2023</span>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Planes IA</p>
                  <h3 className="text-lg font-bold text-slate-900">Suscripciones</h3>
                </div>
                <Sparkles className="text-primary" size={20} />
              </div>

              {loadingPlanes ? (
                <p className="text-sm text-slate-500">Cargando planes...</p>
              ) : planes.length === 0 ? (
                <p className="text-sm text-slate-500">No hay planes disponibles.</p>
              ) : (
                <div className="space-y-4">
                  {planes.map((plan) => (
                    <div
                      key={plan.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white/70 shadow-sm flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{plan.nombre}</p>
                          <p className="text-xs text-slate-500">{plan.duracion_dias} días</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-extrabold text-slate-900">S/ {plan.precio}</span>
                        </div>
                      </div>
                      {plan.caracteristicas && (
                        <p className="text-xs text-slate-600">
                          {Object.entries(plan.caracteristicas || {})
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' · ')}
                        </p>
                      )}
                      <button
                        className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:brightness-105 active:scale-95 transition"
                        onClick={() => abrirPagoPlan(plan)}
                      >
                        Pagar plan
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </section>

          <section className="lg:col-span-8 space-y-8">
            <Card className="p-0">
              <div className="px-7 py-6 flex justify-between items-center">
                <h2 className="text-xl font-bold tracking-tight">Active Invoices</h2>
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">2 PENDING</span>
              </div>
              <div className="divide-y divide-slate-200/50">
                {activeInvoices.map((invoice) => (
                  <details key={invoice.code} className="group">
                    <summary className="flex items-center justify-between p-7 cursor-pointer hover:bg-white/70 transition-colors list-none">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                          <invoice.icon className="text-primary" size={22} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{invoice.title}</p>
                          <p className="text-sm text-slate-500">{invoice.code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="font-bold text-slate-900">{invoice.amount}</p>
                          <p className={`text-xs font-bold ${invoice.due.includes('Due in') ? 'text-red-600' : 'text-slate-500'}`}>{invoice.due}</p>
                        </div>
                        <span className="text-slate-400 transition-transform group-open:rotate-180">▾</span>
                      </div>
                    </summary>
                    <div className="px-7 pb-7 pt-2">
                      {invoice.breakdown ? (
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200/70">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Service Breakdown</p>
                              <ul className="space-y-2 text-sm">
                                {invoice.breakdown.services.map((line) => (
                                  <li key={line.label} className="flex justify-between">
                                    <span>{line.label}</span>
                                    <span>{line.value}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="space-y-3">
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tax & Discounts</p>
                              <ul className="space-y-2 text-sm">
                                {invoice.breakdown.taxes.map((line) => (
                                  <li
                                    key={line.label}
                                    className={`flex justify-between ${line.total ? 'pt-2 border-t border-slate-200 font-bold' : ''} ${
                                      line.highlight ? 'text-primary font-medium' : ''
                                    }`}
                                  >
                                    <span>{line.label}</span>
                                    <span>{line.value}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <div className="mt-6 flex gap-3 flex-wrap">
                            <button className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-full hover:scale-95 transition-transform duration-200">
                              Pay Now
                            </button>
                            <button className="px-6 py-2.5 border border-slate-300 text-sm font-bold rounded-full hover:bg-white transition-colors">
                              Download PDF
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200/70 text-sm text-slate-600">
                          <p className="leading-relaxed">{invoice.description}</p>
                          <div className="mt-4 flex gap-3 flex-wrap">
                            <button className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-full hover:scale-95 transition-transform duration-200">
                              Pay Now
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </Card>

            <Card className="p-0">
              <div className="px-7 py-6 border-b border-slate-200/60 flex justify-between items-center">
                <h2 className="text-xl font-bold tracking-tight">Payment History</h2>
                <button className="text-sm font-bold text-primary flex items-center gap-1">
                  View Full Report
                  <ExternalLink size={14} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-7 py-4">Transaction ID</th>
                      <th className="px-7 py-4">Description</th>
                      <th className="px-7 py-4">Date</th>
                      <th className="px-7 py-4 text-right">Amount</th>
                      <th className="px-7 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-200/70">
                    {historyRows.map((row) => (
                      <tr key={row.id} className="hover:bg-white/70 transition-colors">
                        <td className="px-7 py-5 font-medium">{row.id}</td>
                        <td className="px-7 py-5">{row.desc}</td>
                        <td className="px-7 py-5 text-slate-500">{row.date}</td>
                        <td className="px-7 py-5 text-right font-bold">{row.amount}</td>
                        <td className="px-7 py-5 text-right">
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>
        </div>
      </main>
      </div>
      <Modal
        open={payModalOpen && !!selectedPlan}
        onClose={() => !paying && setPayModalOpen(false)}
        title="Confirmar pago de plan"
        subtitle={selectedPlan ? selectedPlan.nombre : ''}
        description={selectedPlan ? `Se generará una nota de pago por S/ ${selectedPlan.precio}` : ''}
        primaryAction={{ label: paying ? 'Creando...' : 'Crear nota de pago', onClick: confirmarPagoPlan }}
        secondaryAction={{ label: 'Cancelar', onClick: () => setPayModalOpen(false) }}
      />
      <Modal
        open={!!pagoInfo}
        onClose={() => setPagoInfo(null)}
        title="Nota de pago creada"
        subtitle="Revisa tu bandeja de pagos"
        description={pagoInfo ? `Pago ID: ${pagoInfo.pago_id}\nEstado: ${pagoInfo.estado}` : ''}
        primaryAction={{ label: 'Listo', onClick: () => setPagoInfo(null) }}
      />
    </>
  );
};

export default Payments;

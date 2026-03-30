import { BarChart3, Clock, AlertCircle, CheckCircle2, FileText, UserCheck } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';

const Dashboard = () => {
  const stats = [
    { label: 'Progreso de Tesis', value: '45%', icon: <BarChart3 className="text-ios-blue" />, color: 'bg-ios-blue/10' },
    { label: 'Observaciones Pendientes', value: '3', icon: <AlertCircle className="text-amber-500" />, color: 'bg-amber-500/10' },
    { label: 'Versiones de Documento', value: '4', icon: <FileText className="text-purple-500" />, color: 'bg-purple-500/10' },
    { label: 'Solicitudes Activas', value: '1', icon: <Clock className="text-ios-gray" />, color: 'bg-ios-gray/10' },
  ];

  const activities = [
    { title: 'Nueva observación recibida', time: 'Hace 2 horas', type: 'observation' },
    { title: 'Documento v4 subido con éxito', time: 'Ayer, 10:30 AM', type: 'upload' },
    { title: 'Solicitud de asesor aceptada', time: '15 Mar, 2024', type: 'service' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-gray-900">Estadística y Resumen</h2>
        <p className="text-gray-500">Un resumen de tu actividad y progreso actual.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="flex flex-col gap-4 hover:scale-[1.02] transition-transform">
            <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline / Recent Activity */}
        <Card className="lg:col-span-2 space-y-6">
          <CardHeader className="mb-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock size={20} className="text-ios-blue" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.map((activity, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/50 transition-colors">
                <div className="mt-1">
                  {activity.type === 'observation' ? <AlertCircle size={16} className="text-amber-500" /> : <CheckCircle2 size={16} className="text-green-500" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Assigned Advisor */}
        <Card className="flex flex-col items-center text-center gap-6 justify-center">
          <div className="w-20 h-20 rounded-full bg-ios-blue/10 flex items-center justify-center text-ios-blue">
            <UserCheck size={40} />
          </div>
          <div>
            <h3 className="text-lg font-bold">Asesor Asignado</h3>
            <p className="text-sm text-gray-500 mt-1">Dr. Alejandro Vargas</p>
            <p className="text-xs text-ios-blue font-medium mt-2">Facultad de Ingeniería</p>
          </div>
          <Button
            variant="secondary"
            className="w-full py-3 text-sm font-bold"
          >
            Enviar Mensaje
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

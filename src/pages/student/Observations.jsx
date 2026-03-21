import { MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';

const Observations = () => {
  const observations = [
    { id: 1, content: 'El planteamiento del problema necesita mayor sustento teórico.', status: 'pending', date: 'Hace 2 días' },
    { id: 2, content: 'Las referencias deben seguir el formato APA 7ma edición.', status: 'resolved', date: 'Hace 1 semana' },
    { id: 3, content: 'Corregir el diseño de la muestra en el capítulo III.', status: 'pending', date: 'Ayer' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-gray-900">Observaciones del Asesor</h2>
        <p className="text-gray-500">Revisa y responde a las correcciones indicadas por tu asesor académo.</p>
      </div>

      <div className="glass-card divide-y divide-gray-100/50">
        {observations.map((obs) => (
          <div key={obs.id} className="py-6 flex gap-4 first:pt-0 last:pb-0">
            <div className="mt-1">
              {obs.status === 'pending' ? <AlertCircle className="text-amber-500" size={20} /> : <CheckCircle2 className="text-green-500" size={20} />}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-center text-xs text-ios-gray">
                <span>Observación #{obs.id}</span>
                <span>{obs.date}</span>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed">{obs.content}</p>
              <div className="flex gap-4 pt-2">
                <button className="text-xs font-bold text-ios-blue hover:underline">Responder</button>
                {obs.status === 'pending' && <button className="text-xs font-bold text-gray-400 hover:text-gray-600">Marcar como atendida</button>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Observations;

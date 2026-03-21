import { useState } from 'react';
import { BookOpenCheck, FileText, Download, MessageSquare, Send, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdvisorThesisReview() {
  const [selectedThesis, setSelectedThesis] = useState(1);
  const [observation, setObservation] = useState('');

  // Fake Data
  const thesisList = [
    { id: 1, student: 'Juan Pérez', title: 'Modelo de Recomendación con IA', status: 'Pendiente de Revisión', version: 3 },
    { id: 2, student: 'Carlos Díaz', title: 'Análisis de Redes Sociales', status: 'Revisado', version: 1 },
  ];

  const currentThesis = thesisList.find(t => t.id === selectedThesis);

  const handleSendObservation = () => {
    if (!observation.trim()) return toast.error("La observación no puede estar vacía");
    toast.success("Observación enviada exitosamente");
    setObservation('');
  };

  return (
    <div className="w-full flex flex-col gap-8 animate-fade-in fade-in slide-in-from-bottom-4 duration-700 py-10">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <BookOpenCheck className="w-8 h-8 text-ios-blue" />
            Revisión de Tesis
          </h1>
          <p className="text-slate-600 mt-1 max-w-xl text-sm">
            Selecciona la tesis de un estudiante, revisa sus documentos y añade tus recomendaciones o correcciones.
          </p>
        </div>
        <select 
          className="glass-card appearance-none py-3 px-6 rounded-xl text-sm font-bold text-slate-800 border-none focus:ring-2 focus:ring-ios-blue shadow-sm outline-none cursor-pointer w-full md:w-auto"
          value={selectedThesis}
          onChange={(e) => setSelectedThesis(Number(e.target.value))}
        >
          {thesisList.map(t => (
            <option key={t.id} value={t.id}>{t.student} - {t.title}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        
        {/* Document section */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-card rounded-[32px] p-8 shadow-xl border border-white/60">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                  {currentThesis.status}
                </span>
                <h2 className="text-2xl font-bold text-slate-900">{currentThesis.title}</h2>
                <p className="text-slate-500 font-medium">Estudiante: {currentThesis.student}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400 font-bold uppercase">Versión</p>
                <p className="text-3xl font-extrabold text-slate-800">v{currentThesis.version}</p>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button className="flex-1 bg-ios-blue hover:bg-blue-600 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02]">
                <FileText className="w-5 h-5" /> Abrir en Drive
              </button>
              <button className="flex-[0.5] glass-card border border-white/50 text-slate-700 hover:bg-white/80 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all">
                <Download className="w-5 h-5" /> Descargar PDF
              </button>
            </div>
            
            <hr className="my-8 border-slate-200/50" />
            
            <h3 className="text-lg font-bold text-slate-900 mb-4">Documentos Complementarios</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Reglamento.pdf', 'Instrumento_Validacion.docx'].map((doc, idx) => (
                <div key={idx} className="bg-white/50 p-4 rounded-2xl border border-white flex justify-between items-center hover:bg-white transition-colors cursor-pointer shadow-sm">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="text-ios-blue w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-700 truncate">{doc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="flex flex-col gap-6">
          <div className="glass-card rounded-[32px] p-6 shadow-xl border border-white/60 bg-gradient-to-b from-white/40 to-white/10 h-full flex flex-col">
            <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-ios-blue" />
              Recomendaciones
            </h3>
            <p className="text-xs text-slate-500 mb-6">Añade observaciones generales para esta versión.</p>
            
            <textarea
              className="w-full flex-1 min-h-[200px] glass-card rounded-2xl p-4 text-sm text-slate-700 border-none focus:ring-2 focus:ring-ios-blue resize-none mb-4"
              placeholder="Escribe tus observaciones aquí..."
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
            ></textarea>

            <button 
              onClick={handleSendObservation}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg"
            >
              <Send className="w-4 h-4" /> Enviar Corrección
            </button>
            
            <button className="w-full mt-3 py-3 border-2 border-green-500/20 text-green-600 bg-green-500/10 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-500 hover:text-white transition-colors">
              <CheckCircle className="w-4 h-4" /> Aprobar Versión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

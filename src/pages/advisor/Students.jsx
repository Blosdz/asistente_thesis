import { useState } from 'react';
import { Search, ChevronRight, User as UserIcon, BookText } from 'lucide-react';

export default function AdvisorStudents() {
  const [searchTerm, setSearchTerm] = useState('');

  // Fake data - To be replaced by your endpoint
  const students = [
    { id: 1, name: 'Juan Pérez', thesis: 'Modelo de Recomendación con IA', status: 'En revisión' },
    { id: 2, name: 'Ana Gómez', thesis: 'Sistema IoT para Agricultura', status: 'Fase inicial' },
    { id: 3, name: 'Carlos Díaz', thesis: 'Análisis de Redes Sociales', status: 'Casi listo' },
  ];

  return (
    <div className="w-full flex-1 flex flex-col py-10 px-6 animate-fade-in text-slate-900">
      <div className="flex flex-col mb-8 gap-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
          Mis Estudiantes
        </h1>
        <p className="text-slate-600">
          Supervisa y haz seguimiento del avance de tus tutorados.
        </p>
      </div>

      <div className="flex mb-8">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            className="w-full glass-card rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 border-none focus:ring-2 focus:ring-ios-blue shadow-sm"
            placeholder="Buscar por nombre o tesis..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((student) => (
          <div key={student.id} className="glass-card rounded-3xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col border border-white/60">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-ios-blue font-bold text-xl uppercase shadow-inner">
                {student.name[0]}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{student.name}</h3>
                <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-lg uppercase tracking-wider">
                  {student.status}
                </span>
              </div>
            </div>
            
            <div className="mt-2 p-4 bg-white/40 rounded-2xl border border-white/40 flex-1">
              <div className="flex items-start gap-2">
                <BookText className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <p className="text-sm text-slate-700 font-medium">
                  {student.thesis}
                </p>
              </div>
            </div>

            <button className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-ios-blue/10 text-ios-blue text-sm font-bold rounded-xl hover:bg-ios-blue/20 transition-colors">
              Ver perfil completo <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

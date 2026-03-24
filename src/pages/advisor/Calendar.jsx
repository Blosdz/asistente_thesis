import React from 'react';
import { ChevronLeft, ChevronRight, PlusCircle, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';

export default function AdvisorCalendar() {
  const navigate = useNavigate();

  const appointments = [
    { time: '09:00 AM', student: 'Juan Pérez', topic: 'Revisión de Avance Capitulo 1' },
    { time: '11:30 AM', student: 'Ana Gómez', topic: 'Definición de Arquitectura' },
  ];

  return (
    <div className="w-full flex-1 flex flex-col items-center py-10 px-6 animate-fade-in">
      <div className="w-full max-w-[1200px] flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <Button
              variant="link"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium">Volver</span>
            </Button>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Mi Calendario
          </h1>
          <p className="text-slate-600">
            Gestiona tu disponibilidad y visualiza tus próximas citas con estudiantes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar View */}
          <div className="lg:col-span-2 glass-card rounded-3xl p-8 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-900">Noviembre 2023</h3>
              <div className="flex gap-2">
                <Button variant="ghost" className="p-2 rounded-full text-slate-600">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button variant="ghost" className="p-2 rounded-full text-slate-600">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 mb-4">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-3">
              {[1, 2, 3].map((day) => (
                <div key={`disabled-${day}`} className="aspect-square flex items-center justify-center rounded-2xl glass-card opacity-50 cursor-not-allowed text-slate-600">
                  {day}
                </div>
              ))}
              <button className="aspect-square flex flex-col items-center justify-center rounded-2xl bg-ios-blue text-white shadow-lg shadow-blue-500/40 border border-blue-400 hover:scale-105 transition-transform relative">
                <span className="text-lg font-bold">4</span>
                <div className="absolute bottom-2 flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                </div>
              </button>
              {Array.from({ length: 26 }, (_, i) => i + 5).map((day) => (
                <button key={`day-${day}`} className="aspect-square flex items-center justify-center rounded-2xl glass-card transition-all font-medium text-slate-700 hover:text-slate-900 border border-white/60 hover:bg-white/40 shadow-sm relative">
                  {day}
                  {day % 5 === 0 && <div className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-ios-blue"></div>}
                </button>
              ))}
            </div>
          </div>

          {/* Agenda & Settings */}
          <div className="flex flex-col gap-6">
            <div className="glass-card border-white/50 p-6 rounded-3xl shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Citas de Hoy
                </h4>
                <div className="bg-blue-100 text-ios-blue text-xs font-bold px-2 py-1 rounded">2</div>
              </div>

              {appointments.map((apt, index) => (
                <div key={index} className="bg-white/60 border border-white rounded-2xl p-4 flex flex-col gap-2 hover:bg-white/80 transition-colors cursor-pointer shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
                      <Clock className="w-4 h-4 text-ios-blue" />
                      {apt.time}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">{apt.student}</p>
                  <p className="text-xs text-slate-500 line-clamp-1">{apt.topic}</p>
                </div>
              ))}
            </div>

            <Button className="w-full flex items-center justify-between p-5 rounded-3xl bg-ios-blue hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30 group">
              <span className="font-bold text-white text-lg">Configurar Horarios</span>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <PlusCircle className="text-white w-6 h-6" />
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

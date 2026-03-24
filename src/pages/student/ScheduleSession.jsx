import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function ScheduleSession() {
  const [selectedSlot, setSelectedSlot] = useState('13:00');

  const timeSlots = [
    { time: '09:00 AM', id: '09:00' },
    { time: '10:30 AM', id: '10:30' },
    { time: '01:00 PM', id: '13:00' },
    { time: '02:30 PM', id: '14:30' },
    { time: '04:00 PM', id: '16:00' },
  ];

  return (
    <div className="w-full flex-1 flex flex-col items-center py-10 px-6 animate-fade-in">
      <div className="w-full max-w-[1200px] flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Agendar una Sesión
          </h1>
          <p className="text-slate-600">
            Revisa la disponibilidad del asesor y reserva tu próxima consulta.
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Interface */}
          <div className="lg:col-span-2 glass-card rounded-3xl p-8 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-900">Octubre 2023</h3>
              <div className="flex gap-2">
                <button className="p-2 rounded-full hover:bg-white/40 text-slate-600 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-full hover:bg-white/40 text-slate-600 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 mb-4">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Date Grid */}
            <div className="grid grid-cols-7 gap-3">
              {/* Empty cells */}
              <div className="aspect-square"></div>
              <div className="aspect-square"></div>
              <div className="aspect-square"></div>

              {/* Previous month days or disabled */}
              {[1, 2, 3, 4].map((day) => (
                <div
                  key={`disabled-${day}`}
                  className="aspect-square flex flex-col items-center justify-center rounded-2xl glass-card opacity-50 cursor-not-allowed text-slate-600"
                >
                  {day}
                </div>
              ))}

              {/* Selected Day */}
              <button className="aspect-square flex flex-col items-center justify-center rounded-2xl bg-ios-blue text-white shadow-lg shadow-blue-500/40 border border-blue-400 hover:scale-105 transition-transform">
                <span className="text-lg font-bold">5</span>
                <div className="w-1.5 h-1.5 rounded-full bg-white mt-1"></div>
              </button>

              {/* Remaining Days */}
              {Array.from({ length: 26 }, (_, i) => i + 6).map((day) => (
                <button
                  key={`day-${day}`}
                  className="aspect-square flex items-center justify-center rounded-2xl glass-card transition-all font-medium text-slate-700 hover:text-slate-900 border border-white/60 hover:bg-white/40 shadow-sm"
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots Sidebar */}
          <div className="flex flex-col gap-6">
            <div className="glass-card border-white/50 bg-white/20 p-6 rounded-3xl shadow-xl flex flex-col gap-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Horarios para el 5 de Octubre
              </h4>

              <div className="flex flex-col gap-2">
                {timeSlots.map((slot) => {
                  const isSelected = selectedSlot === slot.id;

                  return (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot.id)}
                      className={`w-full py-3 px-4 glass-card rounded-xl my-2 flex justify-between items-center transition-all group ${
                        isSelected
                          ? 'border-[1.5px] border-blue-500 bg-white/80 shadow-md'
                          : 'border border-white/60 hover:bg-white/70 hover:shadow-md'
                      }`}
                    >
                      <div className="flex flex-col items-start">
                        <span
                          className={`font-semibold ${isSelected ? 'text-blue-700' : 'text-slate-900'}`}
                        >
                          {slot.time}
                        </span>
                        <span
                          className={`text-xs ${isSelected ? 'text-blue-600/70' : 'text-slate-500'}`}
                        >
                          {isSelected ? 'Seleccionado' : '45 minutos'}
                        </span>
                      </div>

                      {isSelected ? (
                        <CheckCircle2 className="w-6 h-6 text-blue-600" />
                      ) : (
                        <PlusCircle className="w-6 h-6 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                  );
                })}
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl mt-4 shadow-lg shadow-blue-500/30 transition-all active:scale-95 border border-blue-500 backdrop-blur-sm">
                Confirmar Reserva
              </Button>
            </div>

            {/* Advisor Profile Quick Info */}
            <div className="glass-card rounded-3xl p-6 shadow-xl flex items-center gap-4">
              <div
                className="h-12 w-12 rounded-full bg-cover bg-center border-2 border-white shadow-sm"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBfdGuJzGbQCJDNygmZDy66lTD1k8dsAJC-y1EKHskRKL1hHPkVI-nCr62e1J_ix9u4HNjz8X0rX68oIMQnExazzqJHqwMJ7aI93EGOnf5_PY30S4K7uS-2NL5dgGyTEQh9LWE2M1yGXX2O1tmccgvgI0Qg0Ki7IVfj1Ni9jisHmAyGOGjniWB2Aeo8qVAeyOJe81Du68uKasOW_1mM6HlHhRiRUWOpqHn6P6kgkVDGiDYwzL0zNbFWkPR2TzmF-crd3cBHsHVRwTg')",
                }}
              ></div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900">Sarah Mitchell</span>
                <span className="text-xs text-slate-600 uppercase font-bold tracking-tight">
                  Academic Advisor
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

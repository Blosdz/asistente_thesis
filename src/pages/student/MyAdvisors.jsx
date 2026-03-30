import React, { useState } from 'react';
import { ShieldCheck, Users, Search } from 'lucide-react';
import MisAsesores from './MisAsesores';
import AdvisorCatalog from './AdvisorCatalog';

export default function MyAdvisors() {
  const [activeTab, setActiveTab] = useState('my-advisors'); // 'my-advisors' | 'catalog'

  return (
    <div className="max-w-[1400px] mx-auto w-full animate-fade-in flex flex-col">
      {/* Header with Segmented Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 px-4 md:px-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
            Tu Mentoría
          </h1>
          <p className="text-slate-500 max-w-md">
            Gestiona tus mentores activos o encuentra nuevos asesores expertos para tu tesis.
          </p>
        </div>
        
        <div className="inline-flex p-1 bg-slate-100/80 backdrop-blur-sm rounded-2xl w-fit border border-slate-200/60 shadow-inner">
          <button 
            onClick={() => setActiveTab('my-advisors')}
            className={`px-6 py-2.5 rounded-xl text-sm transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'my-advisors' 
                ? 'bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] font-bold text-ios-blue' 
                : 'font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <Users size={16} />
            Mis Asesores
          </button>
          <button 
            onClick={() => setActiveTab('catalog')}
            className={`px-6 py-2.5 rounded-xl text-sm transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'catalog' 
                ? 'bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] font-bold text-ios-blue' 
                : 'font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <Search size={16} />
            Catálogo de Asesores
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full relative min-h-[400px]">
        {activeTab === 'my-advisors' ? (
          <div className="px-4 md:px-8 animate-fade-in duration-300 pb-12">
            <MisAsesores hideHeader={true} />
            
            {/* Bento Featured Section specifically for MyAdvisors view */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 mt-8 border-t border-slate-200/50">
              <div className="md:col-span-2 bg-gradient-to-br from-ios-blue to-blue-700 p-8 rounded-3xl text-white flex flex-col justify-center shadow-lg shadow-blue-500/20">
                <h4 className="text-2xl font-black tracking-tight mb-4">Programa de Asesoría Élite</h4>
                <p className="text-blue-100 mb-6 max-w-md">
                  Accede a sesiones 1 a 1 de revisión profunda sobre tu avance de tesis con metodologías específicas para agilizar tu graduación.
                </p>
                <button className="w-fit bg-white text-ios-blue px-8 py-3 rounded-full font-bold text-sm shadow-sm hover:scale-[1.02] active:scale-95 transition-all">
                  Conocer más
                </button>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl flex flex-col items-center text-center justify-center">
                <div className="w-16 h-16 bg-blue-100 text-ios-blue rounded-full flex items-center justify-center mb-4">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">100% Verificados</h4>
                <p className="text-sm text-slate-500">
                  Cada mentor pasa por estrictos controles de antecedentes y credenciales académicas.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in duration-300 pb-12 -mt-6">
            <AdvisorCatalog isComponent={true} />
          </div>
        )}
      </div>
    </div>
  );
}
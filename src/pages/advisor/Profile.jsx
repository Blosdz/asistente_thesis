import { User, Mail, Shield, Book, Award, Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCurrentUser } from '../../services/authService';

const AdvisorProfile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="w-full flex flex-col gap-8 animate-fade-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="glass-card rounded-[40px] p-8 md:p-12 mt-12 relative">
        <div className="absolute -top-16 left-12 w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center text-white text-5xl font-bold border-4 border-white shadow-xl">
          {user?.email?.[0]?.toUpperCase() || 'A'}
        </div>

        <div className="mt-16 sm:mt-8 sm:ml-40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Perfil de Asesor
            </h2>
            <p className="text-ios-blue font-semibold mt-1">
              Docente Investigador
            </p>
          </div>
          <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg">
            Editar Perfil
          </button>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                <Mail className="text-ios-blue w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                  Correo Electrónico
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {user?.email || 'No disponible'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center">
                <Award className="text-purple-600 w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                  Especialidad
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  Ingeniería de Software e IA
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center">
                <Briefcase className="text-green-600 w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                  Departamento
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  Facultad de Ingeniería
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                <Shield className="text-orange-600 w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                  Estudiantes a cargo
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  Actualmente asesorando a 4 estudiantes
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="glass-card rounded-[40px] p-8 md:p-12 mb-8">
        <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <Book className="text-ios-blue w-6 h-6" /> Biografía y Experiencia
        </h3>
        <p className="text-slate-600 leading-relaxed max-w-4xl">
          Especialista en metodologías de investigación y desarrollo ágil. Miembro activo del comité de evaluación de tesis.
          Con experiencia en revisión de proyectos tecnológicos y apoyo a estudiantes de pregrado y posgrado en la culminación exitosa de sus trabajos de graduación.
        </p>
      </section>
    </div>
  );
};

export default AdvisorProfile;

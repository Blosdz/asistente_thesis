import {
  User,
  Mail,
  GraduationCap,
  Building,
  Calendar,
  Edit2,
  Phone,
  CreditCard,
  BookOpen,
  Award,
  Loader2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCurrentUser } from '../../services/authService';
import {
  obtenerPerfilEstudiante,
  guardarPerfilEstudiante,
} from '../../services/studentService';
import { obtenerUniversidades } from '../../services/catalogService';
import { universities as universitiesList } from '../../data/universities';
import { clsx } from 'clsx';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Catalogs
  const [universidades, setUniversidades] = useState(universitiesList);

  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    dni: '',
    telefono: '',
    universidad_id: '',
    carrera: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [currentUser, pData, unis] = await Promise.all([
          getCurrentUser(),
          obtenerPerfilEstudiante(),
          obtenerUniversidades().catch(() => universitiesList),
        ]);

        setUser(currentUser);
        setUniversidades(unis && unis.length > 0 ? unis : universitiesList);

        if (pData && pData.tiene_informacion) {
          setPerfil(pData);
          setFormData({
            nombres: pData.nombres || '',
            apellidos: pData.apellidos || '',
            dni: pData.dni || '',
            telefono: pData.telefono || '',
            universidad_id: pData.universidad_id || '',
            carrera: pData.carrera || '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      await guardarPerfilEstudiante(formData);
      // Refresh profile data
      const data = await obtenerPerfilEstudiante();
      if (data && data.length > 0) setPerfil(data[0]);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error al guardar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading && !perfil) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-ios-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-gray-900">Perfil de Usuario</h2>
        <p className="text-gray-500">
          Gestiona tu información personal y académica con tus credenciales
          institucionales.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="glass-card flex flex-col items-center text-center gap-6 p-8 relative overflow-hidden">
            {/* Background Blob */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-ios-blue/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

            <div className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-4xl uppercase relative z-10 shadow-2xl">
              {perfil?.nombres?.[0] || user?.email?.[0] || 'S'}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="absolute bottom-0 right-0 bg-ios-blue text-white p-2.5 rounded-full hover:scale-110 transition-transform shadow-xl border-4 border-white"
              >
                <Edit2 size={16} />
              </button>
            </div>

            <div className="z-10">
              <h3 className="text-xl font-bold text-slate-900">
                {perfil?.nombres
                  ? `${perfil.nombres} ${perfil.apellidos}`
                  : 'Estudiante de Tesis'}
              </h3>
              <p className="text-ios-blue font-medium text-sm mt-1">
                Estudiante de Tesis
              </p>
            </div>

            <div className="w-full pt-6 border-t border-slate-200/50 flex flex-col gap-4 z-10">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-ios-blue/10 flex items-center justify-center text-ios-blue">
                  <Mail size={16} />
                </div>
                <span className="truncate font-medium">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-ios-blue/10 flex items-center justify-center text-ios-blue">
                  <CreditCard size={16} />
                </div>
                <span className="font-medium">
                  DNI: {perfil?.dni || 'No registrado'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-ios-blue/10 flex items-center justify-center text-ios-blue">
                  <Phone size={16} />
                </div>
                <span className="font-medium">
                  {perfil?.telefono || 'Sin teléfono'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card space-y-8 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-ios-blue/10 flex items-center justify-center text-ios-blue">
                  <GraduationCap size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Configuración de Perfil
                </h3>
              </div>
              <button
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                className={clsx(
                  'px-5 py-2 rounded-xl text-sm font-bold transition-all',
                  isEditing
                    ? 'bg-ios-blue text-white shadow-lg shadow-ios-blue/20 hover:bg-blue-600'
                    : 'text-ios-blue hover:bg-ios-blue/5',
                )}
              >
                {isEditing ? 'Guardar Cambios' : 'Editar Datos'}
              </button>
            </div>

            {isEditing ? (
              <div className="grid grid-cols-1 gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Nombres
                    </label>
                    <input
                      name="nombres"
                      value={formData.nombres}
                      onChange={handleChange}
                      className="w-full p-3.5 rounded-2xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-ios-blue/20 focus:border-ios-blue outline-none transition-all"
                      placeholder="Tus nombres"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Apellidos
                    </label>
                    <input
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleChange}
                      className="w-full p-3.5 rounded-2xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-ios-blue/20 focus:border-ios-blue outline-none transition-all"
                      placeholder="Tus apellidos"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      DNI
                    </label>
                    <input
                      name="dni"
                      value={formData.dni}
                      onChange={handleChange}
                      className="w-full p-3.5 rounded-2xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-ios-blue/20 focus:border-ios-blue outline-none transition-all"
                      placeholder="Número de documento"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Teléfono
                    </label>
                    <input
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="w-full p-3.5 rounded-2xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-ios-blue/20 focus:border-ios-blue outline-none transition-all"
                      placeholder="Ej. +51 987 654 321"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-200/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                        Universidad
                      </label>
                      <select
                        name="universidad_id"
                        value={formData.universidad_id}
                        onChange={handleChange}
                        className="w-full p-3.5 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-ios-blue/20 focus:border-ios-blue outline-none transition-all appearance-none"
                      >
                        <option value="">Selecciona tu universidad</option>
                        {universidades.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                        Carrera
                      </label>
                      <input
                        name="carrera"
                        value={formData.carrera}
                        onChange={handleChange}
                        className="w-full p-3.5 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-ios-blue/20 focus:border-ios-blue outline-none transition-all"
                        placeholder="Ej. Ingeniería de Software"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Universidad
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Building size={16} className="text-slate-500" />
                    </div>
                    <p className="font-semibold text-slate-800">
                      {universidades.find(
                        (u) => u.id === perfil?.universidad_id,
                      )?.nombre || 'No registrada'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Carrera
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <BookOpen size={16} className="text-slate-500" />
                    </div>
                    <p className="font-semibold text-slate-800">
                      {perfil?.carrera || 'No registrada'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Día de Registro
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Calendar size={16} className="text-slate-500" />
                    </div>
                    <p className="font-semibold text-slate-800">
                      {perfil?.creado_en
                        ? new Date(perfil.creado_en).toLocaleDateString()
                        : 'Pendiente'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!isEditing && (
            <div className="glass-card space-y-6 p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-ios-blue/20"></div>
              <h3 className="text-lg font-bold text-slate-900 ml-2">
                Detalles de Tesis Actual
              </h3>
              <div className="space-y-4 ml-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Título Registrado
                  </label>
                  <div className="p-4 bg-white/50 rounded-2xl border border-slate-200/50 shadow-sm italic text-slate-700">
                    "Implementación de un Asistente Virtual para la Gestión de
                    Tesis de Grado usando IA Generativa"
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Asesor Asignado
                    </label>
                    <p className="font-bold text-ios-blue">
                      Dr. Alejandro Vargas
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Estado del Proyecto
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <p className="font-bold text-emerald-600">
                        En Desarrollo
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

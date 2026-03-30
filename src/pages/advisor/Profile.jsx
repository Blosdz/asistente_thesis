import {
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
  guardarPerfilAsesor,
  obtenerPerfilAsesor,
} from '../../services/advisorService';
import { obtenerUniversidades } from '../../services/catalogService';
import { universities as universitiesList } from '../../data/universities';
import { clsx } from 'clsx';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectItem } from '../../components/ui/select';

const AdvisorProfile = () => {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [universidades, setUniversidades] = useState(universitiesList);
  const [formData, setFormData] = useState({
    nombre_mostrar: '',
    universidad_id: '',
    slug: '',
    email_publico: '',
    biografia: '',
    foto_url: '',
    especialidad_id: '',
    carrera: '',
    nivel_academico: '',
    nombres: '',
    apellidos: '',
    dni: '',
    telefono: '',
  });

  const tienePerfilAsesor = (perfilData) =>
    Boolean(
      perfilData?.tiene_informacion ||
        perfilData?.asesor_id ||
        perfilData?.nombre_mostrar ||
        perfilData?.email_publico ||
        perfilData?.slug,
    );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const [currentUser, perfilData, unis] = await Promise.all([
          getCurrentUser(),
          obtenerPerfilAsesor().catch(() => null),
          obtenerUniversidades().catch(() => universitiesList),
        ]);

        setUser(currentUser);
        setUniversidades(unis && unis.length > 0 ? unis : universitiesList);

        if (tienePerfilAsesor(perfilData)) {
          setPerfil(perfilData);
          setFormData({
            nombre_mostrar: perfilData.nombre_mostrar || '',
            universidad_id: perfilData.universidad_id || '',
            slug: perfilData.slug || '',
            email_publico: perfilData.email_publico || currentUser?.email || '',
            biografia: perfilData.biografia || '',
            foto_url: perfilData.foto_url || '',
            especialidad_id: perfilData.especialidad_id || '',
            carrera: perfilData.carrera || '',
            nivel_academico: perfilData.nivel_academico || '',
            nombres: perfilData.nombres || '',
            apellidos: perfilData.apellidos || '',
            dni: perfilData.dni || '',
            telefono: perfilData.telefono || '',
          });
        } else if (currentUser?.email) {
          setFormData((prev) => ({
            ...prev,
            email_publico: currentUser.email,
          }));
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const slugify = (value) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 80);

  const handleSave = async () => {
    try {
      setLoading(true);
      const nextSlug = formData.slug || slugify(formData.nombre_mostrar || `${formData.nombres} ${formData.apellidos}`);
      const payload = {
        ...formData,
        slug: nextSlug,
      };

      const saved = await guardarPerfilAsesor(payload);
      if (saved) {
        setPerfil(saved);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving advisor profile:', error);
      alert('Error al guardar el perfil del asesor');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !perfil) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-ios-blue animate-spin" />
      </div>
    );
  }

  const displayName =
    perfil?.nombre_mostrar ||
    `${perfil?.nombres || ''} ${perfil?.apellidos || ''}`.trim() ||
    'Asesor/a';
  const displayInitial =
    displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-gray-900">Perfil de Asesor</h2>
        <p className="text-gray-500">
          Configura tu información profesional para que los estudiantes te
          conozcan mejor.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="glass-card flex flex-col items-center text-center gap-6 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-ios-blue/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

            <div className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-4xl uppercase relative z-10 shadow-2xl">
              {displayInitial}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="absolute bottom-0 right-0 bg-ios-blue text-white p-2.5 rounded-full hover:scale-110 transition-transform shadow-xl border-4 border-white"
              >
                <Edit2 size={16} />
              </button>
            </div>

            <div className="z-10">
              <h3 className="text-xl font-bold text-slate-900">
                {displayName}
              </h3>
              <p className="text-ios-blue font-medium text-sm mt-1">
                Docente Investigador
              </p>
            </div>

            <div className="w-full pt-6 border-t border-slate-200/50 flex flex-col gap-4 z-10">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-ios-blue/10 flex items-center justify-center text-ios-blue">
                  <Mail size={16} />
                </div>
                <span className="truncate font-medium">
                  {formData.email_publico || user?.email || 'No disponible'}
                </span>
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
              <Button
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                variant={isEditing ? 'primary' : 'secondary'}
                className={clsx(
                  'px-5 py-2 text-sm font-bold',
                  isEditing ? 'shadow-lg shadow-ios-blue/20' : 'text-ios-blue',
                )}
              >
                {isEditing ? 'Guardar Cambios' : 'Editar Datos'}
              </Button>
            </div>

            {isEditing ? (
              <div className="grid grid-cols-1 gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Nombre a Mostrar
                    </Label>
                    <Input
                      name="nombre_mostrar"
                      value={formData.nombre_mostrar}
                      onChange={handleChange}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white/50 focus:ring-ios-blue/20"
                      placeholder="Ej. Dra. Ana Torres"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Email Público
                    </Label>
                    <Input
                      name="email_publico"
                      type="email"
                      value={formData.email_publico}
                      onChange={handleChange}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white/50 focus:ring-ios-blue/20"
                      placeholder="correo@universidad.edu"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Nombres
                    </Label>
                    <Input
                      name="nombres"
                      value={formData.nombres}
                      onChange={handleChange}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white/50 focus:ring-ios-blue/20"
                      placeholder="Tus nombres"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Apellidos
                    </Label>
                    <Input
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleChange}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white/50 focus:ring-ios-blue/20"
                      placeholder="Tus apellidos"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      DNI
                    </Label>
                    <Input
                      name="dni"
                      value={formData.dni}
                      onChange={handleChange}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white/50 focus:ring-ios-blue/20"
                      placeholder="Número de documento"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Teléfono
                    </Label>
                    <Input
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white/50 focus:ring-ios-blue/20"
                      placeholder="Ej. +51 987 654 321"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-200/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                        Universidad
                      </Label>
                      <Select
                        name="universidad_id"
                        value={formData.universidad_id}
                        onChange={handleChange}
                        className="p-3.5 rounded-2xl border border-slate-200 bg-white"
                      >
                        <SelectItem value="">Selecciona tu universidad</SelectItem>
                        {universidades.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.nombre}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                        Carrera
                      </Label>
                      <Input
                        name="carrera"
                        value={formData.carrera}
                        onChange={handleChange}
                        className="p-3.5 rounded-2xl border border-slate-200 bg-white"
                        placeholder="Ej. Ingeniería de Software"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Nivel Académico
                    </Label>
                    <Select
                      name="nivel_academico"
                      value={formData.nivel_academico}
                      onChange={handleChange}
                    >
                      <SelectItem value="">Selecciona nivel</SelectItem>
                      <SelectItem value="pregrado">Pregrado</SelectItem>
                      <SelectItem value="maestria">Maestría</SelectItem>
                      <SelectItem value="doctorado">Doctorado</SelectItem>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      ID de Especialidad
                    </Label>
                    <Input
                      name="especialidad_id"
                      value={formData.especialidad_id}
                      onChange={handleChange}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white"
                      placeholder="UUID de especialidad"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Slug Público
                    </Label>
                    <Input
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white"
                      placeholder="ej. ana-torres"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Foto URL
                    </Label>
                    <Input
                      name="foto_url"
                      value={formData.foto_url}
                      onChange={handleChange}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                    Biografía
                  </Label>
                  <textarea
                    name="biografia"
                    value={formData.biografia}
                    onChange={handleChange}
                    rows={4}
                    className="w-full p-3.5 rounded-2xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-ios-blue/20 focus:border-ios-blue outline-none transition-all"
                    placeholder="Describe tu experiencia y líneas de investigación"
                  />
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
                    Nivel Académico
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Award size={16} className="text-slate-500" />
                    </div>
                    <p className="font-semibold text-slate-800">
                      {perfil?.nivel_academico || 'No registrado'}
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
                Perfil Público
              </h3>
              <div className="space-y-4 ml-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Biografía
                  </label>
                  <div className="p-4 bg-white/50 rounded-2xl border border-slate-200/50 shadow-sm text-slate-700">
                    {perfil?.biografia ||
                      'Completa tu biografía para mostrar tu experiencia.'}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Slug Público
                    </label>
                    <p className="font-bold text-ios-blue">
                      {perfil?.slug || 'Pendiente'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Especialidad (ID)
                    </label>
                    <p className="font-bold text-slate-700">
                      {perfil?.especialidad_id || 'Pendiente'}
                    </p>
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

export default AdvisorProfile;

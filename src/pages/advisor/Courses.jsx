import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  Archive,
  BookOpen,
  CheckCircle2,
  FilePlus2,
  FileText,
  FolderUp,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  UploadCloud,
  Video,
} from 'lucide-react';
import {
  actualizarCursoAsesor,
  crearCursoAsesor,
  formatCourseCurrency,
  listarMaterialesCursoAsesor,
  listarMisCursosAsesor,
  subirMaterialesCursoAsesor,
} from '../../services/cursosService';

const initialCourse = {
  titulo: '',
  descripcion: '',
  precio: '',
  moneda: 'PEN',
  portadaUrlDrive: '',
  estado: 'borrador',
};

const initialMaterial = {
  titulo: '',
  descripcion: '',
  tipo: 'documento',
  orden: 1,
  esVistaPrevia: true,
};

const statusClass = {
  borrador: 'bg-slate-100 text-slate-700',
  publicado: 'bg-emerald-100 text-emerald-700',
  pausado: 'bg-amber-100 text-amber-700',
  archivado: 'bg-rose-100 text-rose-700',
};

const materialTypeOptions = [
  { value: 'documento', label: 'Documento' },
  { value: 'video', label: 'Video' },
  { value: 'plantilla', label: 'Plantilla' },
  { value: 'imagen', label: 'Imagen' },
  { value: 'zip', label: 'ZIP' },
  { value: 'otro', label: 'Otro' },
];

const formatFileSize = (size = 0) => {
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(2)} MB`;
  if (size >= 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${size} B`;
};

const getFileKey = (file) =>
  `${file.webkitRelativePath || file.name}-${file.size}-${file.lastModified}`;

const mergeFiles = (current, incoming) => {
  const map = new Map(current.map((file) => [getFileKey(file), file]));
  incoming.forEach((file) => map.set(getFileKey(file), file));
  return Array.from(map.values());
};

const guessMaterialType = (file) => {
  const mime = file?.type || '';
  const extension = file?.name?.split('.').pop()?.toLowerCase() || '';

  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('image/')) return 'imagen';
  if (extension === 'zip') return 'zip';
  return 'documento';
};

const MaterialIcon = ({ material }) => {
  const type = material?.tipo || guessMaterialType(material);
  const className = 'h-4 w-4';

  if (type === 'video') return <Video className={className} />;
  if (type === 'imagen') return <ImageIcon className={className} />;
  if (type === 'zip') return <Archive className={className} />;
  return <FileText className={className} />;
};

export default function AdvisorCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [courseForm, setCourseForm] = useState(initialCourse);
  const [materialForm, setMaterialForm] = useState(initialMaterial);
  const [materialFiles, setMaterialFiles] = useState([]);
  const [isDraggingMaterial, setIsDraggingMaterial] = useState(false);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) || null,
    [courses, selectedCourseId],
  );

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await listarMisCursosAsesor();
      setCourses(data || []);
      if (!selectedCourseId && data?.[0]?.id) {
        setSelectedCourseId(data[0].id);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'No se pudieron cargar tus cursos');
    } finally {
      setLoading(false);
    }
  };

  const loadMaterials = async (courseId) => {
    if (!courseId) {
      setMaterials([]);
      return;
    }

    try {
      setMaterialsLoading(true);
      const data = await listarMaterialesCursoAsesor(courseId);
      setMaterials(data || []);
    } catch (error) {
      console.error(error);
      toast.error('No se pudieron cargar los materiales');
      setMaterials([]);
    } finally {
      setMaterialsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    loadMaterials(selectedCourseId);
    setMaterialForm(initialMaterial);
    setMaterialFiles([]);
    setIsDraggingMaterial(false);
  }, [selectedCourseId]);

  const handleCourseChange = (field, value) => {
    setCourseForm((current) => ({ ...current, [field]: value }));
  };

  const handleMaterialChange = (field, value) => {
    setMaterialForm((current) => ({ ...current, [field]: value }));
  };

  const addMaterialFiles = (files) => {
    const incoming = Array.from(files || []).filter((file) => file.size > 0);
    if (!incoming.length) return;

    setMaterialFiles((current) => {
      const next = mergeFiles(current, incoming);
      if (current.length === 0 && incoming[0]) {
        setMaterialForm((form) => ({
          ...form,
          tipo: guessMaterialType(incoming[0]),
          titulo: form.titulo || incoming[0].name.replace(/\.[^.]+$/, ''),
        }));
      }
      return next;
    });
  };

  const removeMaterialFile = (fileToRemove) => {
    const key = getFileKey(fileToRemove);
    setMaterialFiles((current) =>
      current.filter((file) => getFileKey(file) !== key),
    );
  };

  const handleMaterialDrop = (event) => {
    event.preventDefault();
    setIsDraggingMaterial(false);
    addMaterialFiles(event.dataTransfer.files);
  };

  const handleCreateCourse = async (event) => {
    event.preventDefault();

    if (!courseForm.titulo.trim()) {
      toast.error('Escribe un título para el curso');
      return;
    }

    try {
      setSaving(true);
      const course = await crearCursoAsesor({
        ...courseForm,
        precio: Number(courseForm.precio || 0),
        titulo: courseForm.titulo.trim(),
        descripcion: courseForm.descripcion.trim() || null,
        portadaUrlDrive: courseForm.portadaUrlDrive.trim() || null,
      });
      setCourses((current) => [course, ...current]);
      setSelectedCourseId(course.id);
      setCourseForm(initialCourse);
      toast.success('Curso creado');
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'No se pudo crear el curso');
    } finally {
      setSaving(false);
    }
  };

  const handleSetStatus = async (course, estado) => {
    try {
      const updated = await actualizarCursoAsesor(course.id, { estado });
      setCourses((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      toast.success('Estado actualizado');
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'No se pudo actualizar el estado');
    }
  };

  const handleCreateMaterial = async (event) => {
    event.preventDefault();

    if (!selectedCourseId) {
      toast.error('Selecciona un curso');
      return;
    }

    if (!materialFiles.length) {
      toast.error('Arrastra o selecciona al menos un archivo');
      return;
    }

    try {
      setUploadingMaterial(true);
      const uploaded = await subirMaterialesCursoAsesor({
        cursoId: selectedCourseId,
        files: materialFiles,
        titulo: materialForm.titulo.trim() || materialFiles[0]?.name,
        descripcion: materialForm.descripcion.trim() || null,
        tipo: materialForm.tipo,
        orden: Number(materialForm.orden || 1),
        esVistaPrevia: materialForm.esVistaPrevia,
      });
      setMaterials((current) => [...current, ...uploaded]);
      setMaterialForm(initialMaterial);
      setMaterialFiles([]);
      await loadCourses();
      toast.success(
        uploaded.length > 1
          ? `${uploaded.length} materiales subidos`
          : 'Material subido',
      );
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'No se pudo subir el material');
    } finally {
      setUploadingMaterial(false);
    }
  };

  return (
    <div className="w-full px-4 py-10 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-[1440px] gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Cursos
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
              Publica recursos para tus estudiantes
            </h1>
          </div>

          <form
            onSubmit={handleCreateCourse}
            className="rounded-[28px] border border-white/70 bg-white/78 p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Plus className="h-4 w-4 text-blue-600" />
              Nuevo curso
            </div>

            <div className="mt-4 space-y-3">
              <input
                className="input-pro w-full"
                placeholder="Título"
                value={courseForm.titulo}
                onChange={(event) => handleCourseChange('titulo', event.target.value)}
              />
              <textarea
                className="input-pro min-h-24 w-full resize-none"
                placeholder="Descripción"
                value={courseForm.descripcion}
                onChange={(event) =>
                  handleCourseChange('descripcion', event.target.value)
                }
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className="input-pro w-full"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Precio"
                  value={courseForm.precio}
                  onChange={(event) => handleCourseChange('precio', event.target.value)}
                />
                <select
                  className="select-pro w-full"
                  value={courseForm.estado}
                  onChange={(event) => handleCourseChange('estado', event.target.value)}
                >
                  <option value="borrador">Borrador</option>
                  <option value="publicado">Publicado</option>
                  <option value="pausado">Pausado</option>
                </select>
              </div>
              <input
                className="input-pro w-full"
                placeholder="URL de portada"
                value={courseForm.portadaUrlDrive}
                onChange={(event) =>
                  handleCourseChange('portadaUrlDrive', event.target.value)
                }
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="ios-accent-button mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Crear curso
            </button>
          </form>
        </section>

        <section className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-950">Mis cursos</h2>
            <button
              type="button"
              onClick={loadCourses}
              className="ios-secondary-button inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </button>
          </div>

          {loading ? (
            <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center text-slate-500">
              Cargando cursos...
            </div>
          ) : courses.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/74 p-10 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-3 text-sm font-semibold text-slate-700">
                Aún no tienes cursos creados.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {courses.map((course) => (
                <article
                  key={course.id}
                  className={`rounded-[28px] border bg-white p-5 transition ${
                    selectedCourseId === course.id
                      ? 'border-blue-200 shadow-[0_24px_60px_-44px_rgba(37,99,235,0.45)]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedCourseId(course.id)}
                    className="block w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-950">
                          {course.titulo}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                          {course.descripcion || 'Sin descripción'}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          statusClass[course.estado] || statusClass.borrador
                        }`}
                      >
                        {course.estado}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
                      <span className="rounded-full bg-slate-100 px-3 py-1">
                        {formatCourseCurrency(course.precio, course.moneda)}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">
                        {course.total_materiales} material(es)
                      </span>
                    </div>
                  </button>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleSetStatus(course, 'publicado')}
                      className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                      disabled={course.estado === 'publicado'}
                    >
                      Publicar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetStatus(course, 'pausado')}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 disabled:opacity-50"
                      disabled={course.estado === 'pausado'}
                    >
                      Pausar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {selectedCourse ? (
            <div className="rounded-[28px] border border-slate-200 bg-white p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Materiales
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-slate-950">
                    {selectedCourse.titulo}
                  </h3>
                </div>
                {materialsLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                ) : null}
              </div>

              <form
                onSubmit={handleCreateMaterial}
                className="mt-5 grid gap-3 lg:grid-cols-[1fr_170px]"
              >
                <input
                  className="input-pro w-full"
                  placeholder="Título del material"
                  value={materialForm.titulo}
                  onChange={(event) =>
                    handleMaterialChange('titulo', event.target.value)
                  }
                />
                <select
                  className="select-pro w-full"
                  value={materialForm.tipo}
                  onChange={(event) => handleMaterialChange('tipo', event.target.value)}
                >
                  {materialTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <textarea
                  className="input-pro min-h-20 w-full resize-none lg:col-span-2"
                  placeholder="Descripción breve"
                  value={materialForm.descripcion}
                  onChange={(event) =>
                    handleMaterialChange('descripcion', event.target.value)
                  }
                />
                <div className="grid gap-3 lg:col-span-2 sm:grid-cols-[140px_1fr]">
                  <input
                    className="input-pro w-full"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Orden"
                    value={materialForm.orden}
                    onChange={(event) =>
                      handleMaterialChange('orden', event.target.value)
                    }
                  />
                  <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={materialForm.esVistaPrevia}
                      onChange={(event) =>
                        handleMaterialChange('esVistaPrevia', event.target.checked)
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                    Vista previa para estudiantes
                  </label>
                </div>

                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDraggingMaterial(true);
                  }}
                  onDragLeave={() => setIsDraggingMaterial(false)}
                  onDrop={handleMaterialDrop}
                  className={`lg:col-span-2 rounded-[24px] border border-dashed p-5 transition ${
                    isDraggingMaterial
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-white'
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-white bg-white text-blue-700 shadow-sm">
                        <UploadCloud className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-950">
                          Arrastra documentos, carpetas o videos
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          También puedes seleccionar archivos o una carpeta completa.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <label className="ios-secondary-button inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl px-3 text-sm font-semibold">
                        <FilePlus2 className="h-4 w-4" />
                        Archivos
                        <input
                          type="file"
                          multiple
                          className="sr-only"
                          onChange={(event) => {
                            addMaterialFiles(event.target.files);
                            event.target.value = '';
                          }}
                        />
                      </label>
                      <label className="ios-secondary-button inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl px-3 text-sm font-semibold">
                        <FolderUp className="h-4 w-4" />
                        Carpeta
                        <input
                          type="file"
                          multiple
                          webkitdirectory=""
                          directory=""
                          className="sr-only"
                          onChange={(event) => {
                            addMaterialFiles(event.target.files);
                            event.target.value = '';
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {materialFiles.length > 0 ? (
                    <div className="mt-4 max-h-56 space-y-2 overflow-y-auto rounded-[18px] border border-slate-200 bg-white p-3">
                      {materialFiles.map((file) => (
                        <div
                          key={getFileKey(file)}
                          className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600">
                              <MaterialIcon material={file} />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {file.webkitRelativePath || file.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeMaterialFile(file)}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-white hover:text-rose-600"
                            aria-label={`Quitar ${file.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
                <button
                  type="submit"
                  disabled={uploadingMaterial}
                  className="ios-accent-button inline-flex h-11 items-center justify-center gap-2 rounded-2xl text-sm font-semibold disabled:opacity-60 lg:col-span-2"
                >
                  {uploadingMaterial ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UploadCloud className="h-4 w-4" />
                  )}
                  Subir material
                </button>
              </form>

              <div className="mt-5 divide-y divide-slate-100">
                {materials.length === 0 ? (
                  <p className="py-5 text-sm text-slate-500">
                    Este curso todavía no tiene materiales.
                  </p>
                ) : (
                  materials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                          <MaterialIcon material={material} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {material.titulo}
                          </p>
                          <p className="text-xs text-slate-500">
                            {material.tipo}
                            {material.nombre_archivo
                              ? ` · ${material.nombre_archivo}`
                              : ''}
                          </p>
                        </div>
                      </div>
                      {(material.url_externa || material.url_storage || material.url_drive) && (
                        <a
                          href={material.url_externa || material.url_storage || material.url_drive}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700"
                        >
                          <LinkIcon className="h-3.5 w-3.5" />
                          Abrir
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

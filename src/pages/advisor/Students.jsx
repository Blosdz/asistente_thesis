import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  ChevronRight,
  User as UserIcon,
  BookOpen,
  Calendar,
  BadgeCheck,
  GraduationCap,
  Mail,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Modal from '../../components/ui/modal';
import { Select, SelectItem } from '../../components/ui/select';
import {
  obtenerDetalleEstudianteAsesor,
  obtenerEstudiantesAsesor,
  cambiarEstadoRelacion as cambiarEstadoRelacionAPI,
} from '../../services/advisorService';

const DetailField = ({ icon: Icon, label, value, wide = false }) => (
  <div className={`app-dark-card rounded-xl px-3.5 py-2.5 ${wide ? 'sm:col-span-2' : ''}`}>
    <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] opacity-60">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </label>
    <p className="min-h-[20px] break-words text-sm font-semibold leading-5 opacity-95">
      {value || 'No registrado'}
    </p>
  </div>
);

export default function AdvisorStudents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [changingState, setChangingState] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const base = await obtenerEstudiantesAsesor();
        setStudents(base || []);
        setDetails(base || []);
      } catch (error) {
        console.error(error);
        toast.error('No se pudieron cargar los estudiantes.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const detailsMap = useMemo(() => {
    const map = new Map();
    details.forEach((item) => {
      map.set(item.r_estudiante_id, item);
    });
    return map;
  }, [details]);

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.r_nombres || ''} ${student.r_apellidos || ''}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      student.r_carrera?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.r_estado_relacion?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const updateStudentInLists = (updated) => {
    if (!updated?.r_estudiante_id) return;
    setStudents((current) =>
      current.map((item) =>
        item.r_estudiante_id === updated.r_estudiante_id ? { ...item, ...updated } : item,
      ),
    );
    setDetails((current) =>
      current.map((item) =>
        item.r_estudiante_id === updated.r_estudiante_id ? { ...item, ...updated } : item,
      ),
    );
  };

  const openStudentModal = async (student) => {
    setSelectedStudent(student);
    setModalOpen(true);
    setDetailLoading(true);

    try {
      const detail = await obtenerDetalleEstudianteAsesor(student.r_estudiante_id);
      setSelectedStudent(detail || student);
      updateStudentInLists(detail);
    } catch (error) {
      console.error(error);
      toast.error('No se pudo cargar el detalle del estudiante.');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeStudentModal = () => {
    if (changingState) return;
    setModalOpen(false);
    setSelectedStudent(null);
  };

  const cambiarEstadoRelacion = async (nuevoEstado) => {
    if (!nuevoEstado) return;

    const relacionId =
      selectedStudent?.r_relacion_id || selectedStudent?.relacion_id || selectedStudent?.id;

    if (!relacionId) {
      toast.error('No se encontró el ID de la relación.');
      return;
    }

    try {
      setChangingState(true);
      toast.loading(
        nuevoEstado === 'activo'
          ? 'Aceptando estudiante...'
          : 'Rechazando solicitud...',
        { id: 'estado-change' },
      );

      const updated = await cambiarEstadoRelacionAPI(relacionId, nuevoEstado);

      if (nuevoEstado === 'cancelado') {
        setStudents((current) =>
          current.filter((item) => item.r_estudiante_id !== selectedStudent.r_estudiante_id),
        );
        setDetails((current) =>
          current.filter((item) => item.r_estudiante_id !== selectedStudent.r_estudiante_id),
        );
        toast.success('Solicitud rechazada y vínculo eliminado.', {
          id: 'estado-change',
        });
        closeStudentModal();
        return;
      }

      const merged = { ...selectedStudent, ...updated, r_estado_relacion: 'activo' };
      setSelectedStudent(merged);
      updateStudentInLists(merged);

      toast.success('Estudiante aceptado y vinculado a su tesis.', {
        id: 'estado-change',
      });
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'No se pudo cambiar el estado.', {
        id: 'estado-change',
      });
    } finally {
      setChangingState(false);
    }
  };

  const selectedFullName = `${selectedStudent?.r_nombres || ''} ${
    selectedStudent?.r_apellidos || ''
  }`.trim();
  const selectedStatus = selectedStudent?.r_estado_relacion || 'pendiente';
  const selectedMeeting = selectedStudent?.r_reunion_inicio
    ? new Date(selectedStudent.r_reunion_inicio).toLocaleString()
    : 'Sin reuniones';

  return (
  <div className="w-full flex-1 flex flex-col py-10 px-6 text-slate-900">
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

      {loading ? (
        <div className="flex justify-center items-center py-20 text-slate-500 font-medium">
          Cargando estudiantes...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <div className="glass-card rounded-3xl border border-white/60 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 bg-white/50">
              <div className="col-span-4">Estudiante</div>
              <div className="col-span-3">Carrera</div>
              <div className="col-span-2">Estado</div>
              <div className="col-span-2">Última reunión</div>
              <div className="col-span-1 text-right">Detalles</div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="px-6 py-10 text-center text-slate-500">
                No hay estudiantes vinculados todavía.
              </div>
            ) : (
              filteredStudents.map((student) => {
                const detail = detailsMap.get(student.r_estudiante_id);
                const fullName = `${student.r_nombres || ''} ${student.r_apellidos || ''}`.trim();
                return (
                  <div key={student.r_estudiante_id} className="border-t border-white/60">
                    <div className="grid grid-cols-12 gap-4 px-6 py-5 items-center text-sm">
                      <div className="col-span-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-ios-blue/10 text-ios-blue flex items-center justify-center font-bold">
                          {fullName?.[0] || 'E'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {fullName || 'Estudiante'}
                          </p>
                          <p className="text-xs text-slate-500">
                            ID: {student.r_estudiante_id}
                          </p>
                        </div>
                      </div>
                      <div className="col-span-3 text-slate-700">
                        {student.r_carrera || 'No registrada'}
                      </div>
                      <div className="col-span-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase">
                          <BadgeCheck size={14} />
                          {student.r_estado_relacion || 'pendiente'}
                        </span>
                      </div>
                      <div className="col-span-2 text-slate-600 text-sm">
                        {detail?.r_reunion_inicio
                          ? new Date(detail.r_reunion_inicio).toLocaleDateString()
                          : 'Sin reuniones'}
                      </div>
                      <div className="col-span-1 text-right">
                        <button
                          onClick={() => openStudentModal(student)}
                          className="inline-flex items-center gap-1 text-ios-blue font-semibold hover:underline"
                        >
                          Ver
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={closeStudentModal}
        modalWidth="md"
        showDefaultHeader={false}
        showDefaultActions={false}
        contentClassName="!gap-4 !p-4 text-left sm:!p-5"
        closeButtonClassName="!top-4 !right-4"
      >
        {selectedStudent && (
          <div className="mx-auto w-full max-w-xl">
            <div className="flex flex-col gap-4 border-b border-white/35 pb-4">
              <div className="flex items-center gap-4 pr-12">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ios-blue/10 text-xl font-bold text-ios-blue">
                  {selectedFullName?.[0] || 'E'}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-extrabold text-slate-900">
                    {selectedFullName || 'Estudiante'}
                  </h2>
                  <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                    ID: {selectedStudent.r_estudiante_id}
                  </p>
                  <div className="mt-3 grid max-w-[220px] grid-cols-4 gap-2">
                    <span className="h-1.5 rounded-full bg-ios-blue" />
                    <span className="h-1.5 rounded-full bg-emerald-300" />
                    <span className="h-1.5 rounded-full bg-cyan-300" />
                    <span className="h-1.5 rounded-full bg-slate-300" />
                  </div>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-[1fr_180px]">
                <span className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-100 px-3 py-2 text-xs font-bold uppercase text-emerald-700">
                  <BadgeCheck size={14} />
                  {selectedStatus}
                </span>
                <div className="app-dark-card rounded-xl p-2">
                  <Select
                    className="w-full rounded-lg px-3 py-2 text-xs font-bold"
                    value=""
                    onChange={(event) => cambiarEstadoRelacion(event.target.value)}
                    disabled={changingState || detailLoading}
                  >
                    <SelectItem value="" disabled>
                      Acción
                    </SelectItem>
                    <SelectItem value="activo">Aceptar</SelectItem>
                    <SelectItem value="cancelado">Negar</SelectItem>
                  </Select>
                </div>
              </div>
            </div>

            {detailLoading ? (
              <div className="py-8 text-center text-sm font-semibold text-slate-500">
                Cargando detalle...
              </div>
            ) : (
              <form
                className="mt-4 flex flex-col gap-4"
                onSubmit={(event) => event.preventDefault()}
              >
                <section className="grid gap-3 sm:grid-cols-2">
                  <h3 className="sm:col-span-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-600">
                    Información del estudiante
                  </h3>
                  <DetailField icon={UserIcon} label="Nombres" value={selectedStudent.r_nombres} />
                  <DetailField
                    icon={UserIcon}
                    label="Apellidos"
                    value={selectedStudent.r_apellidos}
                  />
                  <DetailField
                    icon={GraduationCap}
                    label="Carrera"
                    value={selectedStudent.r_carrera}
                    wide
                  />
                  <DetailField
                    icon={Mail}
                    label="Correo"
                    value={selectedStudent.r_email || 'No disponible'}
                    wide
                  />
                </section>

                <section className="grid gap-3 sm:grid-cols-2">
                  <h3 className="sm:col-span-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-600">
                    Información académica
                  </h3>
                  <DetailField
                    icon={BookOpen}
                    label="Tesis actual"
                    value={selectedStudent.r_tesis_titulo || 'Sin título registrado'}
                    wide
                  />
                  <DetailField
                    icon={BadgeCheck}
                    label="Estado de tesis"
                    value={selectedStudent.r_tesis_estado}
                  />
                  <DetailField icon={Calendar} label="Última reunión" value={selectedMeeting} />
                </section>
              </form>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

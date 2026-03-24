import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  ChevronRight,
  User as UserIcon,
  BookText,
  Calendar,
  BadgeCheck,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  obtenerEstudiantesAsesor,
  obtenerEstudiantesMisAsesorias,
} from '../../services/advisorService';

export default function AdvisorStudents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const [base, detailData] = await Promise.all([
          obtenerEstudiantesAsesor(),
          obtenerEstudiantesMisAsesorias().catch(() => []),
        ]);
        setStudents(base || []);
        setDetails(detailData || []);
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
                          onClick={() =>
                            navigate(`/advisor/students/${student.r_estudiante_id}`)
                          }
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
    </div>
  );
}

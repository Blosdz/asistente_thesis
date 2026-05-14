import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Mail,
  User,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Select, SelectItem } from '../../components/ui/select';
import { toast } from 'react-hot-toast';
import {
  obtenerDetalleEstudianteAsesor,
  cambiarEstadoRelacion as cambiarEstadoRelacionAPI,
} from '../../services/advisorService';

const DetailField = ({ icon: Icon, label, value, multiline = false }) => (
  <div className="app-dark-card rounded-xl px-3.5 py-2.5">
    <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] opacity-60">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </label>
    <p
      className={[
        'break-words text-sm font-semibold leading-5 opacity-95',
        multiline ? 'min-h-[70px]' : 'min-h-[20px]',
      ].join(' ')}
    >
      {value || 'No registrado'}
    </p>
  </div>
);

const AdvisorStudentDetail = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [detail, setDetail] = useState(null);
  const [changingState, setChangingState] = useState(false);
  const [relationId, setRelationId] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const selected = await obtenerDetalleEstudianteAsesor(studentId);

        setStudent(selected || null);
        setDetail(selected || null);
        setRelationId(selected?.r_relacion_id || selected?.relacion_id || null);
      } catch (error) {
        console.error(error);
        toast.error('No se pudo cargar el detalle del estudiante.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [studentId]);

  const cambiarEstadoRelacion = async (nuevoEstado) => {
    if (!relationId) {
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

      const updated = await cambiarEstadoRelacionAPI(relationId, nuevoEstado);

      if (nuevoEstado === 'cancelado') {
        toast.success('Solicitud rechazada y vínculo eliminado.', {
          id: 'estado-change',
        });
        navigate('/advisor/students');
        return;
      }

      setStudent(updated || ((prev) => ({ ...prev, r_estado_relacion: nuevoEstado })));
      setDetail(updated || ((prev) => ({ ...prev, r_estado_relacion: nuevoEstado })));

      toast.success('Estudiante aceptado y vinculado a su tesis.', {
        id: 'estado-change',
      });
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      toast.error(`Error: ${err.message || 'No se pudo cambiar el estado.'}`, {
        id: 'estado-change',
      });
    } finally {
      setChangingState(false);
    }
  };

  const fullName = useMemo(() => {
    return `${student?.r_nombres || ''} ${student?.r_apellidos || ''}`.trim();
  }, [student]);

  const estadoRelacion =
    detail?.r_estado_relacion || student?.r_estado_relacion || 'pendiente';
  const ultimaReunion = detail?.r_reunion_inicio
    ? new Date(detail.r_reunion_inicio).toLocaleString()
    : 'Sin reuniones';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-ios-blue border-t-transparent shadow-md"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="glass-card rounded-3xl p-8 text-center text-slate-600">
        <p>No se encontró el estudiante.</p>
        <Button
          onClick={() => navigate('/advisor/students')}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-ios-blue text-white font-bold"
        >
          <ArrowLeft size={16} /> Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-5 px-4 py-8 text-slate-900">
      <Button
        variant="link"
        onClick={() => navigate('/advisor/students')}
        className="w-full max-w-xl justify-start gap-2 text-slate-500 hover:text-slate-800 font-medium"
      >
        <ArrowLeft size={18} /> Volver a estudiantes
      </Button>

      <div className="glass-card w-full max-w-xl rounded-[26px] p-4 md:p-5">
        <div className="flex flex-col gap-4 border-b border-white/35 pb-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ios-blue/10 text-xl font-bold text-ios-blue">
              {fullName?.[0] || 'E'}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-extrabold text-slate-900">
                {fullName || 'Estudiante'}
              </h1>
              <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                ID: {student.r_estudiante_id}
              </p>
              <div className="mt-3 grid max-w-[240px] grid-cols-4 gap-2">
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
              {estadoRelacion}
            </span>
            {relationId && (
              <div className="app-dark-card rounded-xl p-2">
                <Select
                  className="w-full rounded-lg px-3 py-2 text-xs font-bold"
                  value=""
                  onChange={(e) => cambiarEstadoRelacion(e.target.value)}
                  disabled={changingState}
                >
                  <SelectItem value="" disabled>
                    Seleccionar
                  </SelectItem>
                  <SelectItem value="activo">Aceptar</SelectItem>
                  <SelectItem value="cancelado">Negar</SelectItem>
                </Select>
              </div>
            )}
          </div>
        </div>

        <form
          className="mt-4 flex flex-col gap-4"
          onSubmit={(event) => event.preventDefault()}
        >
          <section className="grid gap-3 sm:grid-cols-2">
            <h2 className="sm:col-span-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-600">
              Información del estudiante
            </h2>
            <DetailField icon={User} label="Nombres" value={student.r_nombres} />
            <DetailField icon={User} label="Apellidos" value={student.r_apellidos} />
            <div className="sm:col-span-2">
              <DetailField icon={GraduationCap} label="Carrera" value={student.r_carrera} />
            </div>
            <div className="sm:col-span-2">
              <DetailField icon={Mail} label="Correo" value={student.r_email || 'No disponible'} />
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <h2 className="sm:col-span-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-600">
              Información académica
            </h2>
            <div className="sm:col-span-2">
              <DetailField
                icon={BookOpen}
                label="Tesis actual"
                value={detail?.r_tesis_titulo || 'Sin título registrado'}
                multiline
              />
            </div>
            <DetailField icon={BadgeCheck} label="Estado de tesis" value={detail?.r_tesis_estado} />
            <DetailField icon={Calendar} label="Última reunión" value={ultimaReunion} />
          </section>
        </form>
      </div>
    </div>
  );
};

export default AdvisorStudentDetail;

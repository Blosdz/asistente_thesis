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
  obtenerEstudiantesAsesor,
  obtenerEstudiantesMisAsesorias,
  cambiarEstadoRelacion as cambiarEstadoRelacionAPI,
} from '../../services/advisorService';

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
        

        
        const [base, details] = await Promise.all([
          obtenerEstudiantesAsesor(),
          obtenerEstudiantesMisAsesorias().catch(() => []),
        ]);

        const selected = base.find((item) => item.r_estudiante_id === studentId);
        const detailSelected = details.find(
          (item) => item.r_estudiante_id === studentId,
        );

        setStudent(selected || null);
        setDetail(detailSelected || null);
        
        
        // Guardar el ID de la relación - buscar entre todos los campos
        if (selected) {
          // Buscar el campo que sea el ID de la relación (probablemente r_id o similar)
          let idRelacion = null;
          
          // Prioridad: buscar campos con 'relacion' en el nombre
          if (selected.r_relacion_id) idRelacion = selected.r_relacion_id;
          else if (selected.relacion_id) idRelacion = selected.relacion_id;
          else if (selected.id) idRelacion = selected.id;
          else if (selected.r_id) idRelacion = selected.r_id;
          
          // Si aún no encuentra, buscar el primer campo UUID disponible que sea 'id'
          if (!idRelacion) {
            for (const [key, value] of Object.entries(selected)) {
              if ((key === 'id' || key.endsWith('_id')) && typeof value === 'string' && value.length === 36) {
                idRelacion = value;
                console.log(`Usando campo: ${key}`);
                break;
              }
            }
          }
          
          if (idRelacion) {
            setRelationId(idRelacion);
            console.log('✓ Relation ID encontrado:', idRelacion);
          } else {
            console.warn('✗ No se encontró ID de relación válido');
            console.table(selected);
          }
        }
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
    console.log('RelationId actual:', relationId);
    console.log('Nuevo estado:', nuevoEstado);
    
    if (!relationId) {
      toast.error('No se encontró el ID de la relación. Verifica la consola para debug.');
      return;
    }

    try {
      setChangingState(true);
      toast.loading('Actualizando estado...', { id: 'estado-change' });

      await cambiarEstadoRelacionAPI(relationId, nuevoEstado);

      // Actualizar estado local optimistamente
      setStudent((prev) => ({
        ...prev,
        r_estado_relacion: nuevoEstado,
      }));

      toast.success(
        `Estado cambiado a "${nuevoEstado}" correctamente.`,
        { id: 'estado-change' },
      );

      // Recargar datos después de 1 segundo
      setTimeout(() => {
        window.location.reload();
      }, 1000);
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
    <div className="w-full flex flex-col gap-6 py-10 px-6 text-slate-900">
      <Button
        variant="link"
        onClick={() => navigate('/advisor/students')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium"
      >
        <ArrowLeft size={18} /> Volver a estudiantes
      </Button>

      <div className="glass-card rounded-3xl p-8 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-ios-blue/10 text-ios-blue flex items-center justify-center font-bold text-2xl">
              {fullName?.[0] || 'E'}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">
                {fullName || 'Estudiante'}
              </h1>
              <p className="text-sm text-slate-500">ID: {student.r_estudiante_id}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase">
              <BadgeCheck size={14} />
              {detail?.r_estado_relacion || student.r_estado_relacion || 'pendiente'}
            </span>
            {student.r_estado_relacion === 'pendiente' && (
              <Select
                className="py-2 pl-3 pr-8 text-xs font-bold text-slate-700 w-48"
                value={student.r_estado_relacion || 'pendiente'}
                onChange={(e) => cambiarEstadoRelacion(e.target.value)}
                disabled={changingState}
              >
                <SelectItem value="pendiente" disabled>
                  Cambiar estado...
                </SelectItem>
                <SelectItem value="activo">
                  ✓ Aceptar estudiante
                </SelectItem>
                <SelectItem value="cancelado">
                  ✗ Rechazar
                </SelectItem>
              </Select>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/60 border border-white/60 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <GraduationCap className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">Carrera</p>
                <p className="font-semibold text-slate-800">
                  {student.r_carrera || 'No registrada'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/60 border border-white/60 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">Correo</p>
                <p className="font-semibold text-slate-800">
                  {student.r_email || 'No disponible'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/60 border border-white/60 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">Estado relación</p>
                <p className="font-semibold text-slate-800">
                  {detail?.r_estado_relacion || student.r_estado_relacion || 'pendiente'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/60 border border-white/60 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">Tesis actual</p>
                <p className="font-semibold text-slate-800">
                  {detail?.r_tesis_titulo || 'Sin título registrado'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/60 border border-white/60 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">Última reunión</p>
                <p className="font-semibold text-slate-800">
                  {detail?.r_reunion_inicio
                    ? new Date(detail.r_reunion_inicio).toLocaleString()
                    : 'Sin reuniones'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisorStudentDetail;

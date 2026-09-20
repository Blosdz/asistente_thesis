import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
import { ViewToolsContext } from '../components/navigation/viewToolsContext';
import './AcademicShell.css';

const sections = {
  student: [
    ['dashboard', 'Resumen académico', [['my-thesis', 'Abrir mi tesis'], ['citas', 'Mis citas']]],
    ['my-thesis', 'Espacio de trabajo', []],
    ['documents', 'Biblioteca de documentos', [['my-thesis', 'Mi tesis']]],
    ['asesorias', 'Asesorías', [['asesorias', 'Mis asesores'], ['citas', 'Mis citas'], ['services/advisors', 'Buscar asesor']]],
    ['citas', 'Mis citas', [['asesorias', 'Mis asesores'], ['citas', 'Agenda']]],
    ['cursos', 'Aula virtual', [['my-thesis', 'Volver a mi tesis']]],
    ['services', 'Presustentación', [['services', 'Servicios'], ['services/advisors', 'Asesores'], ['services/book', 'Agendar sesión']]],
    ['payments', 'Pagos y facturación', [['payments', 'Mis pagos'], ['planes', 'Planes']]],
    ['planes', 'Planes', [['payments', 'Mis pagos'], ['planes', 'Planes disponibles']]],
    ['statistics', 'Colmena', [['my-thesis', 'Volver a mi tesis']]],
  ],
  advisor: [
    ['dashboard', 'Resumen de asesorías', [['students', 'Estudiantes'], ['calendar', 'Ver agenda']]],
    ['students', 'Seguimiento de estudiantes', [['students', 'Mis estudiantes'], ['thesis', 'Revisar tesis']]],
    ['calendar', 'Agenda de asesorías', [['calendar', 'Calendario'], ['students', 'Estudiantes']]],
    ['thesis', 'Revisión de tesis', []],
    ['cursos', 'Aula virtual', [['students', 'Mis estudiantes']]],
  ],
};

export function AcademicBrand({ role }) {
  return <div className="academic-brand">
    <span className="academic-brand-mark"><BookOpen size={18} /></span>
    <div><strong>AppThesis</strong><small>{role === 'student' ? 'Estudiante' : 'Profesor'}</small></div>
  </div>;
}

export default function AcademicFrame({ role }) {
  const { pathname } = useLocation();
  const [toolsTarget, setToolsTarget] = useState(null);
  const segment = pathname.split('/')[2];
  const section = sections[role].find(([path]) => path === segment);
  const title = section?.[1] || (segment === 'profile' ? 'Mi perfil' : 'Notificaciones');
  const workspace = (role === 'student' && segment === 'my-thesis') || (role === 'advisor' && segment === 'thesis');

  return <ViewToolsContext.Provider value={toolsTarget}>
    <div className="academic-context-bar">
      <div className="academic-tools-slot" ref={setToolsTarget} />
      <div className="academic-context-default">
        <div className="academic-context-title"><BookOpen size={14} /><ChevronRight size={12} /><span>{title}</span></div>
        <nav aria-label="Herramientas de la sección">
          {(section?.[2] || []).map(([path, label]) => <NavLink key={path} end to={`/${role}/${path}`}>{label}</NavLink>)}
        </nav>
      </div>
    </div>
    <main id="academic-content" tabIndex={-1} className={`academic-content ${workspace ? 'academic-content-workspace' : ''}`}>
      <Outlet />
    </main>
  </ViewToolsContext.Provider>;
}

import { apiRequest } from './client';

export const cursosApi = {
  misCursosAsesor() {
    return apiRequest('/cursos/asesor/mis-cursos');
  },

  crearCursoAsesor(payload: unknown) {
    return apiRequest('/cursos/asesor', {
      method: 'POST',
      body: payload,
    });
  },

  actualizarCursoAsesor(cursoId: string, payload: unknown) {
    return apiRequest(`/cursos/asesor/${cursoId}`, {
      method: 'PATCH',
      body: payload,
    });
  },

  materialesCursoAsesor(cursoId: string) {
    return apiRequest(`/cursos/asesor/${cursoId}/materiales`);
  },

  crearMaterialCursoAsesor(cursoId: string, payload: unknown) {
    return apiRequest(`/cursos/asesor/${cursoId}/materiales`, {
      method: 'POST',
      body: payload,
    });
  },

  misCursosEstudiante() {
    return apiRequest('/cursos/mis-cursos');
  },

  cursosDeAsesor(asesorId: string) {
    return apiRequest(`/cursos/asesores/${asesorId}`);
  },

  comprarCurso(cursoId: string) {
    return apiRequest(`/cursos/${cursoId}/comprar`, {
      method: 'POST',
    });
  },

  detalleCursoEstudiante(cursoId: string) {
    return apiRequest(`/cursos/${cursoId}`);
  },
};

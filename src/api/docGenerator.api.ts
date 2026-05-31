import { apiRequest } from './client';

export const docGeneratorApi = {
  getThesis(tesisId: string) {
    return apiRequest(`/ai/tesis/${tesisId}`, { auth: false });
  },

  listReferences(tesisId: string) {
    return apiRequest(`/ai/tesis/${tesisId}/referencias`, { auth: false });
  },

  createReference(tesisId: string, payload: unknown) {
    return apiRequest(`/ai/tesis/${tesisId}/referencias`, {
      method: 'POST',
      body: payload,
      auth: false,
    });
  },

  updateReference(referenceId: string, payload: unknown) {
    return apiRequest(`/ai/tesis/referencias/${referenceId}`, {
      method: 'PATCH',
      body: payload,
      auth: false,
    });
  },

  deleteReference(referenceId: string) {
    return apiRequest(`/ai/tesis/referencias/${referenceId}`, {
      method: 'DELETE',
      auth: false,
    });
  },

  listIndex(tesisId: string) {
    return apiRequest(`/ai/tesis/${tesisId}/indice`, { auth: false });
  },

  createIndexSection(tesisId: string, payload: unknown) {
    return apiRequest(`/ai/tesis/${tesisId}/indice`, {
      method: 'POST',
      body: payload,
      auth: false,
    });
  },

  replaceIndex(tesisId: string, payload: unknown) {
    return apiRequest(`/ai/tesis/${tesisId}/indice`, {
      method: 'PUT',
      body: payload,
      auth: false,
    });
  },

  updateIndexSection(tesisId: string, sectionId: string, payload: unknown) {
    return apiRequest(`/ai/tesis/${tesisId}/indice/${sectionId}`, {
      method: 'PATCH',
      body: payload,
      auth: false,
    });
  },

  deleteIndexSection(tesisId: string, sectionId: string) {
    return apiRequest(`/ai/tesis/${tesisId}/indice/${sectionId}`, {
      method: 'DELETE',
      auth: false,
    });
  },

  generateDocx(tesisId: string) {
    return apiRequest(`/ai/tesis/${tesisId}/documentos/docx`, {
      method: 'POST',
      auth: false,
    });
  },
};

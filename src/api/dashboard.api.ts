import { apiRequest } from './client';

export const dashboardApi = {
  estudiante() {
    return apiRequest('/dashboard/estudiante');
  },
};

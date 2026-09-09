import { api } from '../../../shared/services/api';
import type { DashboardDTO } from '../../../shared/types/Dashboard';

export const DashboardService = {
  get: async (competence: string, months = 13): Promise<DashboardDTO> =>
    (await api.get('/dashboard', { params: { competence, months } })).data
};

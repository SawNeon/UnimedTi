import { api } from '../../../shared/services/api';
import type { ContractsDashboardDTO, PrintersDashboardDTO } from '../../../shared/types/Dashboard';

export const DashboardService = {
  contracts: async (competence: string, months = 13): Promise<ContractsDashboardDTO> =>
    (await api.get('/dashboard/contracts', { params: { competence, months } })).data,

  printers: async (competence: string, months = 13): Promise<PrintersDashboardDTO> =>
    (await api.get('/dashboard/printers', { params: { competence, months } })).data
};

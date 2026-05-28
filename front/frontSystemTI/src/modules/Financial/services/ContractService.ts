import { api } from '../../../shared/services/api';
import type { ContractDTO } from '../types/Contract';

export const ContractService = {
    create: async (contract: ContractDTO) => {
        const reponse = await api.post('/contracts', contract);
        return reponse.data;
    },
    getAll: async (page: number, size: number, month: string) => {
        const response = await api.get(`/contracts?page=${page}&size=${size}&month=${month}`);
        return response.data;
    },
}
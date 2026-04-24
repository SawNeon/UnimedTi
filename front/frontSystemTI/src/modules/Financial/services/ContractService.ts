import { api } from '../../../shared/services/api';
import type { ContractDTO } from '../types/Contract';

export const ContractService = {
    create: async (contract: ContractDTO) => {
        const reponse = await api.post('/contracts', contract);
        return reponse.data;
    },
    getAll: async (page: number, size: number) => {
        const response = await api.get(`/contracts?page=${page}&size=${size}`);
        return response.data;
    },
}
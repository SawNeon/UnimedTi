import { api } from '../../../shared/services/api';
import type { ContractDTO, ContractMonthResponse } from '../types/Contract';

export const ContractService = {
    create: async (contract: ContractDTO) => {
        const response = await api.post<ContractDTO>('/contracts', contract);
        return response.data;
    },
    getAll: async (page: number, size: number, month: string) => {
        const response = await api.get<{
            content: ContractMonthResponse[];
            totalPages: number;
        }>(`/contracts?page=${page}&size=${size}&month=${month}`);
        return response.data;
    },
}

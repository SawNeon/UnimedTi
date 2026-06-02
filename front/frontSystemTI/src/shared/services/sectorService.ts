import { api } from '../services/api';
import type { SectorDTO } from '../types/Sector';

export const SectorService = { 
    create: async (sector: SectorDTO) => {
        const reponse = await api.post('/sectors', sector);
        return reponse.data;
    },
    getAll: async () => {
        const response = await api.get('/sectors');
        return response.data;
    },
    getByContract: async (contractId: string) => {
        const response = await api.get(`/sectors/contract/${contractId}`);
        return response.data;
    },
}
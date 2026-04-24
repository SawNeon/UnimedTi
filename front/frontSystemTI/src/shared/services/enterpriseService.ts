import { api } from '../services/api';
import type { EnterpriseDTO } from '../types/Enterprise';

export const EnterpriseService = { 
    create: async (enterprise: EnterpriseDTO) => {
        const response = await api.post('/enterprises', enterprise);
        return response.data;
    },
    getAll: async () => {
        const response = await api.get('/enterprises');
        return response.data;
    },
}

import { api } from '../../../shared/services/api';
import type { AssetDTO} from '../types/Asset';

export const AssetService = {
    create: async (asset: AssetDTO) => {
        const reponse = await api.post('/assets', asset);
        return reponse.data;
    },
    getAll: async () => {
        const response = await api.get('/assets');
        return response.data;
    },
    delete: async (id: string) => {
        await api.delete(`/assets/${id}`);
    },
    update: async (id: string, asset: AssetDTO) => {
        const reponse = await api.put(`/assets/${id}`, asset);
        return reponse.data;
    },
    returnAsset: async (id: string) => {
        await api.patch(`/assets/${id}/movements/return`);
        return true;
    }
}
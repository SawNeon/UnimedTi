import { api } from '../../../shared/services/api';
import type { AssetDTO} from '../types/Asset';

export const AssetService = {
    create: async (asset: AssetDTO) => {
        const reponse = await api.post('/assets', asset);
        return reponse.data;
    }, 
}
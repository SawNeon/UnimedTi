import { api } from './api';
import type { MeDTO } from '../types/Access';

export const MeService = {
  get: async (): Promise<MeDTO> => {
    const response = await api.get<MeDTO>('/users/me');
    return response.data;
  }
};

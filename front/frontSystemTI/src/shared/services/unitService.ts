import { api } from './api';
import type { OperationalUnitDTO } from '../types/OperationalUnit';

export const UnitService = {
  getAll: async (): Promise<OperationalUnitDTO[]> => {
    const response = await api.get<OperationalUnitDTO[]>('/units');
    return response.data;
  }
};

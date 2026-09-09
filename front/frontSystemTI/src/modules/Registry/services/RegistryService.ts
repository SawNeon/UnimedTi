import { api } from '../../../shared/services/api';
import type {
  EnterpriseDTO,
  EnterprisePayload,
  SectorDTO,
  SectorPayload
} from '../../../shared/types/Registry';

export const EnterpriseService = {
  getAll: async (): Promise<EnterpriseDTO[]> => (await api.get('/enterprises')).data,
  create: async (payload: EnterprisePayload): Promise<EnterpriseDTO> =>
    (await api.post('/enterprises', payload)).data,
  update: async (id: string, payload: EnterprisePayload): Promise<EnterpriseDTO> =>
    (await api.put(`/enterprises/${id}`, payload)).data,
  /** Recusado pelo backend quando houver setor ou contrato vinculado. */
  remove: async (id: string): Promise<void> => {
    await api.delete(`/enterprises/${id}`);
  }
};

export const SectorService = {
  getAll: async (): Promise<SectorDTO[]> => (await api.get('/sectors')).data,
  create: async (payload: SectorPayload): Promise<SectorDTO> =>
    (await api.post('/sectors', payload)).data,
  update: async (id: string, payload: SectorPayload): Promise<SectorDTO> =>
    (await api.put(`/sectors/${id}`, payload)).data,
  /** Recusado quando houver movimentação, pedido ou rateio vinculado. */
  remove: async (id: string): Promise<void> => {
    await api.delete(`/sectors/${id}`);
  }
};

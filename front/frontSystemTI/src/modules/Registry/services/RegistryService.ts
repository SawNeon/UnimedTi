import { api } from '../../../shared/services/api';
import type {
  EnterpriseDTO,
  EnterprisePayload,
  SectorDTO,
  SectorPayload,
  SupplierDTO,
  SupplierPayload
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

export const SupplierService = {
  getAll: async (): Promise<SupplierDTO[]> => (await api.get('/suppliers')).data,
  create: async (payload: SupplierPayload): Promise<SupplierDTO> =>
    (await api.post('/suppliers', payload)).data,
  update: async (id: string, payload: SupplierPayload): Promise<SupplierDTO> =>
    (await api.put(`/suppliers/${id}`, payload)).data,
  /** Recusado quando houver contrato vinculado; nesse caso, desative. */
  remove: async (id: string): Promise<void> => {
    await api.delete(`/suppliers/${id}`);
  }
};

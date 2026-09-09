import { api } from '../../../shared/services/api';
import type { AccessProfileDTO, UserDTO } from '../../../shared/types/Access';

export interface UserCreatePayload {
  login: string;
  password: string;
  name: string;
  email: string;
  profileId: string;
}

export interface UserUpdatePayload {
  name: string;
  email: string;
  profileId: string;
}

export const UserService = {
  getAll: async (): Promise<UserDTO[]> => {
    const response = await api.get<UserDTO[]>('/users');
    return response.data;
  },

  getProfiles: async (): Promise<AccessProfileDTO[]> => {
    const response = await api.get<AccessProfileDTO[]>('/users/profiles');
    return response.data;
  },

  create: async (payload: UserCreatePayload): Promise<UserDTO> => {
    const response = await api.post<UserDTO>('/users', payload);
    return response.data;
  },

  update: async (id: string, payload: UserUpdatePayload): Promise<UserDTO> => {
    const response = await api.put<UserDTO>(`/users/${id}`, payload);
    return response.data;
  },

  /** Desativa em vez de excluir: preserva a rastreabilidade do historico. */
  setActive: async (id: string, active: boolean): Promise<UserDTO> => {
    const response = await api.patch<UserDTO>(`/users/${id}/active`, null, { params: { active } });
    return response.data;
  },

  changePassword: async (id: string, password: string): Promise<void> => {
    await api.put(`/users/${id}/password`, { password });
  }
};

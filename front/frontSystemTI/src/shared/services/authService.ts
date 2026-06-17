import { api } from './api';
import { clearAuthToken, getAuthToken, notifyAuthRequired, setAuthToken } from './authSession';

interface LoginRequest {
  login: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

export const AuthService = {
  login: async (credentials: LoginRequest) => {

    const response = await api.post<LoginResponse>('/auth/login', credentials);

    const { token } = response.data;
    if (token) {
      setAuthToken(token);
    }

    return response.data;
  },

  logout: () => {
    clearAuthToken();
    notifyAuthRequired();
  },

  isAuthenticated: () => {
    return !!getAuthToken();
  }
};

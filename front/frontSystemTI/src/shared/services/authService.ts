import { api } from './api';

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
      localStorage.setItem('token', token);
    }
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};
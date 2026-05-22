import api from './api';
import { LoginCredentials, SignupCredentials, AuthResponse, User } from '@/types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/backend/auth/login', credentials);
    return response.data;
  },

  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    const response = await api.post('/backend/auth/signup', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/backend/auth/logout');
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/backend/auth/profile');
    return response.data.data.user;
  },

  checkAuth: async (): Promise<User> => {
    const response = await api.get('/backend/auth/check-auth', {
      timeout: 5000,
    });
    return response.data.data.user;
  },

  checkAvailability: async (field: 'email' | 'username', value: string): Promise<boolean> => {
    const response = await api.get('/backend/auth/check-availability', {
      params: { [field]: value },
    });
    return response.data.data.available;
  },
};
import api from './api';
import { LoginFormData, RegisterFormData } from '../types';

export const authService = {
  login: async (data: LoginFormData) => {
    const response = await api.post('/auth/login/', data);
    return response.data;
  },

  register: async (data: RegisterFormData) => {
    const response = await api.post('/auth/register/', data);
    return response.data;
  },

  logout: async (refreshToken: string) => {
    const response = await api.post('/auth/logout/', { refresh: refreshToken });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },

  updateProfile: async (data: Partial<{ first_name: string; last_name: string }>) => {
    const response = await api.patch('/auth/profile/', data);
    return response.data;
  },
};

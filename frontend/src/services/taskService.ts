import api from './api';
import { TaskFormData } from '../types';

export const taskService = {
  getTasks: async (params?: { project?: string; status?: string; search?: string; page?: number }) => {
    const response = await api.get('/tasks/', { params });
    return response.data;
  },

  getTask: async (id: string) => {
    const response = await api.get(`/tasks/${id}/`);
    return response.data;
  },

  createTask: async (data: TaskFormData) => {
    const response = await api.post('/tasks/', data);
    return response.data;
  },

  updateTask: async (id: string, data: Partial<TaskFormData>) => {
    const response = await api.patch(`/tasks/${id}/`, data);
    return response.data;
  },

  deleteTask: async (id: string) => {
    const response = await api.delete(`/tasks/${id}/`);
    return response.data;
  },
};

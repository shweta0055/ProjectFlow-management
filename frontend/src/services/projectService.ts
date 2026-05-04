import api from './api';
import { ProjectFormData } from '../types';

export const projectService = {
  getProjects: async (params?: { status?: string; search?: string; page?: number }) => {
    const response = await api.get('/projects/', { params });
    return response.data;
  },

  getProject: async (id: string) => {
    const response = await api.get(`/projects/${id}/`);
    return response.data;
  },

  createProject: async (data: ProjectFormData) => {
    const response = await api.post('/projects/', data);
    return response.data;
  },

  updateProject: async (id: string, data: Partial<ProjectFormData>) => {
    const response = await api.patch(`/projects/${id}/`, data);
    return response.data;
  },

  deleteProject: async (id: string) => {
    const response = await api.delete(`/projects/${id}/`);
    return response.data;
  },
};

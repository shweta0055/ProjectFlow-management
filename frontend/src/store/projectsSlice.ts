import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Project, ProjectFormData } from '../types';
import { projectService } from '../services/projectService';
// import { Project, ProjectFormData } from '../../types';
// import { projectService } from '../../services/projectService';

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  count: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  currentProject: null,
  count: 0,
  isLoading: false,
  error: null,
};

export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async (params: { status?: string; search?: string; page?: number } = {}, { rejectWithValue }) => {
    try {
      return await projectService.getProjects(params);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch projects');
    }
  }
);

export const fetchProject = createAsyncThunk('projects/fetchOne', async (id: string, { rejectWithValue }) => {
  try {
    return await projectService.getProject(id);
  } catch (err: unknown) {
    const error = err as { response?: { data?: { detail?: string } } };
    return rejectWithValue(error.response?.data?.detail || 'Project not found');
  }
});

export const createProject = createAsyncThunk('projects/create', async (data: ProjectFormData, { rejectWithValue }) => {
  try {
    return await projectService.createProject(data);
  } catch (err: unknown) {
    const error = err as { response?: { data?: Record<string, string[]> } };
    const errData = error.response?.data;
    if (errData) {
      const messages = Object.entries(errData).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ');
      return rejectWithValue(messages);
    }
    return rejectWithValue('Failed to create project');
  }
});

export const updateProject = createAsyncThunk(
  'projects/update',
  async ({ id, data }: { id: string; data: Partial<ProjectFormData> }, { rejectWithValue }) => {
    try {
      return await projectService.updateProject(id, data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: Record<string, string[]> } };
      return rejectWithValue(error.response?.data || 'Failed to update project');
    }
  }
);

export const deleteProject = createAsyncThunk('projects/delete', async (id: string, { rejectWithValue }) => {
  try {
    await projectService.deleteProject(id);
    return id;
  } catch (err: unknown) {
    return rejectWithValue('Failed to delete project');
  }
});

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearProjectError: (state) => { state.error = null; },
    clearCurrentProject: (state) => { state.currentProject = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload.results;
        state.count = action.payload.count;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProject.pending, (state) => { state.isLoading = true; })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.unshift(action.payload);
        state.count += 1;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        const idx = state.projects.findIndex(p => p.id === action.payload.id);
        if (idx !== -1) state.projects[idx] = action.payload;
        if (state.currentProject?.id === action.payload.id) state.currentProject = action.payload;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(p => p.id !== action.payload);
        state.count -= 1;
      });
  },
});

export const { clearProjectError, clearCurrentProject } = projectsSlice.actions;
export default projectsSlice.reducer;

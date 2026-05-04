import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Task, TaskFormData } from '../types';
import { taskService } from '../services/taskService';
// import { Task, TaskFormData } from '../../types';
// import { taskService } from '../../services/taskService';

interface TasksState {
  tasks: Task[];
  count: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  count: 0,
  isLoading: false,
  error: null,
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (params: { project?: string; status?: string; search?: string; page?: number } = {}, { rejectWithValue }) => {
    try {
      return await taskService.getTasks(params);
    } catch {
      return rejectWithValue('Failed to fetch tasks');
    }
  }
);

export const createTask = createAsyncThunk('tasks/create', async (data: TaskFormData, { rejectWithValue }) => {
  try {
    return await taskService.createTask(data);
  } catch (err: unknown) {
    const error = err as { response?: { data?: Record<string, string[]> } };
    const errData = error.response?.data;
    if (errData) {
      const messages = Object.entries(errData).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ');
      return rejectWithValue(messages);
    }
    return rejectWithValue('Failed to create task');
  }
});

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, data }: { id: string; data: Partial<TaskFormData> }, { rejectWithValue }) => {
    try {
      return await taskService.updateTask(id, data);
    } catch {
      return rejectWithValue('Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk('tasks/delete', async (id: string, { rejectWithValue }) => {
  try {
    await taskService.deleteTask(id);
    return id;
  } catch {
    return rejectWithValue('Failed to delete task');
  }
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTaskError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload.results;
        state.count = action.payload.count;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
        state.count += 1;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex(t => t.id === action.payload.id);
        if (idx !== -1) state.tasks[idx] = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
        state.count -= 1;
      });
  },
});

export const { clearTaskError } = tasksSlice.actions;
export default tasksSlice.reducer;

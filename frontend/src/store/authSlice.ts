import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, LoginFormData, RegisterFormData } from '../types';
import { authService } from '../services/authService';

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,
  error: null,
};

export const loginUser = createAsyncThunk('auth/login', async (data: LoginFormData, { rejectWithValue }) => {
  try {
    return await authService.login(data);
  } catch (err: unknown) {
    const error = err as { response?: { data?: { detail?: string; non_field_errors?: string[] } }; message?: string };
    const detail =
      error.response?.data?.detail ||
      error.response?.data?.non_field_errors?.[0] ||
      error.message ||
      'Login failed. Please check your credentials.';
    return rejectWithValue(detail);
  }
});

export const registerUser = createAsyncThunk('auth/register', async (data: RegisterFormData, { rejectWithValue }) => {
  try {
    return await authService.register(data);
  } catch (err: unknown) {
    const error = err as { response?: { data?: Record<string, unknown> }; message?: string };
    const errData = error.response?.data;
    if (errData) {
      const messages = Object.entries(errData)
        .map(([k, v]) => {
          const val = Array.isArray(v) ? v.join(', ') : String(v);
          return k === 'non_field_errors' ? val : `${k}: ${val}`;
        })
        .join(' | ');
      return rejectWithValue(messages);
    }
    return rejectWithValue(error.message || 'Cannot reach backend. Is it running on port 8000?');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { getState }) => {
  try {
    const state = getState() as { auth: AuthState };
    const refreshToken = state.auth.refreshToken;
    if (refreshToken) await authService.logout(refreshToken);
  } catch {
    // Ignore logout errors
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    updateUser: (state, action: PayloadAction<AuthState['user']>) => { state.user = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.access;
        state.refreshToken = action.payload.refresh;
        localStorage.setItem('access_token', action.payload.access);
        localStorage.setItem('refresh_token', action.payload.refresh);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(registerUser.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.access;
        state.refreshToken = action.payload.refresh;
        localStorage.setItem('access_token', action.payload.access);
        localStorage.setItem('refresh_token', action.payload.refresh);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      });
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
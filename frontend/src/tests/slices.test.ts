import authReducer, { clearError, updateUser } from '../store/authSlice';
import projectsReducer, { clearProjectError, clearCurrentProject } from '../store/projectsSlice';
import tasksReducer, { clearTaskError } from '../store/tasksSlice';

// --- Auth slice tests ---
describe('authSlice', () => {
  const initialState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

  it('should return initial state', () => {
    expect(authReducer(undefined, { type: '@@INIT' })).toMatchObject({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it('should clear error', () => {
    const stateWithError = { ...initialState, error: 'Some error' };
    const result = authReducer(stateWithError, clearError());
    expect(result.error).toBeNull();
  });

  it('should update user', () => {
    const user = { id: '1', email: 'test@example.com', first_name: 'Test', last_name: 'User', created_at: '' };
    const result = authReducer(initialState, updateUser(user));
    expect(result.user).toEqual(user);
  });

  it('should set isLoading on loginUser.pending', () => {
    const action = { type: 'auth/login/pending' };
    const result = authReducer(initialState, action);
    expect(result.isLoading).toBe(true);
  });

  it('should set error on loginUser.rejected', () => {
    const action = { type: 'auth/login/rejected', payload: 'Invalid credentials' };
    const result = authReducer(initialState, action);
    expect(result.error).toBe('Invalid credentials');
    expect(result.isLoading).toBe(false);
  });

  it('should set authenticated on loginUser.fulfilled', () => {
    const action = {
      type: 'auth/login/fulfilled',
      payload: {
        user: { id: '1', email: 'a@b.com', first_name: '', last_name: '', created_at: '' },
        access: 'access-token',
        refresh: 'refresh-token',
      },
    };
    const result = authReducer(initialState, action);
    expect(result.isAuthenticated).toBe(true);
    expect(result.accessToken).toBe('access-token');
    expect(result.user?.email).toBe('a@b.com');
  });

  it('should clear state on logoutUser.fulfilled', () => {
    const loggedInState = {
      ...initialState,
      isAuthenticated: true,
      accessToken: 'token',
      user: { id: '1', email: 'x@y.com', first_name: '', last_name: '', created_at: '' },
    };
    const result = authReducer(loggedInState, { type: 'auth/logout/fulfilled' });
    expect(result.isAuthenticated).toBe(false);
    expect(result.accessToken).toBeNull();
    expect(result.user).toBeNull();
  });
});

// --- Projects slice tests ---
describe('projectsSlice', () => {
  const initialState = {
    projects: [],
    currentProject: null,
    count: 0,
    isLoading: false,
    error: null,
  };

  it('should return initial state', () => {
    expect(projectsReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('should clear error', () => {
    const state = { ...initialState, error: 'err' };
    expect(projectsReducer(state, clearProjectError()).error).toBeNull();
  });

  it('should clear currentProject', () => {
    const project = { id: '1', title: 'P', description: '', status: 'active' as const, task_count: 0, completed_task_count: 0, owner_email: '', created_at: '', updated_at: '' };
    const state = { ...initialState, currentProject: project };
    expect(projectsReducer(state, clearCurrentProject()).currentProject).toBeNull();
  });

  it('should set isLoading on fetchProjects.pending', () => {
    const result = projectsReducer(initialState, { type: 'projects/fetchAll/pending' });
    expect(result.isLoading).toBe(true);
  });

  it('should populate projects on fetchProjects.fulfilled', () => {
    const action = {
      type: 'projects/fetchAll/fulfilled',
      payload: { results: [{ id: '1', title: 'P' }], count: 1 },
    };
    const result = projectsReducer(initialState, action);
    expect(result.projects).toHaveLength(1);
    expect(result.count).toBe(1);
  });

  it('should add project on createProject.fulfilled', () => {
    const newProject = { id: '2', title: 'New Project', description: '', status: 'active' as const, task_count: 0, completed_task_count: 0, owner_email: '', created_at: '', updated_at: '' };
    const result = projectsReducer(initialState, { type: 'projects/create/fulfilled', payload: newProject });
    expect(result.projects).toHaveLength(1);
    expect(result.projects[0].title).toBe('New Project');
  });

  it('should remove project on deleteProject.fulfilled', () => {
    const project = { id: 'del-1', title: 'ToDelete', description: '', status: 'active' as const, task_count: 0, completed_task_count: 0, owner_email: '', created_at: '', updated_at: '' };
    const state = { ...initialState, projects: [project], count: 1 };
    const result = projectsReducer(state, { type: 'projects/delete/fulfilled', payload: 'del-1' });
    expect(result.projects).toHaveLength(0);
    expect(result.count).toBe(0);
  });
});

// --- Tasks slice tests ---
describe('tasksSlice', () => {
  const initialState = { tasks: [], count: 0, isLoading: false, error: null };

  it('should return initial state', () => {
    expect(tasksReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('should clear error', () => {
    const state = { ...initialState, error: 'err' };
    expect(tasksReducer(state, clearTaskError()).error).toBeNull();
  });

  it('should set isLoading on fetchTasks.pending', () => {
    const result = tasksReducer(initialState, { type: 'tasks/fetchAll/pending' });
    expect(result.isLoading).toBe(true);
  });

  it('should add task on createTask.fulfilled', () => {
    const task = { id: 't1', project: 'p1', project_title: 'P', title: 'T1', description: '', status: 'todo' as const, due_date: null, created_at: '', updated_at: '' };
    const result = tasksReducer(initialState, { type: 'tasks/create/fulfilled', payload: task });
    expect(result.tasks).toHaveLength(1);
  });

  it('should update task status on updateTask.fulfilled', () => {
    const task = { id: 't1', project: 'p1', project_title: 'P', title: 'T1', description: '', status: 'todo' as const, due_date: null, created_at: '', updated_at: '' };
    const state = { ...initialState, tasks: [task], count: 1 };
    const updated = { ...task, status: 'done' as const };
    const result = tasksReducer(state, { type: 'tasks/update/fulfilled', payload: updated });
    expect(result.tasks[0].status).toBe('done');
  });

  it('should remove task on deleteTask.fulfilled', () => {
    const task = { id: 'del-t1', project: 'p1', project_title: 'P', title: 'T', description: '', status: 'todo' as const, due_date: null, created_at: '', updated_at: '' };
    const state = { ...initialState, tasks: [task], count: 1 };
    const result = tasksReducer(state, { type: 'tasks/delete/fulfilled', payload: 'del-t1' });
    expect(result.tasks).toHaveLength(0);
  });
});

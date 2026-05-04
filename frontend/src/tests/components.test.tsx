import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/authSlice';
import projectsReducer from '../store/projectsSlice';
import tasksReducer from '../store/tasksSlice';
import ProjectCard from '../components/projects/ProjectCard';
import TaskItem from '../components/tasks/TaskItem';
import { Project, Task } from '../types';

// Helper to wrap components with all providers
const makeStore = () =>
  configureStore({
    reducer: { auth: authReducer, projects: projectsReducer, tasks: tasksReducer },
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const store = makeStore();
  return render(
    <Provider store={store}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>
  );
};

// --- Mock data ---
const mockProject: Project = {
  id: 'proj-1',
  title: 'Test Project',
  description: 'A project for testing',
  status: 'active',
  task_count: 5,
  completed_task_count: 2,
  owner_email: 'test@example.com',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-20T10:00:00Z',
};

const mockTask: Task = {
  id: 'task-1',
  project: 'proj-1',
  project_title: 'Test Project',
  title: 'Fix the bug',
  description: 'There is a nasty bug to fix',
  status: 'todo',
  due_date: '2025-12-31',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
};

// --- ProjectCard tests ---
describe('ProjectCard', () => {
  const onClickMock = jest.fn();
  const onEditMock = jest.fn();
  const onDeleteMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders project title and description', () => {
    renderWithProviders(
      <ProjectCard
        project={mockProject}
        onClick={onClickMock}
        onEdit={onEditMock}
        onDelete={onDeleteMock}
      />
    );
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('A project for testing')).toBeInTheDocument();
  });

  it('shows active badge', () => {
    renderWithProviders(
      <ProjectCard project={mockProject} onClick={onClickMock} onEdit={onEditMock} onDelete={onDeleteMock} />
    );
    expect(screen.getByText(/Active/i)).toBeInTheDocument();
  });

  it('shows progress percentage correctly', () => {
    renderWithProviders(
      <ProjectCard project={mockProject} onClick={onClickMock} onEdit={onEditMock} onDelete={onDeleteMock} />
    );
    // 2/5 = 40%
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    renderWithProviders(
      <ProjectCard project={mockProject} onClick={onClickMock} onEdit={onEditMock} onDelete={onDeleteMock} />
    );
    fireEvent.click(screen.getByText('Test Project'));
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('shows "No tasks yet" when task_count is 0', () => {
    const emptyProject = { ...mockProject, task_count: 0, completed_task_count: 0 };
    renderWithProviders(
      <ProjectCard project={emptyProject} onClick={onClickMock} onEdit={onEditMock} onDelete={onDeleteMock} />
    );
    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
  });

  it('shows completed badge for completed project', () => {
    const completedProject = { ...mockProject, status: 'completed' as const };
    renderWithProviders(
      <ProjectCard project={completedProject} onClick={onClickMock} onEdit={onEditMock} onDelete={onDeleteMock} />
    );
    expect(screen.getByText(/Completed/i)).toBeInTheDocument();
  });
});

// --- TaskItem tests ---
describe('TaskItem', () => {
  const onEditMock = jest.fn();
  const onDeleteMock = jest.fn();
  const onStatusChangeMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders task title', () => {
    renderWithProviders(
      <TaskItem task={mockTask} onEdit={onEditMock} onDelete={onDeleteMock} onStatusChange={onStatusChangeMock} />
    );
    expect(screen.getByText('Fix the bug')).toBeInTheDocument();
  });

  it('renders task description', () => {
    renderWithProviders(
      <TaskItem task={mockTask} onEdit={onEditMock} onDelete={onDeleteMock} onStatusChange={onStatusChangeMock} />
    );
    expect(screen.getByText('There is a nasty bug to fix')).toBeInTheDocument();
  });

  it('shows "To Do" status badge', () => {
    renderWithProviders(
      <TaskItem task={mockTask} onEdit={onEditMock} onDelete={onDeleteMock} onStatusChange={onStatusChangeMock} />
    );
    expect(screen.getByText('To Do')).toBeInTheDocument();
  });

  it('calls onStatusChange with next status when checkbox clicked', () => {
    renderWithProviders(
      <TaskItem task={mockTask} onEdit={onEditMock} onDelete={onDeleteMock} onStatusChange={onStatusChangeMock} />
    );
    fireEvent.click(screen.getByTitle(/Mark as/i));
    expect(onStatusChangeMock).toHaveBeenCalledWith('in-progress');
  });

  it('shows "Done" status badge for done task', () => {
    const doneTask = { ...mockTask, status: 'done' as const };
    renderWithProviders(
      <TaskItem task={doneTask} onEdit={onEditMock} onDelete={onDeleteMock} onStatusChange={onStatusChangeMock} />
    );
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('shows due date', () => {
    renderWithProviders(
      <TaskItem task={mockTask} onEdit={onEditMock} onDelete={onDeleteMock} onStatusChange={onStatusChangeMock} />
    );
    expect(screen.getByText(/Dec 31/)).toBeInTheDocument();
  });
});

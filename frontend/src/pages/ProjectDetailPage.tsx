import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchProject, updateProject } from '../store/projectsSlice';
import { fetchTasks, deleteTask, updateTask } from '../store/tasksSlice';
import TaskItem from '../components/tasks/TaskItem';
import TaskFormModal from '../components/tasks/TaskFormModal';
import ProjectFormModal from '../components/projects/ProjectFormModal';
import { Task, TaskStatus } from '../types';
import styles from './ProjectDetailPage.module.css';

const STATUS_TABS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { currentProject, isLoading: projectLoading } = useAppSelector(s => s.projects);
  const { tasks, isLoading: tasksLoading } = useAppSelector(s => s.tasks);

  const [statusFilter, setStatusFilter] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchProject(id));
      dispatch(fetchTasks({ project: id }));
    }
  }, [id, dispatch]);

  const loadTasks = useCallback(() => {
    if (id) dispatch(fetchTasks({ project: id, status: statusFilter }));
  }, [id, dispatch, statusFilter]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Delete this task?')) {
      await dispatch(deleteTask(taskId));
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    await dispatch(updateTask({ id: taskId, data: { status } }));
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleTaskModalClose = () => {
    setShowTaskModal(false);
    setEditingTask(null);
  };

  if (projectLoading) {
    return (
      <div className={styles.loadingCenter}>
        <div className="loading-spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔍</div>
        <h3>Project not found</h3>
        <p>This project may have been deleted or you don't have access.</p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
      </div>
    );
  }

  const progress = currentProject.task_count > 0
    ? Math.round((currentProject.completed_task_count / currentProject.task_count) * 100)
    : 0;

  const taskCounts = {
    todo: tasks.filter(t => t.status === 'todo').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  };

  return (
    <div className={styles.page}>
      {/* Back nav */}
      <button className={`btn btn-ghost btn-sm ${styles.backBtn}`} onClick={() => navigate('/dashboard')}>
        ← Dashboard
      </button>

      {/* Project header */}
      <div className={styles.projectHeader}>
        <div className={styles.projectMeta}>
          <div className={styles.titleRow}>
            <h1 className="page-title">{currentProject.title}</h1>
            <span className={`badge badge-${currentProject.status}`}>
              {currentProject.status === 'active' ? '● Active' : '✓ Completed'}
            </span>
          </div>
          {currentProject.description && (
            <p className={styles.description}>{currentProject.description}</p>
          )}
        </div>

        <div className={styles.headerActions}>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowProjectModal(true)}>✎ Edit</button>
          <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>+ Add Task</button>
        </div>
      </div>

      {/* Progress */}
      {currentProject.task_count > 0 && (
        <div className={styles.progressCard}>
          <div className={styles.progressStats}>
            <div className={styles.progressStat}>
              <span className={styles.progressNum}>{currentProject.task_count}</span>
              <span className={styles.progressLbl}>Total</span>
            </div>
            <div className={styles.progressStat}>
              <span className={styles.progressNum} style={{ color: 'var(--text-3)' }}>{taskCounts.todo}</span>
              <span className={styles.progressLbl}>To Do</span>
            </div>
            <div className={styles.progressStat}>
              <span className={styles.progressNum} style={{ color: 'var(--amber)' }}>{taskCounts['in-progress']}</span>
              <span className={styles.progressLbl}>In Progress</span>
            </div>
            <div className={styles.progressStat}>
              <span className={styles.progressNum} style={{ color: 'var(--green)' }}>{taskCounts.done}</span>
              <span className={styles.progressLbl}>Done</span>
            </div>
            <div className={styles.progressStat}>
              <span className={styles.progressNum} style={{ color: 'var(--accent-2)' }}>{progress}%</span>
              <span className={styles.progressLbl}>Complete</span>
            </div>
          </div>
          <div className="progress-bar" style={{ height: 6 }}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Tasks section */}
      <div className={styles.tasksSection}>
        <div className={styles.tasksHeader}>
          <h2 className={styles.tasksTitle}>Tasks</h2>
          <div className={styles.statusTabs}>
            {STATUS_TABS.map(tab => (
              <button
                key={tab.value}
                className={`btn btn-ghost btn-sm ${statusFilter === tab.value ? styles.tabActive : ''}`}
                onClick={() => setStatusFilter(tab.value)}
              >
                {tab.label}
                {tab.value && (
                  <span className={styles.tabCount}>
                    {tab.value === 'todo' ? taskCounts.todo : tab.value === 'in-progress' ? taskCounts['in-progress'] : taskCounts.done}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {tasksLoading ? (
          <div className={styles.loadingCenter}>
            <div className="loading-spinner" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <h3>{statusFilter ? 'No tasks with this status' : 'No tasks yet'}</h3>
            <p>{statusFilter ? 'Try a different filter.' : 'Add your first task to get started.'}</p>
            {!statusFilter && (
              <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>+ Add Task</button>
            )}
          </div>
        ) : (
          <div className={styles.taskList}>
            {tasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onEdit={() => handleEditTask(task)}
                onDelete={() => handleDeleteTask(task.id)}
                onStatusChange={(status) => handleStatusChange(task.id, status)}
              />
            ))}
          </div>
        )}
      </div>

      {showTaskModal && id && (
        <TaskFormModal
          task={editingTask}
          projectId={id}
          onClose={handleTaskModalClose}
          onSuccess={handleTaskModalClose}
        />
      )}

      {showProjectModal && (
        <ProjectFormModal
          project={currentProject}
          onClose={() => setShowProjectModal(false)}
          onSuccess={() => setShowProjectModal(false)}
        />
      )}
    </div>
  );
};

export default ProjectDetailPage;

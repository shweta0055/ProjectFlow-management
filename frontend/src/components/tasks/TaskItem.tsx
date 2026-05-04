import React from 'react';
import { Task } from '../../types';
import styles from './TaskItem.module.css';

interface Props {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: Task['status']) => void;
}

const statusOrder: Task['status'][] = ['todo', 'in-progress', 'done'];
const statusLabels = { 'todo': 'To Do', 'in-progress': 'In Progress', 'done': 'Done' };

const TaskItem: React.FC<Props> = ({ task, onEdit, onDelete, onStatusChange }) => {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const nextStatus = (): Task['status'] | null => {
    const idx = statusOrder.indexOf(task.status);
    return idx < statusOrder.length - 1 ? statusOrder[idx + 1] : null;
  };

  return (
    <div className={`${styles.item} ${task.status === 'done' ? styles.done : ''}`}>
      <button
        className={`${styles.checkbox} ${task.status === 'done' ? styles.checkboxDone : ''}`}
        onClick={() => {
          const next = nextStatus();
          if (next) onStatusChange(next);
        }}
        title={nextStatus() ? `Mark as ${nextStatus()}` : 'Already done'}
      >
        {task.status === 'done' ? '✓' : task.status === 'in-progress' ? '◎' : '○'}
      </button>

      <div className={styles.content}>
        <div className={styles.titleRow}>
          <span className={styles.title}>{task.title}</span>
          <span className={`badge badge-${task.status}`}>{statusLabels[task.status]}</span>
        </div>
        {task.description && <p className={styles.description}>{task.description}</p>}
        {task.due_date && (
          <span className={`${styles.dueDate} ${isOverdue ? styles.overdue : ''}`}>
            {isOverdue ? '⚠ Overdue · ' : '📅 '}
            {formatDate(task.due_date)}
          </span>
        )}
      </div>

      <div className={styles.actions}>
        <button className={`btn btn-ghost btn-sm ${styles.actionBtn}`} onClick={onEdit} title="Edit task">✎</button>
        <button className={`btn btn-ghost btn-sm ${styles.actionBtn} ${styles.deleteBtn}`} onClick={onDelete} title="Delete task">✕</button>
      </div>
    </div>
  );
};

export default TaskItem;

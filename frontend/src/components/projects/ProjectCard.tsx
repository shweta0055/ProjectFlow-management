import React from 'react';
import { Project } from '../../types';
import styles from './ProjectCard.module.css';

interface Props {
  project: Project;
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

const ProjectCard: React.FC<Props> = ({ project, onClick, onEdit, onDelete }) => {
  const progress = project.task_count > 0
    ? Math.round((project.completed_task_count / project.task_count) * 100)
    : 0;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className={styles.card} onClick={onClick} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onClick()}>
      <div className={styles.cardHeader}>
        <span className={`badge badge-${project.status}`}>
          {project.status === 'active' ? '● Active' : '✓ Completed'}
        </span>
        <div className={styles.actions} onClick={e => e.stopPropagation()}>
          <button
            className={`btn btn-ghost btn-sm ${styles.actionBtn}`}
            onClick={onEdit}
            title="Edit project"
          >
            ✎
          </button>
          <button
            className={`btn btn-ghost btn-sm ${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={onDelete}
            title="Delete project"
          >
            ✕
          </button>
        </div>
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.title}>{project.title}</h3>
        {project.description && (
          <p className={styles.description}>{project.description}</p>
        )}
      </div>

      <div className={styles.cardFooter}>
        {project.task_count > 0 && (
          <div className={styles.progressSection}>
            <div className={styles.progressHeader}>
              <span className={styles.progressLabel}>Progress</span>
              <span className={styles.progressValue}>{progress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className={styles.taskCount}>
              {project.completed_task_count}/{project.task_count} tasks done
            </div>
          </div>
        )}

        {project.task_count === 0 && (
          <div className={styles.noTasks}>No tasks yet</div>
        )}

        <div className={styles.meta}>
          <span className={styles.date}>{formatDate(project.created_at)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;

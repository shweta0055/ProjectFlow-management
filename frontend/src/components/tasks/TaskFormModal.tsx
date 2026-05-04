import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch } from '../../hooks/useRedux';
import { createTask, updateTask } from '../../store/tasksSlice';
import { Task, TaskFormData } from '../../types';

const schema = yup.object({
  title: yup.string().min(3, 'Title must be at least 3 characters').required('Title is required'),
  description: yup.string().default(''),
  status: yup.mixed<'todo' | 'in-progress' | 'done'>().oneOf(['todo', 'in-progress', 'done']).required(),
  due_date: yup.string().default(''),
  project: yup.string().required(),
});

interface Props {
  task?: Task | null;
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const TaskFormModal: React.FC<Props> = ({ task, projectId, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const isEdit = !!task;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<TaskFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'todo',
      due_date: task?.due_date || '',
      project: projectId,
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    const payload = { ...data, due_date: data.due_date || null as unknown as string };
    if (isEdit && task) {
      await dispatch(updateTask({ id: task.id, data: payload }));
    } else {
      await dispatch(createTask(payload));
    }
    onSuccess();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal-title">{isEdit ? 'Edit Task' : 'New Task'}</h2>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input type="hidden" {...register('project')} />

          <div className="form-group">
            <label className="form-label">Task title *</label>
            <input type="text" placeholder="e.g. Design landing page" {...register('title')} />
            {errors.title && <span className="form-error">{errors.title.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              rows={3}
              placeholder="Details about this task..."
              style={{ resize: 'vertical' }}
              {...register('description')}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select {...register('status')}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Due date</label>
              <input type="date" {...register('due_date')} />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting
                ? <><span className="loading-spinner" />{isEdit ? 'Saving...' : 'Creating...'}</>
                : isEdit ? 'Save changes' : 'Create task'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;

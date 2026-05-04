import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch } from '../../hooks/useRedux';
import { createProject, updateProject } from '../../store/projectsSlice';
import { Project, ProjectFormData } from '../../types';

const schema = yup.object({
  title: yup.string().min(3, 'Title must be at least 3 characters').required('Title is required'),
  description: yup.string().default(''),
  status: yup.mixed<'active' | 'completed'>().oneOf(['active', 'completed']).required(),
});

interface Props {
  project?: Project | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ProjectFormModal: React.FC<Props> = ({ project, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const isEdit = !!project;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProjectFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: project?.title || '',
      description: project?.description || '',
      status: project?.status || 'active',
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    if (isEdit && project) {
      await dispatch(updateProject({ id: project.id, data }));
    } else {
      await dispatch(createProject(data));
    }
    onSuccess();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal-title">{isEdit ? 'Edit Project' : 'New Project'}</h2>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Project title *</label>
            <input type="text" placeholder="e.g. Website Redesign" {...register('title')} />
            {errors.title && <span className="form-error">{errors.title.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              rows={3}
              placeholder="What's this project about?"
              style={{ resize: 'vertical' }}
              {...register('description')}
            />
            {errors.description && <span className="form-error">{errors.description.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select {...register('status')}>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting
                ? <><span className="loading-spinner" />{isEdit ? 'Saving...' : 'Creating...'}</>
                : isEdit ? 'Save changes' : 'Create project'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectFormModal;

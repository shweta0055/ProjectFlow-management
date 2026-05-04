import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { registerUser, clearError } from '../store/authSlice';
import { RegisterFormData } from '../types';
import styles from './AuthPage.module.css';

const schema = yup.object({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  password2: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useAppSelector(s => s.auth);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
    return () => { dispatch(clearError()); };
  }, [isAuthenticated, navigate, dispatch]);

  const onSubmit = (data: RegisterFormData) => {
    dispatch(registerUser(data));
  };

  return (
    <div className={styles.page}>
      <div className={styles.bg}>
        <div className={styles.bgOrb1} />
        <div className={styles.bgOrb2} />
      </div>
      <div className={styles.card}>
        <div className={styles.brandRow}>
          <span className={styles.brandIcon}>⬡</span>
          <span className={styles.brandName}>ProjectFlow</span>
        </div>
        <h1 className={styles.heading}>Create account</h1>
        <p className={styles.subheading}>Start managing your projects today</p>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.nameRow}>
            <div className="form-group">
              <label className="form-label">First name</label>
              <input type="text" placeholder="Alice" {...register('first_name')} />
              {errors.first_name && <span className="form-error">{errors.first_name.message}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Last name</label>
              <input type="text" placeholder="Smith" {...register('last_name')} />
              {errors.last_name && <span className="form-error">{errors.last_name.message}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email address</label>
            <input type="email" placeholder="you@company.com" {...register('email')} />
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" placeholder="Min. 8 characters" {...register('password')} />
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm password</label>
            <input type="password" placeholder="••••••••" {...register('password2')} />
            {errors.password2 && <span className="form-error">{errors.password2.message}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            disabled={isLoading}
          >
            {isLoading ? <><span className="loading-spinner" />Creating account...</> : 'Create account'}
          </button>
        </form>

        <p className={styles.switchText}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

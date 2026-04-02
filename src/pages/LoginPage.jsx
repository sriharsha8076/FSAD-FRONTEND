import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FormInput, Button } from '../components';
import { useAuth } from '../utils/AuthContext';
import { useToast } from '../components/Toast';
import { Mail, Lock, Key } from 'lucide-react';
import styles from './Auth.module.css';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or ID is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
export const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    }
  });
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();
  const onSubmit = async (data) => {
    // Hardcoded Super Admin Logic
    if (data.identifier === 'harsha21' && data.password === 'Harsha@0821') {
      login(data.identifier, data.password, 'superadmin', 'Harsha (Creator)');
      addToast(`Welcome back, Creator!`, 'success');
      navigate(`/ superadmin / dashboard`);
      return;
    }
    try {
      const user = await login(data.identifier, data.password);
      const actualRole = user.role;
      addToast(`Welcome! Logged in as ${actualRole} `, 'success');
      navigate(`/ ${actualRole === 'admin' || actualRole === 'university_admin' ? 'admin' : actualRole}/dashboard`);
    } catch (error) {
      addToast(error.message || "Failed to login", 'error');
    }
  };
  return (
    <div className={styles.pageWrapper}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={styles.authCard}
      >
        {/* Header */}
        <div className={styles.header}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className={styles.iconWrapper}
          >
            <Key size={32} color="white" />
          </motion.div>
          <h1 className={styles.title}>Login to SAAMS</h1>
          <p className={styles.subtitle}>Manage student achievements with ease</p>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <FormInput
            id="identifier"
            label="Email or ID"
            type="text"
            placeholder="your@email.com or ID"
            error={errors.identifier?.message}
            icon={Mail}
            {...register('identifier')}
          />
          <FormInput
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            icon={Lock}
            {...register('password')}
          />
          <Button type="submit" variant="primary" disabled={isSubmitting} style={{ width: '100%' }}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        {/* Divider */}
        <div className={styles.divider}>
          <div className={styles.dividerLine} />
          <span className={styles.dividerText}>Don't have an account?</span>
        </div>
        {/* Register Link */}
        <Button onClick={() => navigate('/register')} variant="secondary" style={{ width: '100%' }}>
          Create New Account
        </Button>
        {/* Back to Landing */}
        <div className={styles.backLink}>
          <button onClick={() => navigate('/')} className={styles.backBtn}>
            ← Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

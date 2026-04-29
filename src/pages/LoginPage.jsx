import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FormInput, Button } from '../components';
import { useAuth } from '../utils/AuthContext';
import { useToast } from '../components/Toast';
import { Mail, Lock, Key, ShieldCheck } from 'lucide-react';
import styles from './Auth.module.css';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or ID is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const mfaSchema = z.object({
  code: z.string().length(6, 'Enter the 6-digit code from your authenticator app'),
});

const getDashboardPath = (role) => {
  if (role === 'admin' || role === 'university_admin') return '/admin/dashboard';
  if (role === 'superadmin' || role === 'super_admin') return '/superadmin/dashboard';
  return `/${role}/dashboard`;
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, completeMfaLogin } = useAuth();
  const { addToast } = useToast();

  // MFA state
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaContext, setMfaContext] = useState(null); // { preAuthToken, name, email }

  // Login form
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  // MFA form
  const {
    register: registerMfa,
    handleSubmit: handleSubmitMfa,
    formState: { errors: mfaErrors, isSubmitting: mfaSubmitting },
    setError: setMfaError,
  } = useForm({
    resolver: zodResolver(mfaSchema),
    defaultValues: { code: '' },
  });

  const onSubmit = async (data) => {
    // Hardcoded Super Admin
    if (data.identifier === 'harsha21' && data.password === 'Harsha@0821') {
      login(data.identifier, data.password, 'superadmin', 'Harsha (Creator)');
      addToast('Welcome back, Creator!', 'success');
      navigate('/superadmin/dashboard');
      return;
    }
    try {
      const result = await login(data.identifier, data.password);
      if (result.requiresMfa) {
        setMfaContext({ preAuthToken: result.preAuthToken, name: result.name, email: result.email });
        setMfaStep(true);
        return;
      }
      addToast(`Welcome back, ${result.name}!`, 'success');
      navigate(getDashboardPath(result.role));
    } catch (error) {
      addToast(error.message || 'Failed to login', 'error');
    }
  };

  const onMfaSubmit = async (data) => {
    try {
      const user = await completeMfaLogin(mfaContext.preAuthToken, data.code);
      addToast(`Welcome back, ${user.name}!`, 'success');
      navigate(getDashboardPath(user.role));
    } catch (error) {
      setMfaError('code', { message: error.message || 'Invalid code. Please try again.' });
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <AnimatePresence mode="wait">
        {!mfaStep ? (
          /* Step 1: Credentials */
          <motion.div
            key="credentials"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className={styles.authCard}
          >
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

            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#aaa', margin: 0 }}>Or use demo credentials:</p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button type="button" variant="secondary" onClick={() => { setValue('identifier', 'student@demo.com'); setValue('password', 'Demo@123'); }} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Student</Button>
                <Button type="button" variant="secondary" onClick={() => { setValue('identifier', 'uniadmin@demo.com'); setValue('password', 'Demo@123'); }} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Uni Admin</Button>
                <Button type="button" variant="secondary" onClick={() => { setValue('identifier', 'superadmin@demo.com'); setValue('password', 'Demo@123'); }} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Super Admin</Button>
              </div>
            </div>

            <div className={styles.divider}>
              <div className={styles.dividerLine} />
              <span className={styles.dividerText}>Don't have an account?</span>
            </div>
            <Button onClick={() => navigate('/register')} variant="secondary" style={{ width: '100%' }}>
              Create New Account
            </Button>
            <div className={styles.backLink}>
              <button onClick={() => navigate('/')} className={styles.backBtn}>
                ← Back to Home
              </button>
            </div>
          </motion.div>
        ) : (
          /* Step 2: MFA Verification */
          <motion.div
            key="mfa"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className={styles.authCard}
          >
            <div className={styles.header}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring' }}
                className={styles.iconWrapper}
              >
                <ShieldCheck size={32} color="white" />
              </motion.div>
              <h1 className={styles.title}>Two-Factor Auth</h1>
              <p className={styles.subtitle}>
                Welcome, {mfaContext?.name}! Enter your 6-digit authenticator code.
              </p>
            </div>

            <form onSubmit={handleSubmitMfa(onMfaSubmit)} className={styles.form}>
              <FormInput
                id="mfa-code"
                label="Authenticator Code"
                type="text"
                placeholder="000000"
                maxLength={6}
                error={mfaErrors.code?.message}
                icon={ShieldCheck}
                {...registerMfa('code')}
              />
              <Button type="submit" variant="primary" disabled={mfaSubmitting} style={{ width: '100%' }}>
                {mfaSubmitting ? 'Verifying...' : 'Verify & Login'}
              </Button>
            </form>

            <div className={styles.backLink}>
              <button onClick={() => setMfaStep(false)} className={styles.backBtn}>
                ← Back to Login
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

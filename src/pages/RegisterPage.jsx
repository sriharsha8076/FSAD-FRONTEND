import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FormInput, Button } from '../components';
import { useAuth } from '../utils/AuthContext';
import { useToast } from '../components/Toast';
import { Mail, Lock, User, Key, Calendar, Phone, Hash } from 'lucide-react';
import styles from './Auth.module.css';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last Name is required'),
  dob: z.string().min(1, 'Date of Birth is required'),
  mobileNo: z.string().min(10, 'Valid Mobile Number is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  adminId: z.string().optional(),
  worksUnderUniversity: z.boolean().optional(),
  universityId: z.number().optional().or(z.string().transform(val => val ? Number(val) : undefined)),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to terms' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      dob: '',
      mobileNo: '',
      email: '',
      password: '',
      confirmPassword: '',
      adminId: '',
      agreeToTerms: false,
    }
  });

  const [selectedRole, setSelectedRole] = useState('student');
  const [previewId, setPreviewId] = useState('');
  const [customError, setCustomError] = useState('');
  // eslint-disable-next-line
  const firstName = watch('firstName');
  const middleName = watch('middleName');
  const lastName = watch('lastName');

  const navigate = useNavigate();
  const { registerUser } = useAuth();
  const { addToast } = useToast();
  const onSubmit = async (data) => {
    setCustomError('');
    const fn = data.firstName;
    const mn = data.middleName ? data.middleName + ' ' : '';
    const ln = data.lastName;
    const fullName = `${fn} ${mn}${ln}`.trim();
    try {
      await registerUser({
        ...data,
        name: fullName,
        role: selectedRole,
        dob: data.dob,
        mobileNo: data.mobileNo
      });
      addToast(`Registration successful! Please login with your email.`, 'success');
      navigate(`/login`);
    } catch (err) {
      setCustomError(err.message || "Registration failed");
      addToast(err.message || "Registration failed", 'error');
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
            <User size={32} color="white" />
          </motion.div>
          <h1 className={styles.title}>Join SAAMS</h1>
          <p className={styles.subtitle}>Create your account and start today</p>
        </div>
        {/* Role Selection */}
        <div className={styles.roleSelection}>
          <label className={styles.roleLabel}>Account Type</label>
          <div className={styles.roleGrid}>
            {['student', 'mentor'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`${styles.roleButton} ${selectedRole === role ? styles.roleButtonActive : ''}`}
              >
                {role === 'student' ? '👨‍🎓 Student' : '👨‍🏫 Mentor'}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
            ℹ️ Your Unique ID is auto-assigned continuously and locked upon registration.
          </p>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {selectedRole === 'mentor' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="worksUnderUniversity"
                  {...register('worksUnderUniversity')}
                  style={{ width: '1.2rem', height: '1.2rem' }}
                />
                <label htmlFor="worksUnderUniversity" style={{ color: 'var(--text-color)', fontSize: '0.9rem' }}>
                  I work under a university
                </label>
              </div>

              {watch('worksUnderUniversity') && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '1rem' }}>
                  <FormInput
                    id="universityId"
                    label="University ID"
                    type="number"
                    placeholder="Enter University ID"
                    error={errors.universityId?.message}
                    icon={Hash}
                    {...register('universityId', { valueAsNumber: true })}
                  />
                </motion.div>
              )}
            </motion.div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormInput
              id="firstName"
              label="First Name"
              type="text"
              placeholder="John"
              error={errors.firstName?.message}
              icon={User}
              {...register('firstName')}
            />
            <FormInput
              id="middleName"
              label="Middle Name"
              type="text"
              placeholder="Middle (Opt)"
              error={errors.middleName?.message}
              icon={User}
              {...register('middleName')}
            />
          </div>
          <FormInput
            id="lastName"
            label="Last Name"
            type="text"
            placeholder="Doe"
            error={errors.lastName?.message}
            icon={User}
            {...register('lastName')}
          />
          <FormInput
            id="dob"
            label="Date of Birth"
            type="date"
            error={errors.dob?.message}
            icon={Calendar}
            {...register('dob')}
          />
          <FormInput
            id="mobileNo"
            label="Mobile Number"
            type="tel"
            placeholder="+1 (555) 000-0000"
            error={errors.mobileNo?.message}
            icon={Phone}
            {...register('mobileNo')}
          />
          <FormInput
            id="email"
            label="Email Address"
            type="email"
            placeholder="your@email.com"
            error={errors.email?.message}
            icon={Mail}
            {...register('email')}
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
          <FormInput
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            icon={Key}
            {...register('confirmPassword')}
          />
          {/* Terms Agreement */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="agreeToTerms"
                {...register('agreeToTerms')}
                style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              <label htmlFor="agreeToTerms" style={{ fontSize: '0.875rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                I agree to the Terms of Service and Privacy Policy
              </label>
            </div>
            {errors.agreeToTerms && (
              <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px' }}>{errors.agreeToTerms.message}</p>
            )}
          </div>
          <Button type="submit" variant="primary" disabled={isSubmitting} style={{ width: '100%' }}>
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
        {/* Divider */}
        <div className={styles.divider}>
          <div className={styles.dividerLine} />
          <span className={styles.dividerText}>Already have an account?</span>
        </div>
        {/* Login Link */}
        <Button onClick={() => navigate('/login')} variant="secondary" style={{ width: '100%' }}>
          Sign In
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

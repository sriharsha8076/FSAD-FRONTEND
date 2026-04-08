import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FormInput, Button } from '../components';
import { useAuth } from '../utils/AuthContext';
import { useToast } from '../components/Toast';
import { Mail, Lock, User, Key, Calendar, Phone, Hash, ShieldCheck, RefreshCw } from 'lucide-react';
import styles from './Auth.module.css';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// ─── Zod Schema ───────────────────────────────────────────────────────────────
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

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// ─── OTP Step Component ───────────────────────────────────────────────────────
const OtpStep = ({ email, onVerified, onResend, onBack }) => {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);
  const { addToast } = useToast();

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleDigitChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Allow only digits
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    setError('');

    // Auto-advance to next box
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newDigits = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    const nextEmpty = newDigits.findIndex(d => !d);
    const focusIdx = nextEmpty === -1 ? 5 : nextEmpty;
    inputRefs.current[focusIdx]?.focus();
  };

  const handleVerify = async () => {
    const otp = digits.join('');
    if (otp.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');
      addToast('🎉 Account created! Please login.', 'success');
      onVerified();
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
      // Shake the boxes on error
      setDigits(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    await onResend();
    setResendCooldown(30);
    setDigits(['', '', '', '', '', '']);
    setError('');
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  return (
    <motion.div
      key="otp-step"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Icon */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(99,102,241,0.4)'
          }}
        >
          <ShieldCheck size={34} color="white" />
        </motion.div>
        <h2 style={{ color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 8px' }}>
          Verify Your Email
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
          We sent a 6-digit code to
        </p>
        <p style={{ color: 'var(--primary)', fontSize: '0.95rem', fontWeight: 600, margin: '4px 0 0' }}>
          {email}
        </p>
      </div>

      {/* OTP Digit Boxes */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
        {digits.map((digit, i) => (
          <motion.input
            key={i}
            ref={el => (inputRefs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleDigitChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            whileFocus={{ scale: 1.08 }}
            style={{
              width: '48px', height: '60px',
              textAlign: 'center', fontSize: '1.6rem', fontWeight: 700,
              background: digit ? '#eef2ff' : '#f8fafc',
              border: `2px solid ${error ? '#ef4444' : digit ? '#4f46e5' : '#cbd5e1'}`,
              borderRadius: '12px',
              color: '#333333',
              outline: 'none',
              transition: 'all 0.2s ease',
              caretColor: '#6366f1',
              cursor: 'text',
              fontFamily: 'monospace',
            }}
          />
        ))}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              color: '#ef4444', fontSize: '0.85rem', textAlign: 'center',
              marginBottom: '16px', background: 'rgba(239,68,68,0.08)',
              padding: '8px 16px', borderRadius: '8px'
            }}
          >
            ⚠️ {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Timer info */}
      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', marginBottom: '20px' }}>
        ⏱️ OTP expires in <strong style={{ color: '#f59e0b' }}>5 minutes</strong>
      </p>

      {/* Verify Button */}
      <Button
        type="button"
        variant="primary"
        disabled={loading || digits.join('').length < 6}
        onClick={handleVerify}
        style={{ width: '100%', marginBottom: '12px' }}
      >
        {loading ? '⏳ Verifying...' : '✅ Verify & Create Account'}
      </Button>

      {/* Resend + Back */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: '0.85rem',
          }}
        >
          ← Change details
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0}
          style={{
            background: 'none', border: 'none', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
            color: resendCooldown > 0 ? 'var(--text-muted)' : '#6366f1',
            fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px',
            opacity: resendCooldown > 0 ? 0.5 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          <RefreshCw size={13} />
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
        </button>
      </div>
    </motion.div>
  );
};

// ─── Main RegisterPage ─────────────────────────────────────────────────────────
export const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    watch,
    getValues,
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
  const [customError, setCustomError] = useState('');
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [pendingPayload, setPendingPayload] = useState(null);

  const navigate = useNavigate();
  const { addToast } = useToast();

  // Build the backend payload from form data
  const buildPayload = (data) => {
    const fn = data.firstName;
    const mn = data.middleName ? data.middleName + ' ' : '';
    const ln = data.lastName;
    const fullName = `${fn} ${mn}${ln}`.trim();
    return {
      ...data,
      name: fullName,
      role: selectedRole,
      dob: data.dob,
      mobileNo: data.mobileNo,
    };
  };

  // Step 1: send OTP
  const onSubmit = async (data) => {
    setCustomError('');
    const payload = buildPayload(data);
    setPendingPayload(payload);

    try {
      const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Failed to send OTP');

      addToast(`📧 OTP sent to ${data.email}`, 'success');
      setRegisteredEmail(data.email);
      setStep('otp');
    } catch (err) {
      setCustomError(err.message || 'Registration failed');
      addToast(err.message || 'Registration failed', 'error');
    }
  };

  // Resend OTP using the same cached payload
  const handleResend = async () => {
    if (!pendingPayload) return;
    try {
      const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendingPayload),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Failed to resend OTP');
      addToast('📧 New OTP sent!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to resend OTP', 'error');
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
        {/* Header — always shown */}
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
          <p className={styles.subtitle}>
            {step === 'form' ? 'Create your account and start today' : 'Verify your email to continue'}
          </p>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
            {['Details', 'Verify'].map((label, i) => (
              <React.Fragment key={label}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: (i === 0 && step === 'form') || (i === 1 && step === 'otp')
                      ? 'linear-gradient(135deg,#4f46e5,#7c3aed)'
                      : step === 'otp' && i === 0 ? '#22c55e' : 'rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 700, color: 'white',
                    transition: 'background 0.3s',
                  }}>
                    {step === 'otp' && i === 0 ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</span>
                </div>
                {i === 0 && (
                  <div style={{
                    width: '32px', height: '2px',
                    background: step === 'otp' ? '#6366f1' : 'rgba(255,255,255,0.1)',
                    borderRadius: '2px', transition: 'background 0.4s'
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Animated page content */}
        <AnimatePresence mode="wait">
          {step === 'form' ? (
            <motion.div
              key="form-step"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
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
                  ℹ️ Your Unique ID is auto-assigned and locked upon registration.
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
                    id="firstName" label="First Name" type="text" placeholder="John"
                    error={errors.firstName?.message} icon={User} {...register('firstName')}
                  />
                  <FormInput
                    id="middleName" label="Middle Name" type="text" placeholder="Middle (Opt)"
                    error={errors.middleName?.message} icon={User} {...register('middleName')}
                  />
                </div>
                <FormInput
                  id="lastName" label="Last Name" type="text" placeholder="Doe"
                  error={errors.lastName?.message} icon={User} {...register('lastName')}
                />
                <FormInput
                  id="dob" label="Date of Birth" type="date"
                  error={errors.dob?.message} icon={Calendar} {...register('dob')}
                />
                <FormInput
                  id="mobileNo" label="Mobile Number" type="tel" placeholder="+91 9876543210"
                  error={errors.mobileNo?.message} icon={Phone} {...register('mobileNo')}
                />
                <FormInput
                  id="email" label="Email Address" type="email" placeholder="your@email.com"
                  error={errors.email?.message} icon={Mail} {...register('email')}
                />
                <FormInput
                  id="password" label="Password" type="password" placeholder="••••••••"
                  error={errors.password?.message} icon={Lock} {...register('password')}
                />
                <FormInput
                  id="confirmPassword" label="Confirm Password" type="password" placeholder="••••••••"
                  error={errors.confirmPassword?.message} icon={Key} {...register('confirmPassword')}
                />

                {/* Terms */}
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
                    <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px' }}>
                      {errors.agreeToTerms.message}
                    </p>
                  )}
                </div>

                {customError && (
                  <p style={{
                    color: '#ef4444', fontSize: '0.875rem', textAlign: 'center',
                    marginBottom: '12px', background: 'rgba(239,68,68,0.08)',
                    padding: '10px', borderRadius: '8px'
                  }}>
                    ⚠️ {customError}
                  </p>
                )}

                <Button type="submit" variant="primary" disabled={isSubmitting} style={{ width: '100%' }}>
                  {isSubmitting ? '⏳ Sending OTP...' : '📧 Send OTP & Continue'}
                </Button>
              </form>

              {/* Divider */}
              <div className={styles.divider}>
                <div className={styles.dividerLine} />
                <span className={styles.dividerText}>Already have an account?</span>
              </div>
              <Button onClick={() => navigate('/login')} variant="secondary" style={{ width: '100%' }}>
                Sign In
              </Button>
              <div className={styles.backLink}>
                <button onClick={() => navigate('/')} className={styles.backBtn}>
                  ← Back to Home
                </button>
              </div>
            </motion.div>
          ) : (
            <OtpStep
              email={registeredEmail}
              onVerified={() => navigate('/login')}
              onResend={handleResend}
              onBack={() => setStep('form')}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

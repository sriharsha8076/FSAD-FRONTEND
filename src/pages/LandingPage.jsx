import React from 'react';
import { motion } from 'framer-motion';
import { Navbar, Button, Card } from '../components';
import { ArrowRight, Award, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
export const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const features = [
    {
      icon: Award,
      title: 'Track Achievements',
      description: 'Easily track and manage student extracurricular achievements across multiple categories',
    },
    {
      icon: Users,
      title: 'Student Management',
      description: 'Comprehensive student profile management with achievement history and analytics',
    },
    {
      icon: TrendingUp,
      title: 'Analytics & Reports',
      description: 'Generate detailed reports and visualize achievement trends with interactive charts',
    },
  ];
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-main)',
      color: 'var(--text-main)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Dynamic Background Orbs */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '40vw',
        height: '40vw',
        background: 'radial-gradient(circle, rgba(var(--primary-rgb), 0.15) 0%, rgba(var(--primary-rgb), 0) 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        zIndex: 0
      }} className="animate-blob" />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-5%',
        width: '35vw',
        height: '35vw',
        background: 'radial-gradient(circle, rgba(var(--secondary-rgb), 0.15) 0%, rgba(var(--secondary-rgb), 0) 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animationDelay: '2s',
        zIndex: 0
      }} className="animate-blob" />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />
        {/* Hero Section */}
        <section style={{ position: 'relative', maxWidth: '80rem', margin: '0 auto', padding: '80px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'center' }}>
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
          >
            <div>
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--primary)',
                  marginBottom: '16px'
                }}
              >
                #StudentAchievements
              </motion.span>
              <h1 style={{
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                fontWeight: '800',
                lineHeight: '1.1',
                letterSpacing: '-0.02em',
                marginBottom: '24px',
                margin: 0
              }}>
                Track &
                <span style={{
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}> Manage</span> Student<br />
                <span style={{
                  background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}> Extracurricular</span> Achievements
              </h1>
            </div>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
              Comprehensive platform to recognize, document, and celebrate student achievements. Transform how you manage excellence.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              {user ? (
                <Button
                  variant="primary"
                  onClick={() => navigate(`/${user.role}/dashboard`)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  Go to Dashboard
                  <ArrowRight size={16} />
                </Button>
              ) : (
                <>
                  <Button
                    variant="primary"
                    onClick={() => navigate('/login')}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    Login to Dashboard
                    <ArrowRight size={16} />
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/register')}
                  >
                    Start Free Today
                  </Button>
                </>
              )}
            </div>
            {/* Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              paddingTop: '32px',
              borderTop: '1px solid var(--border-muted)'
            }}>
              <div>
                <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#c084fc', margin: 0 }}>143+</p>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>Achievements</p>
              </div>
              <div>
                <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#c084fc', margin: 0 }}>6</p>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>Students</p>
              </div>
              <div>
                <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#c084fc', margin: 0 }}>4</p>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>Categories</p>
              </div>
            </div>
          </motion.div>
          {/* Right Side - Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              position: 'relative',
              height: '420px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            className="animate-float"
          >
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              borderRadius: '24px',
              opacity: 0.3,
              filter: 'blur(30px)',
              transform: 'scale(0.95)'
            }} />
            <div className="glass-panel" style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              borderRadius: '24px',
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid rgba(255, 255, 255, 0.4)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ fontSize: '4.5rem', marginBottom: '24px', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}
                >
                  🏆
                </motion.div>
                <h3 style={{ color: 'var(--text-main)', fontWeight: '800', fontSize: '1.5rem', margin: 0, letterSpacing: '-0.02em' }}>Excellence Platform</h3>
                <p style={{ color: 'var(--primary)', fontSize: '1rem', marginTop: '12px', margin: 0, fontWeight: '500' }}>Powered by SAAMS</p>
              </div>
            </div>
          </motion.div>
        </section>
        {/* Features Section */}
        <section id="features" style={{
          borderTop: '1px solid var(--border-muted)',
          paddingTop: '80px',
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '80px 16px'
        }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center', marginBottom: '64px' }}
          >
            <h2 style={{
              fontSize: '2.25rem',
              fontWeight: 'bold',
              marginBottom: '16px', margin: 0
            }}>Powerful Features</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', margin: 0 }}>Everything you need to manage student achievements effectively</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card style={{ padding: 'var(--spacing-6)', height: '100%' }} className="cardHoverable">
                  <div style={{
                    padding: '16px',
                    background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.1) 0%, rgba(var(--secondary-rgb), 0.1) 100%)',
                    borderRadius: '16px',
                    width: 'fit-content',
                    marginBottom: '24px',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <feature.icon style={{ width: '28px', height: '28px', color: 'var(--primary)' }} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '12px', margin: 0, color: 'var(--text-light)' }}>{feature.title}</h3>
                  <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: '1.6' }}>{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
        {/* CTA Section */}
        <section style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '80px 16px'
        }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
          >
            <Card style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              textAlign: 'center',
              padding: '48px'
            }}>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '16px', margin: 0 }}>Ready to Transform Student Achievement Management?</h2>
              {user ? (
                <Button
                  variant="primary"
                  onClick={() => navigate(`/${user.role}/dashboard`)}
                  style={{ padding: 'var(--spacing-3) var(--spacing-8)', fontSize: '1.125rem' }}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '1.125rem', margin: 0 }}>Join us today and start tracking excellence</p>
                  <Button
                    variant="primary"
                    onClick={() => navigate('/register')}
                    style={{ padding: 'var(--spacing-3) var(--spacing-8)', fontSize: '1.125rem' }}
                  >
                    Get Started Free
                  </Button>
                </>
              )}
            </Card>
          </motion.div>
        </section>
        <footer style={{
          borderTop: '1px solid var(--border-muted)',
          marginTop: '5rem',
          paddingTop: '3rem',
          paddingBottom: '3rem',
          position: 'relative',
          zIndex: 1,
          background: 'var(--bg-surface)'
        }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ margin: 0, fontWeight: '500' }}>&copy; 2026 SAAMS - Student Achievement & Activity Management System. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

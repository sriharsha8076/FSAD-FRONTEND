import React, { useState, useEffect } from 'react';
import { Menu, X, Trophy } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { Button } from './Button';
import styles from './Navbar.module.css';

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <div className={styles.navContent}>
          {/* Logo */}
          <Link to="/" className={styles.logoContainer} onClick={closeMobileMenu}>
            <div className={styles.logoIcon}>
              <Trophy size={24} />
            </div>
            <span className={styles.logoText}>SAAMS</span>
          </Link>

          {/* Desktop Menu */}
          <div className={styles.desktopMenu}>
            {!user ? (
              <>
                <a href="/#features" className={styles.navLink}>Features</a>
                <Button onClick={() => navigate('/login')} variant="ghost">
                  Login
                </Button>
                <Button onClick={() => navigate('/register')} variant="primary">
                  Register
                </Button>
              </>
            ) : (
              <div className={styles.userInfo}>
                <span className={styles.userName}>Welcome, {user.name}</span>
                <span className={styles.userRole}>{user.role}</span>
                <Button onClick={handleLogout} variant="secondary">
                  Logout
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={styles.mobileMenuBtn}
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={styles.mobileMenu}>
            {!user ? (
              <div className={styles.mobileActions}>
                <a href="/#features" className={styles.mobileLink} onClick={closeMobileMenu}>
                  Features
                </a>
                <Button onClick={() => { navigate('/login'); closeMobileMenu(); }} variant="secondary" className="w-full">
                  Login
                </Button>
                <Button onClick={() => { navigate('/register'); closeMobileMenu(); }} variant="primary" className="w-full">
                  Register
                </Button>
              </div>
            ) : (
              <div className={styles.mobileActions}>
                <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--card-border)' }}>
                  <p className={styles.userName}>Welcome, {user.name}</p>
                  <span className={styles.userRole} style={{ display: 'inline-block', marginTop: '8px' }}>
                    {user.role}
                  </span>
                </div>
                <Button onClick={handleLogout} variant="secondary" className="w-full">
                  Logout
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
//123

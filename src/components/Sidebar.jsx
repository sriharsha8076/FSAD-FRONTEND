import React, { useState, useEffect } from 'react';
import { Menu, X, LayoutDashboard, Award, Users, FileText, BarChart3, Settings, LogOut, User, Plus, Eye, Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import styles from './Sidebar.module.css';

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { logout, user } = useAuth();
  const location = useLocation();

  // Close sidebar on mobile when route changes
  useEffect(() => {
    // Rely on location changes to close modal sidebars.
    setIsMobileOpen(false); // eslint-disable-line
  }, [location.pathname]);

  const adminMenuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Add Achievement', icon: Plus, path: '/admin/add-achievement' },
    { label: 'View Achievements', icon: Eye, path: '/admin/achievements' },
    { label: 'Students', icon: Users, path: '/admin/students' },
    { label: 'Reports', icon: FileText, path: '/admin/reports' },
    { label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
  ];

  const studentMenuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
    { label: 'My Achievements', icon: Award, path: '/student/achievements' },
    { label: 'Profile', icon: User, path: '/student/profile' },
  ];

  const superadminMenuItems = [
    { label: 'System Overview', icon: Shield, path: '/superadmin/dashboard' },
  ];

  const mentorMenuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/mentor/dashboard' },
    { label: 'Student Achievements', icon: Award, path: '/mentor/achievements' },
    { label: 'Profile', icon: User, path: '/profile' },
  ];

  let menuItems = studentMenuItems;
  if (user?.role === 'admin') menuItems = adminMenuItems;
  if (user?.role === 'superadmin') menuItems = superadminMenuItems;
  if (user?.role === 'mentor') menuItems = mentorMenuItems;

  const sidebarClass = `
    ${styles.sidebar} 
    ${isOpen ? styles.open : styles.closed}
    ${isMobileOpen ? styles.mobileOpen : ''}
  `.trim();

  // Toggle handlers
  const toggleDesktop = () => setIsOpen(!isOpen);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  return (
    <div className={styles.sidebarWrapper}>
      {/* Mobile Overlay Toggle - Visible only when mobile menu is open */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleMobile}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 30, background: 'rgba(0,0,0,0.5)' }}
        />
      )}

      {/* Sidebar Component */}
      <aside className={sidebarClass}>
        <div className={styles.toggleContainer}>
          <button onClick={toggleDesktop} className={styles.toggleBtn} aria-label="Toggle Sidebar">
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className={styles.navSection}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                title={!isOpen ? item.label : ''}
              >
                <div className={styles.iconWrapper}>
                  <item.icon size={20} />
                </div>
                <span className={styles.linkLabel}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.bottomSection}>
          <Link
            to="/settings"
            className={`${styles.navLink} ${location.pathname === '/settings' ? styles.active : ''}`}
            title={!isOpen ? 'Settings' : ''}
          >
            <div className={styles.iconWrapper}>
              <Settings size={20} />
            </div>
            <span className={styles.linkLabel}>Settings</span>
          </Link>

          <button onClick={logout} className={styles.logoutBtn} title={!isOpen ? 'Logout' : ''}>
            <div className={styles.iconWrapper}>
              <LogOut size={20} />
            </div>
            <span className={styles.linkLabel}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Spacer */}
      <div className={`${styles.contentSpacer} ${isOpen ? styles.contentSpacerOpen : styles.contentSpacerClosed}`} />
    </div>
  );
};
//123
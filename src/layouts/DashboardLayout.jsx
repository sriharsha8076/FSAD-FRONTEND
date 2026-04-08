import React from 'react';
import { Navbar, Sidebar } from '../components';
import styles from './DashboardLayout.module.css';

export const DashboardLayout = ({ children, title, description }) => {
  return (
    <div className={styles.layoutWrapper}>
      <Navbar />
      <div className={styles.mainContainer}>
        <Sidebar />
        <main className={styles.contentArea}>
          {(title || description) && (
            <div className={styles.pageHeader}>
              {title && <h1 className={styles.pageTitle}>{title}</h1>}
              {description && <p className={styles.pageDescription}>{description}</p>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};
//123
//Dashboard done sccessfully


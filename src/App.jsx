import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/AuthContext';
import { ToastProvider } from './components/Toast';
import './index.css';
import { ThemeProvider } from './utils/ThemeContext';
// Member 1 - Harsha implemented routing structure
// Layouts

//123
import { DashboardLayout } from './layouts/DashboardLayout';

// Components
import { ProtectedRoute } from './components';

// Lazy load pages
const LandingPage = lazy(() => import('./pages/LandingPage').then(module => ({ default: module.LandingPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(module => ({ default: module.RegisterPage })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard').then(module => ({ default: module.SuperAdminDashboard })));
const AddAchievementPage = lazy(() => import('./pages/AddAchievementPage').then(module => ({ default: module.AddAchievementPage })));
const ViewAchievementsPage = lazy(() => import('./pages/ViewAchievementsPage').then(module => ({ default: module.ViewAchievementsPage })));
const StudentsPage = lazy(() => import('./pages/StudentsPage').then(module => ({ default: module.StudentsPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(module => ({ default: module.ReportsPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(module => ({ default: module.AnalyticsPage })));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard').then(module => ({ default: module.StudentDashboard })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(module => ({ default: module.ProfilePage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(module => ({ default: module.SettingsPage })));
const MentorDashboard = lazy(() => import('./pages/MentorDashboard').then(module => ({ default: module.MentorDashboard })));

// Loading Component
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <div className="animate-glow" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)' }} />
  </div>
);

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={user ? <Navigate to={`/${user.role === 'university_admin' ? 'admin' : user.role}/dashboard`} replace /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to={`/${user.role === 'university_admin' ? 'admin' : user.role}/dashboard`} replace /> : <RegisterPage />} />

        {/* Super Admin Routes */}
        <Route
          path="/superadmin/dashboard"
          element={
            <ProtectedRoute requiredRole="superadmin">
              <DashboardLayout title="Super Admin Dashboard">
                <SuperAdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardLayout title="Admin Dashboard">
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add-achievement"
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardLayout title="Add Achievement">
                <AddAchievementPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/achievements"
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardLayout title="View Achievements">
                <ViewAchievementsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardLayout title="Student Database">
                <StudentsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardLayout title="System Reports">
                <ReportsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardLayout title="Analytics & Insights">
                <AnalyticsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute requiredRole="student">
              <DashboardLayout title="Student Dashboard">
                <StudentDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/add-achievement"
          element={
            <ProtectedRoute requiredRole="student">
              <DashboardLayout title="Add Achievement">
                <AddAchievementPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/achievements"
          element={
            <ProtectedRoute requiredRole="student">
              <DashboardLayout title="My Achievements">
                <ViewAchievementsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout title="My Profile">
                <ProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Mentor Routes */}
        <Route
          path="/mentor/dashboard"
          element={
            <ProtectedRoute requiredRole="mentor">
              <DashboardLayout title="Mentor Dashboard">
                <MentorDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentor/achievements"
          element={
            <ProtectedRoute requiredRole="mentor">
              <DashboardLayout title="Student Achievements">
                <ViewAchievementsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Shared Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout title="User Profile">
                <ProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <DashboardLayout title="Account Settings">
                <SettingsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <AppRoutes />
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

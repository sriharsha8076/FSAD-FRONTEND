import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    if (requiredRole === 'admin' && (user.role === 'admin' || user.role === 'university_admin')) {
      return children;
    }
    if (user.role !== requiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};
//123
//123
//1234

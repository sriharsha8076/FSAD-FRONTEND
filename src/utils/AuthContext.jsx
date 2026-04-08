import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.role === 'super_admin') parsed.role = 'superadmin';
      return parsed;
    }
    return null;
  });

  const [usersDB, setUsersDB] = useState([]);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  useEffect(() => {
    const validateSession = async () => {
      if (user?.token && user.id !== 'harsha21') {
        try {
          const response = await fetch('http://localhost:8080/api/users/me', {
            headers: { 'Authorization': `Bearer ${user.token}` }
          });
          if (response.status === 401 || response.status === 403 || response.status === 404) {
            logout();
          }
        } catch (error) {
          console.error("Session validation error:", error);
        }
      }
    };
    validateSession();
  }, [user?.token, user?.id]);

  // Load admins dynamically for SuperAdmin
  const fetchAdmins = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8080/api/users', {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      // Filter only admins for display
      setUsersDB(data.filter(u => u.role === 'UNIVERSITY_ADMIN' || u.role === 'ADMIN'));
    } catch (error) {
      console.error(error);
    }
  }, [user?.token]);

  const registerUser = async (userData) => {
    let role = userData.role.toUpperCase();
    const response = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: role,
        dob: userData.dob,
        mobileNo: userData.mobileNo,
        worksUnderUniversity: userData.worksUnderUniversity || false,
        universityId: userData.universityId || null
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  };

  const login = async (identifier, password, roleFallback = '') => {
    // SuperAdmin hardcode map
    if (identifier === 'harsha21' || roleFallback === 'superadmin') {
      const sessionUser = {
        id: 'harsha21',
        email: 'harsha21@saams.com',
        role: 'superadmin',
        name: 'Harsha (Creator)',
        isAuthenticated: true,
        token: 'superadmin-mock-token'
      };
      setUser(sessionUser);
      localStorage.setItem('user', JSON.stringify(sessionUser));
      return sessionUser;
    }

    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: identifier,
        password: password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed. Check your credentials.');
    }

    // MFA required — backend returns {requiresMfa, preAuthToken, name, email}
    if (data.requiresMfa) {
      return {
        requiresMfa: true,
        preAuthToken: data.preAuthToken,
        name: data.name,
        email: data.email,
      };
    }

    const sessionUser = {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role ? (data.role.toLowerCase() === 'super_admin' ? 'superadmin' : data.role.toLowerCase()) : 'student',
      uniqueId: data.uniqueId,
      dob: data.dob,
      mobileNo: data.mobileNo,
      token: data.token,
      isAuthenticated: true
    };

    setUser(sessionUser);
    localStorage.setItem('user', JSON.stringify(sessionUser));
    return sessionUser;
  };

  // Called after successful TOTP verification
  const completeMfaLogin = async (preAuthToken, totpCode) => {
    const response = await fetch('http://localhost:8080/api/mfa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preAuthToken, code: totpCode })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'MFA verification failed.');
    }

    const sessionUser = {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role ? (data.role.toLowerCase() === 'super_admin' ? 'superadmin' : data.role.toLowerCase()) : 'student',
      uniqueId: data.uniqueId,
      dob: data.dob,
      mobileNo: data.mobileNo,
      token: data.token,
      isAuthenticated: true
    };

    setUser(sessionUser);
    localStorage.setItem('user', JSON.stringify(sessionUser));
    return sessionUser;
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const createUniversityAdmin = async (adminData) => {
    const response = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.token}`
      },
      body: JSON.stringify({
        name: adminData.name,
        email: adminData.email,
        password: adminData.password,
        role: 'UNIVERSITY_ADMIN'
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create University Admin');
    }

    // Refresh admins
    fetchAdmins();
    return data;
  };

  const deleteUniversityAdmin = async (adminId) => {
    const response = await fetch(`http://localhost:8080/api/users/${adminId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${user?.token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete University Admin');
    }

    // Refresh admins
    fetchAdmins();
  };

  return (
    <AuthContext.Provider value={{ user, usersDB, login, logout, registerUser, updateUser, createUniversityAdmin, deleteUniversityAdmin, fetchAdmins, completeMfaLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

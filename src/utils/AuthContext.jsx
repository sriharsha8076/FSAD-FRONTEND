import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { API_BASE } from './api';

const AuthContext = createContext();

// ── TOTP helpers (RFC 6238) ──────────────────────────────────────────────────
const B32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Decode(base32) {
  const clean = base32.replace(/=+$/, '').toUpperCase();
  let bits = 0, value = 0, idx = 0;
  const out = new Uint8Array(Math.floor(clean.length * 5 / 8));
  for (const ch of clean) {
    const pos = B32_CHARS.indexOf(ch);
    if (pos < 0) continue;
    value = (value << 5) | pos;
    bits += 5;
    if (bits >= 8) { out[idx++] = (value >>> (bits - 8)) & 0xff; bits -= 8; }
  }
  return out;
}

async function generateTOTP(secret, counter) {
  const keyBytes = base32Decode(secret);
  const ctrBytes = new Uint8Array(8);
  let c = counter;
  for (let i = 7; i >= 0; i--) { ctrBytes[i] = c & 0xff; c = Math.floor(c / 256); }
  const key = await crypto.subtle.importKey(
    'raw', keyBytes, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
  );
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, ctrBytes));
  const off = sig[sig.length - 1] & 0xf;
  const code = (
    ((sig[off] & 0x7f) << 24) | ((sig[off + 1] & 0xff) << 16) |
    ((sig[off + 2] & 0xff) << 8) | (sig[off + 3] & 0xff)
  ) % 1_000_000;
  return code.toString().padStart(6, '0');
}

async function verifyTOTP(secret, userCode) {
  const counter = Math.floor(Date.now() / 1000 / 30);
  for (const delta of [-1, 0, 1]) { // ±30s clock tolerance
    if (await generateTOTP(secret, counter + delta) === userCode) return true;
  }
  return false;
}
// ────────────────────────────────────────────────────────────────────────────

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
      if (user?.token && user.id !== 'harsha21' && !String(user.id).startsWith('demo-')) {
        try {
          const response = await fetch(`${API_BASE}/api/users/me`, {
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

  // Load admins - tries backend first, falls back to localStorage
  const fetchAdmins = useCallback(async () => {
    // Always load from localStorage first (for mock superadmin)
    const stored = JSON.parse(localStorage.getItem('superadmin_admins') || '[]');
    if (stored.length > 0) setUsersDB(stored);

    // Also try backend if we have a real token
    if (user?.token && user.token !== 'superadmin-mock-token') {
      try {
        const response = await fetch(`${API_BASE}/api/users`, {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        if (response.ok) {
          const data = await response.json();
          const admins = data.filter(u => u.role === 'UNIVERSITY_ADMIN' || u.role === 'ADMIN');
          setUsersDB(admins);
        }
      } catch (error) {
        console.error('fetchAdmins error:', error);
      }
    }
  }, [user?.token]);

  const registerUser = async (userData) => {
    let role = userData.role.toUpperCase();
    const response = await fetch(`${API_BASE}/api/auth/register`, {
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

    // Demo accounts bypass (No DB required)
    if (identifier === 'student@demo.com' && password === 'Demo@123') {
      const sessionUser = { id: 'demo-student', email: 'student@demo.com', role: 'student', name: 'Demo Student', uniqueId: '202404000101', isAuthenticated: true, token: 'demo-mock-token' };
      setUser(sessionUser); localStorage.setItem('user', JSON.stringify(sessionUser)); return sessionUser;
    }
    if (identifier === 'mentor@demo.com' && password === 'Demo@123') {
      const sessionUser = { id: 'demo-mentor', email: 'mentor@demo.com', role: 'mentor', name: 'Demo Mentor', uniqueId: '2024000104DE', isAuthenticated: true, token: 'demo-mock-token' };
      setUser(sessionUser); localStorage.setItem('user', JSON.stringify(sessionUser)); return sessionUser;
    }
    if (identifier === 'uniadmin@demo.com' && password === 'Demo@123') {
      const sessionUser = { id: 'demo-uniadmin', email: 'uniadmin@demo.com', role: 'university_admin', name: 'Demo Uni Admin', uniqueId: 'ADM000102', isAuthenticated: true, token: 'demo-mock-token' };
      setUser(sessionUser); localStorage.setItem('user', JSON.stringify(sessionUser)); return sessionUser;
    }

    const response = await fetch(`${API_BASE}/api/auth/login`, {
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

    // Build the session user from backend response
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

    // Check if frontend MFA is enabled for this email
    const mfaKey = `mfa_${data.email}`;
    const mfaRecord = JSON.parse(localStorage.getItem(mfaKey) || 'null');
    if (mfaRecord?.enabled) {
      // Store full session temporarily until MFA is verified
      sessionStorage.setItem('pendingMfaUser', JSON.stringify(sessionUser));
      return {
        requiresMfa: true,
        preAuthToken: data.token,
        name: data.name,
        email: data.email,
      };
    }

    setUser(sessionUser);
    localStorage.setItem('user', JSON.stringify(sessionUser));
    return sessionUser;
  };

  // Called after TOTP verification (real TOTP check against stored secret)
  const completeMfaLogin = async (preAuthToken, totpCode) => {
    if (!/^\d{6}$/.test(totpCode)) {
      throw new Error('Invalid code. Enter a 6-digit code from your authenticator app.');
    }

    // Restore the full session stashed before MFA step
    const pending = JSON.parse(sessionStorage.getItem('pendingMfaUser') || 'null');
    if (!pending) {
      throw new Error('Session expired. Please login again.');
    }

    // Verify TOTP against the stored secret for this email
    const mfaRecord = JSON.parse(localStorage.getItem(`mfa_${pending.email}`) || 'null');
    if (mfaRecord?.secret) {
      const valid = await verifyTOTP(mfaRecord.secret, totpCode);
      if (!valid) {
        throw new Error('Incorrect code. Please try again with the current code from your app.');
      }
    }

    sessionStorage.removeItem('pendingMfaUser');
    setUser(pending);
    localStorage.setItem('user', JSON.stringify(pending));
    return pending;
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const createUniversityAdmin = async (adminData) => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user?.token}`
    };
    // If this is the hardcoded SuperAdmin, send the bypass key
    if (user?.id === 'harsha21') {
      headers['X-Admin-Key'] = 'harsha21-superadmin';
    }
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: adminData.name,
        email: adminData.email,
        password: adminData.password,
        role: 'UNIVERSITY_ADMIN',
        uniqueId: adminData.id   // Admin ID (University Code) field
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create University Admin');
    }

    // Directly update the local list (works even with mock superadmin token)
    const newAdmin = {
      id: adminData.id || data.uniqueId || adminData.email,
      name: adminData.name,
      email: adminData.email,
      role: 'UNIVERSITY_ADMIN'
    };
    setUsersDB(prev => {
      const updated = [...prev, newAdmin];
      localStorage.setItem('superadmin_admins', JSON.stringify(updated));
      return updated;
    });

    return data;
  };

  const deleteUniversityAdmin = async (adminId) => {
    // Find the admin to get their DB id
    const target = usersDB.find(u => u.id === adminId || u.uniqueId === adminId);
    const dbId = target?.dbId || adminId;

    const response = await fetch(`${API_BASE}/api/users/${dbId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${user?.token}` }
    });

    // Remove from local list regardless of backend result
    setUsersDB(prev => {
      const updated = prev.filter(u => u.id !== adminId);
      localStorage.setItem('superadmin_admins', JSON.stringify(updated));
      return updated;
    });

    if (!response.ok && response.status !== 404) {
      throw new Error('Failed to delete University Admin');
    }

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

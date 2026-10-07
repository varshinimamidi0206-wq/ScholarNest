import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authAPI, profileAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('scholarnest_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [student, setStudent] = useState(() => {
    try {
      const saved = localStorage.getItem('scholarnest_student');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('scholarnest_token'));
  
  // Non-blocking initial loading: if user & token are already cached, render immediately without full-page spinner!
  const [loading, setLoading] = useState(() => {
    const hasToken = Boolean(localStorage.getItem('scholarnest_token'));
    const hasUser = Boolean(localStorage.getItem('scholarnest_user'));
    return hasToken && !hasUser;
  });

  const inFlightRef = useRef(null);
  const lastFetchedRef = useRef(0);

  const fetchCurrentUser = useCallback(async (force = false) => {
    const savedToken = localStorage.getItem('scholarnest_token');
    if (!savedToken) {
      setLoading(false);
      return;
    }

    // Throttle duplicate calls within 30s unless forced
    const now = Date.now();
    if (!force && now - lastFetchedRef.current < 30000 && lastFetchedRef.current > 0) {
      setLoading(false);
      return;
    }

    if (inFlightRef.current) {
      return inFlightRef.current;
    }

    inFlightRef.current = (async () => {
      try {
        const res = await authAPI.getMe();
        if (res.data.success) {
          setUser(res.data.user);
          setStudent(res.data.student);
          lastFetchedRef.current = Date.now();
          try {
            localStorage.setItem('scholarnest_user', JSON.stringify(res.data.user));
            if (res.data.student) {
              localStorage.setItem('scholarnest_student', JSON.stringify(res.data.student));
            }
          } catch (e) {}
        }
      } catch (err) {
        if (err.response && err.response.status === 401) {
          console.warn('Session verification failed, logging out:', err.message);
          logout();
        }
      } finally {
        setLoading(false);
        inFlightRef.current = null;
      }
    })();

    return inFlightRef.current;
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      if (res.data?.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('scholarnest_token', res.data.token);
        localStorage.setItem('scholarnest_user', JSON.stringify(res.data.user));
        await fetchCurrentUser();
        return res.data;
      }
      throw new Error(res.data?.message || 'Login failed');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      throw new Error(msg);
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await authAPI.register({ name, email, password });
      if (res.data?.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('scholarnest_token', res.data.token);
        localStorage.setItem('scholarnest_user', JSON.stringify(res.data.user));
        await fetchCurrentUser();
        return res.data;
      }
      throw new Error(res.data?.message || 'Registration failed');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem('scholarnest_token');
    localStorage.removeItem('scholarnest_user');
    localStorage.removeItem('scholarnest_student');
    localStorage.removeItem('scholarnest_dashboard_cache');
    setToken(null);
    setUser(null);
    setStudent(null);
  };

  const updateStudentProfile = async (profileData) => {
    const res = await profileAPI.updateProfile(profileData);
    if (res.data.success) {
      setStudent(res.data.profile);
      return res.data.profile;
    }
    throw new Error(res.data.message || 'Update failed');
  };

  const value = {
    user,
    student,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
    updateStudentProfile,
    refreshMe: fetchCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

'use client';
import { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Load user on startup
  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
        
        // Always verify with backend on startup
        const res = await api.get('/auth/me');
        if (res.data.success) {
          const userData = res.data.data;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (err) {
        console.error('Failed to load user session:', err);
        logout();
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { user: userData, token, refreshToken } = res.data.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        
        // Redirect based on role
        if (userData.role === 'admin' || userData.role === 'superadmin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/client/dashboard');
        }
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data.success) {
        const { user: newUserData, token, refreshToken } = res.data.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(newUserData));
        
        setUser(newUserData);
        
        // Redirect to client dashboard since register defaults to client
        router.push('/client/dashboard');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    setLoading(true);
    try {
      // Call backend logout (best effort)
      await api.post('/auth/logout').catch(() => {});
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      setLoading(false);
      router.push('/login');
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

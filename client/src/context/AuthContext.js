import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/.netlify/functions/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('authToken');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setError(null);
      const response = await axios.post('/.netlify/functions/auth/login', { username, password });
      const { token, user } = response.data;

      localStorage.setItem('authToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.post('/.netlify/functions/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to change password';
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    changePassword,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

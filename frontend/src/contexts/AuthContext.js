// contexts/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ⬇️ CONFIGURAR AXIOS GLOBALMENTE ⬇️
  const setupAxiosHeaders = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login/', {
        username,
        password
      });
      console.log("Login response:", response.data);

      const { user, token } = response.data;
      
      localStorage.setItem('access_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // ⬇️ CONFIGURAR AXIOS APÓS LOGIN ⬇️
      setupAxiosHeaders(token);
      
      setUser(user);
      
      console.log('✅ Login realizado - Token configurado');
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:8080/api/auth/register/', userData);
      
      const { user, token } = response.data;
      
      localStorage.setItem('access_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // ⬇️ CONFIGURAR AXIOS APÓS REGISTRO ⬇️
      setupAxiosHeaders(token);
      
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setupAxiosHeaders(null); // ⬅️ REMOVER HEADER
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
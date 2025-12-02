// contexts/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { authAPI } from '../services/api'; // ⬅️ IMPORTE A API

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
      // O interceptor do axios já cuida do header agora
      // axios.defaults.headers.common['Authorization'] = `Token ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      // ⬇️ USE A API UNIFICADA ⬇️
      const response = await authAPI.login({ username, password });
      const { user, token } = response.data;
      
      localStorage.setItem('access_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      
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
      // ⬇️ USE A API UNIFICADA ⬇️
      const response = await authAPI.register(userData);
      const { user, token } = response.data;
      
      localStorage.setItem('access_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Registration failed' 
      };
    }
  };

  // ⬇️ NOVA FUNÇÃO PARA ATUALIZAR PERFIL ⬇️
  const updateProfile = async (profileData) => {
    try {
      
      let response;
      
      // Se for FormData (com arquivo), usar axios diretamente com headers específicos
      if (profileData instanceof FormData) {
        const token = localStorage.getItem('access_token');
        response = await axios.patch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile/update/`,
          profileData,
          {
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'multipart/form-data', // ⬅️ IMPORTANTE para FormData
            },
          }
        );
      } else {
        // Se for JSON normal, usar a API
        response = await authAPI.updateProfile(profileData);
      }
      
      // Atualiza o usuário no estado e localStorage
      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { success: true, user: updatedUser };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Erro ao atualizar perfil' 
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
    updateProfile, // ⬅️ EXPORTE A NOVA FUNÇÃO
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
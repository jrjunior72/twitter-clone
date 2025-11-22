// src/services/api.js

import axios from 'axios';


const API_BASE_URL = 'http://localhost:8080/api';

// Criar instância do axios com configurações
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para adicionar token automaticamente a TODAS as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  getProfile: () => api.get('/auth/profile/'),
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  // console.log('🔐 getAuthHeaders - Token:', token ? 'EXISTE' : 'NÃO EXISTE');
  return token ? { 'Authorization': `Token ${token}` } : {};
};

export const postsAPI = {
  getPosts: async (page = 1) => {
    const response = await api.get(`/posts/?page=${page}`);
    // console.log('✅ [API] Posts recebidos:', response.data);
    return response.data; // devolve direto o array
  },

  // 🔄 NOVO ENDPOINT - Feed personalizado
  getPersonalFeed: async (page = 1) => {
    const response = await api.get(`/posts/feed/?page=${page}`);
    return response.data;
  },
  // ... resto permanece igual

  createPost: async (postData) => {
    const response = await api.post('/posts/', postData);
    return response.data; // retorna objeto com count, next, previous, results
  },
  likePost: async (postId) => {
    const response = await api.post(`/posts/${postId}/like/`);
    return response.data;
  },
};




export const relationshipsAPI = {
  followUser: (username) => api.post(`/relationships/follow/${username}/`),
  getFollowing: () => api.get('/relationships/following/'),
  getFollowers: () => api.get('/relationships/followers/'),
};
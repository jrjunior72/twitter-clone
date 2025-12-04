// src/services/api.js

import axios from 'axios';


const API_BASE_URL = process.env.REACT_APP_API_URL

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

// Interceptor para respostas (tratar erros de autenticação)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  getProfile: () => api.get('/auth/profile/'), // ⬅️ GET do perfil
  updateProfile: (profileData) => api.patch('/auth/profile/', profileData), // ⬅️ UPDATE do perfil
  changePassword: (passwordData) => api.post('/auth/change-password/', passwordData), // CHANGE password
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

  createPost: async (postData) => {
    const response = await api.post('/posts/', postData);
    return response.data; // retorna objeto com count, next, previous, results
  },

  likePost: async (postId) => {
    const response = await api.post(`/posts/${postId}/like/`);
    return response.data;
  },
  
  // ⬇️ URLs CORRIGIDAS PARA COMENTÁRIOS
  getPostComments: (postId) => api.get(`/posts/${postId}/comments/`),  // GET para listar
  createComment: (postId, commentData) => api.post(`/posts/${postId}/comments/create/`, commentData),  // POST para criar

  // 🆕 NOVAS FUNÇÕES PARA EDITAR/EXCLUIR COMENTÁRIOS
  updateComment: (postId, commentId, commentData) => 
    api.patch(`/posts/${postId}/comments/${commentId}/`, commentData),
  
  deleteComment: (postId, commentId) => 
    api.delete(`/posts/${postId}/comments/${commentId}/`),

};

// ADICIONADO ESTE BLOCO-----------------------------------------------------
export const usersAPI = {
  // ⬇️ CORREÇÃO: Use /auth/ em vez de /users/
  getUserByUsername: (username) => api.get(`/auth/users/${username}/`),
  getUserById: (userId) => api.get(`/auth/users/${userId}/`),
  // ⬇️ CORREÇÃO: Estas URLs também precisam do /auth/
  getFollowers: (username) => api.get(`/auth/profile/${username}/followers/`),
  getFollowing: (username) => api.get(`/auth/profile/${username}/following/`),
  // ⬇️ JÁ ESTÃO CORRETAS
  followUser: (user_id) => api.post(`/auth/follow/${user_id}/`),
  unfollowUser: (user_id) => api.post(`/auth/unfollow/${user_id}/`),
  checkFollowStatus: (user_id) => api.get(`/auth/follow-status/${user_id}/`),
  getUserSuggestions: () => api.get('/auth/suggestions/'),
  searchUsers: (query) => api.get(`/auth/search/?q=${encodeURIComponent(query)}`),
};
//----------------------------------------------------------------------------

export const relationshipsAPI = {
  followUser: (username) => api.post(`auth/relationships/follow/${username}/`),
  getFollowing: () => api.get('auth/relationships/following/'),
  getFollowers: () => api.get('auth/relationships/followers/'),
};
// src/services/AuthProvider.js

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export const authAPI = {
    login: (credentials) => axios.post(`${API_BASE_URL}/auth/login/`, credentials),
    register: (userData) => axios.post(`${API_BASE_URL}/auth/register/`, userData),
    getProfile: () => axios.get(`${API_BASE_URL}/auth/profile/`),
};

export const postsAPI = {
    getPosts: () => axios.get(`${API_BASE_URL}/posts/`),
    createPost: (postData) => axios.post(`${API_BASE_URL}/posts/`, postData),
    likePost: (postId) => axios.post(`${API_BASE_URL}/posts/${postId}/like/`),
};

export const relationshipsAPI = {
    followUser: (username) => axios.post(`${API_BASE_URL}/relationships/follow/${username}/`),
    getFollowing: () => axios.get(`${API_BASE_URL}/relationships/following/`),
    getFollowers: () => axios.get(`${API_BASE_URL}/relationships/followers/`),
};
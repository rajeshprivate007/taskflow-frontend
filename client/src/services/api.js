import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/user/register', userData),
  login: (credentials) => api.post('/user/login', credentials),
  logout: () => api.post('/user/logout'),
  getProfile: () => api.get('/user/profile'),
  updateProfile: (userData) => api.put('/user/profile', userData),
  changePassword: (passwordData) => api.put('/user/change-password', passwordData),
  deleteAccount: (password) => api.delete('/user/account', { data: { password } }),
};

// Todo API
export const todoAPI = {
  // Get all todos with optional filters
  getTodos: (params = {}) => api.get('/todos', { params }),
  
  // Get single todo
  getTodo: (id) => api.get(`/todos/${id}`),
  
  // Create todo
  createTodo: (todoData) => api.post('/todos', todoData),
  
  // Update todo
  updateTodo: (id, todoData) => api.put(`/todos/${id}`, todoData),
  
  // Toggle todo status
  toggleTodo: (id) => api.patch(`/todos/${id}/toggle`),
  
  // Delete todo
  deleteTodo: (id) => api.delete(`/todos/${id}`),
  
  // Archive todo
  archiveTodo: (id) => api.patch(`/todos/${id}/archive`),
  
  // Add subtask
  addSubtask: (id, subtaskData) => api.post(`/todos/${id}/subtasks`, subtaskData),
  
  // Toggle subtask
  toggleSubtask: (id, subtaskId) => api.patch(`/todos/${id}/subtasks/${subtaskId}`),
  
  // Add comment
  addComment: (id, commentData) => api.post(`/todos/${id}/comments`, commentData),
  
  // Get todo statistics
  getStats: () => api.get('/todos/stats/overview'),
  
  // Bulk operations
  bulkOperation: (operationData) => api.post('/todos/bulk', operationData),
};

// Utility functions
export const apiUtils = {
  handleError: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  setAuthData: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
  
  clearAuthData: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default api;

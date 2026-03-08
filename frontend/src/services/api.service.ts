/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('userToken');
  if (token) {
    config.headers.access_token = token;
  }

  return config;
});

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('userToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  createUser: (userData: any) => api.post('/auth/create-user', userData),
  login: (credentials: any) => api.post('/auth/login', credentials),
  logout: () => api.get('/auth/logout'),
  updatePassword: (data: any) => api.put('/auth/update-password', data),
  resetPassword: (userId: string, data: any) => api.put(`/auth/reset-password/${userId}`, data),
};

// Blog Services
export const blogService = {
  create: (formData: FormData) => api.post('/blog', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: () => api.get('/blog'),
  getById: (id: string) => api.get(`/blog/${id}`),
  update: (id: string, formData: FormData) => api.put(`/blog/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id: string) => api.delete(`/blog/${id}`),
};

// Enquiry Services
export const enquiryService = {
  create: (data: any) => api.post('/enquiry', data),
  getAll: () => api.get('/enquiry'),
  getById: (id: string) => api.get(`/enquiry/${id}`),
  update: (id: string, data: any) => api.put(`/enquiry/${id}`, data),
  respond: (enquiryId: string, data: any) => api.post(`/enquiry/respond/${enquiryId}`, data),
  delete: (enquiryId: string) => api.delete(`/enquiry/${enquiryId}`),
};

// Feedback Services
export const feedbackService = {
  create: (data: any) => api.post('/feedback', data),
  getAll: () => api.get('/feedback'),
  getById: (id: string) => api.get(`/feedback/${id}`),
  update: (id: string, data: any) => api.put(`/feedback/${id}`, data),
  delete: (id: string) => api.delete(`/feedback/${id}`),
};

// Project Services
export const projectService = {
  create: (formData: FormData) => api.post('/project', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: () => api.get('/project'),
  getById: (id: string) => api.get(`/project/${id}`),
  update: (id: string, formData: FormData) => api.put(`/project/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id: string) => api.delete(`/project/${id}`),
};

// User Services
export const userService = {
  getProfile: () => api.get('/user/profile'),
  getAll: () => api.get('/user'),
  update: (userId: string, data: any) => api.put(`/user/${userId}`, data),
  delete: (userId: string) => api.delete(`/user/${userId}`),
};

export default api;
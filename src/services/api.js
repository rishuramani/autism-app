import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', response.data.token);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    localStorage.setItem('token', response.data.token);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      throw error;
    }
  }
};

export const users = {
  updateProfile: async (data) => {
    const response = await api.patch('/users/me', data);
    return response.data;
  },

  saveAssessment: async (results) => {
    const response = await api.post('/users/me/assessments', results);
    return response.data;
  },

  getLatestAssessment: async () => {
    const response = await api.get('/users/me/assessments/latest');
    return response.data;
  }
};

export default api; 
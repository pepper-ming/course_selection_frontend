import apiClient from './api';

export default {
  async login(credentials) {
    const response = await apiClient.post('/auth/login/', credentials);
    if (response.data.csrfToken) {
      sessionStorage.setItem('csrfToken', response.data.csrfToken);
    }
    return response.data;
  },

  async logout() {
    const response = await apiClient.post('/auth/logout/');
    sessionStorage.removeItem('csrfToken');
    return response.data;
  },

  async register(userData) {
    const response = await apiClient.post('/auth/register/', userData);
    return response.data;
  },

  async getCurrentUser() {
    const response = await apiClient.get('/auth/me/');
    return response.data;
  },

  async getCsrfToken() {
    try {
      const response = await apiClient.get('/auth/csrf/');
      const token = response.data.csrfToken;
      sessionStorage.setItem('csrfToken', token);
      return token;
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
    }
  }
};
import apiClient from './api';

export default {
  // 登入
  async login(credentials) {
    const response = await apiClient.post('/auth/login/', credentials);
    return response.data;
  },

  // 登出
  async logout() {
    const response = await apiClient.post('/auth/logout/');
    return response.data;
  },

  // 註冊
  async register(userData) {
    const response = await apiClient.post('/auth/register/', userData);
    return response.data;
  },

  // 取得當前使用者資訊
  async getCurrentUser() {
    const response = await apiClient.get('/auth/me/');
    return response.data;
  }
};
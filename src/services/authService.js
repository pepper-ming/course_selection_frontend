import apiClient from './api';

export default {
  async login(credentials) {
    try {
      console.log('嘗試登入:', credentials.username);
      const response = await apiClient.post('/auth/login/', credentials);
      console.log('登入回應:', response.data);
      return response.data;
    } catch (error) {
      console.error('登入錯誤:', error);
      throw error;
    }
  },

  async logout() {
    try {
      const response = await apiClient.post('/auth/logout/');
      return response.data;
    } catch (error) {
      console.error('登出錯誤:', error);
      // 即使登出失敗也要清除本地狀態
      throw error;
    }
  },

  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register/', userData);
      return response.data;
    } catch (error) {
      console.error('註冊錯誤:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me/');
      return response.data;
    } catch (error) {
      console.error('取得當前使用者錯誤:', error);
      throw error;
    }
  },

  // 為了向後相容，保留這個方法（但實際上不做任何事）
  async getCsrfToken() {
    console.log('CSRF token 已由後端 CsrfExemptSessionAuthentication 處理');
    return null;
  }
};
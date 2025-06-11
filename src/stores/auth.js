import { defineStore } from 'pinia';
import authService from '@/services/authService';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),

  getters: {
    currentUser: (state) => state.user,
    isStudent: (state) => state.user?.role === 'student',
    isTeacher: (state) => state.user?.role === 'teacher',
    isAdmin: (state) => state.user?.role === 'admin'
  },

  actions: {
    async login(credentials) {
      console.log('Auth Store: 開始登入');
      this.loading = true;
      this.error = null;
      
      try {
        const response = await authService.login(credentials);
        console.log('Auth Store: 登入成功', response);
        
        this.user = response.user;
        this.isAuthenticated = true;
        return response;
      } catch (error) {
        console.error('Auth Store: 登入失敗', error);
        this.error = error.response?.data?.detail || '登入失敗';
        this.user = null;
        this.isAuthenticated = false;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      console.log('Auth Store: 開始登出');
      try {
        await authService.logout();
        console.log('Auth Store: 登出成功');
      } catch (error) {
        console.error('Auth Store: 登出錯誤', error);
      } finally {
        // 無論是否成功都重置狀態
        this.$reset();
      }
    },

    async register(userData) {
      console.log('Auth Store: 開始註冊');
      this.loading = true;
      this.error = null;
      
      try {
        const response = await authService.register(userData);
        console.log('Auth Store: 註冊成功', response);
        return response;
      } catch (error) {
        console.error('Auth Store: 註冊失敗', error);
        this.error = error.response?.data?.detail || '註冊失敗';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchCurrentUser() {
      console.log('Auth Store: 開始獲取當前使用者');
      this.loading = true;
      
      try {
        const user = await authService.getCurrentUser();
        console.log('Auth Store: 獲取使用者成功', user);
        
        this.user = user;
        this.isAuthenticated = true;
        return user;
      } catch (error) {
        console.log('Auth Store: 獲取使用者失敗（可能未登入）', error.message);
        this.user = null;
        this.isAuthenticated = false;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 重置狀態的方法
    $reset() {
      console.log('Auth Store: 重置狀態');
      this.user = null;
      this.isAuthenticated = false;
      this.loading = false;
      this.error = null;
    }
  }
});
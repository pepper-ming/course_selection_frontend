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
      this.loading = true;
      this.error = null;
      try {
        const response = await authService.login(credentials);
        this.user = response.user;
        this.isAuthenticated = true;
        return response;
      } catch (error) {
        this.error = error.response?.data?.detail || '登入失敗';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      try {
        await authService.logout();
      } finally {
        this.user = null;
        this.isAuthenticated = false;
      }
    },

    async register(userData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await authService.register(userData);
        return response;
      } catch (error) {
        this.error = error.response?.data?.detail || '註冊失敗';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchCurrentUser() {
      try {
        const user = await authService.getCurrentUser();
        this.user = user;
        this.isAuthenticated = true;
        return user;
      } catch (error) {
        this.user = null;
        this.isAuthenticated = false;
        throw error;
      }
    }
  }
});
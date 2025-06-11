import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// 請求攔截器
apiClient.interceptors.request.use(
  config => {
    const csrfToken = sessionStorage.getItem('csrfToken');
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 回應攔截器
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          const authStore = useAuthStore();
          authStore.$reset();
          window.location.href = '/login';
          break;
        case 403:
          console.error('權限不足或 CSRF token 錯誤');
          break;
        case 500:
          console.error('伺服器錯誤，請稍後再試');
          break;
      }
    } else if (error.request) {
      console.error('網路連線錯誤，請檢查網路連線');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
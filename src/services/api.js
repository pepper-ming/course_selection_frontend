import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

// 修正：使用相對路徑，讓 Vite 代理處理
const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// 請求攔截器 - 簡化 CSRF 處理
apiClient.interceptors.request.use(
  config => {
    // 移除 CSRF token 處理，使用 Django 的 CsrfExemptSessionAuthentication
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
    console.error('API 錯誤:', error);
    
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      console.error(`HTTP ${status}:`, data);
      
      switch (status) {
        case 401:
          console.error('認證失敗 - 未登入或登入過期');
          const authStore = useAuthStore();
          authStore.$reset();
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403:
          console.error('權限不足');
          break;
        case 404:
          console.error('資源不存在');
          break;
        case 500:
          console.error('伺服器內部錯誤');
          break;
        default:
          console.error('其他錯誤:', status);
      }
    } else if (error.request) {
      console.error('網路錯誤 - 無法連接到伺服器');
    } else {
      console.error('請求設定錯誤:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
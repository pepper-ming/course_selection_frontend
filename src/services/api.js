import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 啟用 cookie 以支援 session 認證
});

// 請求攔截器
apiClient.interceptors.request.use(
  config => {
    // 從 sessionStorage 取得 CSRF token（如果有的話）
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
    if (error.response?.status === 401) {
      // 未授權，導向登入頁
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
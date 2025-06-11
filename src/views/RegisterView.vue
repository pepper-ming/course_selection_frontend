<template>
  <div class="register-page">
    <div class="register-container">
      <h1>註冊新帳號</h1>
      
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="username">帳號 *</label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            placeholder="請輸入學號或帳號"
            required
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="name">姓名 *</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            placeholder="請輸入真實姓名"
            required
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="email">電子郵件</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="選填"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="password">密碼 *</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            placeholder="至少 8 個字元"
            required
            minlength="8"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="password_confirm">確認密碼 *</label>
          <input
            id="password_confirm"
            v-model="formData.password_confirm"
            type="password"
            placeholder="請再次輸入密碼"
            required
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="role">身份 *</label>
          <select
            id="role"
            v-model="formData.role"
            required
            :disabled="loading"
          >
            <option value="student">學生</option>
            <option value="teacher">教師</option>
          </select>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          註冊成功！即將跳轉至登入頁面...
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? '註冊中...' : '註冊' }}
        </button>
      </form>

      <div class="links">
        <router-link to="/login">已有帳號？立即登入</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const formData = reactive({
  username: '',
  password: '',
  password_confirm: '',
  name: '',
  email: '',
  role: 'student'
});

const loading = ref(false);
const error = ref('');
const success = ref(false);

const handleRegister = async () => {
  loading.value = true;
  error.value = '';

  // 前端驗證
  if (formData.password !== formData.password_confirm) {
    error.value = '密碼與確認密碼不符';
    loading.value = false;
    return;
  }

  try {
    await authStore.register(formData);
    success.value = true;
    
    // 3秒後跳轉至登入頁
    setTimeout(() => {
      router.push('/login');
    }, 3000);
  } catch (err) {
    const errorData = err.response?.data;
    
    // 處理各種錯誤格式
    if (errorData?.non_field_errors) {
      error.value = errorData.non_field_errors[0];
    } else if (errorData?.username) {
      error.value = `帳號錯誤：${errorData.username[0]}`;
    } else if (errorData?.detail) {
      error.value = errorData.detail;
    } else {
      error.value = '註冊失敗，請稍後再試';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  padding: 1rem;
}

.register-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 450px;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 500;
  color: #555;
}

input, select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus, select:focus {
  outline: none;
  border-color: #3498db;
}

input:disabled, select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  font-size: 0.9rem;
  text-align: center;
  padding: 0.5rem;
  background-color: #fee;
  border-radius: 4px;
}

.success-message {
  color: #27ae60;
  font-size: 0.9rem;
  text-align: center;
  padding: 0.5rem;
  background-color: #eafaf1;
  border-radius: 4px;
}

.submit-btn {
  padding: 0.75rem;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  background-color: #229954;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.links {
  text-align: center;
  margin-top: 1.5rem;
}

.links a {
  color: #3498db;
  text-decoration: none;
}

.links a:hover {
  text-decoration: underline;
}
</style>
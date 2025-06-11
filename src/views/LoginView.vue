<template>
  <div class="login-page">
    <div class="login-container">
      <h1>登入選課系統</h1>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">帳號</label>
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
          <label for="password">密碼</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            placeholder="請輸入密碼"
            required
            :disabled="loading"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? '登入中...' : '登入' }}
        </button>
      </form>

      <div class="links">
        <router-link to="/register">還沒有帳號？立即註冊</router-link>
      </div>

      <!-- 測試帳號提示 -->
      <div class="test-accounts">
        <h3>測試帳號</h3>
        <div class="account-info">
          <p>學生帳號：student001 ~ student020</p>
          <p>教師帳號：teacher001 ~ teacher003</p>
          <p>管理員帳號：admin / admin123</p>
          <p>其他帳號密碼：password123</p>
        </div>
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
  password: ''
});

const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  loading.value = true;
  error.value = '';

  try {
    await authStore.login(formData);
    router.push('/courses');
  } catch (err) {
    error.value = err.response?.data?.detail || err.response?.data?.errors?.non_field_errors?.[0] || '登入失敗，請檢查帳號密碼';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  padding: 1rem;
}

.login-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.login-form {
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

input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #3498db;
}

input:disabled {
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

.submit-btn {
  padding: 0.75rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background-color: #2980b9;
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

.test-accounts {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.test-accounts h3 {
  font-size: 1rem;
  color: #7f8c8d;
  margin-bottom: 0.5rem;
}

.account-info {
  font-size: 0.85rem;
  color: #95a5a6;
  line-height: 1.5;
}

.account-info p {
  margin: 0.25rem 0;
}
</style>
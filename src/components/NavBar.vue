<template>
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-brand">
        <router-link to="/">選課系統</router-link>
      </div>
      
      <div class="nav-menu" v-if="authStore.isAuthenticated">
        <router-link to="/courses" class="nav-link">
          課程查詢
        </router-link>
        <router-link to="/enrollment" class="nav-link">
          選課作業
        </router-link>
        <router-link to="/my-courses" class="nav-link">
          我的課表
        </router-link>
      </div>

      <div class="nav-user">
        <template v-if="authStore.isAuthenticated">
          <span class="user-info">
            {{ authStore.user?.name }} ({{ authStore.user?.role_display || authStore.user?.role }})
          </span>
          <button @click="handleLogout" class="logout-btn">
            登出
          </button>
        </template>
        <template v-else>
          <router-link to="/login" class="nav-link">登入</router-link>
          <router-link to="/register" class="nav-link">註冊</router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('登出失敗:', error);
  }
};
</script>

<style scoped>
.navbar {
  background-color: #2c3e50;
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand a {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
}

.nav-menu {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  background-color: #34495e;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  font-size: 0.9rem;
}

.logout-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: #c0392b;
}
</style>
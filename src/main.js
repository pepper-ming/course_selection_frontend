import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import authService from './services/authService';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// 初始化時嘗試取得 CSRF token
authService.getCsrfToken().catch(() => {
  console.log('CSRF token 初始化失敗，將在需要時重試');
});

app.mount('#app');
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// 移除 CSRF token 初始化，因為我們使用 CsrfExemptSessionAuthentication
console.log('應用程式初始化完成');

app.mount('#app');
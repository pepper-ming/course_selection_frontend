import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/courses'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/courses',
      name: 'courses',
      component: () => import('@/views/CourseListView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/enrollment',
      name: 'enrollment',
      component: () => import('@/views/EnrollmentView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/my-courses',
      name: 'my-courses',
      component: () => import('@/views/MyCoursesView.vue'),
      meta: { requiresAuth: true }
    }
  ]
});

// 導航守衛
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // 嘗試獲取當前使用者（如果尚未獲取）
  if (!authStore.user && !authStore.loading) {
    try {
      await authStore.fetchCurrentUser();
    } catch (error) {
      // 忽略錯誤，使用者未登入
    }
  }

  // 需要登入的頁面
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  }
  // 訪客限定頁面（已登入不能訪問）
  else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/courses');
  }
  else {
    next();
  }
});

export default router;
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login' // 暫時改為重導向到登入頁
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

// 簡化的導航守衛，添加更多調試信息
router.beforeEach(async (to, from, next) => {
  console.log('路由導航:', { from: from.path, to: to.path });
  
  const authStore = useAuthStore();
  console.log('認證狀態:', {
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user,
    loading: authStore.loading
  });

  try {
    // 如果還沒有嘗試獲取使用者資訊，且不是在載入中
    if (!authStore.user && !authStore.loading && !authStore.isAuthenticated) {
      console.log('嘗試獲取當前使用者...');
      try {
        await authStore.fetchCurrentUser();
        console.log('成功獲取使用者:', authStore.user);
      } catch (error) {
        console.log('獲取使用者失敗（可能未登入）:', error.message);
        // 不需要處理，繼續路由邏輯
      }
    }

    // 需要登入的頁面
    if (to.meta.requiresAuth) {
      if (!authStore.isAuthenticated) {
        console.log('需要登入，重導向到登入頁');
        next('/login');
        return;
      }
    }
    
    // 訪客限定頁面（已登入不能訪問）
    if (to.meta.requiresGuest) {
      if (authStore.isAuthenticated) {
        console.log('已登入，重導向到課程頁');
        next('/courses');
        return;
      }
    }
    
    console.log('路由導航成功');
    next();
  } catch (error) {
    console.error('路由導航錯誤:', error);
    // 發生錯誤時，根據目標頁面決定行為
    if (to.meta.requiresAuth) {
      next('/login');
    } else {
      next();
    }
  }
});

export default router;
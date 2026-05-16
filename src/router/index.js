import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      // Поки що головна сторінка буде редіректити на auth
      redirect: '/auth' 
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/Auth.vue'),
      meta: { requiresGuest: true } // Тільки для НЕзалогінених
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/Dashboard.vue'),
      meta: { requiresAuth: true } // Тільки для залогінених
    },
    {
      path: '/item/create',
      name: 'item-create',
      component: () => import('../views/ItemCreate.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/item/:id',
      name: 'item-detail',
      component: () => import('../views/ItemDetail.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/item/:id/edit',
      name: 'item-edit',
      component: () => import('../views/ItemEdit.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/showcase',
      name: 'showcase',
      component: () => import('../views/Showcase.vue')
    }
  ]
});

// Глобальний захисник маршрутів
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // 1. Очікуємо точної відповіді від Firebase ПЕРЕД будь-якою навігацією
  if (!authStore.isInitialized) {
    await authStore.init();
  }

  // 2. Перевіряємо, чи потрібна авторизація для сторінки, куди йде юзер
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  // 3. Логіка перенаправлення
  if (requiresAuth && !authStore.user) {
    // Якщо сторінка закрита, а юзера немає -> на логін
    next('/auth');
  } else if (to.path === '/auth' && authStore.user) {
    // Якщо юзер вже залогінений і намагається зайти на /auth -> на дашборд
    next('/dashboard');
  } else {
    // У всіх інших випадках -> пускаємо далі
    next();
  }
});

export default router;
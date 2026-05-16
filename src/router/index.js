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
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.user !== null;

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Якщо треба логін, а його немає -> на сторінку входу
    next('/auth');
  } else if (to.meta.requiresGuest && isAuthenticated) {
    // Якщо залогінений юзер лізе на сторінку входу -> в кабінет
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
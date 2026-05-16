<script setup>
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();

onMounted(() => {
  authStore.init();
});
</script>

<template>
  <!-- Показуємо loader, поки Firebase перевіряє токен -->
  <div v-if="authStore.loading" class="min-h-screen flex items-center justify-center text-lg font-medium opacity-70">
    {{ $t('app.loading') || 'Завантаження...' }}
  </div>
  
  <RouterView v-else />
</template>
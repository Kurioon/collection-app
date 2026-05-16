<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useThemeStore } from '../stores/theme';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const authStore = useAuthStore();
const themeStore = useThemeStore();
const router = useRouter();
const route = useRoute();
const { locale } = useI18n();

// Стан для мобільного меню
const isMenuOpen = ref(false);

const handleLogout = async () => {
  await authStore.logout();
  router.push('/auth');
};

const toggleLang = () => {
  locale.value = locale.value === 'uk' ? 'en' : 'uk';
  localStorage.setItem('lang', locale.value);
};

// Автоматично закриваємо меню при переході на іншу сторінку
router.afterEach(() => {
  isMenuOpen.value = false;
});
</script>

<template>
  <div class="px-4 pt-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
    <nav class="glass-card px-4 sm:px-6 py-3">
      <div class="flex justify-between items-center">
        
        <div class="flex items-center cursor-pointer group" @click="router.push('/dashboard')">
          <svg class="w-7 h-7 sm:w-8 sm:h-8 text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)] group-hover:rotate-12 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span class="ml-2 sm:ml-3 text-xl sm:text-2xl font-extrabold tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-300">
            Skarb
          </span>
        </div>

        <div class="hidden md:flex items-center ml-10 gap-6">
          <router-link to="/dashboard" class="text-sm font-bold opacity-60 hover:opacity-100 transition-opacity" active-class="opacity-100 text-purple-500">
            {{ $t('nav.inventory') }}
          </router-link>
          <router-link to="/showcase" class="text-sm font-bold opacity-60 hover:opacity-100 transition-opacity" active-class="opacity-100 text-purple-500">
            {{ $t('nav.showcase') }}
          </router-link>
        </div>

        <div class="flex items-center gap-2 sm:gap-4 ml-auto">
          <button @click="themeStore.toggleTheme" class="p-2 sm:p-2.5 rounded-xl bg-white/30 dark:bg-black/30 hover:bg-white/50 dark:hover:bg-black/50 transition-colors border border-white/40 dark:border-white/10">
            <svg v-if="themeStore.isDark" class="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            <svg v-else class="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          </button>

          <button @click="toggleLang" class="p-2 sm:p-2.5 rounded-xl glass-card border-none text-xs font-bold uppercase tracking-widest hover:bg-purple-500/20 transition-colors">
            {{ locale === 'uk' ? 'EN' : 'UA' }}
          </button>

          <button @click="isMenuOpen = !isMenuOpen" class="md:hidden p-2 rounded-xl bg-white/30 dark:bg-black/30 hover:bg-white/50 dark:hover:bg-black/50 transition-colors border border-white/40 dark:border-white/10">
            <svg v-if="!isMenuOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div v-if="authStore.user" class="hidden sm:flex items-center gap-4 border-l border-slate-300/50 dark:border-slate-700/50 pl-4 ml-2">
            <span class="text-sm font-medium">{{ authStore.user.email }}</span>
            <button @click="handleLogout" class="text-sm font-bold text-pink-600 dark:text-pink-400 hover:text-pink-700 transition-colors">
              {{ $t('nav.logout') }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="isMenuOpen" class="md:hidden mt-4 pt-4 border-t border-slate-300/30 dark:border-slate-700/50 flex flex-col gap-4">
        <router-link to="/dashboard" class="text-base font-bold opacity-70 hover:opacity-100 transition-opacity" active-class="opacity-100 text-purple-500">
          {{ $t('nav.inventory') }}
        </router-link>
        <router-link to="/showcase" class="text-base font-bold opacity-70 hover:opacity-100 transition-opacity" active-class="opacity-100 text-purple-500">
          {{ $t('nav.showcase') }}
        </router-link>
        
        <div v-if="authStore.user" class="mt-2 pt-4 border-t border-slate-300/30 dark:border-slate-700/50 flex justify-between items-center">
          <span class="text-xs font-medium opacity-70">{{ authStore.user.email }}</span>
          <button @click="handleLogout" class="text-sm font-bold text-pink-600 dark:text-pink-400 transition-colors">
            {{ $t('nav.logout') }}
          </button>
        </div>
      </div>
    </nav>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const isLogin = ref(true);
const email = ref('');
const password = ref('');

const handleSubmit = async () => {
  if (isLogin.value) {
    await authStore.loginWithEmail(email.value, password.value);
  } else {
    await authStore.registerWithEmail(email.value, password.value);
  }
};

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  authStore.error = null;
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="glass-card w-full max-w-md p-8 sm:p-10">
      <h2 class="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-300">
        {{ isLogin ? $t('auth.welcome_back') : $t('auth.new_account') }}
      </h2>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div>
          <label class="block text-sm font-medium mb-1 pl-1">{{ $t('auth.email') }}</label>
          <input type="email" v-model="email" required class="glass-input" placeholder="you@example.com" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1 pl-1">{{ $t('auth.password') }}</label>
          <input type="password" v-model="password" required class="glass-input" placeholder="••••••••" />
        </div>

        <p v-if="authStore.error" class="text-pink-600 dark:text-pink-400 text-sm text-center bg-pink-100/50 dark:bg-pink-900/30 p-3 rounded-xl border border-pink-200 dark:border-pink-800/50">
          {{ authStore.error }}
        </p>

        <button type="submit" class="glass-btn mt-2">
          {{ isLogin ? $t('auth.login_btn') : $t('auth.register_btn') }}
        </button>
      </form>

      <div class="mt-6 flex items-center justify-between">
        <span class="border-b border-slate-300/50 dark:border-slate-700/50 w-1/4"></span>
        <span class="text-xs text-slate-500 font-medium uppercase">{{ $t('auth.or') }}</span>
        <span class="border-b border-slate-300/50 dark:border-slate-700/50 w-1/4"></span>
      </div>

      <button @click="authStore.loginWithGoogle" class="mt-6 w-full glass-input flex justify-center items-center gap-3 hover:bg-white/60 dark:hover:bg-black/60 cursor-pointer font-medium">
        <svg class="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
        {{ $t('auth.google') }}
      </button>

      <p class="mt-8 text-center text-sm">
        {{ isLogin ? $t('auth.no_account') : $t('auth.have_account') }}
        <button @click="toggleMode" class="text-purple-600 dark:text-purple-400 font-bold hover:underline outline-none">
          {{ isLogin ? $t('auth.create') : $t('auth.login_link') }}
        </button>
      </p>
    </div>
  </div>
</template>
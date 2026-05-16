import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  // Перевіряємо localStorage, якщо там пусто — дивимось на системні налаштування
  const isDark = ref(
    localStorage.getItem('theme') === 'dark' ||
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  const toggleTheme = () => {
    isDark.value = !isDark.value;
  };

  // Слідкуємо за змінною isDark. Як тільки вона змінюється — оновлюємо клас на <html>
  watch(isDark, (val) => {
    const html = document.documentElement;
    if (val) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, { immediate: true }); // immediate означає, що це спрацює одразу при завантаженні

  return { isDark, toggleTheme };
});
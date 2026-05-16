import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import router from './router';
import './assets/main.css';

import uk from './locales/uk.json';
import en from './locales/en.json';

import Toast from "vue-toastification";
import { toastOptions } from './plugins/toast';

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('lang') || 'uk', 
  fallbackLocale: 'en',
  messages: { uk, en }
});

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(i18n);
app.use(Toast, toastOptions);

app.mount('#app');
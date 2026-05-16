import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const loading = ref(true); // Показує, чи йде перевірка статусу при завантаженні сторінки
  const error = ref(null);
  const router = useRouter();

  // Реєстрація через Email/Password
  const registerWithEmail = async (email, password) => {
    error.value = null;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      user.value = userCredential.user;
      router.push('/dashboard'); // Перенаправлення після успішного входу
    } catch (err) {
      error.value = err.message;
    }
  };

  // Логін через Email/Password
  const loginWithEmail = async (email, password) => {
    error.value = null;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      user.value = userCredential.user;
      router.push('/dashboard');
    } catch (err) {
      error.value = err.message;
    }
  };

  // Вхід/Реєстрація через Google
const loginWithGoogle = async () => {
    error.value = null;
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      user.value = result.user;
      router.push('/dashboard');
    } catch (err) {
      // Перевіряємо код помилки
      if (err.code === 'auth/popup-closed-by-user') {
        // Користувач сам закрив вікно. Можемо очистити помилку, щоб не лякати його.
        error.value = null; 
      } else {
        // Для інших помилок показуємо зрозумілий префікс
        error.value = 'Сталася помилка: ' + err.message;
      }
    }
  };

  // Вихід
  const logout = async () => {
    error.value = null;
    try {
      await signOut(auth);
      user.value = null;
      router.push('/');
    } catch (err) {
      error.value = err.message;
    }
  };

  // Ініціалізація слухача стану (викликається один раз при старті додатку)
  const init = () => {
    onAuthStateChanged(auth, (currentUser) => {
      user.value = currentUser;
      loading.value = false;
    });
  };

  return {
    user,
    loading,
    error,
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    logout,
    init
  };
});
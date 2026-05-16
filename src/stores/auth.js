import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { auth } from '../firebase/config'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true) // Показує, чи йде перевірка статусу при завантаженні сторінки
  const isInitialized = ref(false)
  const router = useRouter()
  const toast = useToast()
  const { t } = useI18n()

  // Реєстрація через Email/Password
  const registerWithEmail = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user
      toast.success(t('auth.register_success'))
      router.push('/dashboard') // Перенаправлення після успішного входу
    } catch (err) {
      toast.error(err.message)
    }
  }

  // Логін через Email/Password
  const loginWithEmail = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user
      toast.success(t('auth.login_success'))
      router.push('/dashboard')
    } catch (err) {
      toast.error(err.message)
    }
  }

  // Вхід/Реєстрація через Google
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      user.value = result.user
      toast.success(t('auth.login_success'))
      router.push('/dashboard')
    } catch (err) {
      // Перевіряємо код помилки
      if (err.code === 'auth/popup-closed-by-user') {
        // Користувач сам закрив вікно. Нічого не робимо.
      } else {
        toast.error(t('auth.google_error_prefix') + ': ' + err.message)
      }
    }
  }

  // Вихід
  const logout = async () => {
    try {
      await signOut(auth)
      user.value = null
      router.push('/')
    } catch (err) {
      toast.error(err.message)
    }
  }

  // Ініціалізація слухача стану (викликається один раз при старті додатку)
  const init = () => {
    return new Promise((resolve) => {
      // Якщо вже ініціалізовано, просто повертаємо користувача
      if (isInitialized.value) {
        resolve(user.value)
        return
      }

      // onAuthStateChanged спрацьовує при старті і коли змінюється стан (вхід/вихід)
      import('firebase/auth').then(({ onAuthStateChanged }) => {
        onAuthStateChanged(auth, (currentUser) => {
          user.value = currentUser
          loading.value = false
          isInitialized.value = true
          resolve(currentUser)
        })
      })
    })
  }

  return {
    user,
    loading,
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    logout,
    isInitialized,
    init,
  }
})

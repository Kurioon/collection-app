import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuthStore } from './auth'
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'

export const useItemsStore = defineStore('items', () => {
  // --- Стан (State) ---
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)
  const authStore = useAuthStore()

  const toast = useToast()
  const { t } = useI18n()

  // Змінні для пагінації Вітрини
  const lastVisibleDoc = ref(null)
  const hasMore = ref(true)
  const ITEMS_PER_PAGE = 8

  // --- Дії (Actions) ---
  const addItem = async (itemData) => {
    loading.value = true
    try {
      if (!authStore.user) throw new Error('Користувач не авторизований')
      const docRef = await addDoc(collection(db, 'items'), {
        ...itemData,
        ownerId: authStore.user.uid,
        ownerName: authStore.user.email,
        createdAt: serverTimestamp(),
      })
      return docRef.id
    } catch (err) {
      throw err
    } finally {
      loading.value = false
    }
  }

  // Завантажує предмети, що належать поточному авторизованому користувачу
  const fetchUserItems = async () => {
    loading.value = true
    error.value = null

    try {
      if (!authStore.user) throw new Error('Користувач не авторизований')

      // Створюємо запит до колекції 'items'
      const q = query(
        collection(db, 'items'),
        where('ownerId', '==', authStore.user.uid),
        orderBy('createdAt', 'desc'),
      )

      const querySnapshot = await getDocs(q)
      // Перетворюємо результат запиту в масив об'єктів
      const fetchedItems = []
      querySnapshot.forEach((doc) => {
        fetchedItems.push({ id: doc.id, ...doc.data() })
      })

      // Оновлюємо стан `items`
      items.value = fetchedItems
    } catch (err) {
      error.value = err.message
      console.error(err.message)
      toast.error(`${t('item.fetch_error')}: Перевірте консоль (F12)`)
    } finally {
      loading.value = false
    }
  }

  // Завантажує один предмет за його унікальним ID
  const getItemById = async (id) => {
    loading.value = true
    try {
      const docRef = doc(db, 'items', id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      } else {
        throw new Error('Предмет не знайдено')
      }
    } catch (err) {
      toast.error(`${t('item.fetch_error')}: ${err.message}`)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Видаляє предмет за його ID
  const deleteItem = async (id) => {
    try {
      await deleteDoc(doc(db, 'items', id))
      // Оновлюємо локальний стан, видаляючи предмет з масиву
      items.value = items.value.filter((item) => item.id !== id)
    } catch (err) {
      throw err
    }
  }

  const updateItem = async (id, updatedData) => {
    // Оновлює дані предмета в базі даних
    loading.value = true
    try {
      const docRef = doc(db, 'items', id)
      await updateDoc(docRef, {
        ...updatedData,
        updatedAt: serverTimestamp(),
      })
    } catch (err) {
      throw err
    } finally {
      loading.value = false
    }
  }

  // Завантажує публічні предмети для сторінки "Вітрина" з пагінацією
  const fetchPublicItems = async (isLoadMore = false) => {
    if (loading.value) return
    loading.value = true
    error.value = null

    // Якщо це не "дозавантаження", а перший запит, очищуємо старі дані
    if (!isLoadMore) {
      items.value = []
      lastVisibleDoc.value = null
      hasMore.value = true
    }

    try {
      // Базові умови для запиту: публічні, сортовані за датою, з лімітом
      let qConstraints = [
        collection(db, 'items'),
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc'),
        limit(ITEMS_PER_PAGE),
      ]

      // Якщо це "дозавантаження", додаємо умову "почати після останнього видимого документа"
      if (isLoadMore && lastVisibleDoc.value) {
        qConstraints.push(startAfter(lastVisibleDoc.value))
      }

      const q = query(...qConstraints)
      const querySnapshot = await getDocs(q)

      const fetchedPublicItems = []
      querySnapshot.forEach((doc) => {
        fetchedPublicItems.push({ id: doc.id, ...doc.data() })
      })

      // Зберігаємо посилання на останній завантажений документ для наступного запиту
      if (querySnapshot.docs.length > 0) {
        lastVisibleDoc.value = querySnapshot.docs[querySnapshot.docs.length - 1]
      }

      // Якщо повернулося менше карток, ніж ліміт — більше даних немає
      if (querySnapshot.docs.length < ITEMS_PER_PAGE) {
        hasMore.value = false
      }

      // Додаємо нові елементи до існуючих або замінюємо їх
      if (isLoadMore) {
        items.value = [...items.value, ...fetchedPublicItems]
      } else {
        items.value = fetchedPublicItems
      }
    } catch (err) {
      error.value = err.message
      console.error(err.message)
      toast.error(`${t('item.fetch_error')}: Перевірте консоль (F12)`)
    } finally {
      loading.value = false
    }
  }

  return {
    items,
    loading,
    error,
    hasMore,
    addItem,
    fetchUserItems,
    getItemById,
    deleteItem,
    updateItem,
    fetchPublicItems,
  }
})

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { collection, addDoc, getDocs, doc, getDoc, deleteDoc, query, where, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuthStore } from './auth';
import { useToast } from 'vue-toastification';
import { useI18n } from 'vue-i18n';

export const useItemsStore = defineStore('items', () => {
  const items = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const authStore = useAuthStore();

  // Додавання предмета
  const addItem = async (itemData) => {
    loading.value = true;
    try {
      if (!authStore.user) throw new Error('Користувач не авторизований');
      const docRef = await addDoc(collection(db, 'items'), {
        ...itemData,
        ownerId: authStore.user.uid,
        ownerName: authStore.user.email,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (err) {
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Отримання предметів поточного користувача
  const fetchUserItems = async () => {
    loading.value = true;
    error.value = null;
    // Отримуємо глобальні інструменти всередині функції
    const { t } = useI18n();
    const toast = useToast();

    try {
      if (!authStore.user) throw new Error('Користувач не авторизований');
      
      const q = query(collection(db, 'items'), where('ownerId', '==', authStore.user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedItems = [];
      querySnapshot.forEach((doc) => {
        fetchedItems.push({ id: doc.id, ...doc.data() });
      });
      
      items.value = fetchedItems;
    } catch (err) {
      error.value = err.message;
      toast.error(`${t('item.fetch_error')}: ${err.message}`);
    } finally {
      loading.value = false;
    }
  };

  // Отримання одного предмета за ID
  const getItemById = async (id) => {
    loading.value = true;
    const { t } = useI18n();
    const toast = useToast();

    try {
      const docRef = doc(db, 'items', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error('Предмет не знайдено');
      }
    } catch (err) {
      toast.error(`${t('item.fetch_error')}: ${err.message}`);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Видалення предмета
  const deleteItem = async (id) => {
    try {
      await deleteDoc(doc(db, 'items', id));
      items.value = items.value.filter((item) => item.id !== id);
    } catch (err) {
      throw err;
    }
  };

  // Оновлення предмета
  const updateItem = async (id, updatedData) => {
    loading.value = true;
    try {
      const docRef = doc(db, 'items', id);
      await updateDoc(docRef, {
        ...updatedData,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Отримання ВСІХ публічних предметів для загальної вітрини
  const fetchPublicItems = async () => {
    loading.value = true;
    error.value = null;
    const { t } = useI18n();
    const toast = useToast();

    try {
      const q = query(collection(db, 'items'), where('isPublic', '==', true)
);

      const querySnapshot = await getDocs(q);
      const fetchedPublicItems = [];
      querySnapshot.forEach((doc) => {
        fetchedPublicItems.push({ id: doc.id, ...doc.data() });
      });

      items.value = fetchedPublicItems;
    } catch (err) {
      error.value = err.message;
      toast.error(`${t('item.fetch_error')}: ${err.message}`);
    } finally {
      loading.value = false;
    }
  };

  return {
    items,
    loading,
    error,
    addItem,
    fetchUserItems,
    getItemById,
    deleteItem,
    updateItem,
    fetchPublicItems,
  };
});
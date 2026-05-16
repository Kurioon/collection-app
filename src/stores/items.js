import { defineStore } from 'pinia';
import { ref } from 'vue';
import { collection, addDoc, getDocs, doc, getDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuthStore } from './auth';
import { updateDoc } from 'firebase/firestore';

export const useItemsStore = defineStore('items', () => {
  const items = ref([]); 
  const loading = ref(false);
  const error = ref(null);
  const authStore = useAuthStore();

  // Додавання предмета
  const addItem = async (itemData) => {
    loading.value = true;
    error.value = null;
    try {
      if (!authStore.user) throw new Error("Користувач не авторизований");
      const docRef = await addDoc(collection(db, 'items'), {
        ...itemData,
        ownerId: authStore.user.uid,
        ownerName: authStore.user.email,
        createdAt: serverTimestamp(),
      });
      loading.value = false;
      return docRef.id;
    } catch (err) {
      error.value = err.message;
      loading.value = false;
      throw err;
    }
  };

  // Отримання предметів поточного користувача
  const fetchUserItems = async () => {
    loading.value = true;
    error.value = null;
    try {
      if (!authStore.user) throw new Error("Користувач не авторизований");
      const q = query(collection(db, 'items'), where('ownerId', '==', authStore.user.uid));
      const querySnapshot = await getDocs(q);
      
      const fetchedItems = [];
      querySnapshot.forEach((doc) => {
        fetchedItems.push({ id: doc.id, ...doc.data() });
      });

      items.value = fetchedItems.sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  // Отримання одного предмета за ID
  const getItemById = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const docRef = doc(db, 'items', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        loading.value = false;
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error("Предмет не знайдено");
      }
    } catch (err) {
      error.value = err.message;
      loading.value = false;
      throw err;
    }
  };

  // Видалення предмета
  const deleteItem = async (id) => {
    try {
      await deleteDoc(doc(db, 'items', id));
      items.value = items.value.filter(item => item.id !== id);
    } catch (err) {
      throw err;
    }
  };

  const updateItem = async (id, updatedData) => {
    loading.value = true;
    error.value = null;
    try {
      const docRef = doc(db, 'items', id);
      await updateDoc(docRef, {
        ...updatedData,
        updatedAt: serverTimestamp() // Додаємо мітку часу оновлення
      });
      loading.value = false;
    } catch (err) {
      error.value = err.message;
      loading.value = false;
      throw err;
    }
  };

  // Отримання ВСІХ публічних предметів для загальної вітрини
  const fetchPublicItems = async () => {
    loading.value = true;
    error.value = null;
    try {
      // Запит: тільки публічні предмети
      const q = query(
        collection(db, 'items'), 
        where('isPublic', '==', true)
      );

      const querySnapshot = await getDocs(q);
      const publicItems = [];
      querySnapshot.forEach((doc) => {
        publicItems.push({ id: doc.id, ...doc.data() });
      });

      // Сортуємо: найновіші скарби спочатку
      items.value = publicItems.sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  // Експортуємо ВСЕ, що використовується в компонентах
  return { items, loading, error, addItem, fetchUserItems, getItemById, deleteItem, updateItem, fetchPublicItems };
});
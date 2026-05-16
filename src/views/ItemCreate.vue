<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useItemsStore } from '../stores/items';
import Navbar from '../components/Navbar.vue';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const itemsStore = useItemsStore();
const { t } = useI18n();

// Реактивні змінні, прив'язані до полів форми через v-model
const title = ref('');
const description = ref('');
const imageUrl = ref('');
const isPublic = ref(false);

// Атрибути зберігаються у вигляді масиву об'єктів. 
// При старті ми створюємо один порожній об'єкт, щоб користувач бачив порожні інпути.
const attributes = ref([{ name: '', value: '' }]);

// Функція додає ще один порожній рядок у масив (створює нові поля в інтерфейсі)
const addAttribute = () => attributes.value.push({ name: '', value: '' });
// Видаляє конкретний рядок з масиву за його індексом
const removeAttribute = (index) => attributes.value.splice(index, 1);

// Функція збереження даних у Firebase
const handleSubmit = async () => {
  try {
    // Важливий крок: фільтруємо атрибути. 
    // Якщо користувач створив поле, але нічого туди не написав (лишив пробіли) — ми його видаляємо перед відправкою в БД.
    const cleanAttributes = attributes.value.filter(attr => attr.name.trim() !== '' && attr.value.trim() !== '');
    
    // Передаємо зібраний об'єкт у Store, який вже зробить запит до Firestore
    await itemsStore.addItem({
      title: title.value,
      description: description.value,
      imageUrl: imageUrl.value,
      isPublic: isPublic.value,
      attributes: cleanAttributes
    });
    
    // Після успішного збереження повертаємо юзера на головний дашборд
    router.push('/dashboard');
  } catch (error) {
    alert(t('item.error') + ': ' + error.message);
  }
};
</script>

<template>
  <div>
    <Navbar />

    <main class="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <button @click="router.push('/dashboard')" class="text-sm font-bold opacity-70 hover:opacity-100 mb-6 flex items-center gap-2 transition-opacity">
        &larr; {{ $t('item.back') }}
      </button>

      <div class="glass-card p-6 sm:p-10 border-t border-l border-white/60 dark:border-white/20">
        <h1 class="text-2xl font-bold mb-8">{{ $t('item.create_title') }}</h1>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="space-y-5">
            <div>
              <label class="block text-sm font-medium mb-1 pl-1">{{ $t('item.name_label') }}</label>
              <input type="text" v-model="title" required class="glass-input" />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1 pl-1">{{ $t('item.desc_label') }}</label>
              <textarea v-model="description" rows="3" class="glass-input resize-none"></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1 pl-1">{{ $t('item.img_label') }}</label>
              <input type="url" v-model="imageUrl" class="glass-input" />
            </div>
          </div>

          <div class="border-t border-slate-300/30 dark:border-slate-700/50 pt-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-bold">{{ $t('item.attributes_title') }}</h3>
              <button type="button" @click="addAttribute" class="text-sm text-purple-600 dark:text-purple-400 font-bold hover:underline">
                {{ $t('item.add_attr') }}
              </button>
            </div>

            <div class="space-y-3">
              <div v-for="(attr, index) in attributes" :key="index" class="flex items-center gap-3">
                <input type="text" v-model="attr.name" :placeholder="$t('item.attr_name_placeholder')" class="glass-input py-2" />
                <input type="text" v-model="attr.value" :placeholder="$t('item.attr_value_placeholder')" class="glass-input py-2" />
                <button type="button" @click="removeAttribute(index)" class="p-2 text-pink-500 hover:text-pink-600 bg-white/30 dark:bg-black/30 rounded-lg">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-300/30 dark:border-slate-700/50 pt-6">
            <label class="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" v-model="isPublic" class="w-5 h-5 text-purple-600 bg-white/50 dark:bg-black/50 border-white/50 rounded focus:ring-purple-500">
              <span class="font-medium">{{ $t('item.public_checkbox') }}</span>
            </label>
          </div>

          <button type="submit" :disabled="itemsStore.loading" class="glass-btn mt-4">
            {{ itemsStore.loading ? $t('item.saving') : $t('item.save_btn') }}
          </button>
        </form>
      </div>
    </main>
  </div>
</template>
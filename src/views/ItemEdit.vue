<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useItemsStore } from '../stores/items';
import Navbar from '../components/Navbar.vue';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const router = useRouter();
const itemsStore = useItemsStore();
const { t } = useI18n();

const itemId = route.params.id;
const title = ref('');
const description = ref('');
const imageUrl = ref('');
const isPublic = ref(false);
const attributes = ref([]);

// При відкритті сторінки редагування ми повинні заповнити інпути старими даними з бази
onMounted(async () => {
  try {
    const data = await itemsStore.getItemById(itemId);
    title.value = data.title;
    description.value = data.description;
    imageUrl.value = data.imageUrl;
    isPublic.value = data.isPublic;
    
    // Якщо у предмета не було характеристик (undefined), ми ставимо один порожній рядок, 
    // щоб юзер міг почати вводити нові
    attributes.value = data.attributes || [{ name: '', value: '' }];
  } catch (error) {
    alert(t('item.error') + ': ' + error.message);
    router.push('/dashboard');
  }
});

const addAttribute = () => attributes.value.push({ name: '', value: '' });
const removeAttribute = (index) => attributes.value.splice(index, 1);

// Функція оновлення даних (відправка змін до Firebase)
const handleUpdate = async () => {
  try {
    // Знову очищаємо порожні атрибути перед збереженням
    const cleanAttributes = attributes.value.filter(attr => attr.name.trim() !== '' && attr.value.trim() !== '');
    
    await itemsStore.updateItem(itemId, {
      title: title.value,
      description: description.value,
      imageUrl: imageUrl.value,
      isPublic: isPublic.value,
      attributes: cleanAttributes
    });
    
    // Після оновлення повертаємо юзера на сторінку перегляду цього конкретного предмета
    router.push('/item/' + itemId); 
  } catch (error) {
    alert(t('item.error') + ': ' + error.message);
  }
};
</script>

<template>
  <div class="min-h-screen">
    <Navbar />

    <main class="max-w-2xl mx-auto px-4 py-10">
      <button @click="router.back()" class="text-sm font-bold opacity-70 hover:opacity-100 mb-6 flex items-center gap-2">
        &larr; {{ $t('item.back') }}
      </button>

      <div class="glass-card p-6 sm:p-10 border-t border-l border-white/60 dark:border-white/20">
        <h1 class="text-2xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-300">
          {{ $t('item.edit_title') }}
        </h1>

        <form @submit.prevent="handleUpdate" class="space-y-6">
          <div class="space-y-5">
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('item.name_label') }}</label>
              <input type="text" v-model="title" required class="glass-input" />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('item.desc_label') }}</label>
              <textarea v-model="description" rows="3" class="glass-input resize-none"></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('item.img_label') }}</label>
              <input type="url" v-model="imageUrl" class="glass-input" />
            </div>
          </div>

          <div class="border-t border-slate-300/30 dark:border-slate-700/50 pt-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-bold text-purple-600 dark:text-purple-400">{{ $t('item.attributes_title') }}</h3>
              <button type="button" @click="addAttribute" class="text-sm font-bold hover:underline">
                {{ $t('item.add_attr') }}
              </button>
            </div>

            <div class="space-y-3">
              <div v-for="(attr, index) in attributes" :key="index" class="flex items-center gap-3">
                <input type="text" v-model="attr.name" :placeholder="$t('item.attr_name_placeholder')" class="glass-input py-2 text-sm" />
                <input type="text" v-model="attr.value" :placeholder="$t('item.attr_value_placeholder')" class="glass-input py-2 text-sm" />
                <button type="button" @click="removeAttribute(index)" class="p-2 text-pink-500 bg-white/20 dark:bg-black/20 rounded-lg hover:bg-pink-500/20 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-300/30 dark:border-slate-700/50 pt-6">
            <label class="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" v-model="isPublic" class="w-5 h-5 accent-purple-600 bg-white/50 dark:bg-black/50 border-white/50 rounded">
              <span class="font-medium">{{ $t('item.public_checkbox') }}</span>
            </label>
          </div>

          <button type="submit" :disabled="itemsStore.loading" class="glass-btn mt-4">
            {{ itemsStore.loading ? $t('item.saving') : $t('item.update_btn') }}
          </button>
        </form>
      </div>
    </main>
  </div>
</template>
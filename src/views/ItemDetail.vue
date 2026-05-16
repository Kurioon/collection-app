<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useItemsStore } from '../stores/items'
import { useAuthStore } from '../stores/auth'
import Navbar from '../components/Navbar.vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'

const route = useRoute()
const router = useRouter()
const itemsStore = useItemsStore()
const authStore = useAuthStore()
const { t } = useI18n()
const toast = useToast()

const item = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    // Беремо ID з параметрів роута (наприклад /item/123xyz)
    const itemId = route.params.id
    item.value = await itemsStore.getItemById(itemId)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})

const handleDelete = async () => {
  if (confirm(t('item.delete_confirm'))) {
    try {
      await itemsStore.deleteItem(item.value.id)
      toast.success(t('item.delete_success'))
      router.push('/dashboard') // Повертаємось після видалення
    } catch (err) {
      toast.error(t('item.delete_error') + ': ' + err.message)
    }
  }
}
</script>

<template>
  <div>
    <Navbar />

    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        @click="router.push('/dashboard')"
        class="text-sm font-bold opacity-70 hover:opacity-100 mb-6 flex items-center gap-2 transition-opacity"
      >
        &larr; {{ $t('item.back') }}
      </button>

      <div v-if="loading" class="text-center py-20 opacity-70">
        {{ $t('item.loading_details') }}
      </div>

      <div v-else-if="error" class="glass-card p-10 text-center text-pink-500 border-pink-500/30">
        <h2 class="text-xl font-bold mb-2">{{ $t('item.error') }}</h2>
        <p>{{ error }}</p>
      </div>

      <div v-else-if="item" class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="glass-card p-4 h-fit border-t border-l border-white/60 dark:border-white/20">
          <div
            class="aspect-square rounded-xl overflow-hidden bg-slate-200/50 dark:bg-black/50 relative flex items-center justify-center"
          >
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              :alt="item.title"
              class="w-full h-full object-cover"
            />
            <svg
              v-else
              class="w-20 h-20 opacity-30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>

            <div
              v-if="item.isPublic"
              class="absolute top-4 right-4 bg-green-500/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-lg"
            >
              {{ $t('dashboard.public_badge') }}
            </div>
          </div>
        </div>

        <div class="flex flex-col">
          <div
            class="glass-card p-6 sm:p-8 border-t border-l border-white/60 dark:border-white/20 flex-grow"
          >
            <h1
              class="text-3xl sm:text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-300"
            >
              {{ item.title }}
            </h1>

            <div class="flex items-center gap-2 mb-6 opacity-70 text-sm">
              <svg
                class="w-5 h-5 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span
                >{{ $t('showcase.collector') }}:
                <span class="font-bold text-purple-600 dark:text-purple-400">{{
                  item.ownerName
                }}</span></span
              >
            </div>

            <p class="text-lg opacity-80 mb-8 whitespace-pre-wrap leading-relaxed">
              {{ item.description || $t('dashboard.no_desc') }}
            </p>

            <div v-if="item.attributes && item.attributes.length > 0" class="mb-8">
              <h3
                class="text-xl font-bold mb-4 border-b border-slate-300/30 dark:border-slate-700/50 pb-2"
              >
                {{ $t('item.attributes_title') }}
              </h3>
              <ul class="space-y-3">
                <li
                  v-for="(attr, index) in item.attributes"
                  :key="index"
                  class="flex justify-between items-center py-2 border-b border-slate-200/20 dark:border-slate-800/50 last:border-0"
                >
                  <span class="opacity-70 font-medium">{{ attr.name }}</span>
                  <span class="font-bold text-right">{{ attr.value }}</span>
                </li>
              </ul>
            </div>

            <div
              v-if="authStore.user?.uid === item.ownerId"
              class="mt-auto pt-6 border-t border-slate-300/30 dark:border-slate-700/50 flex gap-4"
            >
              <button
                @click="router.push(`/item/${item.id}/edit`)"
                class="flex-1 py-3 px-4 rounded-xl font-bold bg-white/30 dark:bg-black/30 hover:bg-white/50 dark:hover:bg-black/50 transition-colors border border-white/40 dark:border-white/10 text-center"
              >
                {{ $t('item.edit_btn') }}
              </button>

              <button
                @click="handleDelete"
                class="flex-1 py-3 px-4 rounded-xl font-bold bg-pink-500/20 hover:bg-pink-500/40 text-pink-600 dark:text-pink-400 transition-colors border border-pink-500/30 text-center"
              >
                {{ $t('item.delete_btn') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

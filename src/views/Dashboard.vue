<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useItemsStore } from '../stores/items'
import Navbar from '../components/Navbar.vue'
import SkeletonCard from '../components/SkeletonCard.vue'

const router = useRouter()
const itemsStore = useItemsStore()

onMounted(() => {
  itemsStore.fetchUserItems()
})
</script>

<template>
  <div>
    <Navbar />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10"
      >
        <div>
          <h1
            class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-300"
          >
            {{ $t('dashboard.title') }}
          </h1>
          <p class="text-sm mt-1 opacity-80">{{ $t('dashboard.subtitle') }}</p>
        </div>

        <button @click="router.push('/item/create')" class="glass-btn !w-auto">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          {{ $t('dashboard.add_btn') }}
        </button>
      </div>

      <div
        v-if="itemsStore.loading"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <SkeletonCard v-for="n in 8" :key="n" />
      </div>

      <div
        v-else-if="itemsStore.items.length === 0"
        class="glass-card p-16 text-center border-dashed border-2 border-purple-300/50 dark:border-purple-700/50"
      >
        <div
          class="w-20 h-20 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4"
        >
          <svg
            class="w-10 h-10 text-purple-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h3 class="text-xl font-bold mb-2">{{ $t('dashboard.empty_title') }}</h3>
        <p class="opacity-70 mb-6">{{ $t('dashboard.empty_desc') }}</p>
        <button @click="router.push('/item/create')" class="glass-btn !w-auto mx-auto px-8">
          {{ $t('dashboard.start_btn') }}
        </button>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="item in itemsStore.items"
          :key="item.id"
          @click="router.push('/item/' + item.id)"
          class="glass-card p-5 group hover:-translate-y-2 transition-transform duration-300 cursor-pointer border-t border-l border-white/60 dark:border-white/20"
        >
          <div
            class="aspect-square bg-slate-200/50 dark:bg-black/50 rounded-xl mb-4 overflow-hidden relative"
          >
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div v-else class="w-full h-full flex items-center justify-center opacity-30">
              <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>

            <!-- Бейдж публічності -->
            <div
              v-if="item.isPublic"
              class="absolute top-3 right-3 bg-green-500/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm"
            >
              {{ $t('dashboard.public_badge') }}
            </div>
          </div>

          <h3 class="font-bold text-lg truncate">{{ item.title }}</h3>
          <p class="text-sm opacity-70 mt-1 line-clamp-2 min-h-[40px]">
            {{ item.description || $t('dashboard.no_desc') }}
          </p>

          <div
            class="mt-4 pt-4 border-t border-slate-300/30 dark:border-slate-700/50 flex justify-between items-center text-xs opacity-60"
          >
            <span>{{ item.attributes?.length || 0 }} {{ $t('dashboard.attributes_count') }}</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

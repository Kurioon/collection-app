<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useItemsStore } from '../stores/items'
import Navbar from '../components/Navbar.vue'
import SkeletonCard from '../components/SkeletonCard.vue'

const router = useRouter()
const itemsStore = useItemsStore()

onMounted(() => {
  itemsStore.fetchPublicItems()
})
</script>

<template>
  <div class="min-h-screen">
    <Navbar />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="mb-12 text-center">
        <h1
          class="text-4xl sm:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-purple-400 dark:from-purple-400 dark:via-pink-300 dark:to-purple-200 tracking-tight mb-4"
        >
          {{ $t('showcase.title') }}
        </h1>
        <p class="text-lg opacity-70 max-w-2xl mx-auto">
          {{ $t('showcase.subtitle') }}
        </p>
      </div>

      <div
        v-if="itemsStore.loading"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
      >
        <SkeletonCard v-for="n in 8" :key="n" />
      </div>

      <div v-else-if="itemsStore.items.length === 0" class="glass-card p-20 text-center">
        <h3 class="text-xl font-bold">{{ $t('showcase.empty_title') }}</h3>
        <p class="opacity-60 mt-2">{{ $t('showcase.empty_desc') }}</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <div
          v-for="item in itemsStore.items"
          :key="item.id"
          @click="router.push('/item/' + item.id)"
          class="glass-card p-4 group hover:-translate-y-3 transition-all duration-500 cursor-pointer overflow-hidden"
        >
          <div
            class="aspect-[4/5] rounded-xl mb-4 overflow-hidden relative bg-slate-200/50 dark:bg-black/40"
          >
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div v-else class="w-full h-full flex items-center justify-center opacity-20">
              <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>

            <div
              class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <p class="text-white text-[10px] uppercase tracking-widest font-bold">
                {{ $t('showcase.collector') }}
              </p>
              <p class="text-white text-xs truncate">{{ item.ownerName }}</p>
            </div>
          </div>

          <div class="px-2">
            <h3 class="font-bold text-lg truncate group-hover:text-purple-500 transition-colors">
              {{ item.title }}
            </h3>
            <p class="text-xs opacity-50 mt-1 uppercase tracking-tighter">
              {{ item.attributes?.length || 0 }} {{ $t('dashboard.attributes_count') }}
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

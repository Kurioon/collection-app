<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useItemsStore } from '../stores/items'
import Navbar from '../components/Navbar.vue'
import { useI18n } from 'vue-i18n'
import Compressor from 'compressorjs'
import { useToast } from 'vue-toastification'

const router = useRouter()
const itemsStore = useItemsStore()
const { t } = useI18n()
const toast = useToast()

const CLOUD_NAME = 'daywzbjki'
const UPLOAD_PRESET = 'skarb_preset'

// Реактивні змінні форми
const title = ref('')
const description = ref('')
const imageUrl = ref('')
const isPublic = ref(false)
const attributes = ref([{ name: '', value: '' }])

// Додаткові стани для інтерфейсу завантаження
const imageUploading = ref(false)
const imagePreview = ref(null)

// Обробка вибору файлу з комп'ютера або телефона
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Створюємо тимчасове локальне посилання, щоб користувач одразу побачив прев'ю картинки
  imagePreview.value = URL.createObjectURL(file)
  imageUploading.value = true

  // Запуск процесу стиснення
  new Compressor(file, {
    quality: 0.6,
    maxWidth: 1200,
    success(result) {
      // result — це вже стиснений файл (Blob). Відправляємо його у функцію завантаження
      uploadToCloudinary(result)
    },
    error(err) {
      toast.error(t('item.compress_error') + err.message)
      imageUploading.value = false
    },
  })
}

// Функція відправки файлу на сервери Cloudinary за допомогою FormData API
const uploadToCloudinary = async (fileBlob) => {
  try {
    const formData = new FormData()
    formData.append('file', fileBlob)
    formData.append('upload_preset', UPLOAD_PRESET)

    // Робимо прямий HTTP POST запит до Cloudinary API
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) throw new Error(t('item.upload_error'))

    const data = await response.json()
    imageUrl.value = data.secure_url // Отримуємо пряме HTTPS посилання на картинку
  } catch (error) {
    toast.error(t('item.error') + ': ' + error.message)
    imagePreview.value = null
  } finally {
    imageUploading.value = false
  }
}

const addAttribute = () => attributes.value.push({ name: '', value: '' })
const removeAttribute = (index) => attributes.value.splice(index, 1)

const handleSubmit = async () => {
  try {
    const cleanAttributes = attributes.value.filter(
      (attr) => attr.name.trim() !== '' && attr.value.trim() !== '',
    )

    await itemsStore.addItem({
      title: title.value,
      description: description.value,
      imageUrl: imageUrl.value, // Зберігаємо отримане посилання в базу даних Firebase
      isPublic: isPublic.value,
      attributes: cleanAttributes,
    })

    toast.success(t('item.create_success'))

    router.push('/dashboard')
  } catch (error) {
    toast.error(t('item.error') + ': ' + error.message)
  }
}
</script>

<template>
  <div>
    <Navbar />

    <main class="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <button
        @click="router.push('/dashboard')"
        class="text-sm font-bold opacity-70 hover:opacity-100 mb-6 flex items-center gap-2 transition-opacity"
      >
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
              <label class="block text-sm font-medium mb-2 pl-1">{{
                $t('item.image_label')
              }}</label>

              <div
                class="flex flex-col items-center justify-center border-2 border-dashed border-purple-300/40 dark:border-purple-700/40 rounded-2xl p-6 bg-white/10 dark:bg-black/10 text-center relative overflow-hidden min-h-[200px]"
              >
                <div v-if="imagePreview" class="absolute inset-0 w-full h-full z-0">
                  <img
                    :src="imagePreview"
                    class="w-full h-full object-cover opacity-40 dark:opacity-30"
                  />
                </div>

                <div class="relative z-10 flex flex-col items-center">
                  <svg
                    class="w-10 h-10 text-purple-500 mb-2"
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

                  <span
                    v-if="imageUploading"
                    class="text-sm font-medium text-purple-600 animate-pulse"
                    >{{ $t('item.image_uploading') }}</span
                  >
                  <span v-else-if="imageUrl" class="text-sm font-bold text-green-600">{{
                    $t('item.image_success')
                  }}</span>
                  <span v-else class="text-sm font-medium opacity-70">{{
                    $t('item.image_placeholder')
                  }}</span>

                  <input
                    type="file"
                    accept="image/*"
                    @change="handleFileChange"
                    :disabled="imageUploading"
                    class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-300/30 dark:border-slate-700/50 pt-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-bold">{{ $t('item.attributes_title') }}</h3>
              <button
                type="button"
                @click="addAttribute"
                class="text-sm text-purple-600 dark:text-purple-400 font-bold hover:underline"
              >
                {{ $t('item.add_attr') }}
              </button>
            </div>

            <div class="space-y-3">
              <div v-for="(attr, index) in attributes" :key="index" class="flex items-center gap-3">
                <input
                  type="text"
                  v-model="attr.name"
                  :placeholder="$t('item.attr_name_placeholder')"
                  class="glass-input py-2"
                />
                <input
                  type="text"
                  v-model="attr.value"
                  :placeholder="$t('item.attr_value_placeholder')"
                  class="glass-input py-2"
                />
                <button
                  type="button"
                  @click="removeAttribute(index)"
                  class="p-2 text-pink-500 hover:text-pink-600 bg-white/30 dark:bg-black/30 rounded-lg"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-300/30 dark:border-slate-700/50 pt-6">
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                v-model="isPublic"
                class="w-5 h-5 text-purple-600 bg-white/50 dark:bg-black/50 border-white/50 rounded focus:ring-purple-500"
              />
              <span class="font-medium">{{ $t('item.public_checkbox') }}</span>
            </label>
          </div>

          <button
            type="submit"
            :disabled="itemsStore.loading || imageUploading"
            class="glass-btn mt-4"
          >
            {{ itemsStore.loading ? $t('item.saving') : $t('item.save_btn') }}
          </button>
        </form>
      </div>
    </main>
  </div>
</template>

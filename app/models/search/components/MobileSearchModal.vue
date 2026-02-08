<script setup lang="ts">
import { useProductAPI } from '~/models/product/ProductAPI'
import type { Product } from '~/models/product/types/Product'
import { ROUTES } from '~/models/common/constants/routes'
import SearchDropdownItem from './SearchDropdownItem.vue'

interface Props {
  modelValue: boolean
}

interface SearchResult {
  id: string
  name: string
  price: number
  oldPrice: number | null
  image: string
  slug: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const router = useRouter()
const productAPI = useProductAPI()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const query = ref('')
const results = ref<SearchResult[]>([])
const loading = ref(false)
const totalResults = ref(0)
const inputRef = ref<HTMLInputElement>()

let searchTimeout: ReturnType<typeof setTimeout>

async function performSearch() {
  if (!query.value || query.value.length < 2) {
    results.value = []
    totalResults.value = 0
    return
  }

  loading.value = true
  try {
    const data = await productAPI.getProducts({
      search: query.value,
      limit: 10
    })

    results.value = data.products.map((product: Product) => ({
      id: product.product_id,
      name: product.product_name,
      price: parseFloat(product.price) || 0,
      oldPrice: product.sale_price ? parseFloat(product.sale_price) : null,
      image: product.pictures?.[0]?.pictures_name || '/images/no-image.png',
      slug: product.slug
    }))

    totalResults.value = data.pagination.total
  } catch (e) {
    console.error('Search error:', e)
    results.value = []
  } finally {
    loading.value = false
  }
}

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(performSearch, 300)
}

function handleClose() {
  isOpen.value = false
  query.value = ''
  results.value = []
}

function handleViewAll() {
  if (query.value.trim()) {
    router.push({ path: ROUTES.SEARCH, query: { q: query.value } })
    handleClose()
  }
}

function handleItemClick() {
  handleClose()
}

function handleSubmit() {
  if (query.value.trim()) {
    handleViewAll()
  }
}

watch(query, debouncedSearch)

watch(isOpen, (val) => {
  if (val) {
    nextTick(() => inputRef.value?.focus())
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onUnmounted(() => {
  clearTimeout(searchTimeout)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/50 z-50"
        @click="handleClose"
      />
    </Transition>

    <Transition name="slide-down">
      <div
        v-if="isOpen"
        class="fixed inset-x-0 top-0 bg-white z-50 max-h-[85vh] flex flex-col shadow-xl safe-area-top"
      >
        <form
          class="flex items-center gap-3 p-4 border-b border-gray-200"
          @submit.prevent="handleSubmit"
        >
          <div class="flex-1 relative">
            <UIcon
              name="i-heroicons-magnifying-glass"
              class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
            />
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              placeholder="Пошук товарів..."
              class="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
              enterkeyhint="search"
            >
            <div
              v-if="loading"
              class="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 text-gray-400 animate-spin" />
            </div>
            <button
              v-else-if="query"
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 p-1"
              @click="query = ''"
            >
              <UIcon name="i-heroicons-x-circle-solid" class="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <button
            type="button"
            class="p-2 -mr-2 text-gray-500 hover:text-gray-700"
            @click="handleClose"
          >
            Скасувати
          </button>
        </form>

        <div class="flex-1 overflow-y-auto overscroll-contain">
          <div v-if="loading" class="p-4 space-y-3">
            <div v-for="i in 5" :key="i" class="flex items-center gap-3">
              <div class="w-14 h-14 bg-gray-200 rounded-lg animate-pulse" />
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                <div class="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
              </div>
            </div>
          </div>

          <div v-else-if="results.length > 0" class="p-2">
            <SearchDropdownItem
              v-for="item in results"
              :id="item.id"
              :key="item.id"
              :name="item.name"
              :price="item.price"
              :old-price="item.oldPrice"
              :image="item.image"
              :slug="item.slug"
              @click="handleItemClick"
            />
          </div>

          <div v-else-if="query.length >= 2 && !loading" class="p-8 text-center">
            <UIcon name="i-heroicons-face-frown" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p class="text-gray-600 font-medium mb-1">Нічого не знайдено</p>
            <p class="text-sm text-gray-400">
              Спробуйте змінити пошуковий запит
            </p>
          </div>

          <div v-else class="p-8 text-center">
            <UIcon name="i-heroicons-magnifying-glass" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p class="text-gray-600 font-medium mb-1">Пошук товарів</p>
            <p class="text-sm text-gray-400">
              Введіть мінімум 2 символи для пошуку
            </p>
          </div>
        </div>

        <Transition name="fade">
          <div v-if="totalResults > 0 && !loading" class="border-t border-gray-200 p-4 bg-white">
            <button
              class="w-full py-3.5 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold rounded-xl transition-colors"
              @click="handleViewAll"
            >
              Показати всі результати ({{ totalResults }})
            </button>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active {
  transition: transform 0.3s ease-out;
}

.slide-down-leave-active {
  transition: transform 0.2s ease-in;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
}

.safe-area-top {
  padding-top: env(safe-area-inset-top, 0);
}
</style>
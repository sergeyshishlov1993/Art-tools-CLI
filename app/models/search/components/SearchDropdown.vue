<script setup lang="ts">
import { useProductAPI } from '~/models/product/ProductAPI'
import type { Product } from '~/models/product/types/Product'
import { ROUTES } from '~/models/common/constants/routes'
import SearchDropdownItem from './SearchDropdownItem.vue'

interface Props {
  modelValue: string
  isOpen: boolean
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
  'update:modelValue': [value: string]
  'update:isOpen': [value: boolean]
  close: []
  search: [query: string]
}>()

const router = useRouter()
const productAPI = useProductAPI()

const query = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const results = ref<SearchResult[]>([])
const loading = ref(false)
const totalResults = ref(0)
const selectedIndex = ref(-1)
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
      limit: 5
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
    selectedIndex.value = -1
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

function clearSearch() {
  emit('update:modelValue', '')
  results.value = []
  totalResults.value = 0
}

function handleClose() {
  emit('update:isOpen', false)
  emit('close')
  selectedIndex.value = -1
}

function handleViewAll() {
  if (query.value.trim()) {
    router.push({ path: ROUTES.SEARCH, query: { q: query.value } })
    clearSearch()
    handleClose()
  }
}

function handleItemClick() {
  clearSearch()
  handleClose()
}

function handleKeydown(e: KeyboardEvent) {
  if (!props.isOpen) return

  switch (e.key) {
    case 'Escape':
      handleClose()
      break
    case 'Enter': {
      const selectedProduct = results.value[selectedIndex.value]
      if (selectedIndex.value >= 0 && selectedProduct) {
        router.push(ROUTES.product(selectedProduct.slug))
        clearSearch()
        handleClose()
      } else if (query.value.trim()) {
        handleViewAll()
      }
      break
    }
    case 'ArrowDown':
      e.preventDefault()
      if (selectedIndex.value < results.value.length - 1) {
        selectedIndex.value++
      }
      break
    case 'ArrowUp':
      e.preventDefault()
      if (selectedIndex.value > 0) {
        selectedIndex.value--
      }
      break
  }
}

function handleFocus() {
  if (query.value.length >= 2) {
    emit('update:isOpen', true)
  }
}

watch(query, () => {
  if (query.value.length >= 2) {
    emit('update:isOpen', true)
    debouncedSearch()
  } else {
    results.value = []
    totalResults.value = 0
  }
})

onUnmounted(() => {
  clearTimeout(searchTimeout)
})

defineExpose({
  focus: () => inputRef.value?.focus()
})
</script>

<template>
  <div class="relative">
    <div class="relative">
      <UIcon
        name="heroicons-magnifying-glass"
        class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
      />
      <input
        ref="inputRef"
        v-model="query"
        type="text"
        placeholder="Пошук товарів..."
        class="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm"
        autocomplete="off"
        @keydown="handleKeydown"
        @focus="handleFocus"
      >
      <div
        v-if="loading"
        class="absolute right-3 top-1/2 -translate-y-1/2"
      >
        <UIcon name="heroicons-arrow-path" class="w-4 h-4 text-gray-400 animate-spin" />
      </div>
      <button
        v-else-if="query"
        type="button"
        class="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
        @click="clearSearch(); handleClose()"
      >
        <UIcon name="heroicons-x-mark" class="w-4 h-4 text-gray-400" />
      </button>
    </div>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="isOpen && (loading || results.length > 0 || (query.length >= 2 && !loading))"
        class="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
      >
        <div v-if="loading" class="p-3 space-y-3">
          <div v-for="i in 3" :key="i" class="flex items-center gap-3">
            <div class="w-14 h-14 bg-gray-200 rounded-lg animate-pulse" />
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div class="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
            </div>
          </div>
        </div>

        <template v-else-if="results.length > 0">
          <div class="max-h-80 overflow-y-auto p-2">
            <SearchDropdownItem
              v-for="(item, index) in results"
              :id="item.id"
              :key="item.id"
              :name="item.name"
              :price="item.price"
              :old-price="item.oldPrice"
              :image="item.image"
              :slug="item.slug"
              :class="{ 'bg-gray-50': index === selectedIndex }"
              @click="handleItemClick"
            />
          </div>

          <div class="border-t border-gray-100 p-2">
            <button
              class="w-full py-2.5 text-sm text-green-600 hover:text-green-700 font-medium hover:bg-green-50 rounded-lg transition-colors flex items-center justify-center gap-1"
              @click="handleViewAll"
            >
              Показати всі результати ({{ totalResults }})
              <UIcon name="heroicons-arrow-right" class="w-4 h-4" />
            </button>
          </div>
        </template>

        <div v-else-if="query.length >= 2" class="p-6 text-center">
          <UIcon name="heroicons-face-frown" class="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p class="text-sm text-gray-500">
            За запитом "{{ query }}" нічого не знайдено
          </p>
        </div>
      </div>
    </Transition>

    <Teleport to="body">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-40"
        @click="handleClose"
      />
    </Teleport>
  </div>
</template>
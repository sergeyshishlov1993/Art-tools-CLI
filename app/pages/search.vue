<script setup lang="ts">
import { useCachedProducts } from '~/models/product/composables/useCachedProducts'
import { useCartActions } from '~/models/cart/composables/useCartActions'

import ProductCard from '~/models/product/components/ProductCard.vue'
import CartModal from '~/models/cart/components/CartModal.vue'
import OneClickModal from '~/models/cart/components/OneClickModal.vue'
import BBtn from '~/models/common/components/ui/BBtn.vue'
import BInput from '~/models/common/components/ui/BInput.vue'

const route = useRoute()
const router = useRouter()

const productsData = useCachedProducts()
const {
  isCartModalOpen,
  isOneClickModalOpen,
  lastAddedProduct,
  addToCartById,
  quickBuyById
} = useCartActions()

const searchQuery = ref('')
const currentPage = ref(1)
const perPage = ref(12)

async function loadResults() {
  if (!searchQuery.value.trim()) {
    productsData.reset()
    return
  }

  await productsData.loadProducts({
    search: searchQuery.value,
    page: currentPage.value,
    limit: perPage.value
  }, false)
}

function handleSearch() {
  if (searchQuery.value.trim()) {
    currentPage.value = 1
    router.push({ path: '/search', query: { q: searchQuery.value } })
  }
}

function handleAddToCart(productId: string) {
  addToCartById(productId, productsData.products.value)
}

function handleQuickBuy(productId: string) {
  quickBuyById(productId, productsData.products.value)
}

watch(
  () => route.query.q,
  (newQuery) => {
    searchQuery.value = String(newQuery || '')
    currentPage.value = 1
    loadResults()
  },
  { immediate: true }
)

watch(currentPage, () => {
  loadResults()
})

useHead({
  title: () => searchQuery.value
    ? `Пошук: ${searchQuery.value}`
    : 'Пошук товарів'
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 py-6 lg:py-8">
      <nav class="flex items-center gap-2 text-sm mb-6">
        <NuxtLink to="/" class="text-gray-500 hover:text-green-600 transition-colors">
          Головна
        </NuxtLink>
        <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 text-gray-400" />
        <span class="text-gray-800">Пошук</span>
      </nav>

      <div class="mb-8">
        <h1 class="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
          {{ searchQuery ? `Результати пошуку: "${searchQuery}"` : 'Пошук товарів' }}
        </h1>

        <form class="max-w-xl flex gap-2" @submit.prevent="handleSearch">
          <div class="flex-1">
            <BInput
              v-model="searchQuery"
              type="search"
              placeholder="Введіть назву товару..."
              icon="i-heroicons-magnifying-glass"
              size="lg"
            />
          </div>
          <BBtn type="submit" variant="primary" size="lg">
            Знайти
          </BBtn>
        </form>

        <p v-if="searchQuery && !productsData.loading.value" class="text-gray-500 mt-3">
          Знайдено {{ productsData.total.value }} товарів
        </p>
      </div>

      <div v-if="productsData.loading.value" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="i in 8"
          :key="i"
          class="bg-white rounded-xl border border-gray-200 overflow-hidden"
        >
          <div class="aspect-square bg-gray-200 animate-pulse" />
          <div class="p-4 space-y-3">
            <div class="h-4 bg-gray-200 animate-pulse rounded-full w-full" />
            <div class="h-4 bg-gray-200 animate-pulse rounded-full w-2/3" />
            <div class="h-6 bg-gray-200 animate-pulse rounded-full w-24" />
          </div>
        </div>
      </div>

      <div
        v-else-if="productsData.transformedProducts.value.length > 0"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        <ProductCard
          v-for="product in productsData.transformedProducts.value"
          :key="product.id"
          :product="product"
          @add-to-cart="handleAddToCart"
          @quick-buy="handleQuickBuy"
        />
      </div>

      <div
        v-else-if="searchQuery && !productsData.loading.value"
        class="bg-white rounded-lg border border-gray-200 p-12 text-center"
      >
        <UIcon name="i-heroicons-magnifying-glass" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-800 mb-2">Нічого не знайдено</h3>
        <p class="text-gray-500 mb-4">
          За запитом "{{ searchQuery }}" товарів не знайдено
        </p>
        <p class="text-sm text-gray-400">
          Спробуйте змінити пошуковий запит або перегляньте наш каталог
        </p>
        <NuxtLink to="/catalog">
          <BBtn variant="primary" class="mt-4">
            Перейти до каталогу
          </BBtn>
        </NuxtLink>
      </div>

      <div
        v-else
        class="bg-white rounded-lg border border-gray-200 p-12 text-center"
      >
        <UIcon name="i-heroicons-magnifying-glass" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-800 mb-2">Введіть пошуковий запит</h3>
        <p class="text-gray-500">
          Почніть вводити назву товару для пошуку
        </p>
      </div>

      <div
        v-if="productsData.pages.value > 1 && !productsData.loading.value"
        class="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <p class="text-sm text-gray-500">
          Сторінка {{ currentPage }} з {{ productsData.pages.value }}
        </p>
        <div class="flex items-center gap-2">
          <button
            :disabled="currentPage === 1"
            class="p-2 border border-gray-300 rounded-lg hover:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            @click="currentPage--"
          >
            <UIcon name="i-heroicons-chevron-left" class="w-5 h-5" />
          </button>

          <template v-for="page in productsData.pages.value" :key="page">
            <button
              v-if="page === 1 || page === productsData.pages.value || (page >= currentPage - 1 && page <= currentPage + 1)"
              class="w-10 h-10 rounded-lg text-sm font-medium transition-colors"
              :class="page === currentPage
                ? 'bg-green-500 text-white'
                : 'border border-gray-300 hover:border-green-500'"
              @click="currentPage = page"
            >
              {{ page }}
            </button>
            <span
              v-else-if="page === 2 || page === productsData.pages.value - 1"
              class="px-1 text-gray-400"
            >
              ...
            </span>
          </template>

          <button
            :disabled="currentPage === productsData.pages.value"
            class="p-2 border border-gray-300 rounded-lg hover:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            @click="currentPage++"
          >
            <UIcon name="i-heroicons-chevron-right" class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <CartModal v-model="isCartModalOpen" :product="lastAddedProduct" @quick-buy="() => isOneClickModalOpen = true" />
    <OneClickModal v-model="isOneClickModalOpen" :product="lastAddedProduct" />
  </div>
</template>
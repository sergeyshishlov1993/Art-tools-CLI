<script setup lang="ts">
import { useCategoryStore } from '~/models/category/CategoryStore'
import { useCachedProducts } from '~/models/product/composables/useCachedProducts'
import { useCachedFilters } from '~/models/filters/composables/useCachedFilters'
import { useCatalogFilters } from '~/models/filters/composables/useCatalogFilters'
import { useCartActions } from '~/models/cart/composables/useCartActions'
import { ROUTES } from '~/models/common/constants/routes'
import ProductCard from '~/models/product/components/ProductCard.vue'
import ProductFilter from '~/models/product/components/ProductFilter.vue'
import CartModal from '~/models/cart/components/CartModal.vue'
import OneClickModal from '~/models/cart/components/OneClickModal.vue'
import BSelect from '~/models/common/components/ui/BSelect.vue'
import BBtn from '~/models/common/components/ui/BBtn.vue'

const route = useRoute()
const categoryStore = useCategoryStore()

const productsData = useCachedProducts()
const filtersData = useCachedFilters()
const filterState = useCatalogFilters({ syncUrl: true })
const {
  isCartModalOpen,
  isOneClickModalOpen,
  lastAddedProduct,
  addToCartById,
  quickBuyById
} = useCartActions()

const categoryId = computed(() => route.params.category as string)
const subcategoryId = computed(() => route.params.subcategory as string | undefined)

const isFilterOpen = ref(false)
const loadingMore = ref(false)
const allProducts = ref<any[]>([])
const currentPage = ref(1)
const loadMoreTrigger = ref<HTMLElement | null>(null)

const sortOptions = [
  { value: 'popular', label: 'За популярністю' },
  { value: 'price-asc', label: 'Від дешевих до дорогих' },
  { value: 'price-desc', label: 'Від дорогих до дешевих' },
  { value: 'new', label: 'Новинки' },
]

function buildParams() {
  const params = filterState.buildParams()
  params.category = categoryId.value
  if (filterState.subcategories.value.length > 0) {
    params.sub_category = filterState.subcategories.value.join(',')
  } else if (subcategoryId.value) {
    params.sub_category = subcategoryId.value
  }
  return params
}

const asyncKey = computed(() =>
  `catalog-${categoryId.value}-${subcategoryId.value || 'all'}`
)

const { pending: initialLoading } = await useAsyncData(
  asyncKey.value,
  async () => {
    await categoryStore.fetchActive()

    const params = buildParams()

    await Promise.all([
      filtersData.loadFilters(params),
      productsData.loadProducts({
        ...params,
        page: 1,
        limit: 12,
        sort: filterState.sort.value,
      })
    ])

    allProducts.value = [...productsData.transformedProducts.value]
    currentPage.value = 1

    return true
  },
  {
    watch: [categoryId, subcategoryId],
    immediate: true
  }
)

const currentCategory = computed(() =>
  categoryStore.categories.find(c => c.id === categoryId.value)
)

const currentSubcategory = computed(() => {
  if (!subcategoryId.value) return null
  return categoryStore.getSubcategories(categoryId.value)
    .find(s => s.id === subcategoryId.value)
})

const breadcrumbs = computed(() => {
  const crumbs: { label: string; to?: string }[] = [
    { label: 'Головна', to: ROUTES.HOME },
    { label: 'Каталог', to: ROUTES.CATALOG },
  ]
  if (currentCategory.value) {
    crumbs.push({
      label: currentCategory.value.name,
      to: subcategoryId.value ? ROUTES.category(categoryId.value) : undefined
    })
  }
  if (currentSubcategory.value) {
    crumbs.push({ label: currentSubcategory.value.name })
  }
  return crumbs
})

const pageTitle = computed(() =>
  currentSubcategory.value?.name || currentCategory.value?.name || 'Каталог'
)

const hasMore = computed(() => currentPage.value < productsData.pages.value)
const showingCount = computed(() => allProducts.value.length)

function handleAddToCart(productId: string) {
  addToCartById(productId, productsData.products.value)
}

function handleQuickBuy(productId: string) {
  quickBuyById(productId, productsData.products.value)
}

function clearFilters() {
  filterState.clearFilters()
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function loadMore() {
  if (loadingMore.value || !hasMore.value) return

  loadingMore.value = true
  currentPage.value++

  try {
    await productsData.loadProducts({
      ...buildParams(),
      page: currentPage.value,
      limit: 12,
      sort: filterState.sort.value,
    })

    allProducts.value = [...allProducts.value, ...productsData.transformedProducts.value]
  } finally {
    loadingMore.value = false
  }
}

async function reloadWithFilters() {
  currentPage.value = 1
  filterState.syncToUrl()

  const params = buildParams()

  await Promise.all([
    filtersData.loadFilters(params),
    productsData.loadProducts({
      ...params,
      page: 1,
      limit: 12,
      sort: filterState.sort.value,
    })
  ])

  allProducts.value = [...productsData.transformedProducts.value]
}

let observer: IntersectionObserver | null = null

function setupIntersectionObserver() {
  if (import.meta.server) return

  if (observer) {
    observer.disconnect()
  }

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry?.isIntersecting && hasMore.value && !loadingMore.value && !initialLoading.value) {
        loadMore()
      }
    },
    {
      rootMargin: '200px',
      threshold: 0
    }
  )

  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value)
  }
}

let filterTimeout: ReturnType<typeof setTimeout>
function debouncedReload() {
  clearTimeout(filterTimeout)
  filterTimeout = setTimeout(() => {
    reloadWithFilters()
  }, 300)
}

watch(
  [
    filterState.subcategories,
    filterState.brands,
    filterState.params,
    filterState.special,
    filterState.price,
  ],
  () => {
    debouncedReload()
  },
  { deep: true }
)

watch(() => filterState.sort.value, () => {
  reloadWithFilters()
})

watch(loadMoreTrigger, () => {
  if (loadMoreTrigger.value) {
    setupIntersectionObserver()
  }
})

onMounted(() => {
  filterState.readFromUrl()
  nextTick(() => {
    setupIntersectionObserver()
  })
})

onUnmounted(() => {
  clearTimeout(filterTimeout)
  if (observer) {
    observer.disconnect()
  }
})

useHead({
  title: () => pageTitle.value,
})

useSeoMeta({
  title: () => pageTitle.value,
  description: () => `${pageTitle.value} - купити в інтернет-магазині. Великий вибір, доступні ціни.`,
  ogTitle: () => pageTitle.value,
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 py-6">
      <nav class="flex items-center gap-2 text-sm mb-6 flex-wrap">
        <template v-for="(crumb, index) in breadcrumbs" :key="index">
          <NuxtLink
            v-if="crumb.to"
            :to="crumb.to"
            class="text-gray-500 hover:text-green-600 transition-colors"
          >
            {{ crumb.label }}
          </NuxtLink>
          <span v-else class="text-gray-800">{{ crumb.label }}</span>
          <UIcon
            v-if="index < breadcrumbs.length - 1"
            name="heroicons-chevron-right"
            class="w-4 h-4 text-gray-400"
          />
        </template>
      </nav>

      <div class="mb-6">
        <h1 class="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
          {{ pageTitle }}
        </h1>
        <p class="text-gray-500">
          <template v-if="!initialLoading">
            Показано {{ showingCount }} з {{ productsData.total.value }} товарів
          </template>
          <template v-else>
            Завантаження...
          </template>
        </p>
      </div>

      <div class="xl:hidden sticky top-[120px] z-30 bg-gray-50 pb-3 pt-1 -mx-4 px-4">
        <div class="flex items-center gap-3">
          <BBtn
            variant="secondary"
            icon="heroicons-adjustments-horizontal"
            @click="isFilterOpen = true"
          >
            Фільтри
            <span
              v-if="filterState.hasActiveFilters.value"
              class="ml-1 bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
            >
              !
            </span>
          </BBtn>
          <div class="flex-1">
            <BSelect v-model="filterState.sort.value" :options="sortOptions" size="sm" />
          </div>
        </div>
      </div>

      <div class="flex gap-6">
        <aside class="hidden xl:block w-72 flex-shrink-0">
          <div class="sticky top-32 max-h-[calc(100vh-10rem)] overflow-y-auto scrollbar-thin">
            <ProductFilter
              v-model:selected-subcategories="filterState.subcategories.value"
              v-model:selected-brands="filterState.brands.value"
              v-model:selected-params="filterState.params.value"
              v-model:selected-special="filterState.special.value"
              v-model:selected-price="filterState.price.value"
              :filters="filtersData.filters.value"
              :loading="filtersData.loading.value"
              :show-header="true"
              @clear="clearFilters"
            />
          </div>
        </aside>

        <main class="flex-1 min-w-0">
          <div class="hidden xl:flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-500">Сортування:</span>
              <BSelect v-model="filterState.sort.value" :options="sortOptions" size="sm" class="w-56" />
            </div>
            <Transition name="fade">
              <button
                v-if="filterState.hasActiveFilters.value"
                class="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                @click="clearFilters"
              >
                Скинути фільтри
              </button>
            </Transition>
          </div>

          <div class="relative min-h-[400px]">
            <div
              v-if="initialLoading"
              class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4"
            >
              <div
                v-for="i in 9"
                :key="i"
                class="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <div class="aspect-square skeleton" />
                <div class="p-4 space-y-3">
                  <div class="space-y-2">
                    <div class="h-4 skeleton rounded-full w-full" />
                    <div class="h-4 skeleton rounded-full w-2/3" />
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="h-6 skeleton rounded-full w-24" />
                    <div class="h-4 skeleton rounded-full w-16" />
                  </div>
                  <div class="h-10 skeleton rounded-lg" />
                </div>
              </div>
            </div>

            <template v-else>
              <div
                v-if="allProducts.length > 0"
                class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4"
              >
                <ProductCard
                  v-for="product in allProducts"
                  :key="product.id"
                  :product="product"
                  class="product-card"
                  @add-to-cart="handleAddToCart"
                  @quick-buy="handleQuickBuy"
                />
              </div>

              <div
                v-else
                class="bg-white rounded-lg border border-gray-200 p-12 text-center"
              >
                <UIcon name="heroicons-magnifying-glass" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 class="text-lg font-medium text-gray-800 mb-2">Товарів не знайдено</h3>
                <p class="text-gray-500 mb-4">Спробуйте змінити параметри фільтрів</p>
                <BBtn variant="primary" @click="clearFilters">
                  Скинути фільтри
                </BBtn>
              </div>
            </template>
          </div>

          <div
            v-if="allProducts.length > 0 && !initialLoading"
            ref="loadMoreTrigger"
            class="mt-8 flex flex-col items-center"
          >
            <div v-if="loadingMore" class="flex items-center gap-3 py-8">
              <div class="loading-spinner" />
              <span class="text-gray-500">Завантаження...</span>
            </div>

            <div v-else-if="hasMore" class="py-8 text-center">
              <button
                class="text-green-600 hover:text-green-700 font-medium flex items-center gap-2 mx-auto transition-colors"
                @click="loadMore"
              >
                <UIcon name="heroicons-arrow-down" class="w-5 h-5" />
                Завантажити ще
              </button>
              <p class="text-sm text-gray-400 mt-2">або прокрутіть вниз</p>
            </div>

            <div v-else class="py-8 text-center">
              <div class="inline-flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm">
                <UIcon name="heroicons-check-circle" class="w-5 h-5 text-green-500" />
                Всі товари завантажено
              </div>
            </div>
          </div>

          <div
            v-if="allProducts.length > 0 && productsData.total.value > 12 && !initialLoading"
            class="mt-4"
          >
            <div class="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Прогрес завантаження</span>
              <span>{{ showingCount }} / {{ productsData.total.value }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                class="bg-green-500 h-full rounded-full transition-all duration-500"
                :style="{ width: `${(showingCount / productsData.total.value) * 100}%` }"
              />
            </div>
          </div>
        </main>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="isFilterOpen"
          class="fixed inset-0 bg-black/50 z-40 xl:hidden"
          @click="isFilterOpen = false"
        />
      </Transition>

      <Transition name="slide">
        <div
          v-if="isFilterOpen"
          class="fixed inset-y-0 left-0 w-80 max-w-full bg-white z-50 flex flex-col xl:hidden shadow-2xl"
        >
          <div class="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 class="font-bold text-gray-800">Фільтри</h3>
            <div class="flex items-center gap-2">
              <button
                v-if="filterState.hasActiveFilters.value"
                class="text-sm text-red-500 hover:text-red-600 transition-colors"
                @click="clearFilters"
              >
                Очистити
              </button>
              <button
                class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                @click="isFilterOpen = false"
              >
                <UIcon name="heroicons-x-mark" class="w-6 h-6" />
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto">
            <ProductFilter
              v-model:selected-subcategories="filterState.subcategories.value"
              v-model:selected-brands="filterState.brands.value"
              v-model:selected-params="filterState.params.value"
              v-model:selected-special="filterState.special.value"
              v-model:selected-price="filterState.price.value"
              :filters="filtersData.filters.value"
              :loading="filtersData.loading.value"
              :show-header="false"
              @clear="clearFilters"
            />
          </div>

          <div class="p-4 border-t border-gray-200">
            <BBtn variant="primary" class="w-full" @click="isFilterOpen = false">
              Показати {{ productsData.total.value }} товарів
            </BBtn>
          </div>
        </div>
      </Transition>
    </Teleport>

    <ClientOnly>
      <Transition name="fade">
        <button
          v-if="allProducts.length > 12"
          class="fixed bottom-6 right-6 w-12 h-12 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 hover:border-green-500 transition-all z-30"
          @click="scrollToTop"
        >
          <UIcon name="heroicons-chevron-up" class="w-6 h-6 text-gray-600" />
        </button>
      </Transition>
    </ClientOnly>

    <CartModal v-model="isCartModalOpen" :product="lastAddedProduct" @quick-buy="() => isOneClickModalOpen = true" />
    <OneClickModal v-model="isOneClickModalOpen" :product="lastAddedProduct" />
  </div>
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

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

.product-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.product-card:hover {
  transform: translateY(-4px);
}

.skeleton {
  background: linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
}

@keyframes skeleton-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e5e7eb;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 3px;
}
</style>

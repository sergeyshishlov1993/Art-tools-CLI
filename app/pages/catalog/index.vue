<script setup lang="ts">
import { useCategoryStore } from '~/models/category/CategoryStore'
import { useCartStore } from '~/models/cart/CartStore'
import { useProductSections } from '~/models/product/composables/useProductSections'
import { useCachedProducts } from '~/models/product/composables/useCachedProducts'
import { useCachedFilters } from '~/models/filters/composables/useCachedFilters'
import { useCatalogFilters } from '~/models/filters/composables/useCatalogFilters'
import { useCartActions } from '~/models/cart/composables/useCartActions'
import { useViewedProducts } from '~/models/product/composables/useViewedProducts'
import { ROUTES } from '~/models/common/constants/routes'
import ProductCard from '~/models/product/components/ProductCard.vue'
import ProductFilter from '~/models/product/components/ProductFilter.vue'
import ProductSection from '~/models/product/components/ProductSection.vue'
import CartModal from '~/models/cart/components/CartModal.vue'
import OneClickModal from '~/models/cart/components/OneClickModal.vue'
import BSelect from '~/models/common/components/ui/BSelect.vue'
import BBtn from '~/models/common/components/ui/BBtn.vue'
import BCheckbox from '~/models/common/components/ui/BCheckbox.vue'

const route = useRoute()
const router = useRouter()
const categoryStore = useCategoryStore()
const cartStore = useCartStore()

const { sale, popular, getAllRawProducts } = useProductSections()
const productsData = useCachedProducts()
const filtersData = useCachedFilters()
const filterState = useCatalogFilters({
  syncUrl: true,
  preserveQueryKeys: ['sale', 'bestseller']
})
const {
  isCartModalOpen,
  isOneClickModalOpen,
  lastAddedProduct,
  addToCartById,
  quickBuyById
} = useCartActions()

const { viewedProducts, hasViewed } = useViewedProducts()

const isFilterOpen = ref(false)
const categoriesLoading = ref(true)
const initialLoading = ref(true)
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

const hasQueryFilters = computed(() => {
  const { sale, bestseller, category, brand, price_min, price_max } = route.query
  return !!(sale || bestseller || category || brand || price_min || price_max)
})

const pageTitle = computed(() => {
  if (route.query.sale === 'true') return 'Акційні товари'
  if (route.query.bestseller === 'true') return 'Хіти продажів'
  if (filterState.category.value) {
    const cat = filtersData.filters.value?.categories?.find(
      c => c.slug === filterState.category.value
    )
    return cat?.name || 'Каталог товарів'
  }
  return 'Каталог товарів'
})

const filteredSubcategories = computed(() => {
  if (!filtersData.filters.value?.subcategories) return []
  if (!filterState.category.value) return filtersData.filters.value.subcategories
  return filtersData.filters.value.subcategories.filter(
    s => s.parent_slug === filterState.category.value
  )
})

const hasMore = computed(() => currentPage.value < productsData.pages.value)
const showingCount = computed(() => allProducts.value.length)

function getAllProducts() {
  return [
    ...productsData.products.value,
    ...getAllRawProducts(),
  ]
}

function handleAddToCart(productId: string) {
  addToCartById(productId, getAllProducts())
}

function handleQuickBuy(productId: string) {
  quickBuyById(productId, getAllProducts())
}

function handleViewedAddToCart(productId: string) {
  const viewed = viewedProducts.value.find(p => p.id === productId)
  if (viewed) {
    cartStore.addToCart({
      id: viewed.id,
      slug: viewed.to.replace('/product/', ''),
      name: viewed.name,
      price: viewed.price,
      oldPrice: viewed.oldPrice,
      image: viewed.image,
      code: viewed.code
    })
    lastAddedProduct.value = viewed
    isCartModalOpen.value = true
  }
}

function handleViewedQuickBuy(productId: string) {
  const viewed = viewedProducts.value.find(p => p.id === productId)
  if (viewed) {
    lastAddedProduct.value = viewed
    isOneClickModalOpen.value = true
  }
}

function getIconPath(categoryId: string): string {
  return `/icons/catalog/icon-${categoryId}.svg`
}

function selectCategory(categorySlug: string) {
  filterState.category.value = filterState.category.value === categorySlug ? '' : categorySlug
  filterState.subcategories.value = []
  currentPage.value = 1
}

function toggleSubcategory(slug: string) {
  const index = filterState.subcategories.value.indexOf(slug)
  if (index === -1) {
    filterState.subcategories.value = [...filterState.subcategories.value, slug]
  } else {
    filterState.subcategories.value = filterState.subcategories.value.filter(s => s !== slug)
  }
}

function isSubcategorySelected(slug: string): boolean {
  return filterState.subcategories.value.includes(slug)
}

function clearFilters() {
  filterState.clearFilters()
  router.push({ path: ROUTES.CATALOG })
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function loadCategories() {
  categoriesLoading.value = true
  try {
    await categoryStore.fetchActive()
  } finally {
    categoriesLoading.value = false
  }
}

async function loadInitialData() {
  initialLoading.value = true
  currentPage.value = 1
  const params = filterState.buildParams()
  try {
    await Promise.all([
      filtersData.loadFilters(params),
      productsData.loadProducts({
        ...params,
        page: 1,
        limit: 20,
        sort: filterState.sort.value,
      })
    ])
    allProducts.value = [...productsData.transformedProducts.value]
  } finally {
    initialLoading.value = false
  }
}

async function loadMore() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  currentPage.value++
  try {
    await productsData.loadProducts({
      ...filterState.buildParams(),
      page: currentPage.value,
      limit: 20,
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
  await loadInitialData()
}

let observer: IntersectionObserver | null = null

function setupIntersectionObserver() {
  if (import.meta.server) return
  if (observer) observer.disconnect()
  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry?.isIntersecting && hasMore.value && !loadingMore.value && !initialLoading.value) {
        loadMore()
      }
    },
    { rootMargin: '200px', threshold: 0 }
  )
  if (loadMoreTrigger.value) observer.observe(loadMoreTrigger.value)
}

let filterTimeout: ReturnType<typeof setTimeout>
function debouncedReload() {
  clearTimeout(filterTimeout)
  filterTimeout = setTimeout(() => reloadWithFilters(), 300)
}

watch(
  [filterState.category, filterState.subcategories, filterState.brands, filterState.params, filterState.special, filterState.price],
  () => debouncedReload(),
  { deep: true }
)

watch(() => filterState.sort.value, () => reloadWithFilters())

watch(loadMoreTrigger, () => {
  if (loadMoreTrigger.value) setupIntersectionObserver()
})

watch(
  () => route.query,
  async (newQuery, oldQuery) => {
    const newHasFilters = !!(newQuery.sale || newQuery.bestseller || newQuery.category || newQuery.brand || newQuery.price_min || newQuery.price_max)
    if (newHasFilters) {
      if (JSON.stringify(newQuery) !== JSON.stringify(oldQuery)) {
        filterState.readFromUrl()
        await loadInitialData()
        nextTick(() => setupIntersectionObserver())
      }
    } else {
      filterState.clearFilters()
      allProducts.value = []
      if (sale.products.value.length === 0) sale.load()
      if (popular.products.value.length === 0) popular.load()
      loadCategories()
    }
  },
  { deep: true }
)

onMounted(async () => {
  await loadCategories()
  if (hasQueryFilters.value) {
    filterState.readFromUrl()
    await loadInitialData()
    nextTick(() => setupIntersectionObserver())
  } else {
    initialLoading.value = false
    sale.load()
    popular.load()
  }
})

onUnmounted(() => {
  clearTimeout(filterTimeout)
  if (observer) observer.disconnect()
})

useHead({ title: pageTitle })
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 py-6">
      <nav class="flex items-center gap-2 text-sm mb-8 flex-wrap">
        <NuxtLink :to="ROUTES.HOME" class="text-gray-500 hover:text-green-600 transition-colors">
          Головна
        </NuxtLink>
        <UIcon name="heroicons-chevron-right" class="w-4 h-4 text-gray-400" />
        <NuxtLink
          v-if="hasQueryFilters"
          :to="ROUTES.CATALOG"
          class="text-gray-500 hover:text-green-600 transition-colors"
        >
          Каталог
        </NuxtLink>
        <UIcon v-if="hasQueryFilters" name="heroicons-chevron-right" class="w-4 h-4 text-gray-400" />
        <span class="text-gray-800">{{ pageTitle }}</span>
      </nav>

      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl lg:text-3xl font-bold text-gray-800 mb-1">{{ pageTitle }}</h1>
          <Transition name="fade" mode="out-in">
            <p v-if="hasQueryFilters && !initialLoading" class="text-gray-500">
              Показано {{ showingCount }} з {{ productsData.total.value }} товарів
            </p>
          </Transition>
        </div>
        <div v-if="!hasQueryFilters" class="flex items-center gap-3">
          <NuxtLink
            to="/catalog?sale=true"
            class="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-medium hover:bg-red-100 transition-colors"
          >
            <UIcon name="heroicons-fire" class="w-4 h-4" />
            Акції
          </NuxtLink>
          <NuxtLink
            to="/catalog?bestseller=true"
            class="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-full text-sm font-medium hover:bg-green-100 transition-colors"
          >
            <UIcon name="heroicons-star" class="w-4 h-4" />
            Хіти
          </NuxtLink>
        </div>
      </div>

      <template v-if="hasQueryFilters">
        <div class="xl:hidden sticky top-[120px] z-30 bg-gray-50 pb-3 pt-1 -mx-4 px-4">
          <div class="flex items-center gap-3">
            <BBtn variant="secondary" icon="heroicons-adjustments-horizontal" @click="isFilterOpen = true">
              Фільтри
              <span
                v-if="filterState.hasActiveFilters.value"
                class="ml-1 bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
              >!</span>
            </BBtn>
            <div class="flex-1">
              <BSelect v-model="filterState.sort.value" :options="sortOptions" size="sm" />
            </div>
          </div>
        </div>

        <div class="flex gap-6">
          <aside class="hidden xl:block w-72 flex-shrink-0">
            <div class="sticky top-32 max-h-[calc(100vh-10rem)] overflow-y-auto scrollbar-thin space-y-4">
              <Transition name="fade" mode="out-in">
                <div v-if="filtersData.filters.value?.categories?.length" class="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 class="font-medium text-gray-800 mb-3">Категорія</h3>
                  <div class="space-y-2">
                    <button
                      v-for="cat in filtersData.filters.value.categories"
                      :key="cat.slug"
                      class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 text-left"
                      :class="filterState.category.value === cat.slug ? 'bg-green-50 text-green-700 font-medium' : 'hover:bg-gray-50 text-gray-700'"
                      @click="selectCategory(cat.slug)"
                    >
                      <span>{{ cat.name }}</span>
                      <span class="text-xs text-gray-400">{{ cat.count }}</span>
                    </button>
                  </div>
                </div>
              </Transition>
              <Transition name="fade" mode="out-in">
                <div v-if="filteredSubcategories.length > 0" class="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 class="font-medium text-gray-800 mb-3">Підкатегорія</h3>
                  <div class="space-y-1 max-h-60 overflow-y-auto">
                    <div
                      v-for="sub in filteredSubcategories"
                      :key="sub.slug"
                      class="flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                      @click="toggleSubcategory(sub.slug)"
                    >
                      <BCheckbox :model-value="isSubcategorySelected(sub.slug)" :label="sub.name" @update:model-value="toggleSubcategory(sub.slug)" />
                      <span class="text-xs text-gray-400">{{ sub.count }}</span>
                    </div>
                  </div>
                </div>
              </Transition>
              <ProductFilter
                v-model:selected-brands="filterState.brands.value"
                v-model:selected-params="filterState.params.value"
                v-model:selected-special="filterState.special.value"
                v-model:selected-price="filterState.price.value"
                :filters="filtersData.filters.value"
                :loading="filtersData.loading.value"
                :show-header="false"
                :show-subcategories="false"
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
                >Скинути фільтри</button>
              </Transition>
            </div>

            <div class="relative min-h-[400px]">
              <div v-if="initialLoading" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
                <div v-for="i in 9" :key="i" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
                <div v-if="allProducts.length > 0" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
                  <ProductCard
                    v-for="product in allProducts"
                    :key="product.id"
                    :product="product"
                    class="product-card"
                    @add-to-cart="handleAddToCart"
                    @quick-buy="handleQuickBuy"
                  />
                </div>
                <div v-else class="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <UIcon name="heroicons-face-frown" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 class="text-lg font-medium text-gray-800 mb-2">Товарів не знайдено</h3>
                  <p class="text-gray-500 mb-4">Спробуйте змінити параметри фільтрів</p>
                  <BBtn variant="primary" @click="clearFilters">Скинути фільтри</BBtn>
                </div>
              </template>
            </div>

            <div v-if="allProducts.length > 0 && !initialLoading" ref="loadMoreTrigger" class="mt-8 flex flex-col items-center">
              <div v-if="loadingMore" class="flex items-center gap-3 py-8">
                <div class="loading-spinner" />
                <span class="text-gray-500">Завантаження...</span>
              </div>
              <div v-else-if="hasMore" class="py-8 text-center">
                <button class="text-green-600 hover:text-green-700 font-medium flex items-center gap-2 mx-auto transition-colors" @click="loadMore">
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

            <div v-if="allProducts.length > 0 && productsData.total.value > 20 && !initialLoading" class="mt-4">
              <div class="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>Прогрес завантаження</span>
                <span>{{ showingCount }} / {{ productsData.total.value }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div class="bg-green-500 h-full rounded-full transition-all duration-500" :style="{ width: `${(showingCount / productsData.total.value) * 100}%` }" />
              </div>
            </div>
          </main>
        </div>
      </template>

      <template v-else>
        <section class="mb-16 lg:mb-20">
          <h2 class="text-xl font-bold text-gray-800 mb-6 lg:mb-8">Категорії</h2>
          <Transition name="fade" mode="out-in">
            <div v-if="categoriesLoading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
              <div v-for="i in 10" :key="i" class="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
                <div class="w-14 h-14 skeleton rounded-full mx-auto mb-3" />
                <div class="h-4 skeleton rounded-full w-3/4 mx-auto" />
                <div class="h-3 skeleton rounded-full w-1/2 mx-auto mt-2" />
              </div>
            </div>
            <div v-else-if="categoryStore.categories?.length" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
              <NuxtLink
                v-for="category in categoryStore.categories"
                :key="category.id"
                :to="ROUTES.category(category.id)"
                class="group bg-white rounded-xl border border-gray-200 p-4 lg:p-6 hover:border-green-500 hover:shadow-lg transition-all duration-300"
              >
                <div class="w-14 h-14 lg:w-16 lg:h-16 mx-auto mb-3 lg:mb-4 bg-green-50 rounded-full flex items-center justify-center group-hover:bg-green-100 group-hover:scale-110 transition-all duration-300">
                  <img :src="getIconPath(category.id)" :alt="category.name" class="w-7 h-7 lg:w-8 lg:h-8">
                </div>
                <h3 class="text-sm lg:text-base font-medium text-gray-700 text-center group-hover:text-green-700 transition-colors line-clamp-2">{{ category.name }}</h3>
                <p v-if="categoryStore.getSubcategories(category.id).length" class="text-xs text-gray-400 text-center mt-1 lg:mt-2">
                  {{ categoryStore.getSubcategories(category.id).length }} підкатегорій
                </p>
              </NuxtLink>
            </div>
            <div v-else class="text-center py-12 text-gray-500">Категорії не знайдено</div>
          </Transition>
        </section>

        <div class="space-y-16 lg:space-y-20">
          <ProductSection
            v-if="sale.loading.value || sale.products.value.length"
            title="Акційні товари"
            :products="sale.products.value"
            :loading="sale.loading.value"
            view-all-link="/catalog?sale=true"
            @add-to-cart="handleAddToCart"
            @quick-buy="handleQuickBuy"
          />
          <ProductSection
            v-if="popular.loading.value || popular.products.value.length"
            title="Хіти продажів"
            :products="popular.products.value"
            :loading="popular.loading.value"
            view-all-link="/catalog?bestseller=true"
            @add-to-cart="handleAddToCart"
            @quick-buy="handleQuickBuy"
          />
          <ClientOnly>
            <ProductSection
              v-if="hasViewed"
              title="Ви переглядали"
              :products="viewedProducts"
              @add-to-cart="handleViewedAddToCart"
              @quick-buy="handleViewedQuickBuy"
            />
          </ClientOnly>
        </div>

        <section class="mt-16 lg:mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div
            v-for="(item, index) in [
              { icon: 'heroicons-truck', title: 'Безкоштовна доставка', desc: 'При замовленні від 2000 грн' },
              { icon: 'heroicons-shield-check', title: 'Гарантія якості', desc: 'Офіційна гарантія від виробника' },
              { icon: 'heroicons-arrow-path', title: 'Повернення 14 днів', desc: 'Легке повернення товару' },
              { icon: 'heroicons-credit-card', title: 'Зручна оплата', desc: 'Карткою або при отриманні' }
            ]"
            :key="index"
            class="bg-white rounded-xl border border-gray-200 p-6 lg:p-8 flex items-start gap-4 hover:border-green-200 hover:shadow-md transition-all duration-300"
          >
            <div class="w-12 h-12 lg:w-14 lg:h-14 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <UIcon :name="item.icon" class="w-6 h-6 lg:w-7 lg:h-7 text-green-600" />
            </div>
            <div>
              <h3 class="font-medium text-gray-800 mb-1 lg:text-lg">{{ item.title }}</h3>
              <p class="text-sm text-gray-500">{{ item.desc }}</p>
            </div>
          </div>
        </section>
      </template>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isFilterOpen" class="fixed inset-0 bg-black/50 z-40 xl:hidden" @click="isFilterOpen = false" />
      </Transition>
      <Transition name="slide">
        <div v-if="isFilterOpen" class="fixed inset-y-0 left-0 w-80 max-w-full bg-white z-50 flex flex-col xl:hidden shadow-2xl">
          <div class="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 class="font-bold text-gray-800">Фільтри</h3>
            <div class="flex items-center gap-2">
              <button v-if="filterState.hasActiveFilters.value" class="text-sm text-red-500 hover:text-red-600 transition-colors" @click="clearFilters">Очистити</button>
              <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors" @click="isFilterOpen = false">
                <UIcon name="heroicons-x-mark" class="w-6 h-6" />
              </button>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <div v-if="filtersData.filters.value?.categories?.length" class="bg-gray-50 rounded-lg p-3">
              <h3 class="font-medium text-gray-800 mb-3">Категорія</h3>
              <div class="space-y-1">
                <button
                  v-for="cat in filtersData.filters.value.categories"
                  :key="cat.slug"
                  class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 text-left"
                  :class="filterState.category.value === cat.slug ? 'bg-green-100 text-green-700 font-medium' : 'hover:bg-white text-gray-700'"
                  @click="selectCategory(cat.slug)"
                >
                  <span>{{ cat.name }}</span>
                  <span class="text-xs text-gray-400">{{ cat.count }}</span>
                </button>
              </div>
            </div>
            <div v-if="filteredSubcategories.length > 0" class="bg-gray-50 rounded-lg p-3">
              <h3 class="font-medium text-gray-800 mb-3">Підкатегорія</h3>
              <div class="space-y-1 max-h-48 overflow-y-auto">
                <div
                  v-for="sub in filteredSubcategories"
                  :key="sub.slug"
                  class="flex items-center justify-between px-2 py-1.5 rounded hover:bg-white cursor-pointer transition-colors"
                  @click="toggleSubcategory(sub.slug)"
                >
                  <BCheckbox :model-value="isSubcategorySelected(sub.slug)" :label="sub.name" @update:model-value="toggleSubcategory(sub.slug)" />
                  <span class="text-xs text-gray-400">{{ sub.count }}</span>
                </div>
              </div>
            </div>
            <ProductFilter
              v-model:selected-brands="filterState.brands.value"
              v-model:selected-params="filterState.params.value"
              v-model:selected-special="filterState.special.value"
              v-model:selected-price="filterState.price.value"
              :filters="filtersData.filters.value"
              :loading="filtersData.loading.value"
              :show-header="false"
              :show-subcategories="false"
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
          v-if="hasQueryFilters && allProducts.length > 12"
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
  transition: opacity 0.3s ease;
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
@media (hover: hover) {
  .product-card:hover {
    transform: translateY(-4px);
  }
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
  to { transform: rotate(360deg); }
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
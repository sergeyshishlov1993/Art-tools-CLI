<!--<script setup lang="ts">-->
<!--import { useAdminProductStore } from '~/models/admin/AdminProductStore'-->
<!--import { useCategoryStore } from '~/models/category/CategoryStore'-->
<!--import BBtn from '~/models/common/components/ui/BBtn.vue'-->
<!--import BSelect from '~/models/common/components/ui/BSelect.vue'-->

<!--definePageMeta({-->
<!--  layout: 'admin'-->
<!--})-->

<!--const router = useRouter()-->
<!--const store = useAdminProductStore()-->
<!--const categoryStore = useCategoryStore()-->

<!--// Local state-->
<!--const search = ref('')-->
<!--const showDeleteModal = ref(false)-->
<!--const productToDelete = ref<string | null>(null)-->

<!--// Debounced search-->
<!--let searchTimeout: ReturnType<typeof setTimeout> | null = null-->

<!--function onSearchInput() {-->
<!--  if (searchTimeout) clearTimeout(searchTimeout)-->
<!--  searchTimeout = setTimeout(() => {-->
<!--    store.setFilters({ search: search.value })-->
<!--  }, 400)-->
<!--}-->

<!--// Filter options-->
<!--const availabilityOptions = [-->
<!--  { value: '', label: 'Всі' },-->
<!--  { value: 'true', label: 'В наявності' },-->
<!--  { value: 'false', label: 'Немає' }-->
<!--]-->

<!--const sortOptions = [-->
<!--  { value: 'newest', label: 'Новіші' },-->
<!--  { value: 'price_asc', label: 'Ціна ↑' },-->
<!--  { value: 'price_desc', label: 'Ціна ↓' },-->
<!--  { value: 'name_asc', label: 'Назва А-Я' }-->
<!--]-->

<!--const categoryOptions = computed(() => [-->
<!--  { value: '', label: 'Всі категорії' },-->
<!--  ...categoryStore.categories.map(c => ({ value: c.id, label: c.name }))-->
<!--])-->

<!--// Actions-->
<!--function editProduct(id: string) {-->
<!--  router.push(`/admin/products/${id}`)-->
<!--}-->

<!--function confirmDelete(id: string) {-->
<!--  productToDelete.value = id-->
<!--  showDeleteModal.value = true-->
<!--}-->

<!--async function handleDelete() {-->
<!--  if (productToDelete.value) {-->
<!--    await store.deleteProduct(productToDelete.value)-->
<!--    showDeleteModal.value = false-->
<!--    productToDelete.value = null-->
<!--  }-->
<!--}-->

<!--function formatPrice(price: string) {-->
<!--  return new Intl.NumberFormat('uk-UA').format(parseFloat(price))-->
<!--}-->

<!--// Init-->
<!--onMounted(async () => {-->
<!--  await categoryStore.fetchActive()-->
<!--  await store.fetchProducts()-->
<!--})-->

<!--onUnmounted(() => {-->
<!--  if (searchTimeout) clearTimeout(searchTimeout)-->
<!--})-->
<!--</script>-->

<!--<template>-->
<!--  <div class="p-6">-->
<!--    &lt;!&ndash; Header &ndash;&gt;-->
<!--    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">-->
<!--      <div>-->
<!--        <h1 class="text-2xl font-bold text-gray-800">Товари</h1>-->
<!--        <p class="text-gray-500">Всього: {{ store.pagination.total }}</p>-->
<!--      </div>-->
<!--      <BBtn-->
<!--        variant="primary"-->
<!--        icon="i-heroicons-plus"-->
<!--        @click="router.push('/admin/products/new')"-->
<!--      >-->
<!--        Додати товар-->
<!--      </BBtn>-->
<!--    </div>-->

<!--    &lt;!&ndash; Filters &ndash;&gt;-->
<!--    <div class="bg-white rounded-xl border border-gray-200 p-4 mb-6">-->
<!--      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">-->
<!--        &lt;!&ndash; Search &ndash;&gt;-->
<!--        <div class="lg:col-span-2">-->
<!--          <input-->
<!--            v-model="search"-->
<!--            type="text"-->
<!--            placeholder="Пошук по назві, коду, бренду..."-->
<!--            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"-->
<!--            @input="onSearchInput"-->
<!--          >-->
<!--        </div>-->

<!--        &lt;!&ndash; Category &ndash;&gt;-->
<!--        <BSelect-->
<!--          :model-value="store.filters.category"-->
<!--          :options="categoryOptions"-->
<!--          @update:model-value="store.setFilters({ category: $event, sub_category: '' })"-->
<!--        />-->

<!--        &lt;!&ndash; Availability &ndash;&gt;-->
<!--        <BSelect-->
<!--          :model-value="store.filters.available"-->
<!--          :options="availabilityOptions"-->
<!--          @update:model-value="store.setFilters({ available: $event })"-->
<!--        />-->

<!--        &lt;!&ndash; Sort &ndash;&gt;-->
<!--        <BSelect-->
<!--          :model-value="store.filters.sort"-->
<!--          :options="sortOptions"-->
<!--          @update:model-value="store.setFilters({ sort: $event })"-->
<!--        />-->
<!--      </div>-->

<!--      &lt;!&ndash; Quick filters &ndash;&gt;-->
<!--      <div class="flex flex-wrap gap-2 mt-4">-->
<!--        <button-->
<!--          class="px-3 py-1 text-sm rounded-full border transition-colors"-->
<!--          :class="store.filters.sale === 'true'-->
<!--            ? 'bg-red-100 border-red-300 text-red-700'-->
<!--            : 'border-gray-300 text-gray-600 hover:bg-gray-100'"-->
<!--          @click="store.setFilters({ sale: store.filters.sale === 'true' ? '' : 'true' })"-->
<!--        >-->
<!--          🔥 Акції-->
<!--        </button>-->
<!--        <button-->
<!--          class="px-3 py-1 text-sm rounded-full border transition-colors"-->
<!--          :class="store.filters.bestseller === 'true'-->
<!--            ? 'bg-orange-100 border-orange-300 text-orange-700'-->
<!--            : 'border-gray-300 text-gray-600 hover:bg-gray-100'"-->
<!--          @click="store.setFilters({ bestseller: store.filters.bestseller === 'true' ? '' : 'true' })"-->
<!--        >-->
<!--          ⭐ Хіти-->
<!--        </button>-->
<!--        <button-->
<!--          v-if="store.filters.search || store.filters.category || store.filters.sale || store.filters.bestseller"-->
<!--          class="px-3 py-1 text-sm text-red-600 hover:text-red-700"-->
<!--          @click="store.resetFilters(); search = ''"-->
<!--        >-->
<!--          Скинути фільтри-->
<!--        </button>-->
<!--      </div>-->
<!--    </div>-->

<!--    &lt;!&ndash; Loading &ndash;&gt;-->
<!--    <div v-if="store.loading" class="space-y-4">-->
<!--      <div v-for="i in 5" :key="i" class="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">-->
<!--        <div class="flex gap-4">-->
<!--          <div class="w-16 h-16 bg-gray-200 rounded-lg" />-->
<!--          <div class="flex-1 space-y-2">-->
<!--            <div class="h-4 bg-gray-200 rounded w-3/4" />-->
<!--            <div class="h-4 bg-gray-200 rounded w-1/4" />-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->

<!--    &lt;!&ndash; Products Table &ndash;&gt;-->
<!--    <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">-->
<!--      <div class="overflow-x-auto">-->
<!--        <table class="w-full">-->
<!--          <thead class="bg-gray-50 border-b border-gray-200">-->
<!--            <tr>-->
<!--              <th class="text-left px-4 py-3 text-sm font-medium text-gray-600">Товар</th>-->
<!--              <th class="text-left px-4 py-3 text-sm font-medium text-gray-600">Ціна</th>-->
<!--              <th class="text-center px-4 py-3 text-sm font-medium text-gray-600">Наявність</th>-->
<!--              <th class="text-center px-4 py-3 text-sm font-medium text-gray-600">Акція</th>-->
<!--              <th class="text-center px-4 py-3 text-sm font-medium text-gray-600">Хіт</th>-->
<!--              <th class="text-right px-4 py-3 text-sm font-medium text-gray-600">Дії</th>-->
<!--            </tr>-->
<!--          </thead>-->
<!--          <tbody class="divide-y divide-gray-100">-->
<!--            <tr-->
<!--              v-for="product in store.products"-->
<!--              :key="product.product_id"-->
<!--              class="hover:bg-gray-50 transition-colors"-->
<!--            >-->
<!--              &lt;!&ndash; Product Info &ndash;&gt;-->
<!--              <td class="px-4 py-3">-->
<!--                <div class="flex items-center gap-3">-->
<!--                  <img-->
<!--                    :src="product.pictures[0]?.pictures_name || '/images/no-image.png'"-->
<!--                    :alt="product.product_name"-->
<!--                    class="w-12 h-12 object-cover rounded-lg border border-gray-200"-->
<!--                  >-->
<!--                  <div class="min-w-0">-->
<!--                    <p class="font-medium text-gray-800 truncate max-w-xs">-->
<!--                      {{ product.product_name }}-->
<!--                    </p>-->
<!--                    <p class="text-xs text-gray-500">-->
<!--                      {{ product.product_id }} · {{ product.brand }}-->
<!--                    </p>-->
<!--                  </div>-->
<!--                </div>-->
<!--              </td>-->

<!--              &lt;!&ndash; Price &ndash;&gt;-->
<!--              <td class="px-4 py-3">-->
<!--                <div class="flex flex-col">-->
<!--                  <span class="font-medium text-gray-800">-->
<!--                    {{ formatPrice(product.sale_price && parseFloat(product.sale_price) > 0 ? product.sale_price : product.price) }} ₴-->
<!--                  </span>-->
<!--                  <span-->
<!--                    v-if="product.discount > 0"-->
<!--                    class="text-xs text-gray-400 line-through"-->
<!--                  >-->
<!--                    {{ formatPrice(product.price) }} ₴-->
<!--                  </span>-->
<!--                </div>-->
<!--              </td>-->

<!--              &lt;!&ndash; Available &ndash;&gt;-->
<!--              <td class="px-4 py-3 text-center">-->
<!--                <button-->
<!--                  class="w-8 h-8 rounded-full flex items-center justify-center transition-colors"-->
<!--                  :class="product.available === 'true'-->
<!--                    ? 'bg-green-100 text-green-600 hover:bg-green-200'-->
<!--                    : 'bg-red-100 text-red-600 hover:bg-red-200'"-->
<!--                  :title="product.available === 'true' ? 'В наявності' : 'Немає'"-->
<!--                  @click="store.toggleAvailable(product.product_id)"-->
<!--                >-->
<!--                  <UIcon-->
<!--                    :name="product.available === 'true' ? 'i-heroicons-check' : 'i-heroicons-x-mark'"-->
<!--                    class="w-4 h-4"-->
<!--                  />-->
<!--                </button>-->
<!--              </td>-->

<!--              &lt;!&ndash; Sale &ndash;&gt;-->
<!--              <td class="px-4 py-3 text-center">-->
<!--                <button-->
<!--                  class="w-8 h-8 rounded-full flex items-center justify-center transition-colors"-->
<!--                  :class="product.sale === 'true'-->
<!--                    ? 'bg-red-100 text-red-600 hover:bg-red-200'-->
<!--                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'"-->
<!--                  @click="store.toggleSale(product.product_id)"-->
<!--                >-->
<!--                  🔥-->
<!--                </button>-->
<!--              </td>-->

<!--              &lt;!&ndash; Bestseller &ndash;&gt;-->
<!--              <td class="px-4 py-3 text-center">-->
<!--                <button-->
<!--                  class="w-8 h-8 rounded-full flex items-center justify-center transition-colors"-->
<!--                  :class="product.bestseller === 'true'-->
<!--                    ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'-->
<!--                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'"-->
<!--                  @click="store.toggleBestseller(product.product_id)"-->
<!--                >-->
<!--                  ⭐-->
<!--                </button>-->
<!--              </td>-->

<!--              &lt;!&ndash; Actions &ndash;&gt;-->
<!--              <td class="px-4 py-3">-->
<!--                <div class="flex items-center justify-end gap-2">-->
<!--                  <button-->
<!--                    class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"-->
<!--                    title="Редагувати"-->
<!--                    @click="editProduct(product.product_id)"-->
<!--                  >-->
<!--                    <UIcon name="i-heroicons-pencil" class="w-4 h-4" />-->
<!--                  </button>-->
<!--                  <button-->
<!--                    class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"-->
<!--                    title="Видалити"-->
<!--                    @click="confirmDelete(product.product_id)"-->
<!--                  >-->
<!--                    <UIcon name="i-heroicons-trash" class="w-4 h-4" />-->
<!--                  </button>-->
<!--                </div>-->
<!--              </td>-->
<!--            </tr>-->
<!--          </tbody>-->
<!--        </table>-->
<!--      </div>-->

<!--      &lt;!&ndash; Empty &ndash;&gt;-->
<!--      <div v-if="store.products.length === 0" class="p-12 text-center">-->
<!--        <UIcon name="i-heroicons-cube" class="w-12 h-12 text-gray-300 mx-auto mb-4" />-->
<!--        <p class="text-gray-500">Товарів не знайдено</p>-->
<!--      </div>-->
<!--    </div>-->

<!--    &lt;!&ndash; Pagination &ndash;&gt;-->
<!--    <div-->
<!--      v-if="store.pagination.pages > 1"-->
<!--      class="flex items-center justify-between mt-6"-->
<!--    >-->
<!--      <p class="text-sm text-gray-500">-->
<!--        Сторінка {{ store.pagination.page }} з {{ store.pagination.pages }}-->
<!--      </p>-->
<!--      <div class="flex gap-2">-->
<!--        <button-->
<!--          :disabled="store.pagination.page <= 1"-->
<!--          class="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"-->
<!--          @click="store.setPage(store.pagination.page - 1)"-->
<!--        >-->
<!--          Назад-->
<!--        </button>-->
<!--        <button-->
<!--          :disabled="store.pagination.page >= store.pagination.pages"-->
<!--          class="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"-->
<!--          @click="store.setPage(store.pagination.page + 1)"-->
<!--        >-->
<!--          Далі-->
<!--        </button>-->
<!--      </div>-->
<!--    </div>-->

<!--    &lt;!&ndash; Delete Modal &ndash;&gt;-->
<!--    <Teleport to="body">-->
<!--      <Transition name="fade">-->
<!--        <div-->
<!--          v-if="showDeleteModal"-->
<!--          class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"-->
<!--          @click.self="showDeleteModal = false"-->
<!--        >-->
<!--          <div class="bg-white rounded-xl p-6 max-w-md w-full">-->
<!--            <h3 class="text-lg font-bold text-gray-800 mb-2">Видалити товар?</h3>-->
<!--            <p class="text-gray-500 mb-6">Цю дію неможливо скасувати.</p>-->
<!--            <div class="flex gap-3">-->
<!--              <BBtn-->
<!--                variant="secondary"-->
<!--                class="flex-1"-->
<!--                @click="showDeleteModal = false"-->
<!--              >-->
<!--                Скасувати-->
<!--              </BBtn>-->
<!--              <BBtn-->
<!--                variant="primary"-->
<!--                class="flex-1 !bg-red-500 hover:!bg-red-600"-->
<!--                :loading="store.saving"-->
<!--                @click="handleDelete"-->
<!--              >-->
<!--                Видалити-->
<!--              </BBtn>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--      </Transition>-->
<!--    </Teleport>-->
<!--  </div>-->
<!--</template>-->

<!--<style scoped>-->
<!--.fade-enter-active,-->
<!--.fade-leave-active {-->
<!--  transition: opacity 0.2s ease;-->
<!--}-->

<!--.fade-enter-from,-->
<!--.fade-leave-to {-->
<!--  opacity: 0;-->
<!--}-->
<!--</style>-->

<script setup lang="ts">
import { useAdminProductStore } from '~/models/admin/AdminProductStore'
import { useCategoryStore } from '~/models/category/CategoryStore'
import { useFilterAPI } from '~/models/filters/FilterAPI'
import ConfirmModal from '~/models/common/components/ui/ConfirmModal.vue'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()
const store = useAdminProductStore()
const categoryStore = useCategoryStore()
const filterAPI = useFilterAPI()

const search = ref('')
const deleteModal = ref(false)
const deleting = ref(false)
const productToDelete = ref<{ id: string; name: string } | null>(null)

const saleModal = ref(false)
const savingSale = ref(false)
const saleProduct = ref<{ id: string; name: string; price: string } | null>(null)
const saleDiscount = ref(10)

const allBrands = ref<string[]>([])

let searchTimeout: ReturnType<typeof setTimeout> | null = null

function onSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    store.setFilters({ search: search.value })
  }, 400)
}

const availabilityOptions = [
  { value: '', label: 'Наявність' },
  { value: 'true', label: 'В наявності' },
  { value: 'false', label: 'Немає' }
]

const sortOptions = [
  { value: 'newest', label: 'Новіші' },
  { value: 'price_asc', label: 'Ціна ↑' },
  { value: 'price_desc', label: 'Ціна ↓' },
  { value: 'name_asc', label: 'Назва А-Я' }
]

const categoryOptions = computed(() => [
  { value: '', label: 'Категорія' },
  ...categoryStore.categories.map(c => ({ value: c.id, label: c.name }))
])

const brandOptions = computed(() => [
  { value: '', label: 'Бренд' },
  ...allBrands.value.map(b => ({ value: b, label: b }))
])

const salePrice = computed(() => {
  if (!saleProduct.value) return 0
  const price = parseFloat(saleProduct.value.price)
  return Math.round(price * (1 - saleDiscount.value / 100))
})

async function loadBrands() {
  try {
    const res = await filterAPI.getFilters({})
    allBrands.value = res.filters.brands.map(b => b.name).sort()
  } catch (e) {
    console.error('Failed to load brands:', e)
  }
}

function editProduct(id: string) {
  router.push(`/admin/products/${id}`)
}

function confirmDelete(id: string, name: string) {
  productToDelete.value = { id, name }
  deleteModal.value = true
}

async function handleDelete() {
  if (!productToDelete.value) return
  deleting.value = true
  try {
    await store.deleteProduct(productToDelete.value.id)
    deleteModal.value = false
  } finally {
    deleting.value = false
    productToDelete.value = null
  }
}

function handleSaleClick(product: any) {
  if (product.sale === 'true') {
    store.removeSale(product.product_id)
  } else {
    saleProduct.value = {
      id: product.product_id,
      name: product.product_name,
      price: product.price
    }
    saleDiscount.value = product.discount || 10
    saleModal.value = true
  }
}

async function saveSale() {
  if (!saleProduct.value) return
  savingSale.value = true
  try {
    const newSalePrice = salePrice.value.toFixed(2)
    await store.setSale(saleProduct.value.id, saleDiscount.value, newSalePrice)
    saleModal.value = false
  } finally {
    savingSale.value = false
    saleProduct.value = null
  }
}

function closeSaleModal() {
  saleModal.value = false
  saleProduct.value = null
}

function formatPrice(price: string | number) {
  const num = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('uk-UA').format(num)
}

function getActualPrice(product: any) {
  if (product.sale_price && parseFloat(product.sale_price) > 0) {
    return product.sale_price
  }
  return product.price
}

onMounted(async () => {
  await Promise.all([
    categoryStore.fetchActive(),
    loadBrands(),
    store.fetchProducts()
  ])
})

onUnmounted(() => {
  if (searchTimeout) clearTimeout(searchTimeout)
})
</script>

<template>
  <div class="products-page">
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">📦 Товари</h1>
        <span class="total-badge">{{ store.pagination.total }} шт.</span>
      </div>
      <button class="btn btn-primary" @click="router.push('/admin/products/new')">
        + Додати товар
      </button>
    </header>

    <div class="filters-card">
      <div class="filters-row">
        <div class="filter-search">
          <input
            v-model="search"
            type="text"
            placeholder="🔍 Пошук..."
            @input="onSearchInput"
          >
        </div>

        <select
          :value="store.filters.category"
          @change="store.setFilters({ category: ($event.target as HTMLSelectElement).value })"
        >
          <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <select
          :value="store.filters.brand || ''"
          @change="store.setFilters({ brand: ($event.target as HTMLSelectElement).value })"
        >
          <option v-for="opt in brandOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <select
          :value="store.filters.available"
          @change="store.setFilters({ available: ($event.target as HTMLSelectElement).value })"
        >
          <option v-for="opt in availabilityOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <select
          :value="store.filters.sort"
          @change="store.setFilters({ sort: ($event.target as HTMLSelectElement).value })"
        >
          <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div class="quick-filters">
        <button
          :class="['chip', { active: store.filters.sale === 'true' }]"
          @click="store.setFilters({ sale: store.filters.sale === 'true' ? '' : 'true' })"
        >
          🔥 Акції
        </button>
        <button
          :class="['chip', { active: store.filters.bestseller === 'true' }]"
          @click="store.setFilters({ bestseller: store.filters.bestseller === 'true' ? '' : 'true' })"
        >
          ⭐ Хіти
        </button>
        <button
          v-if="store.filters.search || store.filters.category || store.filters.brand || store.filters.sale || store.filters.bestseller"
          class="chip-reset"
          @click="store.resetFilters(); search = ''"
        >
          ✕ Скинути
        </button>
      </div>
    </div>

    <div v-if="store.loading" class="state-box">
      <div class="spinner" />
      <p>Завантаження...</p>
    </div>

    <div v-else-if="store.products.length === 0" class="state-box">
      <div class="state-icon">📭</div>
      <h3>Товарів не знайдено</h3>
    </div>

    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th class="col-product">Товар</th>
            <th class="col-price">Ціна</th>
            <th class="col-status">Статус</th>
            <th class="col-actions">Дії</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in store.products" :key="product.product_id">
            <td>
              <div class="product-cell">
                <img :src="product.pictures[0]?.pictures_name || '/images/no-image.png'" :alt="product.product_name">
                <div class="product-info">
                  <span class="product-name">{{ product.product_name }}</span>
                  <span class="product-meta">{{ product.brand }}</span>
                </div>
              </div>
            </td>

            <td>
              <div class="price-cell">
                <span class="price-now">{{ formatPrice(getActualPrice(product)) }} ₴</span>
                <span v-if="product.discount > 0" class="price-old">{{ formatPrice(product.price) }} ₴</span>
                <span v-if="product.discount > 0" class="discount-tag">-{{ product.discount }}%</span>
              </div>
            </td>

            <td>
              <div class="status-toggles">
                <button
                  :class="['status-btn', product.available === 'true' ? 'is-active green' : 'is-inactive']"
                  @click="store.toggleAvailable(product.product_id)"
                >
                  {{ product.available === 'true' ? '✓ Є' : '✕ Ні' }}
                </button>

                <button
                  :class="['status-btn', product.sale === 'true' ? 'is-active red' : 'is-inactive']"
                  @click="handleSaleClick(product)"
                >
                  🔥 {{ product.sale === 'true' ? `-${product.discount}%` : '—' }}
                </button>

                <button
                  :class="['status-btn', product.bestseller === 'true' ? 'is-active orange' : 'is-inactive']"
                  @click="store.toggleBestseller(product.product_id)"
                >
                  ⭐ {{ product.bestseller === 'true' ? 'Хіт' : '—' }}
                </button>
              </div>
            </td>

            <td>
              <div class="actions">
                <button class="act-btn edit" @click="editProduct(product.product_id)">✏️</button>
                <button class="act-btn delete" @click="confirmDelete(product.product_id, product.product_name)">🗑️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="store.pagination.pages > 1" class="pagination">
      <span>{{ store.pagination.page }} / {{ store.pagination.pages }}</span>
      <div class="pagination-btns">
        <button :disabled="store.pagination.page <= 1" @click="store.setPage(store.pagination.page - 1)">←</button>
        <button :disabled="store.pagination.page >= store.pagination.pages" @click="store.setPage(store.pagination.page + 1)">→</button>
      </div>
    </div>

    <ConfirmModal
      v-model="deleteModal"
      title="Видалити товар?"
      icon="🗑️"
      confirm-text="Видалити"
      confirm-color="danger"
      :loading="deleting"
      @confirm="handleDelete"
    >
      <strong>{{ productToDelete?.name }}</strong> буде видалено.
    </ConfirmModal>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="saleModal" class="modal-overlay" @click.self="closeSaleModal">
          <div class="sale-modal">
            <button class="modal-close" @click="closeSaleModal">✕</button>
            <div class="modal-icon">🔥</div>
            <h3 class="modal-title">Встановити знижку</h3>
            <p class="modal-subtitle">{{ saleProduct?.name }}</p>

            <div class="discount-control">
              <label>Знижка: <strong>{{ saleDiscount }}%</strong></label>
              <input v-model="saleDiscount" type="range" min="5" max="90" step="5">
              <div class="presets">
                <button v-for="d in [10, 15, 20, 25, 30, 50]" :key="d" :class="{ active: saleDiscount === d }" @click="saleDiscount = d">{{ d }}%</button>
              </div>
            </div>

            <div class="price-preview">
              <div class="row"><span>Стара ціна:</span><span class="old">{{ formatPrice(saleProduct?.price || '0') }} ₴</span></div>
              <div class="row"><span>Нова ціна:</span><span class="new">{{ formatPrice(salePrice) }} ₴</span></div>
              <div class="row green"><span>Економія:</span><span>{{ formatPrice(parseFloat(saleProduct?.price || '0') - salePrice) }} ₴</span></div>
            </div>

            <div class="modal-actions">
              <button class="btn-cancel" @click="closeSaleModal">Скасувати</button>
              <button class="btn-save" :disabled="savingSale" @click="saveSale">{{ savingSale ? '⏳' : '✓' }} Застосувати</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.products-page { padding: 24px; max-width: 1400px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
.header-left { display: flex; align-items: center; gap: 12px; }
.page-title { font-size: 26px; font-weight: 700; margin: 0; }
.total-badge { background: #dbeafe; color: #1d4ed8; padding: 6px 14px; border-radius: 20px; font-size: 14px; font-weight: 600; }
.btn { padding: 12px 24px; border: none; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; }
.btn-primary { background: #10b981; color: white; }
.btn-primary:hover { background: #059669; }

.filters-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 24px; }
.filters-row { display: grid; grid-template-columns: 2fr repeat(4, 1fr); gap: 12px; }
.filter-search input, .filters-row select { width: 100%; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; }
.filter-search input:focus, .filters-row select:focus { outline: none; border-color: #10b981; }
.quick-filters { display: flex; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #f3f4f6; }
.chip { padding: 6px 14px; border: 1px solid #e5e7eb; border-radius: 20px; background: white; font-size: 13px; cursor: pointer; }
.chip.active { background: #fef3c7; border-color: #fbbf24; color: #92400e; }
.chip-reset { background: none; border: none; color: #ef4444; font-size: 13px; cursor: pointer; }

.state-box { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 60px; text-align: center; }
.spinner { width: 40px; height: 40px; border: 3px solid #e5e7eb; border-top-color: #10b981; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
@keyframes spin { to { transform: rotate(360deg); } }
.state-icon { font-size: 48px; margin-bottom: 16px; }

.table-wrap { background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
table { width: 100%; border-collapse: collapse; table-layout: fixed; }
th { text-align: left; padding: 12px 16px; background: #f9fafb; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 1px solid #e5e7eb; }
.col-product { width: 35%; }
.col-price { width: 18%; }
.col-status { width: 32%; }
.col-actions { width: 15%; text-align: center; }
td { padding: 12px 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
tbody tr:hover { background: #fafafa; }
tbody tr:last-child td { border-bottom: none; }

.product-cell { display: flex; align-items: center; gap: 12px; }
.product-cell img { width: 48px; height: 48px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb; }
.product-info { display: flex; flex-direction: column; min-width: 0; }
.product-name { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.product-meta { font-size: 12px; color: #9ca3af; }

.price-cell { display: flex; flex-direction: column; gap: 2px; }
.price-now { font-weight: 600; }
.price-old { font-size: 12px; color: #9ca3af; text-decoration: line-through; }
.discount-tag { display: inline-block; background: #fee2e2; color: #dc2626; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600; width: fit-content; }

.status-toggles { display: flex; gap: 6px; flex-wrap: wrap; }
.status-btn { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; border: none; cursor: pointer; }
.status-btn.is-inactive { background: #f3f4f6; color: #9ca3af; }
.status-btn.is-inactive:hover { background: #e5e7eb; }
.status-btn.is-active.green { background: #d1fae5; color: #047857; }
.status-btn.is-active.red { background: #fee2e2; color: #dc2626; }
.status-btn.is-active.orange { background: #fef3c7; color: #b45309; }

.actions { display: flex; justify-content: center; gap: 8px; }
.act-btn { width: 36px; height: 36px; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; }
.act-btn:hover { transform: scale(1.1); }
.act-btn.edit { background: #dbeafe; }
.act-btn.delete { background: #fee2e2; }

.pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; font-size: 14px; color: #6b7280; }
.pagination-btns { display: flex; gap: 8px; }
.pagination-btns button { padding: 8px 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: white; cursor: pointer; }
.pagination-btns button:disabled { opacity: 0.5; cursor: not-allowed; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 16px; }
.sale-modal { position: relative; background: white; border-radius: 20px; padding: 32px; max-width: 420px; width: 100%; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2); }
.modal-close { position: absolute; top: 16px; right: 16px; width: 32px; height: 32px; border: none; background: #f3f4f6; border-radius: 8px; cursor: pointer; }
.modal-icon { font-size: 48px; text-align: center; margin-bottom: 8px; }
.modal-title { font-size: 22px; font-weight: 700; text-align: center; margin: 0 0 4px; }
.modal-subtitle { text-align: center; color: #6b7280; font-size: 14px; margin: 0 0 24px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.discount-control { margin-bottom: 24px; }
.discount-control label { display: block; margin-bottom: 12px; }
.discount-control label strong { color: #dc2626; font-size: 18px; }
.discount-control input[type="range"] { width: 100%; margin-bottom: 12px; }
.presets { display: flex; gap: 8px; flex-wrap: wrap; }
.presets button { padding: 6px 12px; border: 1px solid #e5e7eb; border-radius: 6px; background: white; font-size: 13px; cursor: pointer; }
.presets button.active { background: #fee2e2; border-color: #fecaca; color: #dc2626; }

.price-preview { background: #f9fafb; border-radius: 12px; padding: 16px; margin-bottom: 24px; }
.price-preview .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
.price-preview .row:last-child { border-bottom: none; }
.price-preview .old { color: #9ca3af; text-decoration: line-through; }
.price-preview .new { color: #dc2626; font-weight: 700; font-size: 18px; }
.price-preview .green { color: #059669; font-weight: 600; }

.modal-actions { display: flex; gap: 12px; }
.btn-cancel, .btn-save { flex: 1; padding: 12px; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; }
.btn-cancel { background: #f3f4f6; color: #374151; }
.btn-save { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; }
.btn-save:disabled { opacity: 0.6; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.3s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .sale-modal { transition: transform 0.3s; }
.modal-enter-from .sale-modal { transform: scale(0.9) translateY(20px); }

@media (max-width: 1024px) {
  .filters-row { grid-template-columns: 1fr 1fr; }
  .filter-search { grid-column: span 2; }
  .col-status, td:nth-child(3) { display: none; }
}

@media (max-width: 640px) {
  .products-page { padding: 16px; }
  .filters-row { grid-template-columns: 1fr; }
  .filter-search { grid-column: span 1; }
  .page-header { flex-direction: column; align-items: stretch; }
  .col-price, td:nth-child(2) { display: none; }
}
</style>

<!--<script setup lang="ts">-->
<!--import { useAdminProductStore } from '~/models/admin/AdminProductStore'-->
<!--import { useCategoryStore } from '~/models/category/CategoryStore'-->
<!--import ConfirmModal from '~/models/common/components/ui/ConfirmModal.vue'-->

<!--definePageMeta({-->
<!--  layout: 'admin'-->
<!--})-->

<!--const router = useRouter()-->
<!--const store = useAdminProductStore()-->
<!--const categoryStore = useCategoryStore()-->

<!--const search = ref('')-->
<!--const deleteModal = ref(false)-->
<!--const deleting = ref(false)-->
<!--const productToDelete = ref<{ id: string; name: string } | null>(null)-->

<!--let searchTimeout: ReturnType<typeof setTimeout> | null = null-->

<!--function onSearchInput() {-->
<!--  if (searchTimeout) clearTimeout(searchTimeout)-->
<!--  searchTimeout = setTimeout(() => {-->
<!--    store.setFilters({ search: search.value })-->
<!--  }, 400)-->
<!--}-->

<!--const availabilityOptions = [-->
<!--  { value: '', label: 'Всі' },-->
<!--  { value: 'true', label: 'В наявності' },-->
<!--  { value: 'false', label: 'Немає' }-->
<!--]-->

<!--const sortOptions = [-->
<!--  { value: 'newest', label: 'Новіші' },-->
<!--  { value: 'price_asc', label: 'Ціна ↑' },-->
<!--  { value: 'price_desc', label: 'Ціна ↓' },-->
<!--  { value: 'name_asc', label: 'Назва А-Я' }-->
<!--]-->

<!--const categoryOptions = computed(() => [-->
<!--  { value: '', label: 'Всі категорії' },-->
<!--  ...categoryStore.categories.map(c => ({ value: c.id, label: c.name }))-->
<!--])-->

<!--function editProduct(id: string) {-->
<!--  router.push(`/admin/products/${id}`)-->
<!--}-->

<!--function confirmDelete(id: string, name: string) {-->
<!--  productToDelete.value = { id, name }-->
<!--  deleteModal.value = true-->
<!--}-->

<!--async function handleDelete() {-->
<!--  if (!productToDelete.value) return-->
<!--  deleting.value = true-->
<!--  try {-->
<!--    await store.deleteProduct(productToDelete.value.id)-->
<!--    deleteModal.value = false-->
<!--  } finally {-->
<!--    deleting.value = false-->
<!--    productToDelete.value = null-->
<!--  }-->
<!--}-->

<!--function formatPrice(price: string) {-->
<!--  return new Intl.NumberFormat('uk-UA').format(parseFloat(price))-->
<!--}-->

<!--function getActualPrice(product: any) {-->
<!--  if (product.sale_price && parseFloat(product.sale_price) > 0) {-->
<!--    return product.sale_price-->
<!--  }-->
<!--  return product.price-->
<!--}-->

<!--onMounted(async () => {-->
<!--  await categoryStore.fetchActive()-->
<!--  await store.fetchProducts()-->
<!--})-->

<!--onUnmounted(() => {-->
<!--  if (searchTimeout) clearTimeout(searchTimeout)-->
<!--})-->
<!--</script>-->

<!--<template>-->
<!--  <div class="products-page">-->
<!--    &lt;!&ndash; Header &ndash;&gt;-->
<!--    <header class="page-header">-->
<!--      <div class="header-left">-->
<!--        <h1 class="page-title">📦 Товари</h1>-->
<!--        <span class="total-badge">{{ store.pagination.total }} шт.</span>-->
<!--      </div>-->
<!--      <button class="btn btn-primary" @click="router.push('/admin/products/new')">-->
<!--        + Додати товар-->
<!--      </button>-->
<!--    </header>-->

<!--    &lt;!&ndash; Filters &ndash;&gt;-->
<!--    <div class="filters-card">-->
<!--      <div class="filters-row">-->
<!--        <div class="filter-search">-->
<!--          <input-->
<!--            v-model="search"-->
<!--            type="text"-->
<!--            placeholder="🔍 Пошук по назві, коду, бренду..."-->
<!--            @input="onSearchInput"-->
<!--          >-->
<!--        </div>-->

<!--        <select-->
<!--          :value="store.filters.category"-->
<!--          @change="store.setFilters({ category: ($event.target as HTMLSelectElement).value })"-->
<!--        >-->
<!--          <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">-->
<!--            {{ opt.label }}-->
<!--          </option>-->
<!--        </select>-->

<!--        <select-->
<!--          :value="store.filters.available"-->
<!--          @change="store.setFilters({ available: ($event.target as HTMLSelectElement).value })"-->
<!--        >-->
<!--          <option v-for="opt in availabilityOptions" :key="opt.value" :value="opt.value">-->
<!--            {{ opt.label }}-->
<!--          </option>-->
<!--        </select>-->

<!--        <select-->
<!--          :value="store.filters.sort"-->
<!--          @change="store.setFilters({ sort: ($event.target as HTMLSelectElement).value })"-->
<!--        >-->
<!--          <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">-->
<!--            {{ opt.label }}-->
<!--          </option>-->
<!--        </select>-->
<!--      </div>-->

<!--      <div class="quick-filters">-->
<!--        <button-->
<!--          :class="['chip', { active: store.filters.sale === 'true' }]"-->
<!--          @click="store.setFilters({ sale: store.filters.sale === 'true' ? '' : 'true' })"-->
<!--        >-->
<!--          🔥 Акції-->
<!--        </button>-->
<!--        <button-->
<!--          :class="['chip', { active: store.filters.bestseller === 'true' }]"-->
<!--          @click="store.setFilters({ bestseller: store.filters.bestseller === 'true' ? '' : 'true' })"-->
<!--        >-->
<!--          ⭐ Хіти-->
<!--        </button>-->
<!--        <button-->
<!--          v-if="store.filters.search || store.filters.category || store.filters.sale || store.filters.bestseller"-->
<!--          class="chip-reset"-->
<!--          @click="store.resetFilters(); search = ''"-->
<!--        >-->
<!--          ✕ Скинути-->
<!--        </button>-->
<!--      </div>-->
<!--    </div>-->

<!--    &lt;!&ndash; Loading &ndash;&gt;-->
<!--    <div v-if="store.loading" class="state-box">-->
<!--      <div class="spinner" />-->
<!--      <p>Завантаження...</p>-->
<!--    </div>-->

<!--    &lt;!&ndash; Empty &ndash;&gt;-->
<!--    <div v-else-if="store.products.length === 0" class="state-box">-->
<!--      <div class="state-icon">📭</div>-->
<!--      <h3>Товарів не знайдено</h3>-->
<!--      <p>Спробуйте змінити фільтри</p>-->
<!--    </div>-->

<!--    &lt;!&ndash; Table &ndash;&gt;-->
<!--    <div v-else class="table-wrap">-->
<!--      <table>-->
<!--        <thead>-->
<!--          <tr>-->
<!--            <th class="col-product">Товар</th>-->
<!--            <th class="col-price">Ціна</th>-->
<!--            <th class="col-status">Статус</th>-->
<!--            <th class="col-actions">Дії</th>-->
<!--          </tr>-->
<!--        </thead>-->
<!--        <tbody>-->
<!--          <tr v-for="product in store.products" :key="product.product_id">-->
<!--            &lt;!&ndash; Product &ndash;&gt;-->
<!--            <td>-->
<!--              <div class="product-cell">-->
<!--                <img-->
<!--                  :src="product.pictures[0]?.pictures_name || '/images/no-image.png'"-->
<!--                  :alt="product.product_name"-->
<!--                >-->
<!--                <div class="product-info">-->
<!--                  <span class="product-name">{{ product.product_name }}</span>-->
<!--                  <span class="product-meta">{{ product.product_id }} · {{ product.brand }}</span>-->
<!--                </div>-->
<!--              </div>-->
<!--            </td>-->

<!--            &lt;!&ndash; Price &ndash;&gt;-->
<!--            <td>-->
<!--              <div class="price-cell">-->
<!--                <span class="price-now">{{ formatPrice(getActualPrice(product)) }} ₴</span>-->
<!--                <span v-if="product.discount > 0" class="price-old">-->
<!--                  {{ formatPrice(product.price) }} ₴-->
<!--                </span>-->
<!--              </div>-->
<!--            </td>-->

<!--            &lt;!&ndash; Status toggles &ndash;&gt;-->
<!--            <td>-->
<!--              <div class="status-toggles">-->
<!--                &lt;!&ndash; Наявність &ndash;&gt;-->
<!--                <button-->
<!--                  :class="['status-btn', product.available === 'true' ? 'is-active green' : 'is-inactive']"-->
<!--                  :title="product.available === 'true' ? 'В наявності' : 'Немає в наявності'"-->
<!--                  @click="store.toggleAvailable(product.product_id)"-->
<!--                >-->
<!--                  {{ product.available === 'true' ? '✓ Є' : '✕ Немає' }}-->
<!--                </button>-->

<!--                &lt;!&ndash; Акція &ndash;&gt;-->
<!--                <button-->
<!--                  :class="['status-btn', product.sale === 'true' ? 'is-active red' : 'is-inactive']"-->
<!--                  title="Акція"-->
<!--                  @click="store.toggleSale(product.product_id)"-->
<!--                >-->
<!--                  🔥 {{ product.sale === 'true' ? 'Акція' : '—' }}-->
<!--                </button>-->

<!--                &lt;!&ndash; Хіт &ndash;&gt;-->
<!--                <button-->
<!--                  :class="['status-btn', product.bestseller === 'true' ? 'is-active orange' : 'is-inactive']"-->
<!--                  title="Хіт продажів"-->
<!--                  @click="store.toggleBestseller(product.product_id)"-->
<!--                >-->
<!--                  ⭐ {{ product.bestseller === 'true' ? 'Хіт' : '—' }}-->
<!--                </button>-->
<!--              </div>-->
<!--            </td>-->

<!--            &lt;!&ndash; Actions &ndash;&gt;-->
<!--            <td>-->
<!--              <div class="actions">-->
<!--                <button class="act-btn edit" title="Редагувати" @click="editProduct(product.product_id)">-->
<!--                  ✏️-->
<!--                </button>-->
<!--                <button class="act-btn delete" title="Видалити" @click="confirmDelete(product.product_id, product.product_name)">-->
<!--                  🗑️-->
<!--                </button>-->
<!--              </div>-->
<!--            </td>-->
<!--          </tr>-->
<!--        </tbody>-->
<!--      </table>-->
<!--    </div>-->

<!--    &lt;!&ndash; Pagination &ndash;&gt;-->
<!--    <div v-if="store.pagination.pages > 1" class="pagination">-->
<!--      <span>Сторінка {{ store.pagination.page }} з {{ store.pagination.pages }}</span>-->
<!--      <div class="pagination-btns">-->
<!--        <button :disabled="store.pagination.page <= 1" @click="store.setPage(store.pagination.page - 1)">-->
<!--          ← Назад-->
<!--        </button>-->
<!--        <button :disabled="store.pagination.page >= store.pagination.pages" @click="store.setPage(store.pagination.page + 1)">-->
<!--          Далі →-->
<!--        </button>-->
<!--      </div>-->
<!--    </div>-->

<!--    &lt;!&ndash; Delete Modal &ndash;&gt;-->
<!--    <ConfirmModal-->
<!--      v-model="deleteModal"-->
<!--      title="Видалити товар?"-->
<!--      icon="🗑️"-->
<!--      confirm-text="Видалити"-->
<!--      confirm-color="danger"-->
<!--      :loading="deleting"-->
<!--      @confirm="handleDelete"-->
<!--    >-->
<!--      Товар <strong>{{ productToDelete?.name }}</strong> буде видалено.-->
<!--    </ConfirmModal>-->
<!--  </div>-->
<!--</template>-->

<!--<style scoped>-->
<!--.products-page {-->
<!--  padding: 24px;-->
<!--  max-width: 1400px;-->
<!--  margin: 0 auto;-->
<!--}-->

<!--/* Header */-->
<!--.page-header {-->
<!--  display: flex;-->
<!--  justify-content: space-between;-->
<!--  align-items: center;-->
<!--  margin-bottom: 24px;-->
<!--  gap: 16px;-->
<!--  flex-wrap: wrap;-->
<!--}-->

<!--.header-left {-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  gap: 12px;-->
<!--}-->

<!--.page-title {-->
<!--  font-size: 26px;-->
<!--  font-weight: 700;-->
<!--  margin: 0;-->
<!--}-->

<!--.total-badge {-->
<!--  background: #dbeafe;-->
<!--  color: #1d4ed8;-->
<!--  padding: 6px 14px;-->
<!--  border-radius: 20px;-->
<!--  font-size: 14px;-->
<!--  font-weight: 600;-->
<!--}-->

<!--.btn {-->
<!--  padding: 12px 24px;-->
<!--  border: none;-->
<!--  border-radius: 10px;-->
<!--  font-weight: 600;-->
<!--  font-size: 14px;-->
<!--  cursor: pointer;-->
<!--}-->

<!--.btn-primary {-->
<!--  background: #10b981;-->
<!--  color: white;-->
<!--}-->

<!--.btn-primary:hover {-->
<!--  background: #059669;-->
<!--}-->

<!--/* Filters */-->
<!--.filters-card {-->
<!--  background: white;-->
<!--  border: 1px solid #e5e7eb;-->
<!--  border-radius: 12px;-->
<!--  padding: 16px;-->
<!--  margin-bottom: 24px;-->
<!--}-->

<!--.filters-row {-->
<!--  display: grid;-->
<!--  grid-template-columns: 2fr 1fr 1fr 1fr;-->
<!--  gap: 12px;-->
<!--}-->

<!--.filter-search input,-->
<!--.filters-row select {-->
<!--  width: 100%;-->
<!--  padding: 10px 14px;-->
<!--  border: 1px solid #e5e7eb;-->
<!--  border-radius: 8px;-->
<!--  font-size: 14px;-->
<!--}-->

<!--.filter-search input:focus,-->
<!--.filters-row select:focus {-->
<!--  outline: none;-->
<!--  border-color: #10b981;-->
<!--}-->

<!--.quick-filters {-->
<!--  display: flex;-->
<!--  gap: 8px;-->
<!--  margin-top: 12px;-->
<!--  padding-top: 12px;-->
<!--  border-top: 1px solid #f3f4f6;-->
<!--}-->

<!--.chip {-->
<!--  padding: 6px 14px;-->
<!--  border: 1px solid #e5e7eb;-->
<!--  border-radius: 20px;-->
<!--  background: white;-->
<!--  font-size: 13px;-->
<!--  cursor: pointer;-->
<!--}-->

<!--.chip.active {-->
<!--  background: #fef3c7;-->
<!--  border-color: #fbbf24;-->
<!--  color: #92400e;-->
<!--}-->

<!--.chip-reset {-->
<!--  background: none;-->
<!--  border: none;-->
<!--  color: #ef4444;-->
<!--  font-size: 13px;-->
<!--  cursor: pointer;-->
<!--}-->

<!--/* States */-->
<!--.state-box {-->
<!--  background: white;-->
<!--  border: 1px solid #e5e7eb;-->
<!--  border-radius: 12px;-->
<!--  padding: 60px;-->
<!--  text-align: center;-->
<!--}-->

<!--.state-box .spinner {-->
<!--  width: 40px;-->
<!--  height: 40px;-->
<!--  border: 3px solid #e5e7eb;-->
<!--  border-top-color: #10b981;-->
<!--  border-radius: 50%;-->
<!--  animation: spin 0.8s linear infinite;-->
<!--  margin: 0 auto 16px;-->
<!--}-->

<!--@keyframes spin {-->
<!--  to { transform: rotate(360deg); }-->
<!--}-->

<!--.state-icon {-->
<!--  font-size: 48px;-->
<!--  margin-bottom: 16px;-->
<!--}-->

<!--.state-box h3 {-->
<!--  margin: 0 0 8px;-->
<!--  color: #374151;-->
<!--}-->

<!--.state-box p {-->
<!--  margin: 0;-->
<!--  color: #9ca3af;-->
<!--}-->

<!--/* Table */-->
<!--.table-wrap {-->
<!--  background: white;-->
<!--  border: 1px solid #e5e7eb;-->
<!--  border-radius: 12px;-->
<!--  overflow: hidden;-->
<!--}-->

<!--table {-->
<!--  width: 100%;-->
<!--  border-collapse: collapse;-->
<!--  table-layout: fixed;-->
<!--}-->

<!--th {-->
<!--  text-align: left;-->
<!--  padding: 12px 16px;-->
<!--  background: #f9fafb;-->
<!--  font-size: 12px;-->
<!--  font-weight: 600;-->
<!--  color: #6b7280;-->
<!--  text-transform: uppercase;-->
<!--  border-bottom: 1px solid #e5e7eb;-->
<!--}-->

<!--.col-product { width: 40%; }-->
<!--.col-price { width: 15%; }-->
<!--.col-status { width: 30%; }-->
<!--.col-actions { width: 15%; text-align: center; }-->

<!--td {-->
<!--  padding: 12px 16px;-->
<!--  border-bottom: 1px solid #f3f4f6;-->
<!--  vertical-align: middle;-->
<!--}-->

<!--tbody tr:hover {-->
<!--  background: #fafafa;-->
<!--}-->

<!--tbody tr:last-child td {-->
<!--  border-bottom: none;-->
<!--}-->

<!--/* Product cell */-->
<!--.product-cell {-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  gap: 12px;-->
<!--}-->

<!--.product-cell img {-->
<!--  width: 48px;-->
<!--  height: 48px;-->
<!--  object-fit: cover;-->
<!--  border-radius: 8px;-->
<!--  border: 1px solid #e5e7eb;-->
<!--  flex-shrink: 0;-->
<!--}-->

<!--.product-info {-->
<!--  display: flex;-->
<!--  flex-direction: column;-->
<!--  min-width: 0;-->
<!--}-->

<!--.product-name {-->
<!--  font-weight: 600;-->
<!--  color: #111;-->
<!--  white-space: nowrap;-->
<!--  overflow: hidden;-->
<!--  text-overflow: ellipsis;-->
<!--}-->

<!--.product-meta {-->
<!--  font-size: 12px;-->
<!--  color: #9ca3af;-->
<!--}-->

<!--/* Price */-->
<!--.price-cell {-->
<!--  display: flex;-->
<!--  flex-direction: column;-->
<!--}-->

<!--.price-now {-->
<!--  font-weight: 600;-->
<!--  color: #111;-->
<!--}-->

<!--.price-old {-->
<!--  font-size: 12px;-->
<!--  color: #9ca3af;-->
<!--  text-decoration: line-through;-->
<!--}-->

<!--/* Status toggles */-->
<!--.status-toggles {-->
<!--  display: flex;-->
<!--  gap: 6px;-->
<!--  flex-wrap: wrap;-->
<!--}-->

<!--.status-btn {-->
<!--  padding: 4px 10px;-->
<!--  border-radius: 6px;-->
<!--  font-size: 12px;-->
<!--  font-weight: 500;-->
<!--  border: none;-->
<!--  cursor: pointer;-->
<!--  transition: all 0.15s;-->
<!--  white-space: nowrap;-->
<!--}-->

<!--.status-btn.is-inactive {-->
<!--  background: #f3f4f6;-->
<!--  color: #9ca3af;-->
<!--}-->

<!--.status-btn.is-inactive:hover {-->
<!--  background: #e5e7eb;-->
<!--}-->

<!--.status-btn.is-active.green {-->
<!--  background: #d1fae5;-->
<!--  color: #047857;-->
<!--}-->

<!--.status-btn.is-active.red {-->
<!--  background: #fee2e2;-->
<!--  color: #dc2626;-->
<!--}-->

<!--.status-btn.is-active.orange {-->
<!--  background: #fef3c7;-->
<!--  color: #b45309;-->
<!--}-->

<!--/* Actions */-->
<!--.actions {-->
<!--  display: flex;-->
<!--  justify-content: center;-->
<!--  gap: 8px;-->
<!--}-->

<!--.act-btn {-->
<!--  width: 36px;-->
<!--  height: 36px;-->
<!--  border: none;-->
<!--  border-radius: 8px;-->
<!--  font-size: 16px;-->
<!--  cursor: pointer;-->
<!--  transition: transform 0.15s;-->
<!--}-->

<!--.act-btn:hover {-->
<!--  transform: scale(1.1);-->
<!--}-->

<!--.act-btn.edit {-->
<!--  background: #dbeafe;-->
<!--}-->

<!--.act-btn.delete {-->
<!--  background: #fee2e2;-->
<!--}-->

<!--/* Pagination */-->
<!--.pagination {-->
<!--  display: flex;-->
<!--  justify-content: space-between;-->
<!--  align-items: center;-->
<!--  margin-top: 20px;-->
<!--  font-size: 14px;-->
<!--  color: #6b7280;-->
<!--}-->

<!--.pagination-btns {-->
<!--  display: flex;-->
<!--  gap: 8px;-->
<!--}-->

<!--.pagination-btns button {-->
<!--  padding: 8px 16px;-->
<!--  border: 1px solid #e5e7eb;-->
<!--  border-radius: 8px;-->
<!--  background: white;-->
<!--  cursor: pointer;-->
<!--}-->

<!--.pagination-btns button:disabled {-->
<!--  opacity: 0.5;-->
<!--  cursor: not-allowed;-->
<!--}-->

<!--.pagination-btns button:hover:not(:disabled) {-->
<!--  background: #f9fafb;-->
<!--}-->

<!--/* Responsive */-->
<!--@media (max-width: 1024px) {-->
<!--  .filters-row {-->
<!--    grid-template-columns: 1fr 1fr;-->
<!--  }-->

<!--  .filter-search {-->
<!--    grid-column: span 2;-->
<!--  }-->

<!--  .col-status {-->
<!--    display: none;-->
<!--  }-->

<!--  td:nth-child(3) {-->
<!--    display: none;-->
<!--  }-->
<!--}-->

<!--@media (max-width: 640px) {-->
<!--  .products-page {-->
<!--    padding: 16px;-->
<!--  }-->

<!--  .filters-row {-->
<!--    grid-template-columns: 1fr;-->
<!--  }-->

<!--  .filter-search {-->
<!--    grid-column: span 1;-->
<!--  }-->

<!--  .page-header {-->
<!--    flex-direction: column;-->
<!--    align-items: stretch;-->
<!--  }-->

<!--  .header-left {-->
<!--    justify-content: space-between;-->
<!--  }-->

<!--  .col-price {-->
<!--    display: none;-->
<!--  }-->

<!--  td:nth-child(2) {-->
<!--    display: none;-->
<!--  }-->
<!--}-->
<!--</style>-->
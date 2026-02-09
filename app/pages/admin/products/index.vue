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

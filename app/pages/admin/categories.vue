<template>
  <div class="category-manager">
    <h1>Управління категоріями</h1>

    <div v-if="overview" class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ overview.stats.total }}</div>
        <div class="stat-label">Всього товарів</div>
      </div>
      <div class="stat-card success">
        <div class="stat-value">{{ overview.stats.mapped }}</div>
        <div class="stat-label">Замаплено</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-value">{{ overview.stats.unmapped }}</div>
        <div class="stat-label">Незамаплено</div>
      </div>
      <div class="stat-card info">
        <div class="stat-value">{{ overview.stats.percent_mapped }}</div>
        <div class="stat-label">Прогрес</div>
      </div>
    </div>

    <div v-if="error" class="alert error" @click="error = null">
      {{ error }}
    </div>
    <div v-if="success" class="alert success" @click="success = null">
      {{ success }}
    </div>

    <div class="tabs">
      <button
        :class="{ active: activeTab === 'unmapped' }"
        @click="activeTab = 'unmapped'"
      >
        Незамаплені ({{ unmapped.total_unmapped || 0 }})
      </button>
      <button
        :class="{ active: activeTab === 'mapped' }"
        @click="activeTab = 'mapped'"
      >
        Замаплені
      </button>
      <button
        :class="{ active: activeTab === 'structure' }"
        @click="activeTab = 'structure'"
      >
        Структура категорій
      </button>
      <button
        :class="{ active: activeTab === 'suppliers' }"
        @click="activeTab = 'suppliers'"
      >
        Постачальники
      </button>
    </div>

    <div class="tab-content">
      <div v-if="activeTab === 'unmapped'" class="unmapped-section">
        <div class="two-columns">
          <div class="column">
            <h3>Категорії постачальників</h3>
            <div class="category-list">
              <div
                v-for="cat in unmapped.categories"
                :key="cat.supplier_sub_category_id"
                class="category-item"
                :class="{ selected: mapForm.from === cat.supplier_sub_category_id }"
                @click="selectFromCategory(cat)"
              >
                <span class="cat-name">{{ cat.supplier_sub_category_name }}</span>
                <span class="cat-count">{{ cat.product_count }} товарів</span>
              </div>
            </div>
          </div>

          <div class="column">
            <h3>Наші категорії</h3>
            <input
              v-model="categorySearch"
              type="text"
              placeholder="Пошук категорії..."
              class="search-input"
            >
            <div class="category-list">
              <div
                v-for="cat in filteredMyCategories"
                :key="cat.id"
                class="category-item"
                :class="{ selected: mapForm.to === cat.id }"
                @click="selectToCategory(cat)"
              >
                <span class="cat-parent">{{ cat.parent_name }}</span>
                <span class="cat-name">{{ cat.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="mapForm.from && mapForm.to" class="map-action">
          <p>
            <strong>{{ getFromCategoryName() }}</strong>
            →
            <strong>{{ getToCategoryName() }}</strong>
          </p>
          <button class="btn primary" :disabled="loading" @click="mapCategory">
            {{ loading ? 'Маплю...' : 'Замапити' }}
          </button>
        </div>
      </div>

      <div v-if="activeTab === 'mapped'" class="mapped-section">
        <div class="two-columns">
          <div class="column">
            <h3>Категорії з товарами</h3>
            <div class="category-list">
              <div
                v-for="cat in mapped"
                :key="cat.sub_category_id"
                class="category-item"
                :class="{ selected: selectedCategory?.sub_category_id === cat.sub_category_id }"
                @click="selectMappedCategory(cat)"
              >
                <span class="cat-parent">{{ cat.category_name }}</span>
                <span class="cat-name">{{ cat.sub_category_name }}</span>
                <span class="cat-count">{{ cat.product_count }} товарів</span>
              </div>
            </div>
          </div>

          <div class="column">
            <h3>Товари в категорії</h3>
            <div v-if="selectedCategory">
              <input
                v-model="productSearch"
                type="text"
                placeholder="Пошук товару..."
                class="search-input"
                @input="debouncedFetchProducts"
              >

              <div class="products-list">
                <div
                  v-for="product in products"
                  :key="product.product_id"
                  class="product-item"
                  :class="{ selected: selectedProducts.includes(product.product_id) }"
                  @click="toggleProductSelection(product.product_id)"
                >
                  <input
                    type="checkbox"
                    :checked="selectedProducts.includes(product.product_id)"
                    @click.stop
                  >
                  <span class="product-name">{{ product.name }}</span>
                  <span class="product-price">{{ product.price }} грн</span>
                  <span class="product-supplier">{{ product.supplier_prefix }}</span>
                </div>
              </div>

              <div class="pagination">
                <button :disabled="page <= 1" @click="prevPage">←</button>
                <span>{{ page }} / {{ totalPages }}</span>
                <button :disabled="page >= totalPages" @click="nextPage">→</button>
              </div>

              <div v-if="selectedProducts.length > 0" class="remap-section">
                <p>Вибрано: {{ selectedProducts.length }} товарів</p>
                <select v-model="remapTo" class="select-input">
                  <option value="">Виберіть категорію...</option>
                  <optgroup
                    v-for="cat in overview?.my?.categories"
                    :key="cat.category_id"
                    :label="cat.category_name"
                  >
                    <option
                      v-for="sub in allSubcategories"
                      :key="sub.id"
                      :value="sub.id"
                    >
                      {{ sub.name }}
                    </option>
                  </optgroup>
                </select>
                <button
                  class="btn primary"
                  :disabled="!remapTo || loading"
                  @click="remapProducts"
                >
                  Перемістити
                </button>
                <button class="btn secondary" @click="selectedProducts = []">
                  Скасувати
                </button>
              </div>
            </div>
            <div v-else class="placeholder">
              Виберіть категорію зліва
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'structure'" class="structure-section">
        <div class="two-columns">
          <div class="column">
            <h3>Категорії</h3>
            <div class="category-tree">
              <div
                v-for="cat in overview?.my?.categories"
                :key="cat.category_id"
                class="tree-item"
              >
                <div class="tree-parent" @click="toggleExpand(cat.category_id)">
                  <span class="expand-icon">{{ expanded[cat.category_id] ? '▼' : '▶' }}</span>
                  <span>{{ cat.category_name }}</span>
                  <span class="count">({{ cat.subcategories_count }})</span>
                  <button class="btn-small danger" @click.stop="deleteCategory(cat.category_id)">✕</button>
                </div>
                <div v-if="expanded[cat.category_id]" class="tree-children">
                  <div
                    v-for="sub in allSubcategories"
                    :key="sub.id"
                    class="tree-child"
                  >
                    <span>{{ sub.name }}</span>
                    <button class="btn-small danger" @click="deleteSubcategory(sub.id)">✕</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="column">
            <h3>Додати категорію</h3>
            <form class="form" @submit.prevent="createCategory">
              <input
                v-model="newCategory.name"
                type="text"
                placeholder="Назва категорії"
                required
              >
              <input
                v-model="newCategory.id"
                type="text"
                placeholder="ID (опційно)"
              >
              <button type="submit" class="btn primary" :disabled="loading">
                Створити категорію
              </button>
            </form>

            <h3>Додати підкатегорію</h3>
            <form class="form" @submit.prevent="createSubcategory">
              <select v-model="newSubCategory.parentId" required>
                <option value="">Виберіть батьківську категорію...</option>
                <option
                  v-for="cat in overview?.my?.categories"
                  :key="cat.category_id"
                  :value="cat.category_id"
                >
                  {{ cat.category_name }}
                </option>
              </select>
              <input
                v-model="newSubCategory.name"
                type="text"
                placeholder="Назва підкатегорії"
                required
              >
              <input
                v-model="newSubCategory.id"
                type="text"
                placeholder="ID (опційно)"
              >
              <input
                v-model="newSubCategory.picture"
                type="text"
                placeholder="URL картинки (опційно)"
              >
              <button type="submit" class="btn primary" :disabled="loading">
                Створити підкатегорію
              </button>
            </form>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'suppliers'" class="suppliers-section">
        <h3>Постачальники</h3>
        <div class="suppliers-grid">
          <div
            v-for="supplier in suppliers"
            :key="supplier.supplier_prefix"
            class="supplier-card"
          >
            <div class="supplier-name">{{ supplier.supplier_name || supplier.supplier_prefix }}</div>
            <div class="supplier-prefix">{{ supplier.supplier_prefix }}</div>
            <div class="supplier-count">{{ supplier.product_count }} товарів</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

interface OverviewStats {
  total: number
  mapped: number
  unmapped: number
  percent_mapped: string
}

interface OverviewCategory {
  category_id: string
  category_name: string
  subcategories_count: number
}

interface Overview {
  stats: OverviewStats
  my?: {
    categories: OverviewCategory[]
  }
}

interface UnmappedCategory {
  supplier_sub_category_id: string
  supplier_sub_category_name: string
  product_count: number
}

interface MyCategory {
  id: string
  name: string
  parent_name?: string
}

interface UnmappedData {
  categories: UnmappedCategory[]
  my_categories: MyCategory[]
  total_unmapped: number
}

interface MappedCategory {
  sub_category_id: string
  sub_category_name: string
  category_name: string
  product_count: number
}

interface Product {
  product_id: string
  name: string
  price: number
  supplier_prefix: string
}

interface Supplier {
  supplier_prefix: string
  supplier_name?: string
  product_count: number
}

const config = useRuntimeConfig()
const API_URL = config.public.apiBase || 'http://localhost:8000/api'

const activeTab = ref<'unmapped' | 'mapped' | 'structure' | 'suppliers'>('unmapped')
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const overview = ref<Overview | null>(null)
const unmapped = ref<UnmappedData>({ categories: [], my_categories: [], total_unmapped: 0 })
const mapped = ref<MappedCategory[]>([])
const suppliers = ref<Supplier[]>([])
const products = ref<Product[]>([])
const selectedCategory = ref<MappedCategory | null>(null)

const newCategory = ref({ name: '', id: '' })
const newSubCategory = ref({ name: '', id: '', parentId: '', picture: '' })
const mapForm = ref({ from: '', to: '' })
const selectedProducts = ref<string[]>([])
const remapTo = ref('')

const page = ref(1)
const totalPages = ref(1)
const productSearch = ref('')
const categorySearch = ref('')

const expanded = ref<Record<string, boolean>>({})

const filteredMyCategories = computed(() => {
  if (!categorySearch.value) return unmapped.value.my_categories
  const search = categorySearch.value.toLowerCase()
  return unmapped.value.my_categories.filter(cat =>
    cat.name.toLowerCase().includes(search) ||
      cat.parent_name?.toLowerCase().includes(search)
  )
})

const allSubcategories = computed(() => unmapped.value.my_categories)

async function fetchOverview() {
  try {
    const data = await $fetch<Overview>(`${API_URL}admin/categories/overview`)
    overview.value = data
  } catch (err: unknown) {
    error.value = (err as { data?: { error?: string }; message?: string }).data?.error || (err as Error).message
  }
}

async function fetchUnmapped() {
  try {
    const data = await $fetch<UnmappedData>(`${API_URL}admin/categories/unmapped`)
    unmapped.value = data
  } catch (err: unknown) {
    error.value = (err as { data?: { error?: string }; message?: string }).data?.error || (err as Error).message
  }
}

async function fetchMapped() {
  try {
    const data = await $fetch<{ categories: MappedCategory[] }>(`${API_URL}admin/categories/mapped`)
    mapped.value = data.categories || []
  } catch (err: unknown) {
    error.value = (err as { data?: { error?: string }; message?: string }).data?.error || (err as Error).message
  }
}

async function fetchSuppliers() {
  try {
    const data = await $fetch<{ suppliers: Supplier[] }>(`${API_URL}admin/categories/suppliers`)
    suppliers.value = data.suppliers || []
  } catch (err: unknown) {
    error.value = (err as { data?: { error?: string }; message?: string }).data?.error || (err as Error).message
  }
}

async function fetchProducts() {
  if (!selectedCategory.value) return
  try {
    const data = await $fetch<{ products: Product[]; pages: number }>(
      `${API_URL}admin/categories/${selectedCategory.value.sub_category_id}/products`,
      {
        params: {
          page: page.value,
          limit: 20,
          search: productSearch.value
        }
      }
    )
    products.value = data.products || []
    totalPages.value = data.pages || 1
  } catch (err: unknown) {
    error.value = (err as { data?: { error?: string }; message?: string }).data?.error || (err as Error).message
  }
}

function selectFromCategory(cat: UnmappedCategory) {
  mapForm.value.from = cat.supplier_sub_category_id
}

function selectToCategory(cat: MyCategory) {
  mapForm.value.to = cat.id
}

function getFromCategoryName() {
  const cat = unmapped.value.categories.find(c => c.supplier_sub_category_id === mapForm.value.from)
  return cat?.supplier_sub_category_name || mapForm.value.from
}

function getToCategoryName() {
  const cat = unmapped.value.my_categories.find(c => c.id === mapForm.value.to)
  return cat?.name || mapForm.value.to
}

async function mapCategory() {
  if (!mapForm.value.from || !mapForm.value.to) return

  loading.value = true
  try {
    const data = await $fetch<{ moved_products: number }>(`${API_URL}admin/categories/map`, {
      method: 'POST',
      body: {
        from_sub_category_id: mapForm.value.from,
        to_sub_category_id: mapForm.value.to
      }
    })
    success.value = `Переміщено ${data.moved_products} товарів`
    mapForm.value = { from: '', to: '' }
    await Promise.all([fetchOverview(), fetchUnmapped(), fetchMapped()])
  } catch (err: unknown) {
    error.value = (err as { data?: { error?: string }; message?: string }).data?.error || (err as Error).message
  } finally {
    loading.value = false
  }
}

function selectMappedCategory(cat: MappedCategory) {
  selectedCategory.value = cat
  page.value = 1
  selectedProducts.value = []
  fetchProducts()
}

function toggleProductSelection(productId: string) {
  const index = selectedProducts.value.indexOf(productId)
  if (index > -1) {
    selectedProducts.value.splice(index, 1)
  } else {
    selectedProducts.value.push(productId)
  }
}

function prevPage() {
  page.value--
  fetchProducts()
}

function nextPage() {
  page.value++
  fetchProducts()
}

async function remapProducts() {
  if (!remapTo.value || selectedProducts.value.length === 0) return

  loading.value = true
  try {
    const data = await $fetch<{ moved_products: number }>(`${API_URL}admin/categories/remap`, {
      method: 'POST',
      body: {
        product_ids: selectedProducts.value,
        to_sub_category_id: remapTo.value
      }
    })
    success.value = `Переміщено ${data.moved_products} товарів`
    selectedProducts.value = []
    remapTo.value = ''
    await Promise.all([fetchOverview(), fetchMapped(), fetchProducts()])
  } catch (err: unknown) {
    error.value = (err as { data?: { error?: string }; message?: string }).data?.error || (err as Error).message
  } finally {
    loading.value = false
  }
}

function toggleExpand(categoryId: string) {
  expanded.value[categoryId] = !expanded.value[categoryId]
}

async function createCategory() {
  if (!newCategory.value.name) return

  loading.value = true
  try {
    await $fetch(`${API_URL}admin/categories/category`, {
      method: 'POST',
      body: {
        name: newCategory.value.name,
        id: newCategory.value.id || undefined
      }
    })
    success.value = 'Категорію створено'
    newCategory.value = { name: '', id: '' }
    await fetchOverview()
  } catch (err: unknown) {
    error.value = (err as { data?: { error?: string }; message?: string }).data?.error || (err as Error).message
  } finally {
    loading.value = false
  }
}

async function createSubcategory() {
  if (!newSubCategory.value.name || !newSubCategory.value.parentId) return

  loading.value = true
  try {
    await $fetch(`${API_URL}admin/categories/subcategory`, {
      method: 'POST',
      body: {
        name: newSubCategory.value.name,
        parentId: newSubCategory.value.parentId,
        id: newSubCategory.value.id || undefined,
        picture: newSubCategory.value.picture || undefined
      }
    })
    success.value = 'Підкатегорію створено'
    newSubCategory.value = { name: '', id: '', parentId: '', picture: '' }
    await Promise.all([fetchOverview(), fetchUnmapped()])
  } catch (err: unknown) {
    error.value = (err as { data?: { error?: string }; message?: string }).data?.error || (err as Error).message
  } finally {
    loading.value = false
  }
}

async function deleteCategory(id: string) {
  if (!confirm('Видалити категорію?')) return

  try {
    await $fetch(`${API_URL}admin/categories/category/${id}`, {
      method: 'DELETE'
    })
    success.value = 'Категорію видалено'
    await fetchOverview()
  } catch (err: unknown) {
    error.value = (err as { data?: { error?: string }; message?: string }).data?.error || (err as Error).message
  }
}

async function deleteSubcategory(id: string) {
  if (!confirm('Видалити підкатегорію?')) return

  try {
    await $fetch(`${API_URL}admin/categories/subcategory/${id}`, {
      method: 'DELETE'
    })
    success.value = 'Підкатегорію видалено'
    await Promise.all([fetchOverview(), fetchUnmapped()])
  } catch (err: unknown) {
    error.value = (err as { data?: { error?: string }; message?: string }).data?.error || (err as Error).message
  }
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null

function debouncedFetchProducts() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    fetchProducts()
  }, 300)
}

watch(activeTab, (tab) => {
  if (tab === 'unmapped') fetchUnmapped()
  if (tab === 'mapped') fetchMapped()
  if (tab === 'suppliers') fetchSuppliers()
})

onMounted(async () => {
  await Promise.all([fetchOverview(), fetchUnmapped()])
})

watch([error, success], () => {
  setTimeout(() => {
    error.value = null
    success.value = null
  }, 5000)
})
</script>

<style scoped>
.category-manager {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 20px;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-card.success { border-left: 4px solid #4caf50; }
.stat-card.warning { border-left: 4px solid #ff9800; }
.stat-card.info { border-left: 4px solid #2196f3; }

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  color: #666;
  margin-top: 5px;
}

.alert {
  padding: 12px 20px;
  border-radius: 6px;
  margin-bottom: 15px;
  cursor: pointer;
}

.alert.error {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ef9a9a;
}

.alert.success {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

.tabs {
  display: flex;
  gap: 5px;
  margin-bottom: 20px;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.tabs button {
  padding: 10px 20px;
  border: none;
  background: #f5f5f5;
  border-radius: 6px 6px 0 0;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.tabs button:hover {
  background: #e0e0e0;
}

.tabs button.active {
  background: #1976d2;
  color: white;
}

.two-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.column {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.column h3 {
  margin-bottom: 15px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.category-list {
  max-height: 500px;
  overflow-y: auto;
}

.category-item {
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-item:hover {
  border-color: #1976d2;
  background: #f5f9ff;
}

.category-item.selected {
  border-color: #1976d2;
  background: #e3f2fd;
}

.cat-name {
  font-weight: 500;
  color: #333;
}

.cat-parent {
  font-size: 12px;
  color: #888;
}

.cat-count {
  font-size: 12px;
  color: #666;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 10px;
  align-self: flex-start;
}

.search-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 15px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #1976d2;
}

.map-action {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.map-action p {
  margin-bottom: 15px;
  font-size: 16px;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn.primary {
  background: #1976d2;
  color: white;
}

.btn.primary:hover:not(:disabled) {
  background: #1565c0;
}

.btn.secondary {
  background: #f5f5f5;
  color: #333;
}

.btn.secondary:hover {
  background: #e0e0e0;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-small {
  padding: 4px 8px;
  font-size: 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-small.danger {
  background: #ffebee;
  color: #c62828;
}

.btn-small.danger:hover {
  background: #ffcdd2;
}

.products-list {
  max-height: 400px;
  overflow-y: auto;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 6px;
  margin-bottom: 6px;
  cursor: pointer;
}

.product-item:hover {
  background: #f5f5f5;
}

.product-item.selected {
  background: #e3f2fd;
  border-color: #1976d2;
}

.product-name {
  flex: 1;
  font-size: 14px;
}

.product-price {
  font-weight: 500;
  color: #2e7d32;
}

.product-supplier {
  font-size: 12px;
  color: #888;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.remap-section {
  margin-top: 15px;
  padding: 15px;
  background: #fff8e1;
  border-radius: 6px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.select-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  min-width: 200px;
}

.category-tree {
  max-height: 500px;
  overflow-y: auto;
}

.tree-item {
  margin-bottom: 5px;
}

.tree-parent {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 6px;
  cursor: pointer;
}

.tree-parent:hover {
  background: #e0e0e0;
}

.expand-icon {
  width: 16px;
  font-size: 12px;
}

.count {
  color: #888;
  font-size: 12px;
}

.tree-children {
  margin-left: 24px;
  margin-top: 5px;
}

.tree-child {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-left: 2px solid #ddd;
  margin-bottom: 3px;
}

.suppliers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.supplier-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.supplier-name {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.supplier-prefix {
  color: #888;
  font-size: 14px;
  margin-top: 5px;
}

.supplier-count {
  margin-top: 10px;
  font-size: 14px;
  color: #1976d2;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 30px;
}

.form input,
.form select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.form input:focus,
.form select:focus {
  outline: none;
  border-color: #1976d2;
}

.placeholder {
  text-align: center;
  color: #888;
  padding: 40px;
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .two-columns {
    grid-template-columns: 1fr;
  }
}
</style>
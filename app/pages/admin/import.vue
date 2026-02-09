<template>
  <div class="import-manager">
    <h1>Управління імпортом</h1>

    <div v-if="error" class="alert error" @click="error = null">
      {{ error }}
    </div>
    <div v-if="success" class="alert success" @click="success = null">
      {{ success }}
    </div>

    <div class="tabs">
      <button
        :class="{ active: activeTab === 'sources' }"
        @click="activeTab = 'sources'"
      >
        Джерела ({{ sources.length }})
      </button>
      <button
        :class="{ active: activeTab === 'add' }"
        @click="activeTab = 'add'"
      >
        Додати джерело
      </button>
      <button
        :class="{ active: activeTab === 'mappings' }"
        @click="activeTab = 'mappings'"
      >
        Маппінг категорій
      </button>
    </div>

    <div class="tab-content">
      <div v-if="activeTab === 'sources'" class="sources-section">
        <div class="actions-bar">
          <button class="btn primary" :disabled="loading" @click="runAllImports">
            {{ loading ? 'Імпортую...' : '🔄 Запустити всі' }}
          </button>
          <button class="btn secondary" @click="fetchSources">
            Оновити список
          </button>
        </div>

        <div class="sources-grid">
          <div
            v-for="source in sources"
            :key="source.id"
            class="source-card"
            :class="{ inactive: !source.isActive }"
          >
            <div class="source-header">
              <div class="source-name">{{ source.supplierName }}</div>
              <div class="source-prefix">{{ source.supplierPrefix }}</div>
              <div class="source-status" :class="source.isActive ? 'active' : 'inactive'">
                {{ source.isActive ? 'Активний' : 'Неактивний' }}
              </div>
            </div>

            <div class="source-info">
              <div class="info-row">
                <span class="label">Тип:</span>
                <span class="value">{{ source.sourceType === 'url' ? '🔗 URL' : '📁 Файл' }}</span>
              </div>
              <div v-if="source.sourceType === 'url'" class="info-row">
                <span class="label">URL:</span>
                <span class="value url">{{ truncateUrl(source.sourceUrl) }}</span>
              </div>
              <div v-if="source.sourceType === 'file'" class="info-row">
                <span class="label">Файл:</span>
                <span class="value">{{ source.sourceFilename }}</span>
              </div>
              <div v-if="source.lastImportAt" class="info-row">
                <span class="label">Останній імпорт:</span>
                <span class="value">{{ formatDate(source.lastImportAt) }}</span>
              </div>
              <div class="info-row highlight">
                <span class="label">Товарів в базі:</span>
                <span class="value count">{{ source.productCount || 0 }}</span>
              </div>
              <div v-if="source.lastImportStats" class="info-row">
                <span class="label">Останній імпорт:</span>
                <span class="value">{{ source.lastImportStats.products?.created || 0 }} нових, {{ source.lastImportStats.products?.updated || 0 }} оновлено</span>
              </div>
            </div>

            <div class="source-actions">
              <button
                class="btn small primary"
                :disabled="loading || !source.isActive"
                @click="runImport(source)"
              >
                ▶ Запустити
              </button>
              <button
                class="btn small warning"
                :disabled="loading"
                @click="reimportSource(source)"
              >
                🔄 Переімпорт
              </button>
              <button class="btn small secondary" @click="editSource(source)">
                ✏️
              </button>
              <button
                class="btn small"
                :class="source.isActive ? 'warning' : 'success'"
                @click="toggleSourceActive(source)"
              >
                {{ source.isActive ? '⏸' : '▶' }}
              </button>
            </div>

            <div class="source-actions-danger">
              <button
                class="btn small danger-outline"
                :disabled="loading"
                @click="deleteSourceProducts(source)"
              >
                🗑️ Очистити товари
              </button>
              <button
                class="btn small danger"
                @click="deleteSource(source)"
              >
                ✕ Видалити джерело
              </button>
            </div>

            <div v-if="importProgress[source.id]" class="import-progress">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: (importProgress[source.id]?.percent ?? 0) + '%' }"
                />
              </div>
              <div class="progress-text">{{ importProgress[source.id]?.status }}</div>
            </div>
          </div>
        </div>

        <div v-if="sources.length === 0" class="empty-state">
          <p>Немає джерел імпорту</p>
          <button class="btn primary" @click="activeTab = 'add'">
            Додати джерело
          </button>
        </div>
      </div>

      <div v-if="activeTab === 'add'" class="add-section">
        <div class="two-columns">
          <div class="column">
            <h3>🔗 Імпорт по URL</h3>
            <form class="form" @submit.prevent="importFromUrl">
              <div class="form-group">
                <label>Префікс постачальника *</label>
                <input
                  v-model="urlForm.supplierPrefix"
                  type="text"
                  placeholder="GROSSER"
                  required
                >
                <small>Унікальний ідентифікатор (латиницею, великі літери)</small>
              </div>
              <div class="form-group">
                <label>Назва постачальника</label>
                <input
                  v-model="urlForm.supplierName"
                  type="text"
                  placeholder="Grosser"
                >
              </div>
              <div class="form-group">
                <label>URL XML фіду *</label>
                <input
                  v-model="urlForm.xmlUrl"
                  type="url"
                  placeholder="https://example.com/feed.xml"
                  required
                >
              </div>
              <button type="submit" class="btn primary" :disabled="loading">
                {{ loading ? 'Імпортую...' : 'Імпортувати' }}
              </button>
            </form>
          </div>

          <div class="column">
            <h3>📁 Імпорт файлу</h3>
            <form class="form" @submit.prevent="importFromFile">
              <div class="form-group">
                <label>Префікс постачальника *</label>
                <input
                  v-model="fileForm.supplierPrefix"
                  type="text"
                  placeholder="PROFI-TEC"
                  required
                >
              </div>
              <div class="form-group">
                <label>Назва постачальника</label>
                <input
                  v-model="fileForm.supplierName"
                  type="text"
                  placeholder="Profi-Tec"
                >
              </div>
              <div class="form-group">
                <label>XML файл *</label>
                <input
                  ref="fileInput"
                  type="file"
                  accept=".xml"
                  required
                  @change="handleFileSelect"
                >
              </div>
              <div v-if="selectedFile" class="file-info">
                📄 {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
              </div>
              <button type="submit" class="btn primary" :disabled="loading || !selectedFile">
                {{ loading ? 'Завантажую...' : 'Завантажити та імпортувати' }}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'mappings'" class="mappings-section">
        <div class="mappings-header">
          <div class="form-group inline">
            <label>Постачальник:</label>
            <select v-model="selectedSupplier" @change="fetchMappings">
              <option value="">Виберіть постачальника...</option>
              <option v-for="source in sources" :key="source.supplierPrefix" :value="source.supplierPrefix">
                {{ source.supplierName }} ({{ source.supplierPrefix }})
              </option>
            </select>
          </div>

          <div v-if="selectedSupplier && mappingStats" class="mapping-stats">
            <span class="stat">Всього: {{ mappingStats.total }}</span>
            <span class="stat success">Замаплено: {{ mappingStats.mapped }}</span>
            <span class="stat warning">Незамаплено: {{ mappingStats.unmapped }}</span>
            <span class="stat info">{{ mappingStats.percent }}%</span>
            <span class="stat products">{{ mappingStats.productCount }} товарів</span>
          </div>
        </div>

        <div v-if="selectedSupplier" class="two-columns">
          <div class="column">
            <h3>Незамаплені категорії ({{ unmappedCategories.length }})</h3>
            <div class="category-list">
              <div
                v-for="cat in unmappedCategories"
                :key="cat.id"
                class="category-item unmapped"
                :class="{ selected: selectedMapping?.id === cat.id }"
                @click="selectMapping(cat)"
              >
                <div class="cat-name">{{ cat.externalName }}</div>
                <div v-if="cat.parentName" class="cat-parent">{{ cat.parentName }}</div>
                <div class="cat-id">{{ cat.externalId }}</div>
              </div>
            </div>
          </div>

          <div class="column">
            <h3>Наші категорії</h3>
            <input
              v-model="targetSearch"
              type="text"
              placeholder="Пошук категорії..."
              class="search-input"
            >
            <div class="category-list">
              <div
                v-for="cat in filteredTargets"
                :key="cat.id"
                class="category-item target"
                :class="{ selected: selectedTarget?.id === cat.id }"
                @click="selectTarget(cat)"
              >
                <div class="cat-parent">{{ cat.parentName }}</div>
                <div class="cat-name">{{ cat.name }}</div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="selectedMapping && selectedTarget" class="map-action">
          <p>
            <strong>{{ selectedMapping.externalName }}</strong>
            →
            <strong>{{ selectedTarget.name }}</strong>
          </p>
          <button class="btn primary" :disabled="loading" @click="saveMapping">
            Зберегти маппінг
          </button>
          <button class="btn secondary" @click="clearSelection">
            Скасувати
          </button>
        </div>

        <div v-if="selectedSupplier && allMappings.length > 0" class="all-mappings">
          <h3>Всі маппінги ({{ allMappings.length }})</h3>
          <div class="mappings-table">
            <table>
              <thead>
                <tr>
                  <th>Зовнішня категорія</th>
                  <th>Внутрішня категорія</th>
                  <th>Дії</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in allMappings" :key="m.id" :class="{ unmapped: !m.internal_sub_category_id }">
                  <td>
                    <div>{{ m.external_category_name }}</div>
                    <small>{{ m.external_category_id }}</small>
                  </td>
                  <td>
                    <span v-if="m.internalCategoryName" class="mapped">
                      {{ m.internalCategoryName }}
                    </span>
                    <span v-else class="not-mapped">Не замаплено</span>
                  </td>
                  <td>
                    <button class="btn-small danger" @click="deleteMapping(m.id)">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div v-if="editModal" class="modal-overlay" @click.self="editModal = null">
      <div class="modal">
        <h3>Редагувати джерело</h3>
        <form class="form" @submit.prevent="saveSourceEdit">
          <div class="form-group">
            <label>Назва постачальника</label>
            <input v-model="editModal.supplierName" type="text">
          </div>
          <div class="form-group">
            <label>URL (якщо тип URL)</label>
            <input v-model="editModal.sourceUrl" type="url">
          </div>
          <div class="form-group">
            <label>Новий файл</label>
            <input
              ref="editFileInput"
              type="file"
              accept=".xml"
              @change="handleEditFileSelect"
            >
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn primary" :disabled="loading">
              Зберегти
            </button>
            <button type="button" class="btn secondary" @click="editModal = null">
              Скасувати
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="deleteConfirmModal" class="modal-overlay" @click.self="deleteConfirmModal = null">
      <div class="modal danger-modal">
        <h3>⚠️ {{ deleteConfirmModal.title }}</h3>
        <p>{{ deleteConfirmModal.message }}</p>
        <div v-if="deleteConfirmModal.stats" class="delete-stats">
          <div>Товарів буде видалено: <strong>{{ deleteConfirmModal.stats.products }}</strong></div>
        </div>
        <div class="modal-actions">
          <button
            class="btn danger"
            :disabled="loading"
            @click="confirmDelete"
          >
            {{ loading ? 'Видаляю...' : 'Так, видалити' }}
          </button>
          <button type="button" class="btn secondary" @click="deleteConfirmModal = null">
            Скасувати
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

interface ImportStats {
  products?: {
    created?: number
    updated?: number
    total?: number
  }
}

interface Source {
  id: string
  supplierName: string
  supplierPrefix: string
  sourceType: 'url' | 'file'
  sourceUrl?: string
  sourceFilename?: string
  isActive: boolean
  lastImportAt?: string
  lastImportStats?: ImportStats
  productCount?: number
}

interface MappingStats {
  total: number
  mapped: number
  unmapped: number
  percent: string
  productCount: number
}

interface UnmappedCategory {
  id: string
  externalId: string
  externalName: string
  parentName?: string
}

interface TargetCategory {
  id: string
  name: string
  parentName?: string
}

interface Mapping {
  id: string
  external_category_id: string
  external_category_name: string
  internal_sub_category_id?: string
  internalCategoryName?: string
}

interface ImportProgress {
  percent: number
  status: string
}

interface DeleteConfirm {
  title: string
  message: string
  stats: { products: number } | null
  action: 'reimport' | 'deleteProducts' | 'deleteSource'
  source: Source
  deleteProducts?: boolean
}

const config = useRuntimeConfig()
const API_URL = config.public.apiBase || 'http://localhost:8000/api'

const activeTab = ref<'sources' | 'add' | 'mappings'>('sources')
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const sources = ref<Source[]>([])
const allMappings = ref<Mapping[]>([])
const unmappedCategories = ref<UnmappedCategory[]>([])
const targetCategories = ref<TargetCategory[]>([])
const mappingStats = ref<MappingStats | null>(null)
const importProgress = ref<Record<string, ImportProgress>>({})

const selectedSupplier = ref('')
const selectedMapping = ref<UnmappedCategory | null>(null)
const selectedTarget = ref<TargetCategory | null>(null)
const selectedFile = ref<File | null>(null)
const editFile = ref<File | null>(null)

const urlForm = ref({ supplierPrefix: '', supplierName: '', xmlUrl: '' })
const fileForm = ref({ supplierPrefix: '', supplierName: '' })
const editModal = ref<Source | null>(null)
const deleteConfirmModal = ref<DeleteConfirm | null>(null)

const targetSearch = ref('')

const filteredTargets = computed(() => {
  if (!targetSearch.value) return targetCategories.value
  const search = targetSearch.value.toLowerCase()
  return targetCategories.value.filter(cat =>
    cat.name.toLowerCase().includes(search) ||
      cat.parentName?.toLowerCase().includes(search)
  )
})

function clearProgress(sourceId: string) {
  const newProgress = { ...importProgress.value }
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete newProgress[sourceId]
  importProgress.value = newProgress
}

function setProgress(sourceId: string, progress: ImportProgress) {
  importProgress.value = { ...importProgress.value, [sourceId]: progress }
}

async function fetchSources() {
  try {
    const data = await $fetch<{ sources: Source[] }>(`${API_URL}admin/import/sources`)
    sources.value = data.sources || []
  } catch (err: unknown) {
    error.value = (err as { data?: { error?: string }; message?: string }).data?.error || (err as Error).message
  }
}

async function fetchMappings() {
  if (!selectedSupplier.value) {
    allMappings.value = []
    unmappedCategories.value = []
    mappingStats.value = null
    return
  }

  try {
    const mappingsData = await $fetch<{ mappings: Mapping[] }>(`${API_URL}admin/import/mappings/${selectedSupplier.value}`)
    allMappings.value = mappingsData.mappings || []

    const unmappedData = await $fetch<{ unmapped: UnmappedCategory[]; targets: TargetCategory[] }>(`${API_URL}admin/import/unmapped/${selectedSupplier.value}`)
    unmappedCategories.value = unmappedData.unmapped || []
    targetCategories.value = unmappedData.targets || []

    const statsData = await $fetch<{ stats: MappingStats }>(`${API_URL}admin/import/stats/${selectedSupplier.value}`)
    mappingStats.value = statsData.stats
  } catch (err: unknown) {
    error.value = (err as { data?: { error?: string }; message?: string }).data?.error || (err as Error).message
  }
}

async function importFromUrl() {
  if (!urlForm.value.xmlUrl || !urlForm.value.supplierPrefix) return

  loading.value = true
  try {
    const data = await $fetch<{ result?: ImportStats }>(`${API_URL}admin/import/url`, {
      method: 'POST',
      body: {
        xmlUrl: urlForm.value.xmlUrl,
        supplierPrefix: urlForm.value.supplierPrefix.toUpperCase(),
        supplierName: urlForm.value.supplierName || urlForm.value.supplierPrefix
      }
    })

    success.value = `Імпортовано ${data.result?.products?.total || 0} товарів`
    urlForm.value = { supplierPrefix: '', supplierName: '', xmlUrl: '' }
    await fetchSources()
    activeTab.value = 'sources'
  } catch (err: unknown) {
    error.value = (err as { data?: { error?: string }; message?: string }).data?.error || (err as Error).message
  } finally {
    loading.value = false
  }
}

async function importFromFile() {
  if (!selectedFile.value || !fileForm.value.supplierPrefix) return

  loading.value = true
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('supplierPrefix', fileForm.value.supplierPrefix.toUpperCase())
    formData.append('supplierName', fileForm.value.supplierName || fileForm.value.supplierPrefix)

    const data = await $fetch<{ result?: ImportStats }>(`${API_URL}admin/import/file`, {
      method: 'POST',
      body: formData
    })

    success.value = `Імпортовано ${data.result?.products?.total || 0} товарів`
    fileForm.value = { supplierPrefix: '', supplierName: '' }
    selectedFile.value = null
    await fetchSources()
    activeTab.value = 'sources'
  } catch (err: unknown) {
    error.value = (err as { data?: { error?: string }; message?: string }).data?.error || (err as Error).message
  } finally {
    loading.value = false
  }
}

async function runImport(source: Source) {
  loading.value = true
  setProgress(source.id, { percent: 0, status: 'Запускаю...' })

  try {
    setProgress(source.id, { percent: 30, status: 'Завантажую XML...' })

    const data = await $fetch<{ result?: ImportStats }>(`${API_URL}admin/import/sources/${source.id}/run`, {
      method: 'POST'
    })

    setProgress(source.id, { percent: 100, status: 'Готово!' })
    success.value = `${source.supplierName}: ${data.result?.products?.created || 0} нових, ${data.result?.products?.updated || 0} оновлено`

    setTimeout(() => clearProgress(source.id), 2000)

    await fetchSources()
  } catch (err: unknown) {
    error.value = (err as { data?: { error?: string }; message?: string }).data?.error || (err as Error).message
    clearProgress(source.id)
  } finally {
    loading.value = false
  }
}

async function runAllImports() {
  loading.value = true
  try {
    const data = await $fetch<{ totalSources: number; results: { success: boolean }[] }>(`${API_URL}admin/import/run-all`, {
      method: 'POST'
    })

    const successCount = data.results.filter(r => r.success).length
    success.value = `Запущено ${data.totalSources} джерел, успішно: ${successCount}`
    await fetchSources()
  } catch (err: unknown) {
    error.value = (err as { data?: { error?: string }; message?: string }).data?.error || (err as Error).message
  } finally {
    loading.value = false
  }
}

function reimportSource(source: Source) {
  deleteConfirmModal.value = {
    title: 'Переімпорт',
    message: `Видалити всі товари "${source.supplierName}" і завантажити заново?`,
    stats: { products: source.productCount || 0 },
    action: 'reimport',
    source
  }
}

function deleteSourceProducts(source: Source) {
  deleteConfirmModal.value = {
    title: 'Очистити товари',
    message: `Видалити всі товари постачальника "${source.supplierName}"? Джерело залишиться.`,
    stats: { products: source.productCount || 0 },
    action: 'deleteProducts',
    source
  }
}

function deleteSource(source: Source) {
  deleteConfirmModal.value = {
    title: 'Видалити джерело',
    message: `Видалити джерело "${source.supplierName}"? Товари залишаться в базі.`,
    stats: null,
    action: 'deleteSource',
    source,
    deleteProducts: false
  }
}

async function confirmDelete() {
  if (!deleteConfirmModal.value) return

  const { action, source } = deleteConfirmModal.value
  loading.value = true

  try {
    if (action === 'reimport') {
      setProgress(source.id, { percent: 0, status: 'Видаляю старі товари...' })

      const data = await $fetch<{ deleted?: { products?: number }; imported?: ImportStats }>(`${API_URL}admin/import/sources/${source.id}/reimport`, {
        method: 'POST'
      })

      setProgress(source.id, { percent: 100, status: 'Готово!' })
      success.value = `Переімпорт завершено: видалено ${data.deleted?.products || 0}, імпортовано ${data.imported?.products?.total || 0} товарів`

      setTimeout(() => clearProgress(source.id), 2000)

    } else if (action === 'deleteProducts') {
      const data = await $fetch<{ deleted?: { products?: number } }>(`${API_URL}admin/import/sources/${source.id}/products`, {
        method: 'DELETE'
      })
      success.value = `Видалено ${data.deleted?.products || 0} товарів`

    } else if (action === 'deleteSource') {
      await $fetch(`${API_URL}admin/import/sources/${source.id}`, {
        method: 'DELETE'
      })
      success.value = 'Джерело видалено'
    }

    deleteConfirmModal.value = null
    await fetchSources()
  } catch (err: unknown) {
    error.value = (err as { data?: { error?: string }; message?: string }).data?.error || (err as Error).message
  } finally {
    loading.value = false
  }
}

async function toggleSourceActive(source: Source) {
  try {
    await $fetch(`${API_URL}admin/import/sources/${source.id}`, {
      method: 'PUT',
      body: { isActive: !source.isActive }
    })
    await fetchSources()
  } catch (err: unknown) {
    error.value = (err as { data?: { error?: string }; message?: string }).data?.error || (err as Error).message
  }
}

function editSource(source: Source) {
  editModal.value = { ...source }
  editFile.value = null
}

async function saveSourceEdit() {
  if (!editModal.value) return

  loading.value = true
  try {
    await $fetch(`${API_URL}admin/import/sources/${editModal.value.id}`, {
      method: 'PUT',
      body: {
        supplierName: editModal.value.supplierName,
        sourceUrl: editModal.value.sourceUrl
      }
    })

    if (editFile.value) {
      const formData = new FormData()
      formData.append('file', editFile.value)
      await $fetch(`${API_URL}admin/import/sources/${editModal.value.id}/file`, {
        method: 'PUT',
        body: formData
      })
    }

    success.value = 'Джерело оновлено'
    editModal.value = null
    await fetchSources()
  } catch (err: unknown) {
    error.value = (err as { data?: { error?: string }; message?: string }).data?.error || (err as Error).message
  } finally {
    loading.value = false
  }
}

async function saveMapping() {
  if (!selectedMapping.value || !selectedTarget.value || !selectedSupplier.value) return

  loading.value = true
  try {
    await $fetch(`${API_URL}admin/import/mapping`, {
      method: 'POST',
      body: {
        supplierPrefix: selectedSupplier.value,
        externalCategoryId: selectedMapping.value.externalId,
        internalCategoryId: selectedTarget.value.id
      }
    })

    success.value = 'Маппінг збережено'
    clearSelection()
    await fetchMappings()
  } catch (err: unknown) {
    error.value = (err as { data?: { error?: string }; message?: string }).data?.error || (err as Error).message
  } finally {
    loading.value = false
  }
}

async function deleteMapping(id: string) {
  if (!confirm('Видалити маппінг?')) return

  try {
    await $fetch(`${API_URL}admin/import/mapping/${id}`, {
      method: 'DELETE'
    })
    success.value = 'Маппінг видалено'
    await fetchMappings()
  } catch (err: unknown) {
    error.value = (err as { data?: { error?: string }; message?: string }).data?.error || (err as Error).message
  }
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  selectedFile.value = input.files?.[0] || null
}

function handleEditFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  editFile.value = input.files?.[0] || null
}

function selectMapping(cat: UnmappedCategory) {
  selectedMapping.value = cat
}

function selectTarget(cat: TargetCategory) {
  selectedTarget.value = cat
}

function clearSelection() {
  selectedMapping.value = null
  selectedTarget.value = null
}

function truncateUrl(url?: string) {
  if (!url) return ''
  return url.length > 50 ? url.substring(0, 50) + '...' : url
}

function formatDate(date?: string) {
  if (!date) return ''
  return new Date(date).toLocaleString('uk-UA')
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

watch(activeTab, (tab) => {
  if (tab === 'sources') fetchSources()
})

watch([error, success], () => {
  setTimeout(() => {
    error.value = null
    success.value = null
  }, 5000)
})

onMounted(() => {
  fetchSources()
})
</script>

<style scoped>
.import-manager {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 20px;
  color: #333;
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

.actions-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.sources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
}

.source-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
}

.source-card.inactive {
  opacity: 0.6;
  border-color: #ffcdd2;
}

.source-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.source-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.source-prefix {
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.source-status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-left: auto;
}

.source-status.active {
  background: #e8f5e9;
  color: #2e7d32;
}

.source-status.inactive {
  background: #ffebee;
  color: #c62828;
}

.source-info {
  margin-bottom: 15px;
}

.info-row {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 14px;
}

.info-row .label {
  color: #666;
  min-width: 120px;
}

.info-row .value {
  color: #333;
}

.info-row .value.url {
  word-break: break-all;
  color: #1976d2;
}

.info-row.highlight {
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  margin: 8px 0;
}

.info-row .value.count {
  font-weight: 600;
  color: #1976d2;
  font-size: 16px;
}

.source-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.source-actions-danger {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.import-progress {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.progress-bar {
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #4caf50;
  transition: width 0.3s;
}

.progress-text {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
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

.form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group.inline {
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.form-group label {
  font-weight: 500;
  color: #333;
}

.form-group small {
  color: #888;
  font-size: 12px;
}

.form-group input,
.form-group select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #1976d2;
}

.file-info {
  padding: 10px;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 14px;
}

.btn {
  padding: 10px 20px;
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

.btn.success {
  background: #e8f5e9;
  color: #2e7d32;
}

.btn.warning {
  background: #fff3e0;
  color: #e65100;
}

.btn.danger {
  background: #c62828;
  color: white;
}

.btn.danger:hover:not(:disabled) {
  background: #b71c1c;
}

.btn.danger-outline {
  background: transparent;
  color: #c62828;
  border: 1px solid #c62828;
}

.btn.danger-outline:hover:not(:disabled) {
  background: #ffebee;
}

.btn.small {
  padding: 6px 12px;
  font-size: 12px;
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

.category-list {
  max-height: 400px;
  overflow-y: auto;
}

.category-item {
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-item:hover {
  border-color: #1976d2;
  background: #f5f9ff;
}

.category-item.selected {
  border-color: #1976d2;
  background: #e3f2fd;
}

.category-item.unmapped {
  border-left: 3px solid #ff9800;
}

.cat-name {
  font-weight: 500;
  color: #333;
}

.cat-parent {
  font-size: 12px;
  color: #888;
}

.cat-id {
  font-size: 11px;
  color: #aaa;
  margin-top: 4px;
}

.search-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 15px;
  font-size: 14px;
}

.map-action {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.mappings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.mapping-stats {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.mapping-stats .stat {
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
}

.mapping-stats .stat.success {
  background: #e8f5e9;
  color: #2e7d32;
}

.mapping-stats .stat.warning {
  background: #fff3e0;
  color: #e65100;
}

.mapping-stats .stat.info {
  background: #e3f2fd;
  color: #1976d2;
  font-weight: 600;
}

.mapping-stats .stat.products {
  background: #f3e5f5;
  color: #7b1fa2;
}

.all-mappings {
  margin-top: 30px;
}

.mappings-table {
  overflow-x: auto;
}

.mappings-table table {
  width: 100%;
  border-collapse: collapse;
}

.mappings-table th,
.mappings-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.mappings-table th {
  background: #f5f5f5;
  font-weight: 600;
}

.mappings-table tr.unmapped {
  background: #fff8e1;
}

.mappings-table .mapped {
  color: #2e7d32;
}

.mappings-table .not-mapped {
  color: #c62828;
  font-style: italic;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 8px;
  min-width: 400px;
  max-width: 90%;
}

.modal h3 {
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.danger-modal {
  border-top: 4px solid #c62828;
}

.danger-modal h3 {
  color: #c62828;
}

.delete-stats {
  background: #fff8e1;
  padding: 15px;
  border-radius: 6px;
  margin: 15px 0;
}

.delete-stats strong {
  color: #c62828;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

@media (max-width: 900px) {
  .two-columns {
    grid-template-columns: 1fr;
  }

  .sources-grid {
    grid-template-columns: 1fr;
  }
}
</style>
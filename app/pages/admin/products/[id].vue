<script setup lang="ts">
import { useAdminProductStore } from '~/models/admin/AdminProductStore'
import { useCategoryStore } from '~/models/category/CategoryStore'
import { useImageUpload } from '~/models/common/composables/useImageUpload'
import BBtn from '~/models/common/components/ui/BBtn.vue'
import BSelect from '~/models/common/components/ui/BSelect.vue'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const store = useAdminProductStore()
const categoryStore = useCategoryStore()
const { uploadImage, uploading, error: uploadError, progress, getOptimizedUrl } = useImageUpload()

// --- State ---
const isNew = computed(() => route.params.id === 'new')
const productId = computed(() => route.params.id as string)

// Form data
const form = reactive({
  product_name: '',
  brand: '',
  price: '',
  sale_price: '0',
  discount: 0,
  available: 'true',
  bestseller: 'false',
  sale: 'false',
  sub_category_id: '',
  product_description: ''
})

// Category
const selectedCategory = ref('')

// Pictures
const newProductPictures = ref<string[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)

// Parameters (характеристики)
interface Parameter {
  name: string
  value: string
}

const parameters = ref<Parameter[]>([])

// Шаблони характеристик для швидкого додавання
const paramTemplates = [
  'Потужність',
  'Напруга',
  'Вага',
  'Розмір',
  'Матеріал',
  'Колір',
  'Гарантія',
  'Країна виробник'
]

// --- Computed ---
const categoryOptions = computed(() =>
  categoryStore.categories.map(c => ({ value: c.id, label: c.name }))
)

const subcategoryOptions = computed(() => {
  if (!selectedCategory.value) return []
  return categoryStore.getSubcategories(selectedCategory.value)
    .map(s => ({ value: s.id, label: s.name }))
})

// --- Watchers ---
watch(selectedCategory, (newVal, oldVal) => {
  if (oldVal) {
    form.sub_category_id = ''
  }
})

// Load product
watch(productId, async (id) => {
  console.log('📦 Loading product, id:', id)

  if (id && id !== 'new') {
    await store.fetchProduct(id)

    if (store.currentProduct) {
      const p = store.currentProduct
      console.log('📦 Loaded product:', p)
      console.log('📦 Product parameters:', (p as any).parameters)
      console.log('📦 Product params:', (p as any).params)

      // Basic info
      form.product_name = p.product_name || ''
      form.brand = p.brand || ''
      form.price = p.price || ''
      form.sale_price = p.sale_price || '0'
      form.discount = p.discount || 0
      form.available = p.available || 'true'
      form.bestseller = p.bestseller || 'false'
      form.sale = p.sale || 'false'
      form.sub_category_id = p.sub_category_id || ''
      form.product_description = (p as any).product_description || ''

      // Set category
      if (p.subCategory?.category?.id) {
        selectedCategory.value = p.subCategory.category.id
      }

      // Load parameters from database - спробуємо обидва варіанти
      const productParams = (p as any).parameters || (p as any).params || []
      console.log('📦 Found params to load:', productParams)

      parameters.value = productParams.map((param: any) => ({
        name: param.parameter_name || param.name || '',
        value: param.parameter_value || param.value || ''
      }))

      console.log('📦 Loaded parameters to form:', parameters.value)
    }
  } else {
    // Reset for new product
    resetForm()
  }
}, { immediate: true })

// --- Form Reset ---
function resetForm() {
  form.product_name = ''
  form.brand = ''
  form.price = ''
  form.sale_price = '0'
  form.discount = 0
  form.available = 'true'
  form.bestseller = 'false'
  form.sale = 'false'
  form.sub_category_id = ''
  form.product_description = ''
  selectedCategory.value = ''
  newProductPictures.value = []
  parameters.value = []
}

// --- Parameters ---
function addParameter() {
  parameters.value.push({ name: '', value: '' })
  console.log('➕ Added parameter, total:', parameters.value.length)
}

function removeParameter(index: number) {
  parameters.value.splice(index, 1)
  console.log('➖ Removed parameter, total:', parameters.value.length)
}

function addParameterFromTemplate(template: string) {
  parameters.value.push({ name: template, value: '' })
  console.log('➕ Added from template:', template)
}

// --- Price Calculation ---
// --- Price Calculation ---
function calculateSalePrice() {
  const discount = Number(form.discount) || 0  // <-- Конвертуємо в число
  const price = parseFloat(form.price) || 0

  if (discount > 0 && price > 0) {
    const salePrice = price - (price * discount / 100)
    form.sale_price = salePrice.toFixed(2)
  } else {
    form.sale_price = '0'
  }
}


// --- Image Upload ---
function openFilePicker() {
  fileInput.value?.click()
}

async function handleFiles(files: FileList | null) {
  if (!files) return

  for (const file of Array.from(files)) {
    if (!file.type.startsWith('image/')) {
      alert('Тільки зображення!')
      continue
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Максимум 10MB на файл')
      continue
    }

    const url = await uploadImage(file)
    if (url) {
      if (isNew.value) {
        newProductPictures.value.push(url)
      } else {
        await store.addPictures(productId.value, [url])
      }
    }
  }
}

function handleInputChange(event: Event) {
  const input = event.target as HTMLInputElement
  handleFiles(input.files)
  input.value = ''
}

function handleDrop(event: DragEvent) {
  dragOver.value = false
  handleFiles(event.dataTransfer?.files || null)
}

function removeNewPicture(index: number) {
  newProductPictures.value.splice(index, 1)
}

async function handleDeletePicture(pictureId: string) {
  if (confirm('Видалити це фото?')) {
    await store.deletePicture(productId.value, pictureId)
  }
}

function getThumbnail(url: string) {
  return getOptimizedUrl(url, { width: 200, height: 200 })
}

// --- Form Submit ---
// --- Form Submit ---
async function handleSubmit() {
  console.log('🚀 ========== SUBMIT START ==========')

  if (!form.product_name || !form.price || !form.sub_category_id) {
    alert('Заповніть обов\'язкові поля: назва, ціна, підкатегорія')
    return
  }

  // Фільтруємо пусті параметри
  const validParameters = parameters.value.filter(p => p.name.trim() && p.value.trim())

  let success = false

  if (isNew.value) {
    const payload = {
      product_name: form.product_name,
      brand: form.brand || '',
      price: form.price,
      sale_price: form.sale_price || '0',
      discount: form.discount || 0,  // <-- Якщо пусто - ставимо 0
      available: form.available || 'true',
      bestseller: form.bestseller || 'false',
      sale: form.sale || 'false',
      sub_category_id: form.sub_category_id,
      product_description: form.product_description || '',
      pictures: newProductPictures.value,
      parameters: validParameters
    }

    console.log('🚀 CREATE payload:', JSON.stringify(payload, null, 2))

    success = await store.createProduct(payload as any)
  } else {
    const payload = {
      product_name: form.product_name,
      brand: form.brand || '',
      price: form.price,
      sale_price: form.sale_price || '0',
      discount: form.discount || 0,  // <-- Якщо пусто - ставимо 0
      available: form.available || 'true',
      bestseller: form.bestseller || 'false',
      sale: form.sale || 'false',
      sub_category_id: form.sub_category_id,
      product_description: form.product_description || '',
      parameters: validParameters
    }

    console.log('🚀 UPDATE payload:', JSON.stringify(payload, null, 2))

    success = await store.updateProduct(productId.value, payload as any)
  }

  console.log('🚀 Result:', success)

  if (success) {
    router.push('/admin/products')
  }
}


// --- Lifecycle ---
onMounted(async () => {
  console.log('🔄 Component mounted')
  await categoryStore.fetchActive()
})

onUnmounted(() => {
  store.clearCurrent()
})
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-6">
      <button
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        @click="router.push('/admin/products')"
      >
        <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
      </button>
      <div>
        <h1 class="text-2xl font-bold text-gray-800">
          {{ isNew ? 'Новий товар' : 'Редагування товару' }}
        </h1>
        <p v-if="!isNew && store.currentProduct" class="text-sm text-gray-500">
          ID: {{ store.currentProduct.product_id }}
        </p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.loading && !isNew" class="animate-pulse space-y-4">
      <div class="h-10 bg-gray-200 rounded" />
      <div class="h-10 bg-gray-200 rounded" />
      <div class="h-32 bg-gray-200 rounded" />
    </div>

    <!-- Form -->
    <form v-else class="space-y-6" @submit.prevent="handleSubmit">

      <!-- Basic Info -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Основна інформація</h2>

        <div class="grid gap-4">
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Назва товару <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.product_name"
              type="text"
              required
              placeholder="Введіть назву товару"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
          </div>

          <!-- Brand -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Бренд
            </label>
            <input
              v-model="form.brand"
              type="text"
              placeholder="Наприклад: Bosch, Makita"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
          </div>

          <!-- Category -->
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Категорія <span class="text-red-500">*</span>
              </label>
              <BSelect
                v-model="selectedCategory"
                :options="[{ value: '', label: 'Оберіть категорію' }, ...categoryOptions]"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Підкатегорія <span class="text-red-500">*</span>
              </label>
              <BSelect
                v-model="form.sub_category_id"
                :options="[{ value: '', label: 'Оберіть підкатегорію' }, ...subcategoryOptions]"
                :disabled="!selectedCategory"
              />
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Опис товару
            </label>
            <textarea
              v-model="form.product_description"
              rows="4"
              placeholder="Детальний опис товару..."
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
            />
          </div>
        </div>
      </div>

      <!-- Price -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Ціна та знижка</h2>

        <div class="grid sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Ціна (грн) <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.price"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="0.00"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              @input="calculateSalePrice"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Знижка (%)
            </label>
            <input
              v-model.number="form.discount"
              type="number"
              min="0"
              max="99"
              placeholder="0"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              @input="calculateSalePrice"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Ціна зі знижкою
            </label>
            <input
              :value="form.sale_price"
              type="text"
              readonly
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
            >
          </div>
        </div>
      </div>

      <!-- Status -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Статус товару</h2>

        <div class="flex flex-wrap gap-6">
          <label class="flex items-center gap-3 cursor-pointer group">
            <input
              v-model="form.available"
              type="checkbox"
              true-value="true"
              false-value="false"
              class="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
            >
            <span class="text-gray-700 group-hover:text-gray-900">✅ В наявності</span>
          </label>

          <label class="flex items-center gap-3 cursor-pointer group">
            <input
              v-model="form.sale"
              type="checkbox"
              true-value="true"
              false-value="false"
              class="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
            >
            <span class="text-gray-700 group-hover:text-gray-900">🔥 Акція</span>
          </label>

          <label class="flex items-center gap-3 cursor-pointer group">
            <input
              v-model="form.bestseller"
              type="checkbox"
              true-value="true"
              false-value="false"
              class="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            >
            <span class="text-gray-700 group-hover:text-gray-900">⭐ Хіт продажів</span>
          </label>
        </div>
      </div>

      <!-- Pictures -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Фотографії</h2>

        <!-- Hidden file input -->
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          multiple
          hidden
          @change="handleInputChange"
        >

        <!-- Drop zone -->
        <div
          class="border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer mb-4"
          :class="[
            dragOver ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50',
            uploading ? 'pointer-events-none opacity-60' : ''
          ]"
          @click="openFilePicker"
          @dragover.prevent="dragOver = true"
          @dragleave="dragOver = false"
          @drop.prevent="handleDrop"
        >
          <div v-if="uploading" class="space-y-3">
            <div class="w-10 h-10 mx-auto border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p class="text-sm text-gray-600">Завантаження... {{ progress }}%</p>
          </div>

          <div v-else>
            <UIcon name="i-heroicons-cloud-arrow-up" class="w-10 h-10 mx-auto text-gray-400 mb-2" />
            <p class="text-sm text-gray-600">
              <span class="text-green-600 font-medium">Натисніть</span> або перетягніть фото
            </p>
            <p class="text-xs text-gray-400 mt-1">PNG, JPG, WebP до 10MB</p>
          </div>
        </div>

        <!-- Upload error -->
        <p v-if="uploadError" class="text-sm text-red-500 mb-4">{{ uploadError }}</p>

        <!-- NEW product pictures preview -->
        <div v-if="isNew && newProductPictures.length > 0" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            v-for="(url, index) in newProductPictures"
            :key="url"
            class="relative group aspect-square"
          >
            <img
              :src="getThumbnail(url)"
              class="w-full h-full object-cover rounded-lg border border-gray-200"
            >
            <button
              type="button"
              class="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              @click.stop="removeNewPicture(index)"
            >
              <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
            </button>
            <span
              v-if="index === 0"
              class="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded"
            >
              Головне
            </span>
          </div>
        </div>

        <!-- EXISTING product pictures -->
        <div v-if="!isNew && store.currentProduct?.pictures?.length" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            v-for="(pic, index) in store.currentProduct.pictures"
            :key="pic.id"
            class="relative group aspect-square"
          >
            <img
              :src="getThumbnail(pic.pictures_name)"
              class="w-full h-full object-cover rounded-lg border border-gray-200"
            >
            <button
              type="button"
              class="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              @click.stop="handleDeletePicture(pic.id!)"
            >
              <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
            </button>
            <span
              v-if="index === 0"
              class="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded"
            >
              Головне
            </span>
          </div>
        </div>

        <!-- Empty state -->
        <p
          v-if="(isNew && newProductPictures.length === 0) || (!isNew && !store.currentProduct?.pictures?.length)"
          class="text-gray-400 text-center text-sm mt-4"
        >
          Фото ще не додані
        </p>
      </div>

      <!-- Parameters (Характеристики) -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Характеристики</h2>
          <button
            type="button"
            class="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium"
            @click="addParameter"
          >
            <UIcon name="i-heroicons-plus" class="w-4 h-4" />
            Додати
          </button>
        </div>

        <!-- Parameters list -->
        <div v-if="parameters.length > 0" class="space-y-3">
          <div
            v-for="(param, index) in parameters"
            :key="index"
            class="flex gap-3 items-start"
          >
            <div class="flex-1">
              <input
                v-model="param.name"
                type="text"
                placeholder="Назва (напр. Потужність)"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
            </div>
            <div class="flex-1">
              <input
                v-model="param.value"
                type="text"
                placeholder="Значення (напр. 1200 Вт)"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
            </div>
            <button
              type="button"
              class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              @click="removeParameter(index)"
            >
              <UIcon name="i-heroicons-trash" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="text-center py-6 text-gray-400">
          <UIcon name="i-heroicons-list-bullet" class="w-8 h-8 mx-auto mb-2" />
          <p class="text-sm">Характеристики не додані</p>
          <button
            type="button"
            class="mt-2 text-sm text-green-600 hover:text-green-700"
            @click="addParameter"
          >
            + Додати першу
          </button>
        </div>

        <!-- Quick add templates -->
        <div v-if="parameters.length > 0 || true" class="mt-4 pt-4 border-t border-gray-100">
          <p class="text-xs text-gray-500 mb-2">Швидке додавання:</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="template in paramTemplates"
              :key="template"
              type="button"
              class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              @click="addParameterFromTemplate(template)"
            >
              + {{ template }}
            </button>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-if="store.error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center gap-2">
        <UIcon name="i-heroicons-exclamation-circle" class="w-5 h-5 flex-shrink-0" />
        {{ store.error }}
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-4 pt-4">
        <BBtn
          type="button"
          variant="secondary"
          @click="router.push('/admin/products')"
        >
          Скасувати
        </BBtn>
        <BBtn
          type="submit"
          variant="primary"
          :loading="store.saving"
          icon="i-heroicons-check"
        >
          {{ isNew ? 'Створити товар' : 'Зберегти зміни' }}
        </BBtn>
      </div>
    </form>
  </div>
</template>

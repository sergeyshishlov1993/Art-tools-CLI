<!--<script setup lang="ts">-->
<!--import { useAdminProductStore } from '~/models/admin/AdminProductStore'-->
<!--import { useCategoryStore } from '~/models/category/CategoryStore'-->
<!--import { useImageUpload } from '~/models/common/composables/useImageUpload'-->
<!--import { ADMIN_ROUTES } from '~/models/common/constants/routes'-->
<!--import type { CreateProductData, UpdateProductData } from '~/models/admin/AdminProductAPI'-->
<!--import BBtn from '~/models/common/components/ui/BBtn.vue'-->
<!--import BSelect from '~/models/common/components/ui/BSelect.vue'-->
<!--import ConfirmModal from '~/models/common/components/ui/ConfirmModal.vue'-->

<!--definePageMeta({-->
<!--  layout: 'admin'-->
<!--})-->

<!--const route = useRoute()-->
<!--const router = useRouter()-->
<!--const store = useAdminProductStore()-->
<!--const categoryStore = useCategoryStore()-->
<!--const { uploadImage, uploading, error: uploadError, progress, getOptimizedUrl } = useImageUpload()-->

<!--interface Parameter {-->
<!--  name: string-->
<!--  value: string-->
<!--}-->

<!--interface ProductForm {-->
<!--  product_name: string-->
<!--  brand: string-->
<!--  price: string-->
<!--  sale_price: string-->
<!--  discount: number-->
<!--  available: string-->
<!--  bestseller: string-->
<!--  sale: string-->
<!--  sub_category_id: string-->
<!--  product_description: string-->
<!--}-->

<!--const isNew = computed(() => route.params.id === 'new')-->
<!--const productId = computed(() => route.params.id as string)-->

<!--const form = reactive<ProductForm>({-->
<!--  product_name: '',-->
<!--  brand: '',-->
<!--  price: '',-->
<!--  sale_price: '0',-->
<!--  discount: 0,-->
<!--  available: 'true',-->
<!--  bestseller: 'false',-->
<!--  sale: 'false',-->
<!--  sub_category_id: '',-->
<!--  product_description: ''-->
<!--})-->

<!--const selectedCategory = ref('')-->
<!--const newProductPictures = ref<string[]>([])-->
<!--const fileInput = ref<HTMLInputElement | null>(null)-->
<!--const dragOver = ref(false)-->
<!--const parameters = ref<Parameter[]>([])-->

<!--// Delete picture modal-->
<!--const showDeletePictureModal = ref(false)-->
<!--const pictureToDelete = ref<string | null>(null)-->
<!--const deletingPicture = ref(false)-->

<!--const paramTemplates = [-->
<!--  'Потужність',-->
<!--  'Напруга',-->
<!--  'Вага',-->
<!--  'Розмір',-->
<!--  'Матеріал',-->
<!--  'Колір',-->
<!--  'Гарантія',-->
<!--  'Країна виробник'-->
<!--]-->

<!--const categoryOptions = computed(() =>-->
<!--  categoryStore.categories.map(c => ({ value: c.id, label: c.name }))-->
<!--)-->

<!--const subcategoryOptions = computed(() => {-->
<!--  if (!selectedCategory.value) return []-->
<!--  return categoryStore.getSubcategories(selectedCategory.value)-->
<!--    .map(s => ({ value: s.id, label: s.name }))-->
<!--})-->

<!--watch(selectedCategory, (_, oldVal) => {-->
<!--  if (oldVal) {-->
<!--    form.sub_category_id = ''-->
<!--  }-->
<!--})-->

<!--watch(productId, async (id) => {-->
<!--  if (id && id !== 'new') {-->
<!--    await store.fetchProduct(id)-->

<!--    if (store.currentProduct) {-->
<!--      const p = store.currentProduct-->

<!--      form.product_name = p.product_name-->
<!--      form.brand = p.brand-->
<!--      form.price = p.price-->
<!--      form.sale_price = p.sale_price-->
<!--      form.discount = p.discount-->
<!--      form.available = p.available-->
<!--      form.bestseller = p.bestseller-->
<!--      form.sale = p.sale-->
<!--      form.sub_category_id = p.sub_category_id-->
<!--      form.product_description = p.product_description || ''-->

<!--      if (p.subCategory?.category?.id) {-->
<!--        selectedCategory.value = p.subCategory.category.id-->
<!--      }-->

<!--      parameters.value = (p.params || []).map(param => ({-->
<!--        name: param.parameter_name,-->
<!--        value: param.parameter_value-->
<!--      }))-->
<!--    }-->
<!--  } else {-->
<!--    resetForm()-->
<!--  }-->
<!--}, { immediate: true })-->

<!--function resetForm() {-->
<!--  form.product_name = ''-->
<!--  form.brand = ''-->
<!--  form.price = ''-->
<!--  form.sale_price = '0'-->
<!--  form.discount = 0-->
<!--  form.available = 'true'-->
<!--  form.bestseller = 'false'-->
<!--  form.sale = 'false'-->
<!--  form.sub_category_id = ''-->
<!--  form.product_description = ''-->
<!--  selectedCategory.value = ''-->
<!--  newProductPictures.value = []-->
<!--  parameters.value = []-->
<!--}-->

<!--function addParameter() {-->
<!--  parameters.value.push({ name: '', value: '' })-->
<!--}-->

<!--function removeParameter(index: number) {-->
<!--  parameters.value.splice(index, 1)-->
<!--}-->

<!--function addParameterFromTemplate(template: string) {-->
<!--  parameters.value.push({ name: template, value: '' })-->
<!--}-->

<!--function calculateSalePrice() {-->
<!--  const discount = form.discount || 0-->
<!--  const price = parseFloat(form.price) || 0-->

<!--  if (discount > 0 && price > 0) {-->
<!--    const salePrice = price - (price * discount / 100)-->
<!--    form.sale_price = salePrice.toFixed(2)-->
<!--  } else {-->
<!--    form.sale_price = '0'-->
<!--  }-->
<!--}-->

<!--function openFilePicker() {-->
<!--  fileInput.value?.click()-->
<!--}-->

<!--async function handleFiles(files: FileList | null) {-->
<!--  if (!files) return-->

<!--  for (const file of Array.from(files)) {-->
<!--    if (!file.type.startsWith('image/')) continue-->
<!--    if (file.size > 10 * 1024 * 1024) continue-->

<!--    const url = await uploadImage(file)-->
<!--    if (url) {-->
<!--      if (isNew.value) {-->
<!--        newProductPictures.value.push(url)-->
<!--      } else {-->
<!--        await store.addPictures(productId.value, [url])-->
<!--      }-->
<!--    }-->
<!--  }-->
<!--}-->

<!--function handleInputChange(event: Event) {-->
<!--  const input = event.target as HTMLInputElement-->
<!--  handleFiles(input.files)-->
<!--  input.value = ''-->
<!--}-->

<!--function handleDrop(event: DragEvent) {-->
<!--  dragOver.value = false-->
<!--  handleFiles(event.dataTransfer?.files || null)-->
<!--}-->

<!--function removeNewPicture(index: number) {-->
<!--  newProductPictures.value.splice(index, 1)-->
<!--}-->

<!--function openDeletePictureModal(pictureId: string) {-->
<!--  pictureToDelete.value = pictureId-->
<!--  showDeletePictureModal.value = true-->
<!--}-->

<!--async function confirmDeletePicture() {-->
<!--  if (!pictureToDelete.value) return-->

<!--  deletingPicture.value = true-->
<!--  const success = await store.deletePicture(productId.value, pictureToDelete.value)-->
<!--  deletingPicture.value = false-->

<!--  if (success) {-->
<!--    showDeletePictureModal.value = false-->
<!--    pictureToDelete.value = null-->
<!--  }-->
<!--}-->

<!--function getThumbnail(url: string) {-->
<!--  return getOptimizedUrl(url, { width: 200, height: 200 })-->
<!--}-->

<!--function getValidParameters() {-->
<!--  return parameters.value.filter(p => p.name.trim() && p.value.trim())-->
<!--}-->

<!--async function handleSubmit() {-->
<!--  if (!form.product_name || !form.price || !form.sub_category_id) {-->
<!--    alert('Заповніть обов\'язкові поля: назва, ціна, підкатегорія')-->
<!--    return-->
<!--  }-->

<!--  const validParameters = getValidParameters()-->
<!--  let success = false-->

<!--  if (isNew.value) {-->
<!--    const payload: CreateProductData = {-->
<!--      product_name: form.product_name,-->
<!--      brand: form.brand || undefined,-->
<!--      price: form.price,-->
<!--      sale_price: form.sale_price || '0',-->
<!--      discount: form.discount || 0,-->
<!--      available: form.available || 'true',-->
<!--      bestseller: form.bestseller || 'false',-->
<!--      sale: form.sale || 'false',-->
<!--      sub_category_id: form.sub_category_id,-->
<!--      product_description: form.product_description || undefined,-->
<!--      pictures: newProductPictures.value.length > 0 ? newProductPictures.value : undefined,-->
<!--      parameters: validParameters.length > 0 ? validParameters : undefined-->
<!--    }-->

<!--    success = await store.createProduct(payload)-->
<!--  } else {-->
<!--    const payload: UpdateProductData = {-->
<!--      product_name: form.product_name,-->
<!--      brand: form.brand || undefined,-->
<!--      price: form.price,-->
<!--      sale_price: form.sale_price || '0',-->
<!--      discount: form.discount || 0,-->
<!--      available: form.available || 'true',-->
<!--      bestseller: form.bestseller || 'false',-->
<!--      sale: form.sale || 'false',-->
<!--      sub_category_id: form.sub_category_id,-->
<!--      product_description: form.product_description || undefined,-->
<!--      parameters: validParameters.length > 0 ? validParameters : undefined-->
<!--    }-->

<!--    success = await store.updateProduct(productId.value, payload)-->
<!--  }-->

<!--  if (success) {-->
<!--    router.push(ADMIN_ROUTES.PRODUCTS)-->
<!--  }-->
<!--}-->

<!--function goBack() {-->
<!--  router.push(ADMIN_ROUTES.PRODUCTS)-->
<!--}-->

<!--onMounted(async () => {-->
<!--  await categoryStore.fetchActive()-->
<!--})-->

<!--onUnmounted(() => {-->
<!--  store.clearCurrent()-->
<!--})-->
<!--</script>-->

<!--<template>-->
<!--  <div class="p-6 max-w-4xl mx-auto">-->
<!--    <div class="flex items-center gap-4 mb-6">-->
<!--      <button-->
<!--        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"-->
<!--        @click="goBack"-->
<!--      >-->
<!--        <UIcon name="heroicons-arrow-left" class="w-5 h-5" />-->
<!--      </button>-->
<!--      <div>-->
<!--        <h1 class="text-2xl font-bold text-gray-800">-->
<!--          {{ isNew ? 'Новий товар' : 'Редагування товару' }}-->
<!--        </h1>-->
<!--        <p v-if="!isNew && store.currentProduct" class="text-sm text-gray-500">-->
<!--          ID: {{ store.currentProduct.product_id }}-->
<!--        </p>-->
<!--      </div>-->
<!--    </div>-->

<!--    <div v-if="store.loading && !isNew" class="animate-pulse space-y-4">-->
<!--      <div class="h-10 bg-gray-200 rounded" />-->
<!--      <div class="h-10 bg-gray-200 rounded" />-->
<!--      <div class="h-32 bg-gray-200 rounded" />-->
<!--    </div>-->

<!--    <form v-else class="space-y-6" @submit.prevent="handleSubmit">-->
<!--      <div class="bg-white rounded-xl border border-gray-200 p-6">-->
<!--        <h2 class="text-lg font-semibold text-gray-800 mb-4">Основна інформація</h2>-->

<!--        <div class="grid gap-4">-->
<!--          <div>-->
<!--            <label class="block text-sm font-medium text-gray-700 mb-1">-->
<!--              Назва товару <span class="text-red-500">*</span>-->
<!--            </label>-->
<!--            <input-->
<!--              v-model="form.product_name"-->
<!--              type="text"-->
<!--              required-->
<!--              placeholder="Введіть назву товару"-->
<!--              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"-->
<!--            >-->
<!--          </div>-->

<!--          <div>-->
<!--            <label class="block text-sm font-medium text-gray-700 mb-1">Бренд</label>-->
<!--            <input-->
<!--              v-model="form.brand"-->
<!--              type="text"-->
<!--              placeholder="Наприклад: Bosch, Makita"-->
<!--              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"-->
<!--            >-->
<!--          </div>-->

<!--          <div class="grid sm:grid-cols-2 gap-4">-->
<!--            <div>-->
<!--              <label class="block text-sm font-medium text-gray-700 mb-1">-->
<!--                Категорія <span class="text-red-500">*</span>-->
<!--              </label>-->
<!--              <BSelect-->
<!--                v-model="selectedCategory"-->
<!--                :options="[{ value: '', label: 'Оберіть категорію' }, ...categoryOptions]"-->
<!--              />-->
<!--            </div>-->
<!--            <div>-->
<!--              <label class="block text-sm font-medium text-gray-700 mb-1">-->
<!--                Підкатегорія <span class="text-red-500">*</span>-->
<!--              </label>-->
<!--              <BSelect-->
<!--                v-model="form.sub_category_id"-->
<!--                :options="[{ value: '', label: 'Оберіть підкатегорію' }, ...subcategoryOptions]"-->
<!--                :disabled="!selectedCategory"-->
<!--              />-->
<!--            </div>-->
<!--          </div>-->

<!--          <div>-->
<!--            <label class="block text-sm font-medium text-gray-700 mb-1">Опис товару</label>-->
<!--            <textarea-->
<!--              v-model="form.product_description"-->
<!--              rows="4"-->
<!--              placeholder="Детальний опис товару..."-->
<!--              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"-->
<!--            />-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->

<!--      <div class="bg-white rounded-xl border border-gray-200 p-6">-->
<!--        <h2 class="text-lg font-semibold text-gray-800 mb-4">Ціна та знижка</h2>-->

<!--        <div class="grid sm:grid-cols-3 gap-4">-->
<!--          <div>-->
<!--            <label class="block text-sm font-medium text-gray-700 mb-1">-->
<!--              Ціна (грн) <span class="text-red-500">*</span>-->
<!--            </label>-->
<!--            <input-->
<!--              v-model="form.price"-->
<!--              type="number"-->
<!--              step="0.01"-->
<!--              min="0"-->
<!--              required-->
<!--              placeholder="0.00"-->
<!--              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"-->
<!--              @input="calculateSalePrice"-->
<!--            >-->
<!--          </div>-->
<!--          <div>-->
<!--            <label class="block text-sm font-medium text-gray-700 mb-1">Знижка (%)</label>-->
<!--            <input-->
<!--              v-model.number="form.discount"-->
<!--              type="number"-->
<!--              min="0"-->
<!--              max="99"-->
<!--              placeholder="0"-->
<!--              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"-->
<!--              @input="calculateSalePrice"-->
<!--            >-->
<!--          </div>-->
<!--          <div>-->
<!--            <label class="block text-sm font-medium text-gray-700 mb-1">Ціна зі знижкою</label>-->
<!--            <input-->
<!--              :value="form.sale_price"-->
<!--              type="text"-->
<!--              readonly-->
<!--              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"-->
<!--            >-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->

<!--      <div class="bg-white rounded-xl border border-gray-200 p-6">-->
<!--        <h2 class="text-lg font-semibold text-gray-800 mb-4">Статус товару</h2>-->

<!--        <div class="flex flex-wrap gap-6">-->
<!--          <label class="flex items-center gap-3 cursor-pointer group">-->
<!--            <input-->
<!--              v-model="form.available"-->
<!--              type="checkbox"-->
<!--              true-value="true"-->
<!--              false-value="false"-->
<!--              class="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"-->
<!--            >-->
<!--            <span class="text-gray-700 group-hover:text-gray-900">✅ В наявності</span>-->
<!--          </label>-->

<!--          <label class="flex items-center gap-3 cursor-pointer group">-->
<!--            <input-->
<!--              v-model="form.sale"-->
<!--              type="checkbox"-->
<!--              true-value="true"-->
<!--              false-value="false"-->
<!--              class="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"-->
<!--            >-->
<!--            <span class="text-gray-700 group-hover:text-gray-900">🔥 Акція</span>-->
<!--          </label>-->

<!--          <label class="flex items-center gap-3 cursor-pointer group">-->
<!--            <input-->
<!--              v-model="form.bestseller"-->
<!--              type="checkbox"-->
<!--              true-value="true"-->
<!--              false-value="false"-->
<!--              class="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"-->
<!--            >-->
<!--            <span class="text-gray-700 group-hover:text-gray-900">⭐ Хіт продажів</span>-->
<!--          </label>-->
<!--        </div>-->
<!--      </div>-->

<!--      <div class="bg-white rounded-xl border border-gray-200 p-6">-->
<!--        <h2 class="text-lg font-semibold text-gray-800 mb-4">Фотографії</h2>-->

<!--        <input-->
<!--          ref="fileInput"-->
<!--          type="file"-->
<!--          accept="image/*"-->
<!--          multiple-->
<!--          hidden-->
<!--          @change="handleInputChange"-->
<!--        >-->

<!--        <div-->
<!--          class="border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer mb-4"-->
<!--          :class="[-->
<!--            dragOver ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50',-->
<!--            uploading ? 'pointer-events-none opacity-60' : ''-->
<!--          ]"-->
<!--          @click="openFilePicker"-->
<!--          @dragover.prevent="dragOver = true"-->
<!--          @dragleave="dragOver = false"-->
<!--          @drop.prevent="handleDrop"-->
<!--        >-->
<!--          <div v-if="uploading" class="space-y-3">-->
<!--            <div class="w-10 h-10 mx-auto border-4 border-green-500 border-t-transparent rounded-full animate-spin" />-->
<!--            <p class="text-sm text-gray-600">Завантаження... {{ progress }}%</p>-->
<!--          </div>-->

<!--          <div v-else>-->
<!--            <UIcon name="heroicons-cloud-arrow-up" class="w-10 h-10 mx-auto text-gray-400 mb-2" />-->
<!--            <p class="text-sm text-gray-600">-->
<!--              <span class="text-green-600 font-medium">Натисніть</span> або перетягніть фото-->
<!--            </p>-->
<!--            <p class="text-xs text-gray-400 mt-1">PNG, JPG, WebP до 10MB</p>-->
<!--          </div>-->
<!--        </div>-->

<!--        <p v-if="uploadError" class="text-sm text-red-500 mb-4">{{ uploadError }}</p>-->

<!--        &lt;!&ndash; NEW product pictures &ndash;&gt;-->
<!--        <div v-if="isNew && newProductPictures.length > 0" class="grid grid-cols-2 sm:grid-cols-4 gap-3">-->
<!--          <div-->
<!--            v-for="(url, index) in newProductPictures"-->
<!--            :key="url"-->
<!--            class="relative group aspect-square"-->
<!--          >-->
<!--            <img-->
<!--              :src="getThumbnail(url)"-->
<!--              class="w-full h-full object-cover rounded-lg border border-gray-200"-->
<!--            >-->
<!--            <button-->
<!--              type="button"-->
<!--              class="absolute top-1.5 right-1.5 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"-->
<!--              @click.stop="removeNewPicture(index)"-->
<!--            >-->
<!--              <UIcon name="heroicons-x-mark" class="w-4 h-4" />-->
<!--            </button>-->
<!--            <span-->
<!--              v-if="index === 0"-->
<!--              class="absolute bottom-1.5 left-1.5 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium"-->
<!--            >-->
<!--              Головне-->
<!--            </span>-->
<!--          </div>-->
<!--        </div>-->

<!--        &lt;!&ndash; EXISTING product pictures &ndash;&gt;-->
<!--        <div v-if="!isNew && store.currentProduct?.pictures?.length" class="grid grid-cols-2 sm:grid-cols-4 gap-3">-->
<!--          <div-->
<!--            v-for="(pic, index) in store.currentProduct.pictures"-->
<!--            :key="pic.id || pic.pictures_name"-->
<!--            class="relative group aspect-square"-->
<!--          >-->
<!--            <img-->
<!--              :src="getThumbnail(pic.pictures_name)"-->
<!--              class="w-full h-full object-cover rounded-lg border border-gray-200"-->
<!--            >-->
<!--            <button-->
<!--              v-if="pic.id"-->
<!--              type="button"-->
<!--              class="absolute top-1.5 right-1.5 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"-->
<!--              @click.stop="openDeletePictureModal(pic.id)"-->
<!--            >-->
<!--              <UIcon name="heroicons-x-mark" class="w-4 h-4" />-->
<!--            </button>-->
<!--            <span-->
<!--              v-if="index === 0"-->
<!--              class="absolute bottom-1.5 left-1.5 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium"-->
<!--            >-->
<!--              Головне-->
<!--            </span>-->
<!--          </div>-->
<!--        </div>-->

<!--        <p-->
<!--          v-if="(isNew && newProductPictures.length === 0) || (!isNew && !store.currentProduct?.pictures?.length)"-->
<!--          class="text-gray-400 text-center text-sm mt-4"-->
<!--        >-->
<!--          Фото ще не додані-->
<!--        </p>-->
<!--      </div>-->

<!--      <div class="bg-white rounded-xl border border-gray-200 p-6">-->
<!--        <div class="flex items-center justify-between mb-4">-->
<!--          <h2 class="text-lg font-semibold text-gray-800">Характеристики</h2>-->
<!--          <button-->
<!--            type="button"-->
<!--            class="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium"-->
<!--            @click="addParameter"-->
<!--          >-->
<!--            <UIcon name="heroicons-plus" class="w-4 h-4" />-->
<!--            Додати-->
<!--          </button>-->
<!--        </div>-->

<!--        <div v-if="parameters.length > 0" class="space-y-3">-->
<!--          <div-->
<!--            v-for="(param, index) in parameters"-->
<!--            :key="index"-->
<!--            class="flex gap-3 items-start"-->
<!--          >-->
<!--            <div class="flex-1">-->
<!--              <input-->
<!--                v-model="param.name"-->
<!--                type="text"-->
<!--                placeholder="Назва (напр. Потужність)"-->
<!--                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"-->
<!--              >-->
<!--            </div>-->
<!--            <div class="flex-1">-->
<!--              <input-->
<!--                v-model="param.value"-->
<!--                type="text"-->
<!--                placeholder="Значення (напр. 1200 Вт)"-->
<!--                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"-->
<!--              >-->
<!--            </div>-->
<!--            <button-->
<!--              type="button"-->
<!--              class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"-->
<!--              @click="removeParameter(index)"-->
<!--            >-->
<!--              <UIcon name="heroicons-trash" class="w-4 h-4" />-->
<!--            </button>-->
<!--          </div>-->
<!--        </div>-->

<!--        <div v-else class="text-center py-6 text-gray-400">-->
<!--          <UIcon name="heroicons-list-bullet" class="w-8 h-8 mx-auto mb-2" />-->
<!--          <p class="text-sm">Характеристики не додані</p>-->
<!--          <button-->
<!--            type="button"-->
<!--            class="mt-2 text-sm text-green-600 hover:text-green-700"-->
<!--            @click="addParameter"-->
<!--          >-->
<!--            + Додати першу-->
<!--          </button>-->
<!--        </div>-->

<!--        <div class="mt-4 pt-4 border-t border-gray-100">-->
<!--          <p class="text-xs text-gray-500 mb-2">Швидке додавання:</p>-->
<!--          <div class="flex flex-wrap gap-2">-->
<!--            <button-->
<!--              v-for="template in paramTemplates"-->
<!--              :key="template"-->
<!--              type="button"-->
<!--              class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"-->
<!--              @click="addParameterFromTemplate(template)"-->
<!--            >-->
<!--              + {{ template }}-->
<!--            </button>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->

<!--      <div v-if="store.error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center gap-2">-->
<!--        <UIcon name="heroicons-exclamation-circle" class="w-5 h-5 flex-shrink-0" />-->
<!--        {{ store.error }}-->
<!--      </div>-->

<!--      <div class="flex items-center gap-4 pt-4">-->
<!--        <BBtn type="button" variant="secondary" @click="goBack">-->
<!--          Скасувати-->
<!--        </BBtn>-->
<!--        <BBtn-->
<!--          type="submit"-->
<!--          variant="primary"-->
<!--          :loading="store.saving"-->
<!--          icon="heroicons-check"-->
<!--        >-->
<!--          {{ isNew ? 'Створити товар' : 'Зберегти зміни' }}-->
<!--        </BBtn>-->
<!--      </div>-->
<!--    </form>-->

<!--    &lt;!&ndash; Delete Picture Modal &ndash;&gt;-->
<!--    <ConfirmModal-->
<!--      v-model="showDeletePictureModal"-->
<!--      title="Видалити фото?"-->
<!--      message="Це фото буде видалено безповоротно. Продовжити?"-->
<!--      icon="🗑️"-->
<!--      confirm-text="Видалити"-->
<!--      confirm-color="danger"-->
<!--      :loading="deletingPicture"-->
<!--      @confirm="confirmDeletePicture"-->
<!--    />-->
<!--  </div>-->
<!--</template>-->

<script setup lang="ts">
import { useAdminProductStore } from '~/models/admin/AdminProductStore'
import { useCategoryStore } from '~/models/category/CategoryStore'
import { useImageUpload } from '~/models/common/composables/useImageUpload'
import { ADMIN_ROUTES } from '~/models/common/constants/routes'
import type { CreateProductData, UpdateProductData } from '~/models/admin/AdminProductAPI'
import BBtn from '~/models/common/components/ui/BBtn.vue'
import BSelect from '~/models/common/components/ui/BSelect.vue'
import ConfirmModal from '~/models/common/components/ui/ConfirmModal.vue'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const store = useAdminProductStore()
const categoryStore = useCategoryStore()
const { uploadImage, uploading, error: uploadError, progress, getOptimizedUrl } = useImageUpload()

interface Parameter {
  name: string
  value: string
}

interface ProductForm {
  product_name: string
  brand: string
  price: string
  sale_price: string
  discount: number
  available: string
  bestseller: string
  sale: string
  sub_category_id: string
  product_description: string
}

const isNew = computed(() => route.params.id === 'new')
const productId = computed(() => route.params.id as string)

const form = reactive<ProductForm>({
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

const selectedCategory = ref('')
const newProductPictures = ref<string[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)
const parameters = ref<Parameter[]>([])

const showDeletePictureModal = ref(false)
const pictureToDelete = ref<string | null>(null)
const deletingPicture = ref(false)

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

const categoryOptions = computed(() =>
  categoryStore.categories.map(c => ({ value: c.id, label: c.name }))
)

const subcategoryOptions = computed(() => {
  if (!selectedCategory.value) return []
  return categoryStore.getSubcategories(selectedCategory.value)
    .map(s => ({ value: s.id, label: s.name }))
})

watch(selectedCategory, (_, oldVal) => {
  if (oldVal) {
    form.sub_category_id = ''
  }
})

watch(productId, async (id) => {
  if (id && id !== 'new') {
    await store.fetchProduct(id)

    if (store.currentProduct) {
      const p = store.currentProduct

      form.product_name = p.product_name
      form.brand = p.brand
      form.price = p.price
      form.sale_price = p.sale_price
      form.discount = p.discount
      form.available = p.available
      form.bestseller = p.bestseller
      form.sale = p.sale
      form.sub_category_id = p.sub_category_id
      form.product_description = p.product_description || ''

      if (p.subCategory?.category?.id) {
        selectedCategory.value = p.subCategory.category.id
      }

      parameters.value = (p.params || []).map(param => ({
        name: param.parameter_name,
        value: param.parameter_value
      }))
    }
  } else {
    resetForm()
  }
}, { immediate: true })

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

function addParameter() {
  parameters.value.push({ name: '', value: '' })
}

function removeParameter(index: number) {
  parameters.value.splice(index, 1)
}

function addParameterFromTemplate(template: string) {
  parameters.value.push({ name: template, value: '' })
}

function calculateDiscount() {
  const price = parseFloat(form.price) || 0
  const salePrice = parseFloat(form.sale_price) || 0

  if (price > 0 && salePrice > 0 && salePrice < price) {
    form.discount = Math.round((1 - salePrice / price) * 100)
  } else {
    form.discount = 0
  }
}

function calculateSalePrice() {
  const discount = form.discount || 0
  const price = parseFloat(form.price) || 0

  if (discount > 0 && price > 0) {
    form.sale_price = Math.round(price - (price * discount / 100)).toString()
  } else {
    form.sale_price = '0'
  }
}

function openFilePicker() {
  fileInput.value?.click()
}

async function handleFiles(files: FileList | null) {
  if (!files) return

  for (const file of Array.from(files)) {
    if (!file.type.startsWith('image/')) continue
    if (file.size > 10 * 1024 * 1024) continue

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

function openDeletePictureModal(pictureId: string) {
  pictureToDelete.value = pictureId
  showDeletePictureModal.value = true
}

async function confirmDeletePicture() {
  if (!pictureToDelete.value) return

  deletingPicture.value = true
  const success = await store.deletePicture(productId.value, pictureToDelete.value)
  deletingPicture.value = false

  if (success) {
    showDeletePictureModal.value = false
    pictureToDelete.value = null
  }
}

function getThumbnail(url: string) {
  return getOptimizedUrl(url, { width: 200, height: 200 })
}

function getValidParameters() {
  return parameters.value.filter(p => p.name.trim() && p.value.trim())
}

async function handleSubmit() {
  if (!form.product_name || !form.price || !form.sub_category_id) {
    alert('Заповніть обов\'язкові поля: назва, ціна, підкатегорія')
    return
  }

  const validParameters = getValidParameters()
  let success = false

  if (isNew.value) {
    const payload: CreateProductData = {
      product_name: form.product_name,
      brand: form.brand || undefined,
      price: form.price,
      sale_price: form.sale_price || '0',
      discount: form.discount || 0,
      available: form.available || 'true',
      bestseller: form.bestseller || 'false',
      sale: form.sale || 'false',
      sub_category_id: form.sub_category_id,
      product_description: form.product_description || undefined,
      pictures: newProductPictures.value.length > 0 ? newProductPictures.value : undefined,
      parameters: validParameters.length > 0 ? validParameters : undefined
    }

    success = await store.createProduct(payload)
  } else {
    const payload: UpdateProductData = {
      product_name: form.product_name,
      brand: form.brand || undefined,
      price: form.price,
      sale_price: form.sale_price || '0',
      discount: form.discount || 0,
      available: form.available || 'true',
      bestseller: form.bestseller || 'false',
      sale: form.sale || 'false',
      sub_category_id: form.sub_category_id,
      product_description: form.product_description || undefined,
      parameters: validParameters.length > 0 ? validParameters : undefined
    }

    success = await store.updateProduct(productId.value, payload)
  }

  if (success) {
    router.push(ADMIN_ROUTES.PRODUCTS)
  }
}

function goBack() {
  router.push(ADMIN_ROUTES.PRODUCTS)
}

onMounted(async () => {
  await categoryStore.fetchActive()
})

onUnmounted(() => {
  store.clearCurrent()
})
</script>
<template>
  <div class="p-6 max-w-4xl mx-auto">
    <div class="flex items-center gap-4 mb-6">
      <button
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        @click="goBack"
      >
        <UIcon name="heroicons-arrow-left" class="w-5 h-5" />
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

    <div v-if="store.loading && !isNew" class="animate-pulse space-y-4">
      <div class="h-10 bg-gray-200 rounded" />
      <div class="h-10 bg-gray-200 rounded" />
      <div class="h-32 bg-gray-200 rounded" />
    </div>

    <form v-else class="space-y-6" @submit.prevent="handleSubmit">
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Основна інформація</h2>

        <div class="grid gap-4">
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

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Бренд</label>
            <input
              v-model="form.brand"
              type="text"
              placeholder="Наприклад: Bosch, Makita"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
          </div>

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

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Опис товару</label>
            <textarea
              v-model="form.product_description"
              rows="4"
              placeholder="Детальний опис товару..."
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
            />
          </div>
        </div>
      </div>

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
              @input="calculateDiscount"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ціна зі знижкою (грн)</label>
            <input
              v-model="form.sale_price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              @input="calculateDiscount"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Знижка</label>
            <div class="flex items-center gap-2">
              <input
                v-model.number="form.discount"
                type="number"
                min="0"
                max="99"
                placeholder="0"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                @input="calculateSalePrice"
              >
              <span class="text-gray-500 font-medium">%</span>
            </div>
          </div>
        </div>
      </div>

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

      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Фотографії</h2>

        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          multiple
          hidden
          @change="handleInputChange"
        >

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
            <UIcon name="heroicons-cloud-arrow-up" class="w-10 h-10 mx-auto text-gray-400 mb-2" />
            <p class="text-sm text-gray-600">
              <span class="text-green-600 font-medium">Натисніть</span> або перетягніть фото
            </p>
            <p class="text-xs text-gray-400 mt-1">PNG, JPG, WebP до 10MB</p>
          </div>
        </div>

        <p v-if="uploadError" class="text-sm text-red-500 mb-4">{{ uploadError }}</p>

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
              class="absolute top-1.5 right-1.5 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
              @click.stop="removeNewPicture(index)"
            >
              <UIcon name="heroicons-x-mark" class="w-4 h-4" />
            </button>
            <span
              v-if="index === 0"
              class="absolute bottom-1.5 left-1.5 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium"
            >
              Головне
            </span>
          </div>
        </div>

        <div v-if="!isNew && store.currentProduct?.pictures?.length" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            v-for="(pic, index) in store.currentProduct.pictures"
            :key="pic.id || pic.pictures_name"
            class="relative group aspect-square"
          >
            <img
              :src="getThumbnail(pic.pictures_name)"
              class="w-full h-full object-cover rounded-lg border border-gray-200"
            >
            <button
              v-if="pic.id"
              type="button"
              class="absolute top-1.5 right-1.5 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
              @click.stop="openDeletePictureModal(pic.id)"
            >
              <UIcon name="heroicons-x-mark" class="w-4 h-4" />
            </button>
            <span
              v-if="index === 0"
              class="absolute bottom-1.5 left-1.5 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium"
            >
              Головне
            </span>
          </div>
        </div>

        <p
          v-if="(isNew && newProductPictures.length === 0) || (!isNew && !store.currentProduct?.pictures?.length)"
          class="text-gray-400 text-center text-sm mt-4"
        >
          Фото ще не додані
        </p>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Характеристики</h2>
          <button
            type="button"
            class="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium"
            @click="addParameter"
          >
            <UIcon name="heroicons-plus" class="w-4 h-4" />
            Додати
          </button>
        </div>

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
              <UIcon name="heroicons-trash" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div v-else class="text-center py-6 text-gray-400">
          <UIcon name="heroicons-list-bullet" class="w-8 h-8 mx-auto mb-2" />
          <p class="text-sm">Характеристики не додані</p>
          <button
            type="button"
            class="mt-2 text-sm text-green-600 hover:text-green-700"
            @click="addParameter"
          >
            + Додати першу
          </button>
        </div>

        <div class="mt-4 pt-4 border-t border-gray-100">
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

      <div v-if="store.error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center gap-2">
        <UIcon name="heroicons-exclamation-circle" class="w-5 h-5 flex-shrink-0" />
        {{ store.error }}
      </div>

      <div class="flex items-center gap-4 pt-4">
        <BBtn type="button" variant="secondary" @click="goBack">
          Скасувати
        </BBtn>
        <BBtn
          type="submit"
          variant="primary"
          :loading="store.saving"
          icon="heroicons-check"
        >
          {{ isNew ? 'Створити товар' : 'Зберегти зміни' }}
        </BBtn>
      </div>
    </form>

    <ConfirmModal
      v-model="showDeletePictureModal"
      title="Видалити фото?"
      message="Це фото буде видалено безповоротно. Продовжити?"
      icon="🗑️"
      confirm-text="Видалити"
      confirm-color="danger"
      :loading="deletingPicture"
      @confirm="confirmDeletePicture"
    />
  </div>
</template>
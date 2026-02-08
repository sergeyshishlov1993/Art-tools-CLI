<script setup lang="ts">
import type { Filters } from '~/models/filters/types/Filter'
import BCheckbox from '~/models/common/components/ui/BCheckbox.vue'
import BInput from '~/models/common/components/ui/BInput.vue'

interface Props {
  filters: Filters | null
  loading?: boolean
  selectedCategory?: string
  selectedBrands?: string[]
  selectedSubcategories?: string[]
  selectedParams?: Record<string, string[]>
  selectedSpecial?: { sale: boolean; bestseller: boolean; discount: boolean }
  selectedPrice?: { min: number | null; max: number | null }
  showHeader?: boolean
  showSubcategories?: boolean
  showCategories?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  selectedCategory: '',
  selectedBrands: () => [],
  selectedSubcategories: () => [],
  selectedParams: () => ({}),
  selectedSpecial: () => ({ sale: false, bestseller: false, discount: false }),
  selectedPrice: () => ({ min: null, max: null }),
  showHeader: true,
  showSubcategories: true,
  showCategories: false
})

const emit = defineEmits<{
  'update:selectedCategory': [value: string]
  'update:selectedBrands': [value: string[]]
  'update:selectedSubcategories': [value: string[]]
  'update:selectedParams': [value: Record<string, string[]>]
  'update:selectedSpecial': [value: { sale: boolean; bestseller: boolean; discount: boolean }]
  'update:selectedPrice': [value: { min: number | null; max: number | null }]
  'clear': []
}>()

function formatPrice(price: number | undefined | null): string {
  if (price === undefined || price === null) return '0'
  return Math.round(price).toLocaleString('uk-UA')
}

const expandedSections = ref<Record<string, boolean>>({
  special: true,
  categories: true,
  subcategories: true,
  price: true,
  brands: true
})

const brandSearch = ref('')
const showAllBrands = ref(false)
const showAllCategories = ref(false)
const showAllSubcategories = ref(false)
const showAllAttributes = ref<Record<string, boolean>>({})

const filteredBrands = computed(() => {
  if (!props.filters?.brands) return []
  if (!brandSearch.value) return props.filters.brands
  return props.filters.brands.filter(b =>
    b.name.toLowerCase().includes(brandSearch.value.toLowerCase())
  )
})

const visibleBrands = computed(() => {
  if (showAllBrands.value) return filteredBrands.value
  return filteredBrands.value.slice(0, 5)
})

const visibleCategories = computed(() => {
  if (!props.filters?.categories) return []
  if (showAllCategories.value) return props.filters.categories
  return props.filters.categories.slice(0, 5)
})

const visibleSubcategories = computed(() => {
  if (!props.filters?.subcategories) return []
  if (showAllSubcategories.value) return props.filters.subcategories
  return props.filters.subcategories.slice(0, 5)
})

function getVisibleValues(attr: { slug: string; values: { slug: string; name: string; count: number }[] }) {
  if (showAllAttributes.value[attr.slug]) return attr.values
  return attr.values.slice(0, 5)
}

function toggleSection(section: string) {
  expandedSections.value[section] = !expandedSections.value[section]
}

function toggleCategory(categorySlug: string) {
  if (props.selectedCategory === categorySlug) {
    emit('update:selectedCategory', '')
  } else {
    emit('update:selectedCategory', categorySlug)
  }
}

function toggleParam(attrSlug: string, valueSlug: string) {
  const current = { ...props.selectedParams }
  if (!current[attrSlug]) {
    current[attrSlug] = []
  }

  const idx = current[attrSlug].indexOf(valueSlug)
  if (idx === -1) {
    current[attrSlug] = [...current[attrSlug], valueSlug]
  } else {
    current[attrSlug] = current[attrSlug].filter(v => v !== valueSlug)
    if (current[attrSlug].length === 0) {
      delete current[attrSlug]
    }
  }

  emit('update:selectedParams', current)
}

function isParamSelected(attrSlug: string, valueSlug: string): boolean {
  return props.selectedParams[attrSlug]?.includes(valueSlug) || false
}

// === Ціна з blur + debounce ===
const localPriceMin = ref<string | number>('')
const localPriceMax = ref<string | number>('')
let priceDebounceTimer: ReturnType<typeof setTimeout> | null = null

watch(() => props.selectedPrice, (val) => {
  localPriceMin.value = val.min ?? ''
  localPriceMax.value = val.max ?? ''
}, { immediate: true })

function emitPrice() {
  if (priceDebounceTimer) {
    clearTimeout(priceDebounceTimer)
    priceDebounceTimer = null
  }

  emit('update:selectedPrice', {
    min: localPriceMin.value === '' ? null : Number(localPriceMin.value),
    max: localPriceMax.value === '' ? null : Number(localPriceMax.value)
  })
}

function onPriceInput() {
  if (priceDebounceTimer) {
    clearTimeout(priceDebounceTimer)
  }
  priceDebounceTimer = setTimeout(() => {
    emitPrice()
  }, 1000)
}

function onPriceBlur() {
  emitPrice()
}

onUnmounted(() => {
  if (priceDebounceTimer) {
    clearTimeout(priceDebounceTimer)
  }
})

function updateSpecial(key: 'sale' | 'bestseller' | 'discount', value: boolean) {
  emit('update:selectedSpecial', { ...props.selectedSpecial, [key]: value })
}

const hasActiveFilters = computed(() => {
  return props.selectedCategory !== '' ||
      props.selectedBrands.length > 0 ||
      props.selectedSubcategories.length > 0 ||
      Object.keys(props.selectedParams).length > 0 ||
      props.selectedSpecial.sale ||
      props.selectedSpecial.bestseller ||
      props.selectedSpecial.discount ||
      props.selectedPrice.min !== null ||
      props.selectedPrice.max !== null
})

const shouldShowCategories = computed(() => {
  return props.showCategories &&
      props.filters?.categories &&
      props.filters.categories.length > 0
})

const shouldShowSubcategories = computed(() => {
  return props.showSubcategories &&
      props.filters?.subcategories &&
      props.filters.subcategories.length > 1
})
</script>

<template>
  <div class="w-full bg-white rounded-lg border border-gray-200 relative">
    <!-- Заголовок -->
    <div
      v-if="showHeader"
      class="flex items-center justify-between p-4 border-b border-gray-200"
    >
      <h3 class="font-bold text-gray-800">Фільтри</h3>
      <Transition name="fade">
        <button
          v-if="hasActiveFilters"
          class="text-sm text-red-500 hover:text-red-600 transition-colors"
          @click="emit('clear')"
        >
          Очистити
        </button>
      </Transition>
    </div>

    <!-- Content wrapper з overlay -->
    <div class="relative">
      <!-- Контент фільтрів -->
      <div
        class="transition-opacity duration-200"
        :class="{ 'opacity-40 pointer-events-none': loading }"
      >
        <template v-if="filters">
          <div class="divide-y divide-gray-200">
            <!-- Спеціальні пропозиції -->
            <div
              v-if="filters.special && (filters.special.sale > 0 || filters.special.bestseller > 0)"
              class="p-4"
            >
              <button
                class="flex items-center justify-between w-full text-left group"
                @click="toggleSection('special')"
              >
                <span class="font-medium text-gray-800 group-hover:text-green-600 transition-colors">
                  Спеціальні пропозиції
                </span>
                <UIcon
                  name="i-heroicons-chevron-down"
                  class="w-5 h-5 text-gray-400 transition-transform duration-300"
                  :class="{ 'rotate-180': expandedSections.special }"
                />
              </button>

              <Transition name="expand">
                <div v-if="expandedSections.special" class="mt-3 space-y-2 flex flex-col items-start">
                  <BCheckbox
                    v-if="filters.special.sale > 0"
                    :model-value="selectedSpecial.sale"
                    :count="filters.special.sale"
                    @update:model-value="updateSpecial('sale', $event as boolean)"
                  >
                    <span class="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">АКЦІЯ</span>
                  </BCheckbox>

                  <BCheckbox
                    v-if="filters.special.bestseller > 0"
                    :model-value="selectedSpecial.bestseller"
                    :count="filters.special.bestseller"
                    @update:model-value="updateSpecial('bestseller', $event as boolean)"
                  >
                    <span class="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded">ХІТ</span>
                  </BCheckbox>
                </div>
              </Transition>
            </div>

            <!-- Категорії -->
            <div v-if="shouldShowCategories" class="p-4">
              <button
                class="flex items-center justify-between w-full text-left group"
                @click="toggleSection('categories')"
              >
                <span class="font-medium text-gray-800 group-hover:text-green-600 transition-colors">
                  Категорія
                </span>
                <UIcon
                  name="i-heroicons-chevron-down"
                  class="w-5 h-5 text-gray-400 transition-transform duration-300"
                  :class="{ 'rotate-180': expandedSections.categories }"
                />
              </button>

              <Transition name="expand">
                <div v-if="expandedSections.categories" class="mt-3 space-y-2">
                  <div class="space-y-2 flex flex-col items-start">
                    <BCheckbox
                      v-for="cat in visibleCategories"
                      :key="cat.slug"
                      :model-value="selectedCategory === cat.slug"
                      :label="cat.name"
                      :count="cat.count"
                      @update:model-value="toggleCategory(cat.slug)"
                    />
                  </div>

                  <button
                    v-if="filters.categories && filters.categories.length > 5"
                    class="text-sm text-green-600 hover:text-green-700 transition-colors flex items-center gap-1 mt-2"
                    @click.stop="showAllCategories = !showAllCategories"
                  >
                    <span>{{ showAllCategories ? 'Згорнути' : `Показати всі (${filters.categories.length})` }}</span>
                    <UIcon
                      name="i-heroicons-chevron-down"
                      class="w-4 h-4 transition-transform duration-300"
                      :class="{ 'rotate-180': showAllCategories }"
                    />
                  </button>
                </div>
              </Transition>
            </div>

            <!-- Підкатегорії -->
            <div v-if="shouldShowSubcategories" class="p-4">
              <button
                class="flex items-center justify-between w-full text-left group"
                @click="toggleSection('subcategories')"
              >
                <span class="font-medium text-gray-800 group-hover:text-green-600 transition-colors">
                  Підкатегорія
                </span>
                <UIcon
                  name="i-heroicons-chevron-down"
                  class="w-5 h-5 text-gray-400 transition-transform duration-300"
                  :class="{ 'rotate-180': expandedSections.subcategories }"
                />
              </button>

              <Transition name="expand">
                <div v-if="expandedSections.subcategories" class="mt-3 space-y-2">
                  <div class="space-y-2 flex flex-col items-start">
                    <BCheckbox
                      v-for="subcat in visibleSubcategories"
                      :key="subcat.slug"
                      :model-value="selectedSubcategories"
                      :value="subcat.slug"
                      :label="subcat.name"
                      :count="subcat.count"
                      @update:model-value="emit('update:selectedSubcategories', $event as string[])"
                    />
                  </div>

                  <button
                    v-if="filters.subcategories && filters.subcategories.length > 5"
                    class="text-sm text-green-600 hover:text-green-700 transition-colors flex items-center gap-1 mt-2"
                    @click.stop="showAllSubcategories = !showAllSubcategories"
                  >
                    <span>{{ showAllSubcategories ? 'Згорнути' : `Показати всі (${filters.subcategories.length})` }}</span>
                    <UIcon
                      name="i-heroicons-chevron-down"
                      class="w-4 h-4 transition-transform duration-300"
                      :class="{ 'rotate-180': showAllSubcategories }"
                    />
                  </button>
                </div>
              </Transition>
            </div>

            <!-- Ціна -->
            <div v-if="filters.price" class="p-4">
              <button
                class="flex items-center justify-between w-full text-left group"
                @click="toggleSection('price')"
              >
                <span class="font-medium text-gray-800 group-hover:text-green-600 transition-colors">
                  Ціна, грн
                </span>
                <UIcon
                  name="i-heroicons-chevron-down"
                  class="w-5 h-5 text-gray-400 transition-transform duration-300"
                  :class="{ 'rotate-180': expandedSections.price }"
                />
              </button>

              <Transition name="expand">
                <div v-if="expandedSections.price" class="mt-3">
                  <p class="text-xs text-gray-400 mb-2">
                    {{ formatPrice(filters.price.min) }} — {{ formatPrice(filters.price.max) }} грн
                  </p>
                  <div class="flex items-center gap-2">
                    <BInput
                      v-model="localPriceMin"
                      type="number"
                      :placeholder="formatPrice(filters.price.min)"
                      size="sm"
                      @input="onPriceInput"
                      @blur="onPriceBlur"
                    />
                    <span class="text-gray-400">—</span>
                    <BInput
                      v-model="localPriceMax"
                      type="number"
                      :placeholder="formatPrice(filters.price.max)"
                      size="sm"
                      @input="onPriceInput"
                      @blur="onPriceBlur"
                    />
                  </div>
                </div>
              </Transition>
            </div>

            <!-- Бренди -->
            <div v-if="filters.brands && filters.brands.length > 0" class="p-4">
              <button
                class="flex items-center justify-between w-full text-left group"
                @click="toggleSection('brands')"
              >
                <span class="font-medium text-gray-800 group-hover:text-green-600 transition-colors">
                  Бренд
                </span>
                <UIcon
                  name="i-heroicons-chevron-down"
                  class="w-5 h-5 text-gray-400 transition-transform duration-300"
                  :class="{ 'rotate-180': expandedSections.brands }"
                />
              </button>

              <Transition name="expand">
                <div v-if="expandedSections.brands" class="mt-3 space-y-3">
                  <BInput
                    v-if="filters.brands.length > 5"
                    v-model="brandSearch"
                    type="search"
                    placeholder="Пошук бренду..."
                    icon="i-heroicons-magnifying-glass"
                    size="sm"
                  />

                  <div class="space-y-2 flex flex-col items-start">
                    <BCheckbox
                      v-for="brand in visibleBrands"
                      :key="brand.name"
                      :model-value="selectedBrands"
                      :value="brand.name"
                      :label="brand.name"
                      :count="brand.count"
                      @update:model-value="emit('update:selectedBrands', $event as string[])"
                    />
                  </div>

                  <button
                    v-if="filteredBrands.length > 5"
                    class="text-sm text-green-600 hover:text-green-700 transition-colors flex items-center gap-1"
                    @click.stop="showAllBrands = !showAllBrands"
                  >
                    <span>{{ showAllBrands ? 'Згорнути' : `Показати всі (${filteredBrands.length})` }}</span>
                    <UIcon
                      name="i-heroicons-chevron-down"
                      class="w-4 h-4 transition-transform duration-300"
                      :class="{ 'rotate-180': showAllBrands }"
                    />
                  </button>
                </div>
              </Transition>
            </div>

            <!-- Атрибути -->
            <div
              v-for="attr in filters.attributes"
              :key="attr.slug"
              class="p-4"
            >
              <button
                class="flex items-center justify-between w-full text-left group"
                @click="toggleSection(attr.slug)"
              >
                <span class="font-medium text-gray-800 group-hover:text-green-600 transition-colors">
                  {{ attr.name }}
                </span>
                <UIcon
                  name="i-heroicons-chevron-down"
                  class="w-5 h-5 text-gray-400 transition-transform duration-300"
                  :class="{ 'rotate-180': expandedSections[attr.slug] }"
                />
              </button>

              <Transition name="expand">
                <div v-if="expandedSections[attr.slug]" class="mt-3 space-y-2">
                  <div class="space-y-2 flex flex-col items-start">
                    <BCheckbox
                      v-for="val in getVisibleValues(attr)"
                      :key="val.slug"
                      :model-value="isParamSelected(attr.slug, val.slug)"
                      :label="val.name"
                      :count="val.count"
                      @update:model-value="toggleParam(attr.slug, val.slug)"
                    />
                  </div>

                  <button
                    v-if="attr.values.length > 5"
                    class="text-sm text-green-600 hover:text-green-700 transition-colors flex items-center gap-1"
                    @click.stop="showAllAttributes[attr.slug] = !showAllAttributes[attr.slug]"
                  >
                    <span>{{ showAllAttributes[attr.slug] ? 'Згорнути' : `Показати всі (${attr.values.length})` }}</span>
                    <UIcon
                      name="i-heroicons-chevron-down"
                      class="w-4 h-4 transition-transform duration-300"
                      :class="{ 'rotate-180': showAllAttributes[attr.slug] }"
                    />
                  </button>
                </div>
              </Transition>
            </div>
          </div>
        </template>

        <!-- Empty state -->
        <div v-else-if="!loading" class="p-8 text-center text-gray-500 text-sm">
          Фільтри недоступні
        </div>

        <!-- Placeholder для початкового завантаження -->
        <div v-else class="p-8" />
      </div>

      <!-- Loading overlay -->
      <Transition name="fade">
        <div
          v-if="loading"
          class="absolute inset-0 flex items-center justify-center"
        >
          <div class="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-lg shadow-sm">
            <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 text-green-500 animate-spin" />
            <span class="text-sm text-gray-600">Оновлення...</span>
          </div>
        </div>
      </Transition>
    </div>
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

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 500px;
  margin-top: 0.75rem;
}
</style>

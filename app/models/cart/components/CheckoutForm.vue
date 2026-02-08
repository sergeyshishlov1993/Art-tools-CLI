<script setup lang="ts">
import { reactive, ref, watch, computed } from 'vue'
import { useCartStore } from '../CartStore'
import type { NovaPoshtaCity, NovaPoshtaWarehouse } from '../types'
import BInput from '~/models/common/components/ui/BInput.vue'
import BAutocomplete from '~/models/common/components/ui/BAutocomplete.vue'

const props = defineProps<{ modelValue: any }>()
const emit = defineEmits(['update:modelValue'])
const cartStore = useCartStore()

const formData = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  city: '',
  cityRef: '',
  deliveryType: 'nova_poshta',
  warehouse: '',
  address: '',
  paymentMethod: 'Накладений платіж'
})

// State
const cities = ref<NovaPoshtaCity[]>([])
const warehouses = ref<NovaPoshtaWarehouse[]>([])
const loadingCities = ref(false)
const loadingWarehouses = ref(false)

// 20 Popular Cities
const popularCities = [
  'Київ', 'Харків', 'Одеса', 'Дніпро', 'Запоріжжя',
  'Львів', 'Кривий Ріг', 'Миколаїв', 'Вінниця', 'Полтава',
  'Чернігів', 'Черкаси', 'Хмельницький', 'Житомир', 'Чернівці',
  'Суми', 'Рівне', 'Івано-Франківськ', 'Тернопіль', 'Луцьк'
]

watch(formData, (val) => emit('update:modelValue', val), { deep: true })

// --- City Logic ---

async function onSearchCity(query: string) {
  if (!query) return
  loadingCities.value = true
  try {
    cities.value = await cartStore.searchCities(query)
  } finally {
    loadingCities.value = false
  }
}

async function onSelectCity(city: NovaPoshtaCity) {
  formData.city = city.Description
  formData.cityRef = city.Ref
  formData.warehouse = ''
  warehouses.value = []
  await fetchWarehouses('')
}

async function selectPopularCity(cityName: string) {
  formData.city = cityName
  loadingCities.value = true

  try {
    const results = await cartStore.searchCities(cityName)
    if (results.length > 0) {
      const bestMatch = results[0]
      formData.cityRef = bestMatch.Ref
      formData.warehouse = ''
      await fetchWarehouses('')
    }
  } finally {
    loadingCities.value = false
  }
}

// --- Warehouse Logic ---

async function fetchWarehouses(query: string) {
  if (!formData.cityRef) return

  loadingWarehouses.value = true
  try {
    warehouses.value = await cartStore.getWarehouses(formData.cityRef, query)
  } finally {
    loadingWarehouses.value = false
  }
}

function onSearchWarehouse(query: string) {
  fetchWarehouses(query)
}

function onSelectWarehouse(wh: NovaPoshtaWarehouse) {
  formData.warehouse = wh.Description
}

const paymentOptions = [
  { value: 'На карту', label: 'Оплата на карту' },
  { value: 'Накладений платіж', label: 'Накладений платіж (при отриманні)' },
  { value: 'Безготівковий розрахунок', label: 'Безготівковий розрахунок' },
]
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white p-6 rounded-xl border border-gray-200">
      <h2 class="text-lg font-bold text-gray-800 mb-4">Контактні дані</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BInput
          v-model="formData.firstName"
          label="Ім'я"
          placeholder="Введіть ім'я"
          required
        />
        <BInput
          v-model="formData.lastName"
          label="Прізвище"
          placeholder="Введіть прізвище"
          required
        />
        <BInput
          v-model="formData.phone"
          label="Телефон"
          type="tel"
          placeholder="+38 (0__) ___-__-__"
          required
          mask="phone"
        />
      </div>
    </div>

    <div class="bg-white p-6 rounded-xl border border-gray-200">
      <h2 class="text-lg font-bold text-gray-800 mb-4">Доставка</h2>

      <div class="flex gap-4 mb-4">
        <label class="flex items-center gap-2 cursor-pointer">
          <input v-model="formData.deliveryType" type="radio" value="nova_poshta" class="text-green-500 focus:ring-green-500">
          <span>Нова Пошта (відділення)</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input v-model="formData.deliveryType" type="radio" value="courier" class="text-green-500 focus:ring-green-500">
          <span>Кур'єр</span>
        </label>
      </div>

      <div class="space-y-4">
        <div>
          <BAutocomplete
            v-model="formData.city"
            label="Місто"
            placeholder="Почніть вводити назву міста..."
            :items="cities"
            :loading="loadingCities"
            display-key="Description"
            required
            @search="onSearchCity"
            @select="onSelectCity"
          />

          <div class="mt-3 flex flex-wrap gap-2">
            <button
              v-for="city in popularCities"
              :key="city"
              type="button"
              class="px-3 py-1 text-xs font-medium rounded-full transition-colors border"
              :class="formData.city === city
                ? 'bg-green-100 text-green-700 border-green-200'
                : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100'"
              @click="selectPopularCity(city)"
            >
              {{ city }}
            </button>
          </div>
        </div>

        <div v-if="formData.deliveryType === 'nova_poshta'">
          <BAutocomplete
            v-model="formData.warehouse"
            label="Відділення"
            placeholder="Введіть номер або адресу..."
            :items="warehouses"
            :loading="loadingWarehouses"
            display-key="Description"
            required
            :disabled="!formData.cityRef"
            @search="onSearchWarehouse"
            @select="onSelectWarehouse"
          />
          <p v-if="!formData.cityRef" class="text-xs text-gray-400 mt-1">Спочатку оберіть місто</p>
        </div>

        <div v-if="formData.deliveryType === 'courier'">
          <BInput
            v-model="formData.address"
            label="Адреса доставки"
            placeholder="Вулиця, будинок, квартира"
            required
          />
        </div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-xl border border-gray-200">
      <h2 class="text-lg font-bold text-gray-800 mb-4">Оплата</h2>
      <div class="space-y-2">
        <label
          v-for="option in paymentOptions"
          :key="option.value"
          class="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors"
          :class="formData.paymentMethod === option.value ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'"
        >
          <input v-model="formData.paymentMethod" type="radio" :value="option.value" class="text-green-500 focus:ring-green-500">
          <span class="text-sm font-medium text-gray-700">{{ option.label }}</span>
        </label>
      </div>
    </div>
  </div>
</template>
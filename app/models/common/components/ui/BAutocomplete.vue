<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import BInput from './BInput.vue'

interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  loading?: boolean
  items: any[]
  displayKey?: string
  required?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  displayKey: 'Description',
  placeholder: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'select': [item: any]
  'search': [query: string]
}>()

const isOpen = ref(false)
const searchTimeout = ref<any>(null)
const container = ref<HTMLElement | null>(null)

watch(() => props.items, (newItems) => {
  if (newItems.length > 0) {
    isOpen.value = true
  }
})

function onInput(val: string | number) {
  const query = String(val)
  emit('update:modelValue', query)

  clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => {
    if (query.length >= 2) {
      emit('search', query)
      isOpen.value = true
    } else {
      isOpen.value = false
    }
  }, 400)
}

function selectItem(item: any) {
  const val = item[props.displayKey] || ''
  emit('update:modelValue', val)
  emit('select', item)
  isOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', (e) => {
    if (container.value && !container.value.contains(e.target as Node)) {
      isOpen.value = false
    }
  })
})
</script>

<template>
  <div ref="container" class="relative">
    <BInput
      :model-value="modelValue"
      :label="label"
      :placeholder="placeholder"
      :required="required"
      :error="error"
      autocomplete="off"
      @update:model-value="onInput"
      @focus="isOpen = items.length > 0"
    />

    <div v-if="loading" class="absolute right-3 top-[38px] pointer-events-none">
      <UIcon name="heroicons-arrow-path" class="w-5 h-5 animate-spin text-green-500" />
    </div>

    <Transition name="fade">
      <div
        v-if="isOpen && items.length > 0"
        class="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"
      >
        <ul class="py-1">
          <li
            v-for="(item, idx) in items"
            :key="idx"
            class="px-4 py-2.5 hover:bg-green-50 hover:text-green-700 cursor-pointer text-sm text-gray-700 transition-colors border-b border-gray-50 last:border-0"
            @click="selectItem(item)"
          >
            {{ item[displayKey] }}
          </li>
        </ul>
      </div>
    </Transition>

    <div
      v-if="isOpen && !loading && items.length === 0 && modelValue.length >= 2"
      class="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-sm p-3 text-sm text-gray-500 text-center"
    >
      Нічого не знайдено
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
</style>
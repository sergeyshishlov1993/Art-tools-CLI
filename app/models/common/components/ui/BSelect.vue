<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Option {
  value: string | number
  label: string
  disabled?: boolean
}

interface Props {
  modelValue?: string | number
  options: Option[]
  placeholder?: string
  label?: string
  hint?: string
  error?: string
  disabled?: boolean
  required?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  options: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'change': [value: string | number]
}>()

// Состояние открытия меню
const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)

// Находим выбранную опцию для отображения
const selectedOption = computed(() =>
  props.options.find(o => o.value === props.modelValue)
)

// Текст для отображения в инпуте
const displayValue = computed(() => {
  if (selectedOption.value) return selectedOption.value.label
  if (props.placeholder) return props.placeholder
  return ''
})

// Размеры
const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-4 py-3 text-base',
}

function toggle() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

function select(option: Option) {
  if (option.disabled) return
  emit('update:modelValue', option.value)
  emit('change', option.value)
  isOpen.value = false
}

// Закрытие при клике вне компонента
function handleClickOutside(event: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="containerRef" class="w-full">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1.5">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <div
        class="w-full border rounded-lg bg-white transition-all cursor-pointer flex items-center justify-between group"
        :class="[
          sizeClasses[size],
          error
            ? 'border-red-500 hover:border-red-600'
            : isOpen
              ? 'border-green-500 ring-2 ring-green-500/20'
              : 'border-gray-300 hover:border-green-400',
          disabled ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''
        ]"
        @click="toggle"
      >
        <span
          class="truncate select-none"
          :class="!selectedOption ? 'text-gray-500' : 'text-gray-900'"
        >
          {{ displayValue || '&nbsp;' }}
        </span>

        <UIcon
          name="i-heroicons-chevron-down"
          class="w-5 h-5 text-gray-400 transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
        />
      </div>

      <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div
          v-if="isOpen"
          class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto py-1 focus:outline-none"
        >
          <ul class="text-sm text-gray-700">
            <li
              v-for="option in options"
              :key="option.value"
              class="relative cursor-pointer select-none py-2.5 px-4 transition-colors flex items-center justify-between"
              :class="[
                option.disabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-green-50 hover:text-green-700',
                option.value === modelValue ? 'bg-green-50 text-green-700 font-medium' : ''
              ]"
              @click="select(option)"
            >
              <span class="block truncate">{{ option.label }}</span>

              <UIcon
                v-if="option.value === modelValue"
                name="i-heroicons-check"
                class="w-4 h-4 text-green-600"
              />
            </li>
          </ul>
        </div>
      </Transition>
    </div>

    <p v-if="error" class="mt-1.5 text-sm text-red-500">{{ error }}</p>
    <p v-else-if="hint" class="mt-1.5 text-sm text-gray-500">{{ hint }}</p>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  disabled?: boolean
  loading?: boolean
  icon?: string
  iconRight?: string
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  block: false,
  disabled: false,
  loading: false,
  type: 'button',
})

const variantClasses = computed(() => ({
  primary: 'bg-green-500 hover:bg-green-600 text-white border-transparent',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-transparent',
  outline: 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300 hover:border-green-500 hover:text-green-600',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent',
  danger: 'bg-red-500 hover:bg-red-600 text-white border-transparent',
}))

const sizeClasses = computed(() => ({
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
}))

const iconSizes = computed(() => ({
  sm: 'w-4 h-4',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
}))
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center font-medium rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[
      variantClasses[variant],
      sizeClasses[size],
      { 'w-full': block }
    ]"
  >
    <svg
      v-if="loading"
      class="animate-spin"
      :class="iconSizes[size]"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>

    <UIcon v-else-if="icon" :name="icon" :class="iconSizes[size]" />

    <span v-if="$slots.default">
      <slot />
    </span>

    <UIcon v-if="iconRight && !loading" :name="iconRight" :class="iconSizes[size]" />
  </button>
</template>
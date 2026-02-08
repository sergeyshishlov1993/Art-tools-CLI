<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  rounded?: boolean
  outline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  rounded: false,
  outline: false,
})

const variantClasses = computed(() => {
  if (props.outline) {
    return {
      primary: 'border border-green-500 text-green-600 bg-green-50',
      secondary: 'border border-gray-500 text-gray-600 bg-gray-50',
      success: 'border border-green-500 text-green-600 bg-green-50',
      danger: 'border border-red-500 text-red-600 bg-red-50',
      warning: 'border border-yellow-500 text-yellow-700 bg-yellow-50',
      info: 'border border-blue-500 text-blue-600 bg-blue-50',
    }[props.variant]
  }

  return {
    primary: 'bg-green-500 text-white',
    secondary: 'bg-gray-500 text-white',
    success: 'bg-green-500 text-white',
    danger: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white',
  }[props.variant]
})

const sizeClasses = computed(() => {
  return {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }[props.size]
})

const roundedClass = computed(() => {
  return props.rounded ? 'rounded-full' : 'rounded'
})
</script>

<template>
  <span
    class="inline-flex items-center font-semibold"
    :class="[variantClasses, sizeClasses, roundedClass]"
  >
    <slot />
  </span>
</template>
<script setup lang="ts">
type ModelValue = boolean | string[] | number[]

interface Props {
  modelValue?: ModelValue
  value?: string | number
  label?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
  size: 'md'
})

const emit = defineEmits<{
  'update:modelValue': [value: ModelValue]
}>()

const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.value !== undefined
      ? props.modelValue.some(v => String(v) === String(props.value))
      : false
  }
  return !!props.modelValue
})

function toggle() {
  if (props.disabled) return

  if (Array.isArray(props.modelValue)) {
    if (props.value === undefined) return

    const currentValue = props.value
    const isString = props.modelValue.length === 0 || typeof props.modelValue[0] === 'string'

    if (isString) {
      const arr = props.modelValue as string[]
      const strValue = String(currentValue)
      const idx = arr.findIndex(v => v === strValue)

      if (idx === -1) {
        emit('update:modelValue', [...arr, strValue])
      } else {
        emit('update:modelValue', arr.filter((_, i) => i !== idx))
      }
    } else {
      const arr = props.modelValue as number[]
      const numValue = Number(currentValue)
      const idx = arr.findIndex(v => v === numValue)

      if (idx === -1) {
        emit('update:modelValue', [...arr, numValue])
      } else {
        emit('update:modelValue', arr.filter((_, i) => i !== idx))
      }
    }
  } else {
    emit('update:modelValue', !props.modelValue)
  }
}

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'w-4 h-4'
    case 'lg': return 'w-6 h-6'
    default: return 'w-5 h-5'
  }
})

const labelSizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'text-xs'
    case 'lg': return 'text-base'
    default: return 'text-sm'
  }
})
</script>

<template>
  <label
    class="inline-flex items-center gap-2.5 cursor-pointer group select-none"
    :class="{ 'opacity-50 cursor-not-allowed': disabled }"
  >
    <input
      type="checkbox"
      :checked="isChecked"
      :disabled="disabled"
      class="sr-only"
      @change="toggle"
    >

    <div
      class="relative border-2 rounded transition-all duration-200 flex items-center justify-center flex-shrink-0"
      :class="[
        sizeClasses,
        isChecked
          ? 'bg-green-500 border-green-500'
          : 'bg-white border-gray-300 group-hover:border-green-400'
      ]"
    >
      <Transition name="check">
        <UIcon
          v-if="isChecked"
          name="i-heroicons-check-20-solid"
          class="text-white"
          :class="props.size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'"
        />
      </Transition>
    </div>

    <span
      v-if="label || $slots.default"
      class="text-gray-700 group-hover:text-gray-900 transition-colors"
      :class="labelSizeClasses"
    >
      <slot>{{ label }}</slot>
    </span>

    <span
      v-if="count !== undefined"
      class="text-xs text-gray-400 ml-auto"
    >
      {{ count }}
    </span>
  </label>
</template>

<style scoped>
.check-enter-active {
  animation: bounce-in 0.2s;
}
.check-leave-active {
  transition: opacity 0.1s;
}
.check-leave-to {
  opacity: 0;
}

@keyframes bounce-in {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
</style>
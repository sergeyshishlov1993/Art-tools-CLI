<script setup lang="ts">
import { ref,  nextTick, useId } from 'vue'

interface Props {
  modelValue?: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'search'
  placeholder?: string
  label?: string
  hint?: string
  error?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  icon?: string
  iconRight?: string
  size?: 'sm' | 'md' | 'lg'
  mask?: 'phone' | null
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'md',
  mask: null,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
}>()

const inputId = useId()
const isFocused = ref(false)

const phoneDigits = ref('')

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-4 py-3 text-base',
}

const iconPadding = {
  sm: 'pl-9',
  md: 'pl-10',
  lg: 'pl-11',
}

const iconRightPadding = {
  sm: 'pr-9',
  md: 'pr-10',
  lg: 'pr-11',
}

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-5 h-5',
}

const iconPositions = {
  sm: 'left-3',
  md: 'left-3',
  lg: 'left-4',
}


function formatPhoneFromDigits(digits: string): string {
  if (!digits) return ''


  let result = '+38 (0'

  if (digits.length <= 2) {
    result += digits
  } else if (digits.length <= 5) {
    result += digits.slice(0, 2) + ') ' + digits.slice(2)
  } else if (digits.length <= 7) {
    result += digits.slice(0, 2) + ') ' + digits.slice(2, 5) + '-' + digits.slice(5)
  } else {
    result += digits.slice(0, 2) + ') ' + digits.slice(2, 5) + '-' + digits.slice(5, 7) + '-' + digits.slice(7, 9)
  }

  return result
}

function extractDigitsFromFormatted(value: string): string {

  const clean = value.replace(/\D/g, '')


  if (clean.startsWith('380')) {
    return clean.slice(3, 12)
  }

  if (clean.startsWith('38')) {
    return clean.slice(2, 11)
  }

  if (clean.startsWith('0')) {
    return clean.slice(1, 10)
  }

  return clean.slice(0, 9)
}

function handlePhoneInput(event: Event) {
  const input = event.target as HTMLInputElement
  const inputEvent = event as InputEvent

  if (inputEvent.inputType === 'deleteContentBackward' || inputEvent.inputType === 'deleteContentForward') {
    if (phoneDigits.value.length > 0) {
      phoneDigits.value = phoneDigits.value.slice(0, -1)
    }
  } else if (inputEvent.inputType === 'insertFromPaste') {
    phoneDigits.value = extractDigitsFromFormatted(input.value)
  } else {
    const newChar = inputEvent.data
    if (newChar && /^\d$/.test(newChar) && phoneDigits.value.length < 9) {
      phoneDigits.value += newChar
    }
  }

  const formatted = phoneDigits.value ? formatPhoneFromDigits(phoneDigits.value) : ''
  emit('update:modelValue', formatted)

  nextTick(() => {
    const pos = formatted.length || 6
    input.setSelectionRange(pos, pos)
  })
}

function handlePhoneFocus(event: FocusEvent) {
  const input = event.target as HTMLInputElement
  isFocused.value = true

  if (!props.modelValue) {
    emit('update:modelValue', '+38 (0')
  }

  nextTick(() => {
    const len = input.value.length
    input.setSelectionRange(len, len)
  })

  emit('focus', event)
}

function handlePhoneBlur(event: FocusEvent) {
  isFocused.value = false

  if (props.modelValue === '+38 (0' || !phoneDigits.value) {
    emit('update:modelValue', '')
    phoneDigits.value = ''
  }

  emit('blur', event)
}

function handlePhoneKeydown(event: KeyboardEvent) {
  const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Enter']
  if (event.metaKey || event.ctrlKey) {
    return
  }

  if (allowed.includes(event.key)) {
    return
  }

  if (!/^\d$/.test(event.key)) {
    event.preventDefault()
    return
  }

  if (phoneDigits.value.length >= 9) {
    event.preventDefault()
  }
}

watch(() => props.modelValue, (newVal) => {
  if (newVal && typeof newVal === 'string') {
    const extracted = extractDigitsFromFormatted(newVal)
    if (extracted !== phoneDigits.value) {
      phoneDigits.value = extracted
    }
  } else if (!newVal) {
    phoneDigits.value = ''
  }
}, { immediate: true })

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}

function handleFocus(event: FocusEvent) {
  isFocused.value = true
  emit('focus', event)
}

function handleBlur(event: FocusEvent) {
  isFocused.value = false
  emit('blur', event)
}
</script>

<template>
  <div class="w-full">
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium text-gray-700 mb-1.5"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <div
        v-if="icon"
        class="absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        :class="iconPositions[size]"
      >
        <UIcon :name="icon" :class="iconSizes[size]" />
      </div>

      <input
        v-if="mask === 'phone'"
        :id="inputId"
        :value="modelValue"
        type="tel"
        inputmode="numeric"
        :placeholder="placeholder || '+38 (0__) ___-__-__'"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        class="w-full border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        :class="[
          sizeClasses[size],
          icon ? iconPadding[size] : '',
          iconRight ? iconRightPadding[size] : '',
          error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
        ]"
        @input="handlePhoneInput"
        @focus="handlePhoneFocus"
        @blur="handlePhoneBlur"
        @keydown="handlePhoneKeydown"
      >

      <input
        v-else
        :id="inputId"
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        class="w-full border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        :class="[
          sizeClasses[size],
          icon ? iconPadding[size] : '',
          iconRight ? iconRightPadding[size] : '',
          error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
        ]"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      >

      <div
        v-if="iconRight"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      >
        <UIcon :name="iconRight" :class="iconSizes[size]" />
      </div>
    </div>

    <p v-if="error" class="mt-1.5 text-sm text-red-500">{{ error }}</p>
    <p v-else-if="hint" class="mt-1.5 text-sm text-gray-500">{{ hint }}</p>
  </div>
</template>

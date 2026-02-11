<script setup lang="ts">
import { ref, watch } from 'vue'

interface AccordionItem {
  id: string
  title: string
  content?: string
}

interface Props {
  items: AccordionItem[]
  modelValue?: string | string[]
  multiple?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
}>()

const openItems = ref<Set<string>>(new Set())

watch(() => props.modelValue, (value) => {
  if (value) {
    if (Array.isArray(value)) {
      openItems.value = new Set(value)
    } else {
      openItems.value = new Set([value])
    }
  }
}, { immediate: true })

function toggleItem(id: string) {
  const newOpenItems = new Set(openItems.value)

  if (newOpenItems.has(id)) {
    newOpenItems.delete(id)
  } else {
    if (!props.multiple) {
      newOpenItems.clear()
    }
    newOpenItems.add(id)
  }

  openItems.value = newOpenItems

  const value = props.multiple
    ? Array.from(newOpenItems)
    : Array.from(newOpenItems)[0] || ''

  emit('update:modelValue', value)
}

function isOpen(id: string): boolean {
  return openItems.value.has(id)
}

function onBeforeEnter(el: Element) {
  const element = el as HTMLElement
  element.style.height = '0'
  element.style.opacity = '0'
}

function onEnter(el: Element, done: () => void) {
  const element = el as HTMLElement
  element.style.transition = 'height 0.3s ease, opacity 0.3s ease'
  element.style.height = element.scrollHeight + 'px'
  element.style.opacity = '1'
  setTimeout(() => {
    element.style.height = 'auto'
    done()
  }, 300)
}

function onBeforeLeave(el: Element) {
  const element = el as HTMLElement
  element.style.height = element.scrollHeight + 'px'
  element.style.opacity = '1'
}

function onLeave(el: Element, done: () => void) {
  const element = el as HTMLElement
  element.style.transition = 'height 0.3s ease, opacity 0.3s ease'
  element.style.height = '0'
  element.style.opacity = '0'
  setTimeout(done, 300)
}
</script>

<template>
  <div class="w-full border border-gray-200 rounded-lg divide-y divide-gray-200 overflow-hidden">
    <div v-for="item in items" :key="item.id">
      <button
        type="button"
        class="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50 transition-colors group"
        @click="toggleItem(item.id)"
      >
        <span class="font-medium text-gray-800 group-hover:text-green-600 transition-colors">
          {{ item.title }}
        </span>
        <UIcon
          name="heroicons-chevron-down"
          class="w-5 h-5 text-gray-400 transition-transform duration-300"
          :class="{ 'rotate-180': isOpen(item.id) }"
        />
      </button>

      <Transition
        @before-enter="onBeforeEnter"
        @enter="onEnter"
        @before-leave="onBeforeLeave"
        @leave="onLeave"
      >
        <div v-if="isOpen(item.id)" class="overflow-hidden">
          <div class="p-4 pt-0 text-gray-600 text-sm leading-relaxed">
            <slot :name="item.id" :item="item">
              {{ item.content }}
            </slot>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

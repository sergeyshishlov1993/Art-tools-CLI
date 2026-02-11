<script setup lang="ts">
import { ROUTES } from '~/models/common/constants/routes'

interface Props {
  id: string
  name: string
  price: number
  oldPrice?: number | null
  image: string
  slug: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: []
}>()

const formattedPrice = computed(() =>
  new Intl.NumberFormat('uk-UA').format(props.price)
)

const formattedOldPrice = computed(() =>
  props.oldPrice ? new Intl.NumberFormat('uk-UA').format(props.oldPrice) : null
)

const discount = computed(() => {
  if (!props.oldPrice || props.oldPrice <= props.price) return 0
  return Math.round((1 - props.price / props.oldPrice) * 100)
})
</script>

<template>
  <NuxtLink
    :to="ROUTES.product(slug)"
    class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
    @click="emit('click')"
  >
    <div class="w-14 h-14 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
      <img
        :src="image"
        :alt="name"
        class="w-full h-full object-contain p-1"
        loading="lazy"
        @error="($event.target as HTMLImageElement).src = '/images/no-image.png'"
      >
    </div>

    <div class="flex-1 min-w-0">
      <h4 class="text-sm text-gray-800 font-medium line-clamp-2 group-hover:text-green-600 transition-colors">
        {{ name }}
      </h4>
      <div class="flex items-center gap-2 mt-1">
        <span class="text-sm font-bold" :class="discount > 0 ? 'text-red-600' : 'text-gray-900'">
          {{ formattedPrice }} ₴
        </span>
        <span v-if="formattedOldPrice" class="text-xs text-gray-400 line-through">
          {{ formattedOldPrice }} ₴
        </span>
        <span v-if="discount > 0" class="text-xs text-red-500 font-medium">
          -{{ discount }}%
        </span>
      </div>
    </div>

    <UIcon
      name="heroicons-chevron-right"
      class="w-4 h-4 text-gray-400 group-hover:text-green-500 transition-colors flex-shrink-0"
    />
  </NuxtLink>
</template>

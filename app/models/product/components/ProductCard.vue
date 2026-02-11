<script setup lang="ts">
import BBadge from '~/models/common/components/ui/BBadge.vue'

interface Product {
  id: string
  code: string
  name: string
  price: number
  oldPrice?: number
  image: string
  to: string
  isHit?: boolean
  isPromo?: boolean
}

const props = defineProps<{
  product: Product
}>()

const emit = defineEmits<{
  addToCart: [productId: string]
  quickBuy: [productId: string]
}>()

const imageError = ref(false)

const discountPercent = computed(() => {
  if (!props.product.oldPrice) return 0
  return Math.round((1 - props.product.price / props.product.oldPrice) * 100)
})

const hasDiscount = computed(() => !!props.product.oldPrice)

const hasValidImage = computed(() => {
  return props.product.image && !imageError.value
})

function handleImageError() {
  imageError.value = true
}

function handleAddToCart(event: Event) {
  event.preventDefault()
  event.stopPropagation()
  emit('addToCart', props.product.id)
}

function handleQuickBuy(event: Event) {
  event.preventDefault()
  event.stopPropagation()
  emit('quickBuy', props.product.id)
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('uk-UA').format(value)
}

watch(() => props.product.image, () => {
  imageError.value = false
})
</script>

<template>
  <div
    class="group h-full flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300"
  >
    <NuxtLink :to="product.to" class="block relative">
      <div class="absolute top-2 left-2 z-10 flex flex-col gap-1">
        <BBadge v-if="product.isPromo" variant="danger" size="sm">
          АКЦІЯ
        </BBadge>
        <BBadge v-if="product.isHit" variant="warning" size="sm">
          ХІТ
        </BBadge>
      </div>

      <div
        v-if="discountPercent > 0"
        class="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg"
      >
        -{{ discountPercent }}%
      </div>

      <button
        class="absolute bottom-2 right-2 z-10 w-8 h-8 sm:w-9 sm:h-9 bg-white/90 hover:bg-green-500 text-gray-600 hover:text-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
        title="Купити в 1 клік"
        @click="handleQuickBuy"
      >
        <UIcon name="heroicons-bolt" class="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <div class="relative w-full pt-[100%] bg-gray-50">
        <img
          v-if="hasValidImage"
          :src="product.image"
          :alt="product.name"
          class="absolute inset-0 w-full h-full object-contain p-3 sm:p-4 group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          @error="handleImageError"
        >
        <div v-else class="absolute inset-0 flex flex-col items-center justify-center text-gray-300"">
          <UIcon name="heroicons-photo" class="w-12 h-12 sm:w-16 sm:h-16 mb-1" />
          <span class="text-[10px] sm:text-xs">Немає фото</span>
        </div>
      </div>
    </NuxtLink>

    <div class="flex flex-col flex-1 p-2.5 sm:p-3">
      <p class="text-[10px] sm:text-xs text-gray-400 mb-1 truncate h-4 sm:h-5">
        {{ product.code }}
      </p>

      <NuxtLink :to="product.to" class="block mb-2">
        <h3 class="text-xs sm:text-sm font-medium text-gray-800 hover:text-green-600 transition-colors line-clamp-3 leading-snug min-h-[3.25rem] sm:min-h-[3.5rem]">
          {{ product.name }}
        </h3>
      </NuxtLink>

      <div class="flex flex-wrap items-baseline gap-1 sm:gap-2 mb-2 sm:mb-3 min-h-[1.75rem] sm:min-h-[2rem]">
        <span
          class="text-base sm:text-lg font-bold"
          :class="hasDiscount ? 'text-red-500' : 'text-gray-900'"
        >
          {{ formatPrice(product.price) }} ₴
        </span>
        <span
          v-if="product.oldPrice"
          class="text-[10px] sm:text-sm text-gray-400 line-through"
        >
          {{ formatPrice(product.oldPrice) }} ₴
        </span>
      </div>

      <button
        class="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 h-9 sm:h-10 text-xs sm:text-sm mt-auto"
        @click="handleAddToCart"
      >
        <UIcon name="heroicons-shopping-cart" class="w-4 h-4 sm:w-5 sm:h-5" />
        <span>В кошик</span>
      </button>
    </div>
  </div>
</template>
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

const discountPercent = computed(() => {
  if (!props.product.oldPrice) return 0
  return Math.round((1 - props.product.price / props.product.oldPrice) * 100)
})

const hasDiscount = computed(() => !!props.product.oldPrice)

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
</script>

<template>
  <div class="group h-full flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300">
    <!-- Фото з бейджами -->
    <NuxtLink :to="product.to" class="block relative">
      <!-- Бейджи зліва -->
      <div class="absolute top-2 left-2 z-10 flex flex-col gap-1">
        <BBadge v-if="product.isPromo" variant="danger" size="sm">
          АКЦІЯ
        </BBadge>
        <BBadge v-if="product.isHit" variant="warning" size="sm">
          ХІТ
        </BBadge>
      </div>

      <!-- Знижка справа -->
      <div
        v-if="discountPercent > 0"
        class="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg"
      >
        -{{ discountPercent }}%
      </div>

      <!-- Швидка покупка - іконка в кутку (з'являється при ховері) -->
      <button
        class="absolute bottom-2 right-2 z-10 w-8 h-8 sm:w-9 sm:h-9 bg-white/90 hover:bg-green-500 text-gray-600 hover:text-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
        title="Купити в 1 клік"
        @click="handleQuickBuy"
      >
        <UIcon name="i-heroicons-bolt" class="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <!-- Зображення -->
      <div class="aspect-square bg-gray-50 flex items-center justify-center p-3 sm:p-4">
        <img
          :src="product.image"
          :alt="product.name"
          class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        >
      </div>
    </NuxtLink>

    <!-- Контент -->
    <div class="flex flex-col flex-1 p-2.5 sm:p-3">
      <!-- Код -->
      <p class="text-[10px] sm:text-xs text-gray-400 mb-1 truncate">
        {{ product.code }}
      </p>

      <!-- Назва -->
      <NuxtLink :to="product.to" class="block mb-2 flex-1">
        <h3 class="text-xs sm:text-sm font-medium text-gray-800 hover:text-green-600 transition-colors line-clamp-2 leading-tight">
          {{ product.name }}
        </h3>
      </NuxtLink>

      <!-- Ціна -->
      <div class="flex flex-wrap items-baseline gap-1 sm:gap-2 mb-2 sm:mb-3">
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

      <!-- Одна кнопка на всю ширину -->
      <button
        class="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 h-9 sm:h-10 text-xs sm:text-sm"
        @click="handleAddToCart"
      >
        <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4 sm:w-5 sm:h-5" />
        <span>В кошик</span>
      </button>
    </div>
  </div>
</template>
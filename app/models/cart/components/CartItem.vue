<script setup lang="ts">
import type { CartItem } from '../types'
import { useCartStore } from '../CartStore'

defineProps<{
  item: CartItem
}>()

const cartStore = useCartStore()

function formatPrice(value: number) {
  return new Intl.NumberFormat('uk-UA').format(value)
}
</script>

<template>
  <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-6 border-b border-gray-100 last:border-0">
    <div class="relative w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg flex-shrink-0 p-2">
      <img :src="item.image" :alt="item.name" class="w-full h-full object-contain mix-blend-multiply">
      <span
        v-if="item.oldPrice"
        class="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded"
      >
        -{{ Math.round((1 - item.price / item.oldPrice) * 100) }}%
      </span>
    </div>

    <div class="flex-1 min-w-0 w-full">
      <div class="flex justify-between items-start gap-4">
        <div>
          <p class="text-xs text-gray-400 mb-1">Код: {{ item.code }}</p>
          <NuxtLink :to="`/product/${item.slug}`" class="font-medium text-gray-800 hover:text-green-600 transition-colors line-clamp-2">
            {{ item.name }}
          </NuxtLink>
        </div>
        <button class="text-gray-400 hover:text-red-500 transition-colors" @click="cartStore.removeFromCart(item.id)">
          <UIcon name="heroicons-trash" class="w-5 h-5" />
        </button>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-4 mt-4">
        <div class="flex items-center border border-gray-300 rounded-lg">
          <button
            class="px-3 py-1 text-gray-500 hover:text-gray-800 disabled:opacity-50"
            :disabled="item.quantity <= 1"
            @click="cartStore.updateQuantity(item.id, -1)"
          >
            −
          </button>
          <span class="w-8 text-center text-sm font-medium">{{ item.quantity }}</span>
          <button
            class="px-3 py-1 text-gray-500 hover:text-gray-800"
            @click="cartStore.updateQuantity(item.id, 1)"
          >
            +
          </button>
        </div>

        <div class="text-right ml-auto sm:ml-0">
          <div class="flex items-center gap-2 justify-end">
            <span
              class="font-bold text-lg whitespace-nowrap"
              :class="item.oldPrice ? 'text-red-500' : 'text-gray-900'"
            >
              {{ formatPrice(item.price * item.quantity) }} ₴
            </span>
            <span
              v-if="item.oldPrice"
              class="text-sm text-gray-400 line-through whitespace-nowrap"
            >
              {{ formatPrice(item.oldPrice * item.quantity) }} ₴
            </span>
          </div>

          <div v-if="item.quantity > 1" class="text-xs text-gray-500 whitespace-nowrap mt-1">
            <span :class="item.oldPrice ? 'text-red-400' : ''">
              {{ formatPrice(item.price) }} ₴
            </span>
            <span v-if="item.oldPrice" class="line-through ml-1">
              {{ formatPrice(item.oldPrice) }} ₴
            </span>
            / шт.
          </div>

          <div v-if="item.oldPrice" class="text-xs text-green-600 font-medium mt-1">
            Економія: {{ formatPrice((item.oldPrice - item.price) * item.quantity) }} ₴
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

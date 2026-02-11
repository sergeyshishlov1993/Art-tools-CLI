<script setup lang="ts">
import type { ProductCardData } from '~/models/product/types/Product'
import ProductCard from './ProductCard.vue'

interface Props {
  title: string
  products: ProductCardData[]
  loading?: boolean
  viewAllLink?: string
}

defineProps<Props>()

const emit = defineEmits<{
  'add-to-cart': [productId: string]
  'quick-buy': [productId: string]
}>()

const sliderRef = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(true)

function updateScrollButtons() {
  if (!sliderRef.value) return
  const { scrollLeft, scrollWidth, clientWidth } = sliderRef.value
  canScrollLeft.value = scrollLeft > 0
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 10
}

function scrollTo(direction: 'left' | 'right') {
  if (!sliderRef.value) return
  const cardWidth = sliderRef.value.querySelector('.product-card')?.clientWidth || 280
  const gap = 16
  const scrollAmount = (cardWidth + gap) * 2

  sliderRef.value.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth'
  })
}

onMounted(() => {
  updateScrollButtons()
  sliderRef.value?.addEventListener('scroll', updateScrollButtons)
})

onUnmounted(() => {
  sliderRef.value?.removeEventListener('scroll', updateScrollButtons)
})
</script>

<template>
  <section>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl lg:text-2xl font-bold text-gray-800">{{ title }}</h2>

      <div class="flex items-center gap-4">
        <!-- Navigation buttons -->
        <div class="hidden md:flex items-center gap-2">
          <button
            :disabled="!canScrollLeft"
            class="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 hover:border-green-500 hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            @click="scrollTo('left')"
          >
            <UIcon name="heroicons-chevron-left" class="w-5 h-5" />
          </button>
          <button
            :disabled="!canScrollRight"
            class="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 hover:border-green-500 hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            @click="scrollTo('right')"
          >
            <UIcon name="heroicons-chevron-right" class="w-5 h-5" />
          </button>
        </div>

        <NuxtLink
          v-if="viewAllLink"
          :to="viewAllLink"
          class="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
        >
          Дивитись все
          <UIcon name="heroicons-arrow-right" class="w-4 h-4" />
        </NuxtLink>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="flex gap-4 overflow-hidden"
    >
      <div
        v-for="i in 5"
        :key="i"
        class="flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-13px)]"
      >
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="aspect-square bg-gray-200 animate-pulse" />
          <div class="p-4 space-y-3">
            <div class="h-4 bg-gray-200 animate-pulse rounded-full w-full" />
            <div class="h-4 bg-gray-200 animate-pulse rounded-full w-2/3" />
            <div class="h-6 bg-gray-200 animate-pulse rounded-full w-24" />
          </div>
        </div>
      </div>
    </div>

    <!-- Products Slider -->
    <div v-else class="relative">
      <div
        ref="sliderRef"
        class="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2 -mb-2"
        @scroll="updateScrollButtons"
      >
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          class="product-card flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-13px)]"
          @add-to-cart="emit('add-to-cart', $event)"
          @quick-buy="emit('quick-buy', $event)"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
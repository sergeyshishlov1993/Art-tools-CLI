<script setup lang="ts">
import { useProductStore } from '~/models/product/ProductStore'
import { useCartStore } from '~/models/cart/CartStore'
import { useCategoryStore } from '~/models/category/CategoryStore'
import { useCartActions } from '~/models/cart/composables/useCartActions'
import { useViewedProducts } from '~/models/product/composables/useViewedProducts'
import ProductSection from '~/models/product/components/ProductSection.vue'
import CartModal from '~/models/cart/components/CartModal.vue'
import OneClickModal from '~/models/cart/components/OneClickModal.vue'
import PromoTimer from '~/models/common/components/PromoTimer.vue'
import BBtn from '~/models/common/components/ui/BBtn.vue'

const route = useRoute()
const productStore = useProductStore()
const cartStore = useCartStore()
const categoryStore = useCategoryStore()

const {
  isCartModalOpen,
  isOneClickModalOpen,
  lastAddedProduct,
  addToCartById,
  quickBuyById
} = useCartActions()

const { addViewed, getViewedExcept } = useViewedProducts()

const slug = computed(() => route.params.slug as string)
const selectedImageIndex = ref(0)
const quantity = ref(1)
const activeTab = ref<'description' | 'params'>('params')
const isZooming = ref(false)
const zoomPosition = ref({ x: 50, y: 50 })
const imageRef = ref<HTMLDivElement | null>(null)
const failedImages = ref<Set<string>>(new Set())
const loadedImages = ref<Set<string>>(new Set())
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const supportsHover = ref(false)
const touchStartX = ref(0)
const touchEndX = ref(0)
const isSwiping = ref(false)

onMounted(() => {
  supportsHover.value = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  categoryStore.fetchActive()
})

async function loadProduct(productSlug: string) {
  isLoading.value = true
  loadError.value = null
  selectedImageIndex.value = 0
  quantity.value = 1
  failedImages.value = new Set()
  loadedImages.value = new Set()

  try {
    await productStore.fetchProduct(productSlug)
    if (productStore.error) {
      loadError.value = productStore.error
    }
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Помилка завантаження товару'
  } finally {
    isLoading.value = false
  }
}

watch(slug, (newSlug) => {
  if (newSlug) loadProduct(newSlug)
}, { immediate: true })

watch(
  () => productStore.currentProductCardData,
  (cardData) => {
    if (cardData && import.meta.client) addViewed(cardData)
  }
)

const viewedProductCards = computed(() => {
  if (!productStore.currentProduct) return []
  return getViewedExcept(productStore.currentProduct.product_id, 10)
})

const validImages = computed(() =>
  productStore.images
    .map((img, index) => ({ img, index }))
    .filter(({ img }) => !failedImages.value.has(img))
)

const currentImage = computed(() => {
  if (validImages.value.length === 0) return '/images/no-image.png'
  const current = validImages.value.find(({ index }) => index === selectedImageIndex.value)
  return current?.img || validImages.value[0]?.img || '/images/no-image.png'
})

const hasValidImages = computed(() => validImages.value.length > 0)

const currentImagePosition = computed(() => {
  const idx = validImages.value.findIndex(({ index }) => index === selectedImageIndex.value)
  return idx >= 0 ? idx : 0
})

const formattedPrice = computed(() =>
  new Intl.NumberFormat('uk-UA').format(productStore.finalPrice)
)

const formattedOldPrice = computed(() => {
  if (!productStore.oldPrice) return null
  return new Intl.NumberFormat('uk-UA').format(productStore.oldPrice)
})

const formattedSavings = computed(() => {
  if (!productStore.oldPrice) return null
  return new Intl.NumberFormat('uk-UA').format(productStore.oldPrice - productStore.finalPrice)
})

const showPromoTimer = computed(() =>
  productStore.isSale || productStore.discountPercent > 0
)

const modalProduct = computed(() => {
  if (lastAddedProduct.value) return lastAddedProduct.value
  if (productStore.cartItemData) {
    return { ...productStore.cartItemData, to: `/product/${productStore.currentProduct?.slug}` }
  }
  return null
})

function handleImageError(img: string, index: number) {
  failedImages.value = new Set([...failedImages.value, img])
  if (index === selectedImageIndex.value) {
    const nextValid = validImages.value.find(v => v.index !== index)
    if (nextValid) selectedImageIndex.value = nextValid.index
  }
}

function handleImageLoad(img: string) {
  loadedImages.value = new Set([...loadedImages.value, img])
}

function selectImage(index: number) {
  const item = validImages.value.find(v => v.index === index)
  if (item) selectedImageIndex.value = index
}

function handleMouseEnter() {
  if (!supportsHover.value || !hasValidImages.value) return
  isZooming.value = true
}

function handleMouseLeave() {
  if (!supportsHover.value) return
  isZooming.value = false
  zoomPosition.value = { x: 50, y: 50 }
}

function handleMouseMove(event: MouseEvent) {
  if (!supportsHover.value || !imageRef.value || !hasValidImages.value) return
  const rect = imageRef.value.getBoundingClientRect()
  zoomPosition.value = {
    x: ((event.clientX - rect.left) / rect.width) * 100,
    y: ((event.clientY - rect.top) / rect.height) * 100
  }
}

function handleTouchStart(event: TouchEvent) {
  if (validImages.value.length <= 1) return
  const touch = event.touches[0]
  if (!touch) return
  touchStartX.value = touch.clientX
  touchEndX.value = touch.clientX
  isSwiping.value = true
}

function handleTouchMove(event: TouchEvent) {
  if (!isSwiping.value) return
  const touch = event.touches[0]
  if (!touch) return
  touchEndX.value = touch.clientX
}

function handleTouchEnd() {
  if (!isSwiping.value) return
  isSwiping.value = false
  const diff = touchStartX.value - touchEndX.value
  const threshold = 50

  if (Math.abs(diff) < threshold) return

  const currentPos = currentImagePosition.value

  if (diff > 0 && currentPos < validImages.value.length - 1) {
    const next = validImages.value[currentPos + 1]
    if (next) selectedImageIndex.value = next.index
  } else if (diff < 0 && currentPos > 0) {
    const prev = validImages.value[currentPos - 1]
    if (prev) selectedImageIndex.value = prev.index
  }
}

function handleAddToCart() {
  const cartData = productStore.cartItemData
  if (cartData) {
    for (let idx = 0; idx < quantity.value; idx++) {
      cartStore.addToCart(cartData)
    }
    lastAddedProduct.value = { ...cartData, to: `/product/${productStore.currentProduct?.slug}` }
    isCartModalOpen.value = true
  }
}

function handleQuickBuy() {
  if (productStore.cartItemData) {
    lastAddedProduct.value = { ...productStore.cartItemData, to: `/product/${productStore.currentProduct?.slug}` }
  }
  isOneClickModalOpen.value = true
}

function handleRelatedAddToCart(productId: string) {
  addToCartById(productId, productStore.relatedProducts)
}

function handleRelatedQuickBuy(productId: string) {
  quickBuyById(productId, productStore.relatedProducts)
}

function handleViewedAddToCart(productId: string) {
  const viewed = viewedProductCards.value.find(p => p.id === productId)
  if (viewed) {
    cartStore.addToCart({
      id: viewed.id,
      slug: viewed.to.replace('/product/', ''),
      name: viewed.name,
      price: viewed.price,
      oldPrice: viewed.oldPrice,
      image: viewed.image,
      code: viewed.code
    })
    lastAddedProduct.value = viewed
    isCartModalOpen.value = true
  }
}

function handleViewedQuickBuy(productId: string) {
  const viewed = viewedProductCards.value.find(p => p.id === productId)
  if (viewed) {
    lastAddedProduct.value = viewed
    isOneClickModalOpen.value = true
  }
}

function incrementQuantity() { quantity.value++ }
function decrementQuantity() { if (quantity.value > 1) quantity.value-- }

onUnmounted(() => {
  productStore.clearProduct()
})

useSeoMeta({
  title: () => productStore.currentProduct?.product_name || 'Товар',
  description: () =>
    productStore.description
      || `Купити ${productStore.currentProduct?.product_name} в інтернет-магазині Art Tools`,
  ogType: 'website',
  ogTitle: () => productStore.currentProduct?.product_name || 'Товар',
  ogDescription: () =>
    productStore.description
      || `Купити ${productStore.currentProduct?.product_name} ✓ В наявності ✓ Доставка по Україні`,
  ogImage: () =>
    currentImage.value !== '/images/no-image.png' ? currentImage.value : '/og-image.jpg',
  ogSiteName: 'Art Tools',
  ogLocale: 'uk_UA',
  twitterCard: 'summary_large_image',
  twitterTitle: () => productStore.currentProduct?.product_name || 'Товар',
  twitterDescription: () =>
    productStore.description
      || `Купити ${productStore.currentProduct?.product_name} в Art Tools`,
  twitterImage: () =>
    currentImage.value !== '/images/no-image.png' ? currentImage.value : '/og-image.jpg',
})
</script>
Часть 2 — template:


Html, xml
<template>
  <div class="bg-gray-50 pb-10">
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div v-if="isLoading" class="animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-1/3 mb-6" />
        <div class="grid lg:grid-cols-2 gap-8">
          <div class="aspect-square bg-gray-200 rounded-xl" />
          <div class="space-y-4">
            <div class="h-8 bg-gray-200 rounded w-3/4" />
            <div class="h-6 bg-gray-200 rounded w-1/4" />
            <div class="h-12 bg-gray-200 rounded w-1/2" />
            <div class="h-12 bg-gray-200 rounded" />
          </div>
        </div>
      </div>

      <div v-else-if="loadError" class="bg-white rounded-xl p-12 text-center">
        <UIcon name="heroicons-exclamation-triangle" class="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 class="text-xl font-bold text-gray-800 mb-2">Товар не знайдено</h2>
        <p class="text-gray-500 mb-4">{{ loadError }}</p>
        <NuxtLink to="/" class="text-green-600 hover:text-green-700 font-medium">
          Повернутися на головну
        </NuxtLink>
      </div>

      <template v-else-if="productStore.currentProduct">
        <nav class="flex items-center gap-2 text-sm mb-6 flex-wrap">
          <template v-for="(crumb, index) in productStore.breadcrumbs" :key="index">
            <NuxtLink v-if="crumb.to" :to="crumb.to" class="text-gray-500 hover:text-green-600 transition-colors">
              {{ crumb.label }}
            </NuxtLink>
            <span v-else class="text-gray-800 line-clamp-1">{{ crumb.label }}</span>
            <UIcon v-if="index < productStore.breadcrumbs.length - 1" name="heroicons-chevron-right" class="w-4 h-4 text-gray-400 flex-shrink-0" />
          </template>
        </nav>

        <div class="grid lg:grid-cols-2 gap-8 mb-8">
          <div class="space-y-4 min-w-0 overflow-hidden">
            <div
              ref="imageRef"
              class="relative aspect-square bg-white rounded-xl border border-gray-200 overflow-hidden select-none"
              :class="{ 'cursor-zoom-in': hasValidImages && supportsHover }"
              @mouseenter="handleMouseEnter"
              @mouseleave="handleMouseLeave"
              @mousemove="handleMouseMove"
              @touchstart.passive="handleTouchStart"
              @touchmove.passive="handleTouchMove"
              @touchend="handleTouchEnd"
            >
              <div class="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
                <span v-if="productStore.isSale" class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">АКЦІЯ</span>
                <span v-if="productStore.isBestseller" class="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">ХІТ</span>
                <span v-if="productStore.discountPercent > 0" class="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">-{{ productStore.discountPercent }}%</span>
              </div>

              <img
                v-if="hasValidImages"
                :key="currentImage"
                :src="currentImage"
                :alt="productStore.currentProduct.product_name"
                class="w-full h-full object-contain p-4 transition-opacity duration-200 pointer-events-none"
                :class="{ 'opacity-0': isZooming }"
                @error="handleImageError(currentImage, selectedImageIndex)"
                @load="handleImageLoad(currentImage)"
              >

              <div v-else class="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <UIcon name="heroicons-photo" class="w-20 h-20 mb-2" />
                <span class="text-sm">Зображення недоступне</span>
              </div>

              <div
                v-if="isZooming && hasValidImages"
                class="absolute inset-0 bg-white"
                :style="{
                  backgroundImage: `url(${currentImage})`,
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  backgroundSize: '200%',
                  backgroundRepeat: 'no-repeat'
                }"
              />

              <div v-if="supportsHover && !isZooming && hasValidImages" class="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <UIcon name="heroicons-magnifying-glass-plus" class="w-4 h-4" />
                <span>Наведіть для збільшення</span>
              </div>

              <div v-if="!supportsHover && validImages.length > 1" class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                <span
                  v-for="(_, dotIndex) in validImages"
                  :key="dotIndex"
                  class="w-2 h-2 rounded-full transition-colors"
                  :class="currentImagePosition === dotIndex ? 'bg-green-500' : 'bg-gray-300'"
                />
              </div>
            </div>

            <div v-if="validImages.length > 1" class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                v-for="{ img, index } in validImages"
                :key="img"
                class="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg border-2 overflow-hidden transition-all bg-white"
                :class="selectedImageIndex === index ? 'border-green-500 ring-2 ring-green-500/30' : 'border-gray-200 hover:border-gray-300'"
                @click="selectImage(index)"
              >
                <img :src="img" :alt="`${productStore.currentProduct.product_name} - ${index + 1}`" class="w-full h-full object-cover" @error="handleImageError(img, index)">
              </button>
            </div>
          </div>

          <div class="space-y-6 min-w-0">
            <div>
              <p class="text-sm text-gray-500 mb-1">Код: {{ productStore.currentProduct.product_id }}</p>
              <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 break-words">{{ productStore.currentProduct.product_name }}</h1>
              <p v-if="productStore.currentProduct.brand" class="text-gray-500 mt-1">
                Бренд: <span class="font-medium text-gray-700">{{ productStore.currentProduct.brand }}</span>
              </p>
            </div>

            <div class="flex items-center gap-2">
              <span v-if="productStore.isAvailable" class="flex items-center gap-1 text-green-600">
                <UIcon name="heroicons-check-circle" class="w-5 h-5" />
                <span class="font-medium">В наявності</span>
              </span>
              <span v-else class="flex items-center gap-1 text-red-500">
                <UIcon name="heroicons-x-circle" class="w-5 h-5" />
                <span class="font-medium">Немає в наявності</span>
              </span>
            </div>

            <div class="bg-gray-50 rounded-xl p-4">
              <div class="flex items-end gap-3 flex-wrap">
                <span class="text-2xl sm:text-3xl font-bold" :class="showPromoTimer ? 'text-red-600' : 'text-gray-900'">
                  {{ formattedPrice }} ₴
                </span>
                <span v-if="formattedOldPrice" class="text-base sm:text-lg text-gray-400 line-through">{{ formattedOldPrice }} ₴</span>
              </div>
              <div v-if="formattedSavings" class="mt-2 text-green-600 text-sm font-medium">💰 Економія: {{ formattedSavings }} ₴</div>
            </div>

            <PromoTimer v-if="showPromoTimer" :product-id="productStore.currentProduct.product_id" />

            <div class="hidden lg:block space-y-4">
              <div class="flex items-center gap-4">
                <span class="text-sm text-gray-600">Кількість:</span>
                <div class="flex items-center border border-gray-300 rounded-lg">
                  <button class="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50" :disabled="quantity <= 1" @click="decrementQuantity">
                    <UIcon name="heroicons-minus" class="w-4 h-4" />
                  </button>
                  <span class="w-12 text-center font-medium">{{ quantity }}</span>
                  <button class="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100" @click="incrementQuantity">
                    <UIcon name="heroicons-plus" class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div class="flex gap-3">
                <BBtn variant="primary" size="lg" class="flex-1" icon="heroicons-shopping-cart" :disabled="!productStore.isAvailable" @click="handleAddToCart">
                  Додати в кошик
                </BBtn>
                <BBtn variant="secondary" size="lg" class="flex-1" icon="heroicons-bolt" :disabled="!productStore.isAvailable" @click="handleQuickBuy">
                  Купити в 1 клік
                </BBtn>
              </div>
            </div>

            <div class="border-t border-gray-200 pt-6 space-y-3">
              <div class="flex items-start gap-3">
                <UIcon name="heroicons-truck" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p class="font-medium text-gray-800">Доставка</p>
                  <p class="text-sm text-gray-500">Нова Пошта, кур'єр по Україні</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <UIcon name="heroicons-credit-card" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p class="font-medium text-gray-800">Оплата</p>
                  <p class="text-sm text-gray-500">Накладений платіж, карткою онлайн</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <UIcon name="heroicons-shield-check" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p class="font-medium text-gray-800">Гарантія</p>
                  <p class="text-sm text-gray-500">Офіційна гарантія від виробника</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
          <div class="flex border-b border-gray-200 relative">
            <div class="absolute bottom-0 h-0.5 bg-green-500 transition-all duration-300" :style="{ left: activeTab === 'params' ? '0%' : '50%', width: '50%' }" />
            <button class="flex-1 py-4 px-4 sm:px-6 text-center font-medium transition-colors relative z-10 text-sm sm:text-base" :class="activeTab === 'params' ? 'text-green-600' : 'text-gray-600 hover:text-gray-800'" @click="activeTab = 'params'">
              Характеристики
            </button>
            <button class="flex-1 py-4 px-4 sm:px-6 text-center font-medium transition-colors relative z-10 text-sm sm:text-base" :class="activeTab === 'description' ? 'text-green-600' : 'text-gray-600 hover:text-gray-800'" @click="activeTab = 'description'">
              Опис
            </button>
          </div>

          <div class="p-4 sm:p-6">
            <div v-if="activeTab === 'params'">
              <div v-if="productStore.groupedParams.length > 0" class="grid gap-2 sm:gap-3">
                <div v-for="param in productStore.groupedParams" :key="param.name" class="flex flex-col sm:flex-row py-2 sm:py-3 border-b border-gray-100 last:border-0">
                  <span class="sm:w-1/2 text-gray-500 text-sm sm:text-base">{{ param.name }}</span>
                  <span class="sm:w-1/2 font-medium text-gray-800 text-sm sm:text-base">{{ param.values.join(', ') }}</span>
                </div>
              </div>
              <p v-else class="text-gray-500 text-center py-8">Характеристики не вказані</p>
            </div>

            <div v-else-if="activeTab === 'description'">
              <div v-if="productStore.description" class="prose prose-sm sm:prose-base prose-gray max-w-none" v-html="productStore.description" />
              <p v-else class="text-gray-500 text-center py-8">Опис товару відсутній</p>
            </div>
          </div>
        </div>

        <ProductSection
          v-if="productStore.relatedProductCards.length > 0"
          title="Схожі товари"
          :products="productStore.relatedProductCards"
          class="mb-8"
          @add-to-cart="handleRelatedAddToCart"
          @quick-buy="handleRelatedQuickBuy"
        />

        <ClientOnly>
          <ProductSection
            v-if="viewedProductCards.length > 0"
            title="Ви переглядали"
            :products="viewedProductCards"
            @add-to-cart="handleViewedAddToCart"
            @quick-buy="handleViewedQuickBuy"
          />
        </ClientOnly>
      </template>
    </div>

    <div v-if="productStore.currentProduct && !isLoading" class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 lg:hidden">
      <div class="px-4 py-3">
        <div class="flex items-center justify-between mb-3">
          <div>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl font-bold" :class="showPromoTimer ? 'text-red-600' : 'text-gray-900'">{{ formattedPrice }} ₴</span>
              <span v-if="formattedOldPrice" class="text-sm text-gray-400 line-through">{{ formattedOldPrice }} ₴</span>
            </div>
            <div v-if="formattedSavings" class="text-green-600 text-xs font-medium">💰 Економія: {{ formattedSavings }} ₴</div>
          </div>
          <div v-if="productStore.isAvailable" class="text-sm text-green-600 font-medium flex items-center gap-1">
            <UIcon name="heroicons-check-circle-solid" class="w-4 h-4" />
            В наявності
          </div>
          <div v-else class="text-sm text-red-500 font-medium">Немає в наявності</div>
        </div>

        <div class="flex gap-2">
          <button class="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2" :disabled="!productStore.isAvailable" @click="handleAddToCart">
            <UIcon name="heroicons-shopping-cart" class="w-5 h-5" />
            <span>В кошик</span>
          </button>
          <button class="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400 text-gray-800 font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2" :disabled="!productStore.isAvailable" @click="handleQuickBuy">
            <UIcon name="heroicons-bolt" class="w-5 h-5" />
            <span>Швидко</span>
          </button>
        </div>
      </div>
      <div class="safe-area-bottom" />
    </div>

    <CartModal v-model="isCartModalOpen" :product="modalProduct" @quick-buy="() => isOneClickModalOpen = true" />
    <OneClickModal v-model="isOneClickModalOpen" :product="modalProduct" />
  </div>
</template>

<style scoped>
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.safe-area-bottom { height: env(safe-area-inset-bottom, 0); background: white; }
</style>

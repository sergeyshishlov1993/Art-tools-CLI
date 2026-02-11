<script setup lang="ts">
import BBtn from '~/models/common/components/ui/BBtn.vue'
import type { ProductCardData } from '~/models/product/types/Product'

interface Props {
  modelValue: boolean
  product: ProductCardData | null
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'quickBuy'])
const router = useRouter()

function close() {
  emit('update:modelValue', false)
}

function goToCart() {
  close()
  router.push('/cart')
}

function handleQuickBuy() {
  emit('quickBuy', props.product)
  close()
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('uk-UA').format(value)
}

const discountPercent = computed(() => {
  if (!props.product?.oldPrice) return 0
  return Math.round((1 - props.product.price / props.product.oldPrice) * 100)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
        @click="close"
      >
        <Transition name="modal-content" appear>
          <div
            v-if="modelValue"
            class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            @click.stop
          >
            <!-- Заголовок -->
            <div class="flex items-center justify-between p-4 border-b border-gray-100 bg-green-50">
              <h3 class="font-bold text-gray-800 flex items-center gap-2">
                <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <UIcon name="heroicons-check" class="w-5 h-5 text-white" />
                </div>
                Товар додано в кошик
              </h3>
              <button
                class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                @click="close"
              >
                <UIcon name="heroicons-x-mark" class="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <!-- Товар -->
            <div v-if="product" class="p-4 sm:p-6">
              <div class="flex gap-4">
                <!-- Фото -->
                <NuxtLink
                  :to="product.to"
                  class="relative w-24 h-24 sm:w-28 sm:h-28 bg-gray-50 rounded-xl p-2 flex-shrink-0 hover:bg-gray-100 transition-colors"
                  @click="close"
                >
                  <img
                    :src="product.image"
                    :alt="product.name"
                    class="w-full h-full object-contain"
                  >
                  <span
                    v-if="discountPercent > 0"
                    class="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg"
                  >
                    -{{ discountPercent }}%
                  </span>
                </NuxtLink>

                <!-- Інфо -->
                <div class="flex-1 min-w-0">
                  <NuxtLink
                    :to="product.to"
                    class="text-sm sm:text-base text-gray-800 font-medium line-clamp-2 mb-2 hover:text-green-600 transition-colors block"
                    @click="close"
                  >
                    {{ product.name }}
                  </NuxtLink>

                  <!-- Код -->
                  <p class="text-xs text-gray-400 mb-2">
                    Код: {{ product.code }}
                  </p>

                  <!-- Ціни -->
                  <div class="flex items-center gap-2 flex-wrap">
                    <span
                      class="font-bold text-xl"
                      :class="product.oldPrice ? 'text-red-500' : 'text-green-600'"
                    >
                      {{ formatPrice(product.price) }} ₴
                    </span>
                    <span
                      v-if="product.oldPrice"
                      class="text-sm text-gray-400 line-through"
                    >
                      {{ formatPrice(product.oldPrice) }} ₴
                    </span>
                  </div>

                  <!-- Економія -->
                  <div v-if="product.oldPrice" class="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                    <UIcon name="heroicons-tag" class="w-3.5 h-3.5" />
                    Економія: {{ formatPrice(product.oldPrice - product.price) }} ₴
                  </div>
                </div>
              </div>
            </div>

            <!-- Кнопки -->
            <div class="p-4 bg-gray-50 space-y-2">
              <!-- Оформити замовлення -->
              <BBtn
                variant="primary"
                size="lg"
                block
                icon="heroicons-shopping-bag"
                @click="goToCart"
              >
                Оформити замовлення
              </BBtn>

              <!-- Купити в 1 клік -->
              <BBtn
                variant="secondary"
                size="lg"
                block
                icon="heroicons-bolt"
                @click="handleQuickBuy"
              >
                Купити в 1 клік
              </BBtn>

              <!-- Продовжити покупки -->
              <button
                class="w-full text-center text-sm text-gray-500 hover:text-green-600 py-2 transition-colors"
                @click="close"
              >
                Продовжити покупки
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-content-enter-active {
  transition: all 0.3s ease-out;
}

.modal-content-leave-active {
  transition: all 0.2s ease-in;
}

.modal-content-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}

.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>

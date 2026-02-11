<script setup lang="ts">
import BBtn from '~/models/common/components/ui/BBtn.vue'
import BInput from '~/models/common/components/ui/BInput.vue'
import { useCartStore } from '../CartStore'
import { useNotify } from '~/models/common/composables/useNotify'
import type { ProductCardData } from '~/models/product/types/Product'

interface Props {
  modelValue: boolean
  product: ProductCardData | null
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])
const cartStore = useCartStore()
const notify = useNotify()

const form = reactive({
  name: '',
  phone: ''
})

const isLoading = ref(false)
const errorMessage = ref('')

function close() {
  emit('update:modelValue', false)
  setTimeout(() => {
    form.name = ''
    form.phone = ''
    errorMessage.value = ''
  }, 300)
}

async function submit() {
  if (!props.product) return
  if (!form.name || !form.phone) {
    notify.warning('Заповніть форму', 'Введіть ім\'я та телефон')
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  const result = await cartStore.submitQuickBuy({
    name: form.name,
    phone: form.phone,
    slug: props.product.code
  })

  isLoading.value = false

  if (result.success) {
    // Тост успіху
    notify.orderSuccess(result.orderNumber || 'Створено')
    close()
  } else {
    notify.error('Помилка', result.message || 'Спробуйте ще раз')
    errorMessage.value = result.message || ''
  }
}

function formatPrice(value: number) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
        @click="close"
      >
        <div
          class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative"
          @click.stop
        >
          <div class="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 class="font-bold text-gray-800">Купити в 1 клік</h3>
            <button class="text-gray-400 hover:text-gray-600" @click="close">
              <UIcon name="heroicons-x-mark" class="w-6 h-6" />
            </button>
          </div>

          <div class="p-6">
            <div v-if="product" class="flex gap-4 mb-6 bg-gray-50 p-3 rounded-lg">
              <div class="w-16 h-16 bg-white rounded p-1 flex-shrink-0 border border-gray-100">
                <img
                  :src="product.image"
                  :alt="product.name"
                  class="w-full h-full object-contain mix-blend-multiply"
                >
              </div>
              <div class="min-w-0">
                <div class="text-xs text-gray-500 mb-1">Код: {{ product.code }}</div>
                <div class="text-sm text-gray-800 font-medium line-clamp-1 mb-1">
                  {{ product.name }}
                </div>
                <div class="font-bold text-green-600">
                  {{ formatPrice(product.price) }} грн
                </div>
              </div>
            </div>

            <form class="space-y-4" @submit.prevent="submit">
              <BInput
                v-model="form.name"
                label="Ваше ім'я"
                placeholder="Введіть ім'я"
                required
              />
              <BInput
                v-model="form.phone"
                label="Телефон"
                type="tel"
                placeholder="+38 (0__) ___-__-__"
                required
                mask="phone"
              />

              <div v-if="errorMessage" class="text-red-500 text-sm text-center">
                {{ errorMessage }}
              </div>

              <BBtn
                type="submit"
                variant="primary"
                block
                :loading="isLoading"
              >
                Надіслати замовлення
              </BBtn>

              <p class="text-xs text-gray-400 text-center">
                Натискаючи кнопку, ви погоджуєтесь з політикою конфіденційності
              </p>
            </form>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
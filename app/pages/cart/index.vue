<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCartStore } from '~/models/cart/CartStore'
import CartItem from '~/models/cart/components/CartItem.vue'
import CheckoutForm from '~/models/cart/components/CheckoutForm.vue'
import CartSummary from '~/models/cart/components/CartSummary.vue'
import BBtn from '~/models/common/components/ui/BBtn.vue'
import { useNotify } from '~/models/common/composables/useNotify'
import { ROUTES } from '~/models/common/constants/routes'

const cartStore = useCartStore()
const router = useRouter()
const route = useRoute()
const notify = useNotify()

const checkoutData = ref({
  firstName: '',
  lastName: '',
  phone: '',
  city: '',
  cityRef: '',
  deliveryType: 'nova_poshta',
  warehouse: '',
  address: '',
  paymentMethod: 'Накладений платіж',
  comment: ''
})

const utmData = computed(() => ({
  utm_source: (route.query.utm_source as string) || '',
  utm_medium: (route.query.utm_medium as string) || '',
  utm_campaign: (route.query.utm_campaign as string) || ''
}))

const formattedTotalPrice = computed(() =>
  new Intl.NumberFormat('uk-UA').format(cartStore.totalPrice)
)

const checkoutProgress = computed(() => {
  const data = checkoutData.value
  let completedSteps = 0

  if (data.firstName.trim()) completedSteps++
  if (data.phone.trim()) completedSteps++
  if (data.city.trim()) completedSteps++
  if (data.deliveryType === 'nova_poshta' && data.warehouse.trim()) completedSteps++
  if (data.deliveryType === 'courier' && data.address.trim()) completedSteps++

  return {
    completedSteps,
    totalSteps: 4,
    percent: Math.round((completedSteps / 4) * 100)
  }
})

const mobileCheckoutHint = computed(() => {
  const data = checkoutData.value

  if (!data.firstName.trim()) return 'Заповніть ім’я'
  if (!data.phone.trim()) return 'Вкажіть номер телефону'
  if (!data.city.trim()) return 'Оберіть місто'
  if (data.deliveryType === 'nova_poshta' && !data.warehouse.trim()) return 'Оберіть відділення'
  if (data.deliveryType === 'courier' && !data.address.trim()) return 'Вкажіть адресу доставки'

  return 'Усе готово до оформлення'
})

onMounted(() => {
  if (route.query.utm_source) localStorage.setItem('utm_source', route.query.utm_source as string)
  if (route.query.utm_medium) localStorage.setItem('utm_medium', route.query.utm_medium as string)
  if (route.query.utm_campaign) localStorage.setItem('utm_campaign', route.query.utm_campaign as string)

  if (cartStore.items.length > 0 && (window as Window & { ttq?: { track: (event: string, payload: unknown) => void } }).ttq) {
    ;(window as Window & { ttq?: { track: (event: string, payload: unknown) => void } }).ttq?.track('InitiateCheckout', {
      content_type: 'product',
      currency: 'UAH',
      value: cartStore.totalPrice,
      contents: cartStore.items.map(item => ({
        content_id: String(item.id),
        content_name: item.name,
        quantity: item.quantity,
        price: item.price
      }))
    })
  }
})

const isFormValid = computed(() => {
  const data = checkoutData.value
  const basic = data.firstName && data.phone && data.city
  const delivery = data.deliveryType === 'nova_poshta' ? data.warehouse : data.address
  return !!(basic && delivery)
})

async function handleOrder() {
  if (!isFormValid.value) {
    notify.warning('Заповніть форму', 'Будь ласка, заповніть всі обов\'язкові поля')
    return
  }

  const storedUtmSource = localStorage.getItem('utm_source') || ''
  const storedUtmMedium = localStorage.getItem('utm_medium') || ''
  const storedUtmCampaign = localStorage.getItem('utm_campaign') || ''

  const orderPayload = {
    name: checkoutData.value.firstName,
    secondName: checkoutData.value.lastName,
    phone: checkoutData.value.phone,
    payment: checkoutData.value.paymentMethod,
    city: checkoutData.value.city,
    warehouses: checkoutData.value.deliveryType === 'nova_poshta'
      ? checkoutData.value.warehouse
      : '',
    courierDeliveryAddress: checkoutData.value.deliveryType === 'courier'
      ? checkoutData.value.address
      : '',
    comment: checkoutData.value.comment || '',
    totalPrice: cartStore.totalPrice,
    orders: cartStore.items.map(item => {
      const oldPrice = item.oldPrice ?? 0
      const hasDiscount = oldPrice > item.price
      const discount = hasDiscount
        ? Math.round((1 - item.price / oldPrice) * 100)
        : 0

      return {
        orderName: item.name,
        count: item.quantity,
        product_id: item.id,
        img: item.image || '',
        price: item.price,
        oldPrice: hasDiscount ? oldPrice : null,
        discount,
        discountProduct: hasDiscount
      }
    }),
    utm_source: (route.query.utm_source as string) || storedUtmSource,
    utm_medium: (route.query.utm_medium as string) || storedUtmMedium,
    utm_campaign: (route.query.utm_campaign as string) || storedUtmCampaign
  }

  const result = await cartStore.submitOrder(orderPayload)

  if (result.success) {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      event: 'purchase',
      value: cartStore.totalPrice,
      currency: 'UAH'
    })

    if (window.ttq) {
      window.ttq.track('CompletePayment', {
        content_type: 'product',
        currency: 'UAH',
        value: cartStore.totalPrice,
        contents: cartStore.items.map(item => ({
          content_id: String(item.id),
          content_name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      })
    }

    notify.orderSuccess(result.orderNumber || result.orderId || 'Створено')

    localStorage.removeItem('utm_source')
    localStorage.removeItem('utm_medium')
    localStorage.removeItem('utm_campaign')

    window.scrollTo({ top: 0, behavior: 'smooth' })

    setTimeout(() => {
      cartStore.clearCart()
      router.push(ROUTES.HOME)
    }, 2500)
  } else {
    notify.error('Помилка замовлення', result.error || 'Спробуйте ще раз')
  }
}

useHead({
  title: 'Кошик - ART TOOLS'
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8 lg:py-12 pb-36 lg:pb-12">
    <div class="max-w-7xl mx-auto px-4 lg:px-8">
      <h1 class="text-2xl lg:text-3xl font-bold text-gray-800 mb-8">Кошик</h1>

      <ClientOnly>
        <div v-if="cartStore.items.length > 0" class="flex flex-col lg:flex-row gap-8">
          <div class="flex-1 space-y-8">
            <div class="bg-white rounded-xl border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-bold text-gray-800">
                  Товари ({{ cartStore.totalQuantity }})
                </h2>
                <button
                  class="text-sm text-gray-400 hover:text-red-500 transition-colors"
                  @click="cartStore.clearCart()"
                >
                  Очистити
                </button>
              </div>

              <div class="divide-y divide-gray-100">
                <CartItem
                  v-for="item in cartStore.items"
                  :key="item.id"
                  :item="item"
                />
              </div>
            </div>

            <CheckoutForm v-model="checkoutData" />
          </div>

          <aside class="hidden lg:block lg:w-96 flex-shrink-0">
            <CartSummary
              :total-quantity="cartStore.totalQuantity"
              :total-price="cartStore.totalPrice"
              :loading="cartStore.loading"
              :disabled="!isFormValid"
              @submit="handleOrder"
            />
          </aside>
        </div>

        <div v-else class="bg-white rounded-xl border border-gray-200 p-12 text-center max-w-2xl mx-auto">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <UIcon name="heroicons-shopping-cart" class="w-10 h-10 text-gray-400" />
          </div>
          <h2 class="text-xl font-bold text-gray-800 mb-2">Кошик порожній</h2>
          <p class="text-gray-500 mb-8">Але це ніколи не пізно виправити :)</p>
          <BBtn :to="ROUTES.CATALOG" variant="primary" size="lg">
            Перейти до каталогу
          </BBtn>
        </div>

        <template #fallback>
          <div class="h-40" />
        </template>
      </ClientOnly>
    </div>

    <div
      v-if="cartStore.items.length > 0"
      class="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white lg:hidden z-40"
    >
      <div class="px-4 py-3">
        <div class="flex items-center justify-between mb-2">
          <div>
            <div class="text-sm text-gray-500">До сплати</div>
            <div class="text-2xl font-bold text-gray-800">{{ formattedTotalPrice }} ₴</div>
          </div>
          <div class="text-sm text-gray-500">
            {{ checkoutProgress.completedSteps }}/{{ checkoutProgress.totalSteps }}
          </div>
        </div>

        <div class="mb-3 h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            class="h-full rounded-full bg-green-500 transition-all duration-300"
            :style="{ width: `${checkoutProgress.percent}%` }"
          />
        </div>

        <div
          class="mb-3 flex items-center gap-2 rounded-xl px-3 py-2"
          :class="isFormValid ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'"
        >
          <UIcon
            :name="isFormValid ? 'heroicons-check-circle' : 'heroicons-exclamation-circle'"
            class="w-5 h-5 flex-shrink-0"
          />
          <span class="text-sm font-semibold">
            {{ mobileCheckoutHint }}
          </span>
        </div>

        <BBtn
          variant="primary"
          class="w-full py-4 text-[18px] font-semibold"
          :loading="cartStore.loading"
          :disabled="!isFormValid"
          @click="handleOrder"
        >
          Оформити замовлення
        </BBtn>
      </div>
      <div class="h-[env(safe-area-inset-bottom,0px)] bg-white" />
    </div>
  </div>
</template>
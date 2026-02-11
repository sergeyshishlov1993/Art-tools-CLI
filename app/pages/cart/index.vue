<script setup lang="ts">
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
  utm_source: (route.query.utm_source as string) || localStorage.getItem('utm_source') || '',
  utm_medium: (route.query.utm_medium as string) || localStorage.getItem('utm_medium') || '',
  utm_campaign: (route.query.utm_campaign as string) || localStorage.getItem('utm_campaign') || ''
}))

onMounted(() => {
  if (route.query.utm_source) localStorage.setItem('utm_source', route.query.utm_source as string)
  if (route.query.utm_medium) localStorage.setItem('utm_medium', route.query.utm_medium as string)
  if (route.query.utm_campaign) localStorage.setItem('utm_campaign', route.query.utm_campaign as string)
})

const isFormValid = computed(() => {
  const d = checkoutData.value
  const basic = d.firstName && d.phone && d.city
  const delivery = d.deliveryType === 'nova_poshta' ? d.warehouse : d.address
  return !!(basic && delivery)
})

async function handleOrder() {
  if (!isFormValid.value) {
    notify.warning('Заповніть форму', 'Будь ласка, заповніть всі обов\'язкові поля')
    return
  }

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
        discount: discount,
        discountProduct: hasDiscount
      }
    }),
    utm_source: utmData.value.utm_source,
    utm_medium: utmData.value.utm_medium,
    utm_campaign: utmData.value.utm_campaign
  }

  const result = await cartStore.submitOrder(orderPayload)

  if (result.success) {
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
  <div class="min-h-screen bg-gray-50 py-8 lg:py-12">
    <div class="max-w-7xl mx-auto px-4 lg:px-8">
      <h1 class="text-2xl lg:text-3xl font-bold text-gray-800 mb-8">Кошик</h1>

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

        <aside class="lg:w-96 flex-shrink-0">
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
    </div>
  </div>
</template>
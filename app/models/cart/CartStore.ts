import { defineStore } from 'pinia'
import { useCartAPI } from './CartApi'
import type {
  CartItem,
  OrderPayload,
  OrderPayloadItem,
  OrderResponse,
  QuickBuyPayload,
  QuickBuyResponse,
  SubmitOrderData,
  NovaPoshtaCity,
  NovaPoshtaWarehouse,
  CityApiResponse,
  WarehouseApiResponse
} from './types'

interface SubmitResult {
  success: boolean
  orderId?: string
  orderNumber?: string
  error?: string
  message?: string
}

interface ApiError {
  response?: {
    _data?: {
      message?: string
    }
  }
}

export const useCartStore = defineStore('cart', () => {
  const api = useCartAPI()
  const items = ref<CartItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  onMounted(() => {
    loadFromStorage()
  })

  function loadFromStorage(): void {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem('cart_items')
      if (saved) {
        items.value = JSON.parse(saved) as CartItem[]
      }
    } catch (e) {
      console.error('Failed to load cart:', e)
    }
  }

  function saveToStorage(): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('cart_items', JSON.stringify(items.value))
  }

  watch(items, () => saveToStorage(), { deep: true })

  const totalQuantity = computed<number>(() =>
    items.value.reduce((acc, item) => acc + item.quantity, 0)
  )

  const totalPrice = computed<number>(() =>
    items.value.reduce((acc, item) => {
      const price = item.oldPrice && item.oldPrice > item.price ? item.price : item.price
      return acc + (price * item.quantity)
    }, 0)
  )

  function addToCart(product: Omit<CartItem, 'quantity'>): void {
    const existing = items.value.find(i => i.id === product.id)
    if (existing) {
      existing.quantity++
    } else {
      items.value.push({ ...product, quantity: 1 })
    }
  }

  function removeFromCart(id: string): void {
    items.value = items.value.filter(i => i.id !== id)
  }

  function updateQuantity(id: string, delta: number): void {
    const item = items.value.find(i => i.id === id)
    if (item) {
      item.quantity += delta
      if (item.quantity <= 0) removeFromCart(id)
    }
  }

  function setQuantity(id: string, quantity: number): void {
    const item = items.value.find(i => i.id === id)
    if (item) {
      if (quantity <= 0) {
        removeFromCart(id)
      } else {
        item.quantity = quantity
      }
    }
  }

  function clearCart(): void {
    items.value = []
  }

  function buildOrderPayload(formData: SubmitOrderData): OrderPayload {
    const orderItems: OrderPayloadItem[] = items.value.map(item => {
      const hasDiscount = Boolean(item.oldPrice && item.oldPrice > item.price)
      const discountPercent = hasDiscount
        ? Math.round((1 - item.price / item.oldPrice!) * 100)
        : 0

      return {
        orderName: item.name,
        count: item.quantity,
        product_id: item.id,
        img: item.image || '',
        price: item.price,
        oldPrice: hasDiscount ? item.oldPrice : null,
        discount: discountPercent,
        discountProduct: hasDiscount
      }
    })

    return {
      name: formData.name || formData.firstName || '',
      secondName: formData.secondName || formData.lastName || '',
      phone: formData.phone,
      payment: formData.payment || formData.paymentMethod || '',
      city: formData.city,
      warehouses: formData.warehouses || formData.warehouse || '',
      courierDeliveryAddress: formData.courierDeliveryAddress || formData.address || '',
      comment: formData.comment || null,
      totalPrice: totalPrice.value,
      orders: orderItems,
      utm_source: formData.utm_source || '',
      utm_medium: formData.utm_medium || '',
      utm_campaign: formData.utm_campaign || ''
    }
  }


  async function submitOrder(formData: SubmitOrderData): Promise<SubmitResult> {
    loading.value = true
    error.value = null

    try {
      const payload = buildOrderPayload(formData)
      const res = await api.createOrder(payload) as OrderResponse
      clearCart()

      return {
        success: true,
        orderId: res.order_id,
        orderNumber: res.order_number
      }
    } catch (e: unknown) {
      const msg = extractErrorMessage(e)
      error.value = msg
      return { success: false, error: msg }
    } finally {
      loading.value = false
    }
  }

  async function submitQuickBuy(data: QuickBuyPayload): Promise<SubmitResult> {
    loading.value = true
    error.value = null

    try {
      const res = await api.quickBuy(data) as QuickBuyResponse

      return {
        success: true,
        message: res.message,
        orderNumber: res.order_number
      }
    } catch (e: unknown) {
      const msg = extractErrorMessage(e)
      error.value = msg
      return { success: false, message: msg }
    } finally {
      loading.value = false
    }
  }

  async function searchCities(query: string): Promise<NovaPoshtaCity[]> {
    try {
      const res = await api.searchCities(query) as unknown as CityApiResponse

      if (res.city && Array.isArray(res.city.data)) {
        return res.city.data
      }
      return []
    } catch (e) {
      console.error('Search cities error:', e)
      return []
    }
  }

  async function getWarehouses(cityRef: string, query: string = ''): Promise<NovaPoshtaWarehouse[]> {
    try {
      const res = await api.getWarehouses(cityRef, query) as unknown as WarehouseApiResponse

      if (Array.isArray(res.warehouses)) {
        return res.warehouses
      }

      if (res.warehouses && 'data' in res.warehouses && Array.isArray(res.warehouses.data)) {
        return res.warehouses.data
      }

      return []
    } catch (e) {
      console.error('Get warehouses error:', e)
      return []
    }
  }

  function isApiError(e: unknown): e is ApiError {
    return typeof e === 'object' && e !== null && 'response' in e
  }

  function extractErrorMessage(e: unknown): string {
    if (isApiError(e) && e.response?._data?.message) {
      return e.response._data.message
    }
    if (e instanceof Error) {
      return e.message
    }
    return 'Помилка сервера'
  }

  return {
    items,
    loading,
    error,
    totalQuantity,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    setQuantity,
    clearCart,
    submitOrder,
    submitQuickBuy,
    searchCities,
    getWarehouses
  }
})

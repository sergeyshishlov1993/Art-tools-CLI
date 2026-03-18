import { defineStore } from 'pinia'
import { useCartAPI } from './CartApi'
import { getUtmData } from '~/models/common/utils/getUtmData'
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
  WarehouseApiResponse,
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

  function loadFromStorage(): void {
    if (typeof window === 'undefined') return

    try {
      const savedItems = localStorage.getItem('cart_items')
      if (savedItems) {
        items.value = JSON.parse(savedItems) as CartItem[]
      }
    }
    catch {}
  }

  function saveToStorage(): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('cart_items', JSON.stringify(items.value))
  }

  loadFromStorage()

  watch(items, saveToStorage, { deep: true })

  const totalQuantity = computed<number>(() =>
    items.value.reduce((accumulator, item) => accumulator + item.quantity, 0),
  )

  const totalPrice = computed<number>(() =>
    items.value.reduce((accumulator, item) => accumulator + (item.price * item.quantity), 0),
  )

  function addToCart(product: Omit<CartItem, 'quantity'>): void {
    const existingItem = items.value.find(item => item.id === product.id)

    if (existingItem) {
      existingItem.quantity++
    }
    else {
      items.value.push({ ...product, quantity: 1 })
    }
  }

  function removeFromCart(id: string): void {
    items.value = items.value.filter(item => item.id !== id)
  }

  function updateQuantity(id: string, delta: number): void {
    const item = items.value.find(cartItem => cartItem.id === id)

    if (item) {
      item.quantity += delta

      if (item.quantity <= 0) {
        removeFromCart(id)
      }
    }
  }

  function setQuantity(id: string, quantity: number): void {
    const item = items.value.find(cartItem => cartItem.id === id)

    if (item) {
      if (quantity <= 0) {
        removeFromCart(id)
      }
      else {
        item.quantity = quantity
      }
    }
  }

  function clearCart(): void {
    items.value = []
  }

  function buildOrderPayload(formData: SubmitOrderData): OrderPayload {
    const utm = getUtmData()

    const orderItems: OrderPayloadItem[] = items.value.map((item) => {
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
        discountProduct: hasDiscount,
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
      utm_source: formData.utm_source || utm.utm_source || '',
      utm_medium: formData.utm_medium || utm.utm_medium || '',
      utm_campaign: formData.utm_campaign || utm.utm_campaign || '',
    }
  }

  async function submitOrder(formData: SubmitOrderData): Promise<SubmitResult> {
    loading.value = true
    error.value = null

    try {
      const payload = buildOrderPayload(formData)
      const response = await api.createOrder(payload) as OrderResponse
      clearCart()

      return {
        success: true,
        orderId: response.order_id,
        orderNumber: response.order_number,
      }
    }
    catch (exception: unknown) {
      const message = extractErrorMessage(exception)
      error.value = message

      return {
        success: false,
        error: message,
      }
    }
    finally {
      loading.value = false
    }
  }

  async function submitQuickBuy(data: QuickBuyPayload): Promise<SubmitResult> {
    loading.value = true
    error.value = null

    try {
      const utm = getUtmData()

      const payload: QuickBuyPayload = {
        ...data,
        utm_source: data.utm_source || utm.utm_source || '',
        utm_medium: data.utm_medium || utm.utm_medium || '',
        utm_campaign: data.utm_campaign || utm.utm_campaign || '',
      }

      const response = await api.quickBuy(payload) as QuickBuyResponse

      return {
        success: true,
        message: response.message,
        orderNumber: response.order_number,
      }
    }
    catch (exception: unknown) {
      const message = extractErrorMessage(exception)
      error.value = message

      return {
        success: false,
        message,
      }
    }
    finally {
      loading.value = false
    }
  }

  async function searchCities(query: string): Promise<NovaPoshtaCity[]> {
    try {
      const response = await api.searchCities(query) as unknown as CityApiResponse

      if (response.city && Array.isArray(response.city.data)) {
        return response.city.data
      }

      return []
    }
    catch {
      return []
    }
  }

  async function getWarehouses(cityRef: string, query = ''): Promise<NovaPoshtaWarehouse[]> {
    try {
      const response = await api.getWarehouses(cityRef, query) as unknown as WarehouseApiResponse

      if (Array.isArray(response.warehouses)) {
        return response.warehouses
      }

      if (response.warehouses && 'data' in response.warehouses && Array.isArray(response.warehouses.data)) {
        return response.warehouses.data
      }

      return []
    }
    catch {
      return []
    }
  }

  function isApiError(exception: unknown): exception is ApiError {
    return typeof exception === 'object' && exception !== null && 'response' in exception
  }

  function extractErrorMessage(exception: unknown): string {
    if (isApiError(exception) && exception.response?._data?.message) {
      return exception.response._data.message
    }

    if (exception instanceof Error) {
      return exception.message
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
    getWarehouses,
  }
})
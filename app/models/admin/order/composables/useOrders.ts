import type {
  Order,
  OrderItem,
  OrderStatus,
  OrderSource,
  Stats,
  TrackingDetails,
  OrdersResponse,
  TtnResponse,
  SyncResponse
} from '~/models/admin/types/Orders'
import { useAdminStore } from '~/models/admin/AdminStore'
import { useOrderHelpers } from './useOrderHelpers'

export function useOrders() {
  const config = useRuntimeConfig()
  const API_URL = (config.public.apiBase || 'http://localhost:8000/api').replace(/\/$/, '')
  const adminStore = useAdminStore()
  const { getErrorMessage } = useOrderHelpers()
  const error = ref<string | null>(null)
  const success = ref<string | null>(null)
  const currentPage = ref(1)
  const search = ref('')
  const statusFilter = ref<OrderStatus | 'all'>('all')
  const sourceFilter = ref<OrderSource | 'all'>('all')
  const selectedYear = ref('all')
  const selectedMonth = ref('all')
  const selectedOrder = ref<Order | null>(null)
  const isModalOpen = ref(false)
  const modalTtn = ref('')
  const savingTtn = ref(false)
  const trackingDetails = ref<TrackingDetails | null>(null)
  const loadingTrackingDetails = ref(false)
  const isTtnModalOpen = ref(false)
  const ttnOrder = ref<Order | null>(null)
  const newTtn = ref('')
  const syncingAll = ref(false)

  const queryParams = computed(() => {
    const params = new URLSearchParams({
      page: String(currentPage.value),
      limit: '20'
    })

    if (search.value.trim()) params.append('search', search.value.trim())
    if (statusFilter.value !== 'all') params.append('status', statusFilter.value)
    if (sourceFilter.value !== 'all') params.append('source', sourceFilter.value)
    if (selectedYear.value !== 'all') params.append('year', selectedYear.value)
    if (selectedMonth.value !== 'all') params.append('month', selectedMonth.value)

    return params.toString()
  })

  const statsParams = computed(() => {
    const params = new URLSearchParams()
    if (selectedYear.value !== 'all') params.append('year', selectedYear.value)
    if (selectedMonth.value !== 'all') params.append('month', selectedMonth.value)
    if (sourceFilter.value !== 'all') params.append('source', sourceFilter.value)
    return params.toString()
  })

  const {
    data: ordersData,
    status: ordersStatus,
    refresh: refreshOrders
  } = useAsyncData<OrdersResponse>(
    'admin-orders',
    () => $fetch(`${API_URL}/admin/orders/all-orders?${queryParams.value}`),
    { watch: [queryParams] }
  )

  const {
    data: statsData,
    refresh: refreshStats
  } = useAsyncData<Stats>(
    'admin-stats',
    () => $fetch(`${API_URL}/admin/orders/stats?${statsParams.value}`),
    { watch: [statsParams] }
  )

  const orders = computed(() => ordersData.value?.orders ?? [])
  const totalItems = computed(() => ordersData.value?.totalItems ?? 0)
  const totalPages = computed(() => ordersData.value?.totalPages ?? 1)
  const stats = computed(() => statsData.value ?? {})
  const loading = computed(() => ordersStatus.value === 'pending')

  const years = computed(() => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 5 }, (_, i) => currentYear - i)
  })

  const monthGrowth = computed((): number | null => {
    const current = stats.value.thisMonth?.total ?? 0
    const last = stats.value.lastMonth?.total ?? 0
    if (!last) return current > 0 ? 100 : null
    return Math.round(((current - last) / last) * 100)
  })

  function updateOrderInList(orderId: string, updates: Partial<Order>): void {
    if (!ordersData.value) return
    const index = ordersData.value.orders.findIndex(o => o.order_id === orderId)
    if (index !== -1) {
      ordersData.value.orders[index] = {
        ...ordersData.value.orders[index],
        ...updates
      } as Order
    }
  }

  function showSuccess(msg: string): void {
    success.value = msg
  }

  function showError(msg: string): void {
    error.value = msg
  }

  // ==================== DEBOUNCE ====================

  let searchTimeout: ReturnType<typeof setTimeout> | null = null

  function debouncedSearch(): void {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      currentPage.value = 1
    }, 300)
  }

  // ==================== ORDER ACTIONS ====================

  async function changeStatus(order: Order, newStatus: OrderStatus): Promise<void> {
    const oldStatus = order.status

    try {
      await $fetch(
        `${API_URL}/admin/orders/change-status/${order.order_id}?status=${newStatus}`,
        { method: 'PUT' }
      )

      order.status = newStatus

      if (oldStatus === 'new' && newStatus !== 'new') {
        adminStore.decrementOrders()
      } else if (oldStatus !== 'new' && newStatus === 'new') {
        adminStore.incrementOrders()
      }

      showSuccess('Статус змінено')
      await refreshStats()
    } catch (err) {
      order.status = oldStatus
      showError(getErrorMessage(err))
    }
  }

  async function deleteOrderById(orderId: string): Promise<void> {
    await $fetch(`${API_URL}/admin/orders/delete/${orderId}`, { method: 'DELETE' })
    await refreshOrders()
    await refreshStats()
  }

  async function deleteOrder(order: Order): Promise<void> {
    const orderLabel = order.order_number || order.order_id.slice(0, 8)
    if (!confirm(`Видалити замовлення #${orderLabel}?`)) return

    try {
      await deleteOrderById(order.order_id)

      if (order.status === 'new') {
        adminStore.decrementOrders()
      }

      showSuccess('Замовлення видалено')
    } catch (err) {
      showError(getErrorMessage(err))
    }
  }

  async function deleteOrderItem(order: Order, item: OrderItem): Promise<void> {
    if (!confirm(`Видалити товар "${item.order_name}"?`)) return

    try {
      const newTotal = order.total_price - (item.price * item.count)
      await $fetch(
        `${API_URL}/admin/orders/delete/${order.order_id}/${item.item_id}?totalPrice=${newTotal}`,
        { method: 'PUT' }
      )

      if (order.items) {
        order.items = order.items.filter(i => i.item_id !== item.item_id)
      }
      order.total_price = newTotal
      showSuccess('Товар видалено')
    } catch (err) {
      showError(getErrorMessage(err))
    }
  }
  async function fetchTrackingDetails(): Promise<void> {
    if (!selectedOrder.value?.ttn) return

    loadingTrackingDetails.value = true
    trackingDetails.value = null

    try {
      const data = await $fetch<{ tracking: TrackingDetails }>(
        `${API_URL}/admin/tracking/details/${selectedOrder.value.ttn}`
      )
      trackingDetails.value = data.tracking

      selectedOrder.value.np_status = data.tracking.status
      selectedOrder.value.np_status_code = data.tracking.statusCode
      selectedOrder.value.np_last_sync = new Date().toISOString()

      updateOrderInList(selectedOrder.value.order_id, {
        np_status: data.tracking.status,
        np_status_code: data.tracking.statusCode,
        np_last_sync: selectedOrder.value.np_last_sync
      })
    } catch (err) {
      showError(getErrorMessage(err) || 'Помилка отримання даних трекінгу')
    } finally {
      loadingTrackingDetails.value = false
    }
  }

  async function syncOrderTracking(order: Order): Promise<void> {
    try {
      const data = await $fetch<SyncResponse>(
        `${API_URL}/admin/tracking/sync-order/${order.order_id}`,
        { method: 'POST' }
      )

      order.np_status = data.npStatus
      order.np_status_code = data.npStatusCode
      order.np_last_sync = new Date().toISOString()

      if (data.newStatus) {
        const oldStatus = order.status
        order.status = data.newStatus

        if (oldStatus === 'new' && data.newStatus !== 'new') {
          adminStore.decrementOrders()
        }
      }

      showSuccess(data.message)
    } catch (err) {
      showError(getErrorMessage(err))
    }
  }

  async function syncAllTracking(): Promise<void> {
    syncingAll.value = true
    try {
      const data = await $fetch<SyncResponse>(
        `${API_URL}/admin/tracking/sync-all`,
        { method: 'POST' }
      )
      showSuccess(data.message)
      await refreshOrders()
      await refreshStats()
      await adminStore.fetchCounts()
    } catch (err) {
      showError(getErrorMessage(err))
    } finally {
      syncingAll.value = false
    }
  }

  async function saveNewTtn(): Promise<void> {
    if (!newTtn.value || !ttnOrder.value) return

    savingTtn.value = true
    try {
      const data = await $fetch<TtnResponse>(
        `${API_URL}/admin/tracking/set-ttn/${ttnOrder.value.order_id}`,
        { method: 'PUT', body: { ttn: newTtn.value } }
      )

      const oldStatus = ttnOrder.value.status

      updateOrderInList(ttnOrder.value.order_id, {
        ttn: data.ttn,
        status: data.status,
        np_status: data.npStatus,
        np_status_code: data.npStatusCode
      })

      if (oldStatus === 'new' && data.status !== 'new') {
        adminStore.decrementOrders()
      }

      showSuccess('ТТН збережено')
      isTtnModalOpen.value = false
    } catch (err) {
      showError(getErrorMessage(err))
    } finally {
      savingTtn.value = false
    }
  }

  async function saveTtn(): Promise<void> {
    if (!modalTtn.value || !selectedOrder.value) return

    savingTtn.value = true
    try {
      const data = await $fetch<TtnResponse>(
        `${API_URL}/admin/tracking/set-ttn/${selectedOrder.value.order_id}`,
        { method: 'PUT', body: { ttn: modalTtn.value } }
      )

      const oldStatus = selectedOrder.value.status

      Object.assign(selectedOrder.value, {
        ttn: data.ttn,
        status: data.status,
        np_status: data.npStatus,
        np_status_code: data.npStatusCode
      })

      updateOrderInList(selectedOrder.value.order_id, {
        ttn: data.ttn,
        status: data.status,
        np_status: data.npStatus,
        np_status_code: data.npStatusCode
      })

      if (oldStatus === 'new' && data.status !== 'new') {
        adminStore.decrementOrders()
      }

      showSuccess('ТТН збережено')
      await fetchTrackingDetails()
    } catch (err) {
      showError(getErrorMessage(err))
    } finally {
      savingTtn.value = false
    }
  }


  function filterByStatus(status: OrderStatus): void {
    statusFilter.value = statusFilter.value === status ? 'all' : status
    currentPage.value = 1
  }

  function goToPage(page: number): void {
    currentPage.value = page
  }

  function resetFilters(): void {
    search.value = ''
    statusFilter.value = 'all'
    sourceFilter.value = 'all'
    selectedYear.value = 'all'
    selectedMonth.value = 'all'
    currentPage.value = 1
  }

  function openOrderDetails(order: Order): void {
    selectedOrder.value = structuredClone(order)
    modalTtn.value = order.ttn ?? ''
    trackingDetails.value = null
    isModalOpen.value = true

    if (order.ttn) {
      fetchTrackingDetails()
    }
  }

  function closeOrderModal(): void {
    isModalOpen.value = false
    selectedOrder.value = null
    trackingDetails.value = null
  }

  function openSetTtnModal(order: Order): void {
    ttnOrder.value = order
    newTtn.value = ''
    isTtnModalOpen.value = true
  }

  function closeTtnModal(): void {
    isTtnModalOpen.value = false
    ttnOrder.value = null
    newTtn.value = ''
  }


  watch([error, success], () => {
    setTimeout(() => {
      error.value = null
      success.value = null
    }, 5000)
  })


  return {
    error,
    success,
    loading,
    syncingAll,
    search,
    statusFilter,
    sourceFilter,
    selectedYear,
    selectedMonth,
    currentPage,
    orders,
    totalItems,
    totalPages,
    stats,
    years,
    monthGrowth,
    selectedOrder,
    isModalOpen,
    modalTtn,
    savingTtn,
    trackingDetails,
    loadingTrackingDetails,
    isTtnModalOpen,
    ttnOrder,
    newTtn,
    debouncedSearch,
    changeStatus,
    deleteOrder,
    deleteOrderById,
    deleteOrderItem,
    fetchTrackingDetails,
    syncOrderTracking,
    syncAllTracking,
    saveNewTtn,
    saveTtn,
    filterByStatus,
    goToPage,
    resetFilters,
    openOrderDetails,
    closeOrderModal,
    openSetTtnModal,
    closeTtnModal,
    refreshOrders,
    refreshStats
  }
}

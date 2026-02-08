import { defineStore } from 'pinia'
import { useApiClient } from '~/models/common/composables/useApiClient'

export const useAdminStore = defineStore('admin', () => {
  const orderApi = useApiClient({ module: 'admin/orders' })
  const feedbackApi = useApiClient({ module: 'admin/feedback' })

  const newOrdersCount = ref(0)
  const newFeedbackCount = ref(0)
  const loading = ref(false)

  const totalNewCount = computed(() => newOrdersCount.value + newFeedbackCount.value)

  async function fetchCounts(): Promise<void> {
    loading.value = true

    try {
      const [ordersRes, feedbackRes] = await Promise.allSettled([
        orderApi.get<{ count: number }>('/count-new'),
        feedbackApi.get<{ count: number }>('/count-new')
      ])

      if (ordersRes.status === 'fulfilled') {
        newOrdersCount.value = ordersRes.value?.count ?? 0
      }

      if (feedbackRes.status === 'fulfilled') {
        newFeedbackCount.value = feedbackRes.value?.count ?? 0
      }
    } catch (e) {
      console.error('Failed to fetch admin counts:', e)
    } finally {
      loading.value = false
    }
  }

  async function requestNotificationPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  function incrementOrders(amount = 1): void {
    newOrdersCount.value += amount
  }

  function decrementOrders(amount = 1): void {
    newOrdersCount.value = Math.max(0, newOrdersCount.value - amount)
  }

  function incrementFeedback(amount = 1): void {
    newFeedbackCount.value += amount
  }

  function decrementFeedback(amount = 1): void {
    newFeedbackCount.value = Math.max(0, newFeedbackCount.value - amount)
  }

  function resetCounts(): void {
    newOrdersCount.value = 0
    newFeedbackCount.value = 0
  }

  return {
    newOrdersCount,
    newFeedbackCount,
    loading,
    totalNewCount,
    fetchCounts,
    incrementOrders,
    decrementOrders,
    incrementFeedback,
    decrementFeedback,
    resetCounts,
    requestNotificationPermission
  }
})

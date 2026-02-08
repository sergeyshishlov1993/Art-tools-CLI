// models/common/composables/usePromoTimer.ts

interface PromoTimer {
  productId: string
  expiresAt: number
}

export function usePromoTimer(productId: string, promoDays: number = 30) {
  const STORAGE_KEY = 'promo_timers'

  const timeLeft = ref({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  const isExpired = ref(false)
  const isActive = ref(false)

  let interval: ReturnType<typeof setInterval> | null = null

  function getStoredTimers(): Record<string, PromoTimer> {
    if (import.meta.server) return {}
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }

  function saveTimer(timer: PromoTimer) {
    if (import.meta.server) return
    try {
      const timers = getStoredTimers()
      timers[productId] = timer
      localStorage.setItem(STORAGE_KEY, JSON.stringify(timers))
    } catch (e) {
      console.error('Failed to save timer:', e)
    }
  }

  function getOrCreateTimer(): number {
    const timers = getStoredTimers()
    const existing = timers[productId]

    if (existing && existing.expiresAt > Date.now()) {
      return existing.expiresAt
    }

    // Створюємо таймер до кінця місяця
    const expiresAt = getEndOfMonth()
    saveTimer({ productId, expiresAt })
    return expiresAt
  }

  // Кінець поточного місяця - чесний підхід
  function getEndOfMonth(): number {
    const now = new Date()
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    return endOfMonth.getTime()
  }

  function calculateTimeLeft(expiresAt: number) {
    const diff = expiresAt - Date.now()

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return { days, hours, minutes, seconds, expired: false }
  }

  function updateTimer() {
    const expiresAt = getOrCreateTimer()
    const result = calculateTimeLeft(expiresAt)

    if (result.expired) {
      isExpired.value = true
      isActive.value = false
      timeLeft.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
      stopTimer()
      return
    }

    isActive.value = true
    isExpired.value = false
    timeLeft.value = {
      days: result.days,
      hours: result.hours,
      minutes: result.minutes,
      seconds: result.seconds
    }
  }

  function startTimer() {
    if (import.meta.server) return
    updateTimer()
    if (!interval) {
      interval = setInterval(updateTimer, 1000)
    }
  }

  function stopTimer() {
    if (interval) {
      clearInterval(interval)
      interval = null
    }
  }

  onMounted(() => {
    startTimer()
  })

  onUnmounted(() => {
    stopTimer()
  })

  watch(() => productId, () => {
    stopTimer()
    startTimer()
  })

  return {
    timeLeft: readonly(timeLeft),
    isExpired: readonly(isExpired),
    isActive: readonly(isActive)
  }
}

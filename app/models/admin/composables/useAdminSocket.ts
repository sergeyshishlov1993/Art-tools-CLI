// composables/useAdminSocket.ts
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client'
import { useAdminStore } from '~/models/admin/AdminStore'

let socket: Socket | null = null
const orderCallbacks: Array<(data: any) => void> = []
const feedbackCallbacks: Array<(data: any) => void> = []

export function useAdminSocket() {
  const config = useRuntimeConfig()
  const adminStore = useAdminStore()
  const isConnected = ref(false)

  function connect() {
    if (socket?.connected) return

    const wsUrl = config.public.apiBase?.replace('/api', '') || 'http://localhost:8000'

    socket = io(wsUrl, {
      transports: ['websocket', 'polling']
    })

    socket.on('connect', () => {
      isConnected.value = true
      socket?.emit('join-admin')
      console.log('🔌 WebSocket connected')
    })

    socket.on('disconnect', () => {
      isConnected.value = false
      console.log('🔌 WebSocket disconnected')
    })

    // Нове замовлення
    socket.on('new-order', (data) => {
      console.log('🛒 New order:', data)
      adminStore.incrementOrders()
      playSound()
      showNotification('🛒 Нове замовлення!', `#${data.orderNumber} — ${data.name}`)
      orderCallbacks.forEach(cb => cb(data))
    })

    // Новий відгук
    socket.on('new-feedback', (data) => {
      console.log('💬 New feedback:', data)
      adminStore.incrementFeedback()
      playSound()
      showNotification('💬 Нова заявка!', data.name)
      feedbackCallbacks.forEach(cb => cb(data))
    })
  }

  function disconnect() {
    socket?.disconnect()
    socket = null
    isConnected.value = false
  }

  function onNewOrder(callback: (data: any) => void) {
    orderCallbacks.push(callback)
    return () => {
      const index = orderCallbacks.indexOf(callback)
      if (index > -1) orderCallbacks.splice(index, 1)
    }
  }

  function onNewFeedback(callback: (data: any) => void) {
    feedbackCallbacks.push(callback)
    return () => {
      const index = feedbackCallbacks.indexOf(callback)
      if (index > -1) feedbackCallbacks.splice(index, 1)
    }
  }

  function playSound() {
    try {
      const audio = new Audio('/sounds/notification.mp3')
      audio.volume = 0.5
      audio.play().catch(() => {})
    } catch {}
  }

  function showNotification(title: string, body: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'admin-notification'
      })
    }
  }

  return {
    isConnected: readonly(isConnected),
    connect,
    disconnect,
    onNewOrder,
    onNewFeedback
  }
}

import { useAuthStore } from '~/models/auth/AuthStore'

export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith('/admin')) {
    return
  }

  if (import.meta.server) {
    return
  }

  const authStore = useAuthStore()

  if (!authStore.isInitialized) {
    authStore.init()
  }

  if (to.path === '/admin/login') {
    if (authStore.isAuthenticated) {
      return navigateTo('/admin/orders')
    }
    return
  }

  if (!authStore.isAuthenticated) {
    return navigateTo('/admin/login')
  }
})

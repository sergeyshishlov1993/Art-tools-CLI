import { useAuthStore } from '~/models/auth/AuthStore'

export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  authStore.init()
})

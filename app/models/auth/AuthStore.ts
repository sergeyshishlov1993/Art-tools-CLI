import { defineStore } from 'pinia'

interface Admin {
  id: number
  name: string
  role: string
}

interface LoginResponse {
  message: string
  accessToken: string
  refreshToken: string
  admin: Admin
}

export const useAuthStore = defineStore('auth', () => {
  const config = useRuntimeConfig()
  const API_URL = config.public.apiBase

  const admin = ref<Admin | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)

  const isAuthenticated = computed(() => !!accessToken.value)

  function init() {
    if (isInitialized.value) return

    if (import.meta.client) {
      accessToken.value = localStorage.getItem('accessToken')
      refreshToken.value = localStorage.getItem('refreshToken')
      const savedAdmin = localStorage.getItem('admin')
      if (savedAdmin) {
        try {
          admin.value = JSON.parse(savedAdmin)
        } catch {
          admin.value = null
        }
      }
    }

    isInitialized.value = true
  }

  function saveTokens(access: string, refresh: string, adminData: Admin) {
    accessToken.value = access
    refreshToken.value = refresh
    admin.value = adminData

    if (import.meta.client) {
      localStorage.setItem('accessToken', access)
      localStorage.setItem('refreshToken', refresh)
      localStorage.setItem('admin', JSON.stringify(adminData))
    }
  }

  function clearTokens() {
    accessToken.value = null
    refreshToken.value = null
    admin.value = null

    if (import.meta.client) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('admin')
    }
  }

  async function login(username: string, password: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch<LoginResponse>(`${API_URL}admin/login`, {
        method: 'POST',
        body: { username, password }
      })

      saveTokens(data.accessToken, data.refreshToken, data.admin)
      return true
    } catch (err: unknown) {
      const e = err as { data?: { message?: string }; message?: string }
      error.value = e.data?.message || e.message || 'Помилка авторизації'
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      if (refreshToken.value) {
        await $fetch(`${API_URL}admin/login/logout`, {
          method: 'POST',
          body: { token: refreshToken.value }
        })
      }
    } catch {
      // Ignore
    } finally {
      clearTokens()
      navigateTo('/admin/login')
    }
  }

  async function refreshAccessToken(): Promise<boolean> {
    if (!refreshToken.value) return false

    try {
      const data = await $fetch<{ accessToken: string }>(`${API_URL}admin/login/token`, {
        method: 'POST',
        body: { token: refreshToken.value }
      })

      accessToken.value = data.accessToken
      if (import.meta.client) {
        localStorage.setItem('accessToken', data.accessToken)
      }
      return true
    } catch {
      clearTokens()
      return false
    }
  }

  return {
    admin,
    accessToken,
    refreshToken,
    loading,
    error,
    isAuthenticated,
    isInitialized,
    init,
    login,
    logout,
    refreshAccessToken
  }
})

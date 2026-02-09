import {useAuthStore} from '~/models/auth/AuthStore';
export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  // Ініціалізуємо store з localStorage
  authStore.init()

  // Сторінка логіну - пропускаємо
  if (to.path === '/admin/login') {
    // Якщо вже залогінений - редірект на дашборд
    if (authStore.isAuthenticated) {
      return navigateTo('/admin/orders')
    }
    return
  }

  // Всі інші адмін сторінки - перевіряємо авторизацію
  if (!authStore.isAuthenticated) {
    return navigateTo('/admin/login')
  }
})
